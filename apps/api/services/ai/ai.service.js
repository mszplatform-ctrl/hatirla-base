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

const CITY_PROMPTS = {
  istanbul:  'A realistic travel photograph of this exact person standing in front of the Blue Mosque in Istanbul Turkey, full body visible, wide angle 35mm lens, natural golden hour lighting, candid tourist moment, person interacting with the environment, realistic travel photography, cinematic composition, the mosque clearly visible in background',
  paris:     'A realistic travel photograph of this exact person standing near the Eiffel Tower in Paris France, full body visible, wide angle 35mm lens, natural daylight, candid tourist moment, Parisian street atmosphere, realistic travel photography, person looking toward the tower',
  rome:      'A realistic travel photograph of this exact person walking near the Colosseum in Rome Italy, full body visible, wide angle 35mm lens, natural warm lighting, cobblestone street, candid tourist moment, cinematic travel photography',
  barcelona: 'A realistic travel photograph of this exact person in front of Sagrada Familia in Barcelona Spain, full body visible, wide angle 35mm lens, bright Mediterranean sunlight, candid tourist moment, realistic travel photography',
  tokyo:     'A realistic travel photograph of this exact person walking through Shibuya crossing in Tokyo Japan at night, full body visible, wide angle 35mm lens, neon lights reflecting on wet pavement, cinematic travel photography, candid moment',
  newyork:   'A realistic travel photograph of this exact person in Times Square New York City, full body visible, wide angle 35mm lens, night scene, neon billboards, cinematic street photography, candid tourist moment',
  london:    'A realistic travel photograph of this exact person near Big Ben in London England, full body visible, wide angle 35mm lens, overcast British sky, cinematic travel photography, candid moment',
  dubai:     'A realistic travel photograph of this exact person in front of Burj Khalifa in Dubai UAE, full body visible, wide angle 35mm lens, golden sunset lighting, cinematic travel photography, modern city atmosphere',
  tokyo2050: 'A cinematic sci-fi photograph of this exact person walking through futuristic Tokyo in 2050, full body visible, holographic advertisements, flying vehicles, neon cyberpunk atmosphere, wide angle 35mm lens, ultra realistic, cinematic lighting',
  mars:      'A cinematic sci-fi photograph of this exact person standing on the surface of Mars, full body visible in a sleek space suit, red rocky landscape, Earth visible in the distant sky, dramatic lighting, ultra realistic, wide angle 35mm lens',
  orbit:     'A cinematic sci-fi photograph of this exact person floating in Earth orbit inside a space station window, full body visible, Earth visible below, stars in background, dramatic space lighting, ultra realistic',
};

/**
 * POST /api/ai/face-swap
 * Places the user naturally in a city or cosmic scene via flux-kontext-pro.
 * Falls back gracefully — throws on hard failure so the controller can 500.
 *
 * @param {string} userPhotoDataUri  — data:image/jpeg;base64,... from the frontend
 * @param {string} cityId            — e.g. "istanbul", "mars", "orbit"
 * @returns {Promise<string>}        — result image as a data URI
 */
async function faceSwap(userPhotoDataUri, cityId) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('REPLICATE_API_TOKEN not configured');

  const prompt = CITY_PROMPTS[cityId] || CITY_PROMPTS.paris;

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

