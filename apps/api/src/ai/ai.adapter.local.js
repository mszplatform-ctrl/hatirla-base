/**
 * Local AI Adapter (Mock / Fallback)
 * This adapter simulates AI behavior when real AI is disabled.
 */

async function generateItinerary({ selections = [], language = 'tr' }) {
  return {
    mode: 'fallback',
    language,
    summary: 'AI disabled – fallback itinerary generated.',
    items: selections.map((item, index) => ({
      order: index + 1,
      type: item.type || 'unknown',
      price: item.price ?? 0,
      note: 'Fallback item (no AI enrichment)',
    })),
  };
}

module.exports = {
  generateItinerary,
};
