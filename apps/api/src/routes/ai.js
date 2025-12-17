const express = require('express');
const router = express.Router();

const aiController = require('../../controllers/ai/ai.controller');

// AI service root (sanity check)
router.get('/', (req, res) => {
  res.json({
    status: 'ai service online',
    endpoints: ['/packages', '/compose'],
    language: req.lang || 'tr',
  });
});

// REAL endpoint → controller → service → repository → DB
router.get('/packages', aiController.getPackages);

// WRITE PATH → create package
router.post('/compose', aiController.composePackage);

module.exports = router;
