const express = require('express');
const router = express.Router();

const aiController = require('../../controllers/ai/ai.controller');

// ❌ rateLimit KALDIRILDI (dosya projede yok)

// AI service root (sanity check)
router.get('/', (req, res) => {
  res.json({
    status: 'ai service online',
    endpoints: ['/packages', '/compose'],
    language: req.lang || 'tr',
  });
});

// READ PATH → packages
router.get('/packages', aiController.getPackages);

// WRITE PATH → create package (NO RATE LIMIT)
router.post('/compose', aiController.composePackage);

module.exports = router;
