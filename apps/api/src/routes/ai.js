const express = require('express');
const router = express.Router();

// AI service root (debug / sanity)
router.get('/', (req, res) => {
  res.json({
    status: 'ai service online',
    endpoints: ['/packages'],
    language: req.lang || 'tr'
  });
});

// AI Packages endpoint (MINIMAL – test için)
router.get('/packages', (req, res) => {
  res.json({
    status: 'ok',
    source: 'ai',
    message: 'AI packages endpoint reached',
    language: req.lang || 'tr'
  });
});

module.exports = router;
