const express = require('express');
const router = express.Router();

const aiController = require('../../controllers/ai/ai.controller');
const { composeRateLimit } = require('../gateway/rateLimit');

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

// WRITE PATH → create package (RATE LIMITED)
router.post('/compose', composeRateLimit, aiController.composePackage);

module.exports = router;
