const express = require('express');
const router = express.Router();

// Data service root
router.get('/', (req, res) => {
  res.json({
    status: 'data service online',
    language: req.lang || 'tr'
  });
});

// Health
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'data',
    timestamp: new Date().toISOString(),
    language: req.lang || 'tr'
  });
});

module.exports = router;
