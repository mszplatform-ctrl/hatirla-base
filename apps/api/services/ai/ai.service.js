/**
 * AI Service
 * Business logic layer for AI-related operations
 */

const packageRepository = require('../../repositories/data/package.repository');
const { composeSchema } = require('../../src/validation/compose.schema');

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
  userId = null, // optional, future-proof
}) {
  // 🔒 INPUT VALIDATION (ZOD)
  const parsed = composeSchema.parse({
    selections,
    language,
  });

  const { selections: validSelections } = parsed;

  // 💰 totalPrice hesapla (tolerant & deterministic)
  const totalPrice = validSelections.reduce((sum, item) => {
    const price =
      item.price ??
      item.minPrice ??
      item.payload?.price ??
      item.payload?.minPrice ??
      0;

    return sum + (typeof price === 'number' ? price : 0);
  }, 0);

  // 🧱 DB write (REAL write-path)
  const created = await packageRepository.createPackage({
    userId, // null olabilir
    items: validSelections,
    totalPrice,
    currency: 'USD',
    status: 'draft',
  });

  // 🔁 Clean & stable response contract
  return {
    success: true,
    package: {
      id: created.id,
      totalPrice,
      currency: 'USD',
      status: 'draft',
    },
  };
}

/**
 * Placeholders (bilerek boş – Aşama 4+)
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
