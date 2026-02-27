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
  console.log('🔍 [SERVICE] composePackage START');
  console.log('📦 Input:', { selections, language, userId });
  try {
    // 🔒 INPUT VALIDATION (ZOD)
    console.log('🔒 [SERVICE] Validating with Zod...');
    const parsed = composeSchema.parse({
      selections,
      language,
    });
    console.log('✅ [SERVICE] Validation passed:', parsed);
    const { selections: validSelections } = parsed;
    // 💰 totalPrice hesapla
    console.log('💰 [SERVICE] Calculating totalPrice...');
    const totalPrice = validSelections.reduce((sum, item) => {
      const price =
        item.price ??
        item.minPrice ??
        item.payload?.price ??
        item.payload?.minPrice ??
        0;
      return sum + (typeof price === 'number' ? price : 0);
    }, 0);
    console.log('✅ [SERVICE] totalPrice:', totalPrice);
    // 🧱 DB write
    console.log('🧱 [SERVICE] Calling repository.createPackage...');
    const created = await packageRepository.createPackage({
      userId,
      items: validSelections,
      totalPrice,
      currency: 'USD',
      status: 'draft',
    });
    console.log('✅ [SERVICE] Repository returned:', created);
    // 🤖 AI BRIDGE (Stage 4.5)
    console.log('🤖 [SERVICE] Generating itinerary (AI bridge)...');
    const itinerary = { days: [], summary: 'Hazirlaniyor...' };
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
    console.log('✅ [SERVICE] Final response:', response);
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
async function getSuggestions() {
  const db = require('../../db');

  const hotels = db.prepare(`
    SELECT name, city, country, rating, price_per_night, description
    FROM hotels
    WHERE rating IS NOT NULL
    ORDER BY rating DESC
    LIMIT 5
  `).all();

  const experiences = db.prepare(`
    SELECT title, city, country, rating, price, category, description
    FROM experiences
    WHERE rating IS NOT NULL
    ORDER BY rating DESC
    LIMIT 8
  `).all();

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

    const userPrompt = `Based on the following travel catalog, generate exactly 3 travel package suggestions.

HOTELS:
${hotelLines}

EXPERIENCES:
${expLines}

Return ONLY a valid JSON array with exactly 3 objects. No markdown, no explanation.
Each object must have:
- "title": string (short, catchy package name)
- "description": string (2-3 sentences about what makes this package special)
- "score": number between 0 and 1

Example: [{"title":"...","description":"...","score":0.9},...]`;

    const completion = await openai.chat.completions.create(
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a travel package recommendation AI. Always respond with valid JSON only — no markdown, no code fences, no extra text.',
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
    return buildFallbackSuggestions(hotels, experiences);
  }
}

function buildFallbackSuggestions(hotels, experiences) {
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

    let description = `Discover ${city}`;
    if (topHotel) description += ` with a stay at ${topHotel.name}`;
    if (topExp) description += ` and enjoy ${topExp.title}`;
    description += '.';

    suggestions.push({
      title: `${city} Getaway`,
      description,
      score: parseFloat((0.9 - i * 0.1).toFixed(1)),
    });
  }

  while (suggestions.length < 3) {
    suggestions.push({
      title: 'Custom Travel Package',
      description: 'Explore top-rated destinations with hand-picked hotels and experiences from our catalog.',
      score: parseFloat((0.6 - suggestions.length * 0.05).toFixed(2)),
    });
  }

  return suggestions.slice(0, 3);
}

async function generateSuggestions() {
  return { success: true };
}
module.exports = {
  getPackages,
  composePackage,
  getSuggestions,
  generateSuggestions,
};

