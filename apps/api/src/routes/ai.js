const express = require('express');
const router = express.Router();

const aiController = require('../../controllers/ai/ai.controller');

// AI service root (sanity check)
router.get('/', (req, res) => {
  res.json({
    status: 'ai service online',
    endpoints: ['/packages'],
    language: req.lang || 'tr',
  });
});

// REAL endpoint → controller → service → repository → DB
router.get('/packages', aiController.getPackages);

module.exports = router;
