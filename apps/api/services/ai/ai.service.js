/**
 * AI Service
 * Business logic layer for AI-related operations
 */

const packageRepository = require('../../repositories/data/package.repository');

/**
 * Get all AI packages
 * Used by: GET /api/ai/packages
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
 * Placeholders (kept intentionally)
 * Will be reintroduced in later phases
 */
async function getSuggestions() {
  return [];
}

async function generateSuggestions() {
  return {
    success: true,
    message: 'AI generation placeholder',
  };
}

async function composePackage(selections, language = 'tr') {
  return {
    package: {
      selections,
      language,
    },
  };
}

module.exports = {
  getPackages,
  getSuggestions,
  generateSuggestions,
  composePackage,
};
