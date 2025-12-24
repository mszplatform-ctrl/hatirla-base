/**
 * AI Bridge Entry Point
 * Decides which AI adapter to use
 */

const aiInterface = require('./ai.interface');
const localAdapter = require('./ai.adapter.local');

const AI_ENABLED = process.env.AI_ENABLED === 'true';

async function generateItinerary(payload) {
  if (!AI_ENABLED) {
    return localAdapter.generateItinerary(payload);
  }

  // future: real AI adapter
  return aiInterface.generateItinerary(payload);
}

module.exports = {
  generateItinerary,
};
