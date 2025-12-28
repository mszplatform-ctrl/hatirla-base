const express = require('express');
const router = express.Router();
const aiController = require('../../controllers/ai/ai.controller');
const { composeRateLimit } = require('../gateway/rateLimit');

/**
 * AI service root (sanity check)
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ai service online',
    endpoints: ['/packages', '/compose', '/suggestions'],
    language: req.lang || 'tr',
  });
});

/**
 * READ PATH → packages
 */
router.get('/packages', aiController.getPackages);

/**
 * WRITE PATH → create package (RATE LIMITED)
 */
router.post('/compose', composeRateLimit, aiController.composePackage);

/**
 * READ PATH → AI suggestions (MOCK / FALLBACK)
 * Frontend bunu çağırıyor: GET /api/ai/suggestions?lang=tr
 * Gerçek AI sonra buraya bağlanacak
 */
router.get('/suggestions', (req, res) => {
  const lang = req.query.lang || 'tr';
  
  const suggestions = {
    tr: [
      {
        type: 'hotel',
        score: 0.87,
        payload: {
          id: 101,
          name: 'AI Tavsiyeli Otel',
          price: 120,
          currency: 'USD',
        },
      },
      {
        type: 'experience',
        score: 0.82,
        payload: {
          id: 202,
          title: 'AI Seçimi Deneyim',
          price: 60,
          currency: 'USD',
        },
      },
      {
        type: 'experience',
        score: 0.76,
        payload: {
          id: 203,
          title: 'Gizli Yerel Deneyim',
          price: 45,
          currency: 'USD',
        },
      },
    ],
    en: [
      {
        type: 'hotel',
        score: 0.87,
        payload: {
          id: 101,
          name: 'AI Recommended Hotel',
          price: 120,
          currency: 'USD',
        },
      },
      {
        type: 'experience',
        score: 0.82,
        payload: {
          id: 202,
          title: 'AI Selected Experience',
          price: 60,
          currency: 'USD',
        },
      },
      {
        type: 'experience',
        score: 0.76,
        payload: {
          id: 203,
          title: 'Hidden Local Experience',
          price: 45,
          currency: 'USD',
        },
      },
    ],
  };

  res.json(suggestions[lang] || suggestions.tr);
});

module.exports = router;