/**
 * AI Service
 * Business logic layer for AI-related operations
 */
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
  mars: [
    'A cinematic sci-fi photograph of this exact person standing on the surface of Mars, full body visible in a sleek space suit, red rocky landscape, Earth visible in the distant sky, dramatic lighting, ultra realistic, wide angle 35mm lens',
    'A cinematic sci-fi photograph of this exact person exploring a Mars canyon in a space suit, towering red rock formations, dust swirling in the atmosphere, full body visible, ultra realistic, wide angle lens, dramatic lighting',
    'A cinematic sci-fi photograph of this exact person next to a Mars rover on the Martian surface, distant mountains, reddish sky, full body visible in advanced space suit, ultra realistic, cinematic lighting',
  ],
  orbit: [
    'A cinematic sci-fi photograph of this exact person floating in Earth orbit inside a space station window, full body visible, Earth visible below, stars in background, dramatic space lighting, ultra realistic',
    'A cinematic sci-fi photograph of this exact person in a space suit performing a spacewalk above Earth, planet filling the background, full body visible, dramatic sunlight, ultra realistic, wide angle lens',
    'A cinematic sci-fi photograph of this exact person inside a futuristic space station observation deck, panoramic window showing Earth from orbit, full body visible, ambient space lighting, ultra realistic',
  ],
  saturn: [
    'A cinematic sci-fi photograph of this exact person standing on the rings of Saturn, full body visible in a sleek space suit, Saturn\'s massive planet visible above, stars and cosmic dust, dramatic space lighting, ultra realistic, wide angle lens',
    'A cinematic sci-fi photograph of this exact person floating near Saturn\'s rings, ice crystals and ring particles surrounding them, Saturn looming large overhead, full body visible in a space suit, ultra realistic, dramatic lighting',
    'A cinematic sci-fi photograph of this exact person on a small moon orbiting Saturn, the rings arcing across the sky, full body visible in a space suit, cosmic landscape, ultra realistic, wide angle lens, dramatic space lighting',
  ],
  // ── Time Teleport ──
  ancient_egypt: [
    'A cinematic historical scene of this exact person in Ancient Egypt 2000 BC, the Great Pyramids under construction in the background, desert landscape, Egyptian people and merchants, full body visible, realistic historical photography, cinematic lighting, wide angle',
    'A cinematic historical scene of this exact person beside the Sphinx in Ancient Egypt 2000 BC, pyramids on the horizon, desert sand, Egyptian priests and workers, full body visible, realistic historical photography, golden sunlight',
    'A cinematic historical scene of this exact person on the banks of the Nile River in Ancient Egypt 2000 BC, papyrus reeds, boats, Egyptian temples, full body visible, realistic historical photography, warm cinematic lighting',
  ],
  ancient_greece: [
    'A cinematic historical scene of this exact person in Ancient Greece 500 BC, the Parthenon on the Acropolis in the background, marble columns, Mediterranean sea visible, Greek citizens in robes, full body visible, realistic historical photography',
    'A cinematic historical scene of this exact person at the Ancient Greek agora marketplace 500 BC, philosophers debating, marble statues, Mediterranean light, full body visible, realistic historical photography, cinematic composition',
    'A cinematic historical scene of this exact person at the Temple of Zeus in Ancient Olympia Greece 500 BC, olive trees and columns, athletes and spectators, full body visible, realistic historical photography, golden afternoon light',
  ],
  roman_era: [
    'A cinematic historical scene of this exact person in Ancient Rome, the Colosseum and Roman forum visible, Roman citizens and soldiers, cobblestone streets, full body visible, realistic historical photography, cinematic lighting',
    'A cinematic historical scene of this exact person in a Roman marketplace in Ancient Rome, merchants selling goods, togas and armour, grand architecture, full body visible, realistic historical photography, warm sunlight',
    'A cinematic historical scene of this exact person watching gladiators at the Colosseum in Ancient Rome, roaring crowds, sand arena, Roman spectacle, full body visible, realistic historical photography, dramatic lighting',
  ],
  medieval: [
    'A cinematic historical scene of this exact person in a Medieval European city 1200 AD, stone castles and cobblestone streets, market stalls, people in medieval clothing, full body visible, realistic historical photography',
    'A cinematic historical scene of this exact person at a Medieval jousting tournament 1200 AD, knights on horseback, castle in the background, cheering crowd, full body visible, realistic historical photography, cinematic lighting',
    'A cinematic historical scene of this exact person crossing a drawbridge at a medieval castle 1200 AD, torches and banners, armoured guards, moat below, full body visible, realistic historical photography, overcast dramatic sky',
  ],
  renaissance: [
    'A cinematic historical scene of this exact person in Renaissance Florence 1500, the grand cathedral dome in the background, artists and merchants on the street, beautiful Italian architecture, full body visible, realistic historical photography',
    'A cinematic historical scene of this exact person in a Renaissance artist\'s studio in Florence 1500, paintings and sculptures, Michelangelo-era setting, full body visible, realistic historical photography, warm candlelight',
    'A cinematic historical scene of this exact person at a Renaissance festival in Venice 1500, elaborate masks and costumes, canal and gondolas, grand palazzo, full body visible, realistic historical photography, golden hour light',
  ],
  industrial: [
    'A cinematic historical scene of this exact person in 1800s Industrial London, steam engines and factories, Victorian architecture, fog and gaslit streets, full body visible, realistic historical photography',
    'A cinematic historical scene of this exact person at a Victorian railway station in London 1800s, steam locomotive, top hats and long coats, iron and glass architecture, full body visible, realistic historical photography, atmospheric fog',
    'A cinematic historical scene of this exact person in a Victorian market street in London 1800s, horse-drawn carriages, gaslit shop fronts, cobblestones, full body visible, realistic historical photography, moody cinematic lighting',
  ],
  future2200: [
    'A cinematic sci-fi scene of this exact person in a futuristic city 2200 AD, flying vehicles, holographic displays, advanced architecture, full body visible, ultra realistic, wide angle lens, cinematic lighting',
    'A cinematic sci-fi scene of this exact person walking through a floating sky city in 2200 AD, clouds below, transparent walkways, holographic signs, full body visible, ultra realistic, dramatic lighting, wide angle lens',
    'A cinematic sci-fi scene of this exact person at a futuristic spaceport in 2200 AD, sleek spacecraft, diverse crowd in advanced clothing, neon and chrome architecture, full body visible, ultra realistic, cinematic lighting',
  ],
};

function pickPrompt(sceneId) {
  const variants = SCENE_PROMPTS[sceneId];
  if (!variants) return SCENE_PROMPTS.paris[0];
  return variants[Math.floor(Math.random() * variants.length)];
}

/**
 * POST /api/ai/face-swap
 * Places the user in a city, cosmic, or historical scene via flux-kontext-pro.
 * Falls back gracefully — throws on hard failure so the controller can 500.
 *
 * @param {string} userPhotoDataUri  — data:image/jpeg;base64,... from the frontend
 * @param {string} cityId            — e.g. "istanbul", "mars", "ancient_egypt"
 * @returns {Promise<string>}        — result image as a data URI
 */
async function faceSwap(userPhotoDataUri, cityId) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('REPLICATE_API_TOKEN not configured');

  const prompt = pickPrompt(cityId);

  // Start the prediction via flux-kontext-pro
  const startRes = await fetch(
    'https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions',
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'wait=60', // ask Replicate to wait synchronously up to 60 s
      },
      body: JSON.stringify({
        input: {
          input_image: userPhotoDataUri,
          prompt,
        },
      }),
    }
  );

  if (!startRes.ok) {
    const txt = await startRes.text();
    throw new Error(`Replicate API error ${startRes.status}: ${txt}`);
  }

  let prediction = await startRes.json();
  console.log(`[FaceSwap] Prediction ${prediction.id} status: ${prediction.status}`);

  // Poll until terminal status (in case Prefer:wait was ignored or timed out)
  const MAX_ATTEMPTS = 45; // 45 × 2 s = 90 s ceiling
  let attempts = 0;
  while (
    prediction.status !== 'succeeded' &&
    prediction.status !== 'failed' &&
    prediction.status !== 'canceled' &&
    attempts < MAX_ATTEMPTS
  ) {
    await new Promise((r) => setTimeout(r, 2000));
    const pollRes = await fetch(
      `https://api.replicate.com/v1/predictions/${prediction.id}`,
      { headers: { Authorization: `Token ${token}` } }
    );
    prediction = await pollRes.json();
    attempts++;
    console.log(`[FaceSwap] Poll ${attempts}: ${prediction.status}`);
  }

  if (prediction.status !== 'succeeded' || !prediction.output) {
    throw new Error(
      `Face swap prediction did not succeed: ${prediction.error || prediction.status}`
    );
  }

  // Output is typically a URL or array of URLs
  const outputUrl = Array.isArray(prediction.output)
    ? prediction.output[0]
    : prediction.output;

  // Download and return as base64 data URI so the frontend can display it directly
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

