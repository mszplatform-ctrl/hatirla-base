/**
 * AI Service
 * Business logic layer for AI-related operations
 */
const packageRepository = require('../../data/package.repository');
const { composeSchema } = require('../../src/validation/compose.schema');
// ✅ AI BRIDGE (Stage 4.5)
// DOĞRU KAYNAK: src/routes/ai.js
const ai = require('../../src/routes/ai');
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
    const itinerary = await ai.generateItinerary({
      selections: validSelections,
      language,
    });
    // 🔁 Response
    const response = {
      success: true,
      package: {
        id: created.id,
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
 * Placeholders
 */
async function getSuggestions() {
  return [];
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