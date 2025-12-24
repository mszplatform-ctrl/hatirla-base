/**
 * AI Interface
 * Central switch between AI adapters (local / real)
 */

const localAdapter = require('./ai.adapter.local');

const AI_ENABLED = process.env.AI_ENABLED === 'true';

/**
 * Generate itinerary via active AI adapter
 */
async function generateItinerary({ selections = [], language = 'tr' }) {
  if (!AI_ENABLED) {
    return localAdapter.generateItinerary({ selections, language });
  }

  // 🚧 Future: real AI adapter will be plugged here
  throw new Error('AI adapter not enabled');
}

module.exports = {
  generateItinerary,
  AI_ENABLED,
};
