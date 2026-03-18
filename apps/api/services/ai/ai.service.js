/**
 * AI Service
 * Business logic layer for AI-related operations
 */
const { fal } = require('@fal-ai/client');
fal.config({ credentials: process.env.FAL_API_KEY });

const packageRepository = require('../../data/package.repository');
const { composeSchema } = require('../../src/validation/compose.schema');
// ✅ AI BRIDGE (Stage 4.5)
// DOĞRU KAYNAK: src/routes/ai.js
// AI bridge removed - stub inline
/**
 * GET /api/ai/packages
 */
async function getPackages() {
  const packages = await packageRepository.getAllPackages();
  return {
    success: true,
    count: packages.length,
    packages,
  };
}
/**
 * POST /api/ai/compose
 * Create a new package in DB (validated + user-aware)
 */
async function composePackage({
  selections = [],
  language = 'tr',
  userId = null,
}) {
  try {
    // 🔒 INPUT VALIDATION (ZOD)
    const parsed = composeSchema.parse({
      selections,
      language,
    });
    const { selections: validSelections } = parsed;
    // 💰 totalPrice hesapla
    const totalPrice = validSelections.reduce((sum, item) => {
      const price =
        item.price ??
        item.minPrice ??
        item.payload?.price ??
        item.payload?.minPrice ??
        0;
      return sum + (typeof price === 'number' ? price : 0);
    }, 0);
    // 🧱 DB write
    const created = await packageRepository.createPackage({
      userId,
      items: validSelections,
      totalPrice,
      currency: 'USD',
      status: 'draft',
    });
    // 🤖 AI BRIDGE (Stage 4.5)
    const summaryByLang = { tr: 'Hazırlanıyor...', en: 'Preparing...', ar: 'جارٍ التحضير...', es: 'Preparando...', de: 'Wird vorbereitet...', ru: 'Подготовка...' };
    const itinerary = { days: [], summary: summaryByLang[language] || summaryByLang.en };
    // 🔁 Response
    const response = {
      success: true,
      package: {
        id: created.id,
        items: validSelections,
        totalPrice,
        currency: 'USD',
        status: 'draft',
      },
      itinerary,
    };
    return response;
  } catch (error) {
    console.error('💣 [SERVICE] ERROR:', error.message);
    console.error('💣 [SERVICE] Stack:', error.stack);
    throw error;
  }
}
/**
 * GET /api/ai/suggestions
 * Fetches top hotels + experiences from DB, builds a prompt,
 * calls gpt-4o-mini, and returns exactly 3 structured suggestions.
 * Falls back to rule-based suggestions if OpenAI is unavailable.
 */
async function getSuggestions(lang = 'tr') {
  const db = require('../../db');

  const { rows: hotels } = await db.query(`
    SELECT name, city, country, rating, price_per_night, description
    FROM hotels
    WHERE rating IS NOT NULL
    ORDER BY rating DESC
    LIMIT 5
  `);

  const { rows: experiences } = await db.query(`
    SELECT title, city, country, rating, price, category, description
    FROM experiences
    WHERE rating IS NOT NULL
    ORDER BY rating DESC
    LIMIT 8
  `);

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const hotelLines = hotels.map(h =>
      `• ${h.name} (${h.city}, ${h.country}) | Rating: ${h.rating} | $${h.price_per_night}/night`
    ).join('\n');

    const expLines = experiences.map(e =>
      `• ${e.title} (${e.city}, ${e.country}) | ${e.category} | Rating: ${e.rating} | $${e.price}`
    ).join('\n');

    const langNames = { tr: 'Turkish', en: 'English', ar: 'Arabic', es: 'Spanish', de: 'German', ru: 'Russian' };
    const langName = langNames[lang] || 'Turkish';

    const userPrompt = `Based on the following travel catalog, generate exactly 3 travel package suggestions.
Respond entirely in ${langName}. All "title" and "description" values must be written in ${langName}.

HOTELS:
${hotelLines}

EXPERIENCES:
${expLines}

Return ONLY a valid JSON array with exactly 3 objects. No markdown, no explanation.
Each object must have:
- "title": string (short, catchy package name in ${langName})
- "description": string (2-3 sentences about what makes this package special, in ${langName})
- "score": number between 0 and 1

Example: [{"title":"...","description":"...","score":0.9},...]`;

    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a travel package recommendation AI. Always respond with valid JSON only — no markdown, no code fences, no extra text. Write all content in ${langName}.`,
          },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      },
      { timeout: 10000 }
    );

    const raw = completion.choices[0].message.content.trim();
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('AI returned unexpected format');
    }

    return parsed.slice(0, 3);
  } catch (aiError) {
    console.error('[AI Service] OpenAI unavailable, using rule-based fallback:', aiError.message);
    return buildFallbackSuggestions(hotels, experiences, lang);
  }
}

const fallbackStrings = {
  tr: {
    intro: (city) => `${city}'i keşfet`,
    hotel: (name) => ` – ${name}'da konaklayarak`,
    exp: (title) => ` ve ${title} deneyimini yaşa`,
    getaway: (city) => `${city} Kaçamağı`,
    customTitle: 'Özel Seyahat Paketi',
    customDesc: 'Kataloğumuzdan özenle seçilmiş oteller ve deneyimlerle en iyi destinasyonları keşfet.',
  },
  en: {
    intro: (city) => `Discover ${city}`,
    hotel: (name) => ` with a stay at ${name}`,
    exp: (title) => ` and enjoy ${title}`,
    getaway: (city) => `${city} Getaway`,
    customTitle: 'Custom Travel Package',
    customDesc: 'Explore top-rated destinations with hand-picked hotels and experiences from our catalog.',
  },
};

function buildFallbackSuggestions(hotels, experiences, lang = 'tr') {
  const s = fallbackStrings[lang] || fallbackStrings.en;

  const cities = [
    ...new Set([
      ...hotels.map(h => h.city),
      ...experiences.map(e => e.city),
    ]),
  ].filter(Boolean);

  const suggestions = [];

  for (let i = 0; i < Math.min(3, cities.length); i++) {
    const city = cities[i];
    const topHotel = hotels.find(h => h.city === city);
    const topExp = experiences.find(e => e.city === city);

    let description = s.intro(city);
    if (topHotel) description += s.hotel(topHotel.name);
    if (topExp) description += s.exp(topExp.title);
    description += '.';

    suggestions.push({
      title: s.getaway(city),
      description,
      score: parseFloat((0.9 - i * 0.1).toFixed(1)),
    });
  }

  while (suggestions.length < 3) {
    suggestions.push({
      title: s.customTitle,
      description: s.customDesc,
      score: parseFloat((0.6 - suggestions.length * 0.05).toFixed(2)),
    });
  }

  return suggestions.slice(0, 3);
}

async function generateSuggestions() {
  return { success: true };
}

// Each scene has 3 prompt variations; one is picked randomly per generation.
const SCENE_PROMPTS = {
  istanbul: [
    'A realistic travel photograph of this exact person standing in front of the Blue Mosque in Istanbul Turkey, full body visible, wide angle 35mm lens, natural golden hour lighting, candid tourist moment, cinematic composition, the mosque clearly visible in background',
    'A realistic travel photograph of this exact person walking through the Grand Bazaar marketplace in Istanbul Turkey, full body visible, wide angle 35mm lens, colourful stalls and lanterns, cinematic travel photography, candid moment',
    'A realistic travel photograph of this exact person on Galata Bridge overlooking the Bosphorus at sunset in Istanbul Turkey, full body visible, wide angle 35mm lens, warm amber light, boats on the water, cinematic travel photography',
  ],
  paris: [
    'A realistic travel photograph of this exact person standing near the Eiffel Tower in Paris France, full body visible, wide angle 35mm lens, natural daylight, candid tourist moment, Parisian street atmosphere, person looking toward the tower',
    'A realistic travel photograph of this exact person strolling along the Seine River in Paris France, the Eiffel Tower visible in the distance, full body visible, wide angle 35mm lens, golden hour lighting, cinematic travel photography',
    'A realistic travel photograph of this exact person sitting at a Parisian café on Champs-Élysées, full body visible, wide angle 35mm lens, soft morning light, croissants on the table, cinematic travel photography, candid moment',
  ],
  rome: [
    'A realistic travel photograph of this exact person walking near the Colosseum in Rome Italy, full body visible, wide angle 35mm lens, natural warm lighting, cobblestone street, candid tourist moment, cinematic travel photography',
    'A realistic travel photograph of this exact person tossing a coin at the Trevi Fountain in Rome Italy, full body visible, wide angle 35mm lens, crowded tourist scene, cinematic travel photography, golden afternoon light',
    'A realistic travel photograph of this exact person standing in the Roman Forum in Rome Italy, ancient ruins and columns surrounding them, full body visible, wide angle 35mm lens, warm sunset light, cinematic travel photography',
  ],
  barcelona: [
    'A realistic travel photograph of this exact person in front of Sagrada Familia in Barcelona Spain, full body visible, wide angle 35mm lens, bright Mediterranean sunlight, candid tourist moment, realistic travel photography',
    'A realistic travel photograph of this exact person walking along La Rambla boulevard in Barcelona Spain, full body visible, wide angle 35mm lens, lively street market, Mediterranean atmosphere, cinematic travel photography',
    'A realistic travel photograph of this exact person at Park Güell in Barcelona Spain, colourful mosaic architecture in background, full body visible, wide angle 35mm lens, bright sunny day, cinematic travel photography',
  ],
  tokyo: [
    'A realistic travel photograph of this exact person walking through Shibuya crossing in Tokyo Japan at night, full body visible, wide angle 35mm lens, neon lights reflecting on wet pavement, cinematic travel photography, candid moment',
    'A realistic travel photograph of this exact person at Senso-ji temple in Asakusa Tokyo Japan, full body visible, wide angle 35mm lens, lanterns and crowds, cherry blossoms, cinematic travel photography, golden hour',
    'A realistic travel photograph of this exact person in Shinjuku district Tokyo Japan at night, full body visible, wide angle 35mm lens, glowing signs and neon lights, cinematic street photography, candid moment',
  ],
  london: [
    'A realistic travel photograph of this exact person near Big Ben in London England, full body visible, wide angle 35mm lens, overcast British sky, cinematic travel photography, candid moment',
    'A realistic travel photograph of this exact person on Tower Bridge in London England, the Thames River below, full body visible, wide angle 35mm lens, dramatic cloudy sky, cinematic travel photography',
    'A realistic travel photograph of this exact person in front of Buckingham Palace in London England, full body visible, wide angle 35mm lens, royal guards visible, cinematic travel photography, morning light',
  ],
  berlin: [
    'A realistic travel photograph of this exact person at Brandenburg Gate in Berlin Germany, full body visible, wide angle 35mm lens, natural lighting, candid tourist moment, realistic travel photography, preserve the person\'s exact gender appearance and clothing',
    'A realistic travel photograph of this exact person walking along Berlin Wall art district, full body visible, wide angle 35mm lens, urban atmosphere, realistic travel photography, preserve the person\'s exact gender appearance and clothing',
    'A realistic travel photograph of this exact person at Reichstag building in Berlin Germany, full body visible, wide angle 35mm lens, natural lighting, realistic travel photography, preserve the person\'s exact gender appearance and clothing',
  ],
  dubai: [
    'A realistic travel photograph of this exact person in front of Burj Khalifa in Dubai UAE, full body visible, wide angle 35mm lens, golden sunset lighting, cinematic travel photography, modern city atmosphere',
    'A realistic travel photograph of this exact person at Dubai Marina waterfront, luxury yachts and skyscrapers, full body visible, wide angle 35mm lens, blue sky, cinematic travel photography, candid moment',
    'A realistic travel photograph of this exact person at the Dubai Desert Safari, sand dunes stretching to the horizon, camel nearby, full body visible, wide angle 35mm lens, dramatic desert sunset, cinematic travel photography',
  ],
  // ── Time Teleport stops ──
  stone_age: [
    'A realistic historical photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing in a prehistoric forest clearing in the Stone Age, ancient trees, misty atmosphere, primitive fire in background, full body visible, wide angle, natural lighting, the person looks like they actually belong in this time period',
    'A realistic historical photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing at the entrance of a Stone Age cave, cave paintings on the rock walls behind them, hunters with primitive tools nearby, ancient wilderness, full body visible, wide angle, natural lighting',
    'A realistic historical photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing beside a prehistoric megalith stone circle at dawn, misty ancient landscape, early humans in the distance, full body visible, wide angle, natural dramatic sky',
  ],
  ancient: [
    'A realistic historical photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing in an ancient civilization street, massive stone architecture, torches, market activity, full body visible, wide angle, natural lighting',
    'A realistic historical photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing in an ancient Roman forum, senators in togas walking past, grand stone columns, the Colosseum visible in background, full body visible, wide angle, warm afternoon sun',
    'A realistic historical photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing on the ancient Silk Road, camel caravans passing, merchants from different civilisations, desert landscape and stone temples, full body visible, wide angle, warm cinematic lighting',
  ],
  medieval: [
    'A realistic historical photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing in a medieval town square, castle in background, stone streets, villagers around, full body visible, wide angle, natural lighting',
    'A realistic historical photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing at the gate of a medieval castle, torches and banners, armoured guards, stone drawbridge, cobblestone path, full body visible, wide angle, overcast dramatic sky',
    'A realistic historical photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing in a medieval market fair, merchants selling goods, people in period clothing, castle towers in background, full body visible, wide angle, warm natural lighting',
  ],
  year1920: [
    'A realistic historical photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing on a 1920s european city street, vintage cars, tram tracks, golden light, full body visible, wide angle, natural lighting',
    'A realistic historical photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing outside a 1920s jazz club at night, art deco neon signs, people in period fashion, vintage automobiles parked on the street, full body visible, wide angle, warm golden light',
    'A realistic historical photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing on a 1920s train station platform, steam locomotive arriving, travellers in period clothing, vintage luggage and signage, full body visible, wide angle, atmospheric morning light',
  ],
  present: [
    'A realistic photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing in a modern city square, contemporary buildings, natural daylight, full body visible, wide angle',
    'A realistic photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing in a busy modern urban plaza, glass towers, electric vehicles, people around, full body visible, wide angle, natural daylight',
    'A realistic photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing on a modern city waterfront promenade, contemporary skyline, golden hour light, full body visible, wide angle',
  ],
  future: [
    'A realistic sci-fi photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing in a futuristic megacity, floating vehicles, neon lights, glass towers, full body visible, wide angle, cinematic lighting',
    'A realistic sci-fi photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing on a transparent sky bridge in a futuristic city 2200 AD, clouds below, holographic signs overhead, sleek architecture, full body visible, wide angle, dramatic cinematic lighting',
    'A realistic sci-fi photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing at a futuristic spaceport in 2200 AD, sleek spacecraft in background, advanced crowd in futuristic clothing, neon and chrome architecture, full body visible, wide angle, cinematic lighting',
  ],
  alien_world: [
    'A realistic sci-fi photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing on an alien planet with bizarre landscape, two suns in the sky, alien vegetation and architecture, strange atmospheric colors, full body visible, wide angle, cinematic lighting',
    'A realistic sci-fi photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing in an alien jungle, towering bioluminescent plants, strange creatures visible, alien sky with multiple moons, full body visible, wide angle, cinematic lighting',
    'A realistic sci-fi photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing on an alien cliff overlooking a vast alien ocean, bioluminescent waves, alien sky with a giant gas planet on the horizon, full body visible, wide angle, cinematic dramatic lighting',
  ],
  end: [
    'A realistic post-apocalyptic photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing in abandoned city ruins, nature reclaiming skyscrapers, red sunset sky, full body visible, wide angle, cinematic lighting',
    'A realistic post-apocalyptic photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing on a crumbling bridge over an overgrown city, vines covering ruined skyscrapers, dramatic red and orange sky, full body visible, wide angle, cinematic lighting',
    'A realistic post-apocalyptic photograph of the exact person from the input photo — preserve their gender, face, hair and skin tone — standing in a decayed urban street reclaimed by forest, moss-covered buildings, eerie golden light filtering through broken windows, full body visible, wide angle, cinematic lighting',
  ],
};

function pickPrompt(sceneId) {
  const variants = SCENE_PROMPTS[sceneId];
  if (!variants) return SCENE_PROMPTS.paris[0];
  return variants[Math.floor(Math.random() * variants.length)];
}

/**
 * POST /api/ai/face-swap
 * Places the user in a scene via fal.ai flux-pro/kontext.
 * fal.subscribe waits internally — no polling needed.
 *
 * @param {string} userPhotoDataUri  — data:image/jpeg;base64,...
 * @param {string} cityId            — e.g. "istanbul", "mars", "ancient_egypt"
 * @returns {Promise<string>}        — result image as a base64 data URI
 */
async function faceSwap(userPhotoDataUri, cityId) {
  if (!process.env.FAL_API_KEY) throw new Error('FAL_API_KEY not configured');

  const prompt = pickPrompt(cityId);

  const result = await fal.subscribe('fal-ai/flux-kontext-pro', {
    input: {
      prompt,
      image_url: userPhotoDataUri,
    },
    logs: true,
  });

  const outputUrl = result.data.images[0].url;

  const imgRes = await fetch(outputUrl);
  const buffer = await imgRes.arrayBuffer();
  const contentType = imgRes.headers.get('content-type') || 'image/png';
  const base64 = Buffer.from(buffer).toString('base64');
  return `data:${contentType};base64,${base64}`;
}

module.exports = {
  getPackages,
  composePackage,
  getSuggestions,
  generateSuggestions,
  faceSwap,
};

