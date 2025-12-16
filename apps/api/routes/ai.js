/**
 * AI Routes
 * Handles AI-related endpoints
 */
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai/ai.controller');

// GET /api/ai/suggestions - Fetch all AI suggestions
router.get('/suggestions', aiController.getSuggestions);

// POST /api/ai/generate - Generate new AI suggestions
router.post('/generate', aiController.generateSuggestions);

// POST /api/ai/compose - Compose travel package from selections
router.post('/compose', aiController.composePackage);

// GET /api/ai/packages - Get all packages
router.get('/packages', aiController.getPackages);

module.exports = router;