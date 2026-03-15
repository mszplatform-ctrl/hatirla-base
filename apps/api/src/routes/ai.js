const express = require('express');
const router = express.Router();

const aiController = require('../../controllers/ai/ai.controller');

// AI service root (sanity check)
router.get('/', (req, res) => {
  res.json({
    status: 'ai service online',
    endpoints: ['/packages', '/suggestions', '/compose'],
    language: req.lang || 'tr',
  });
});

// READ PATH → packages
router.get('/packages', aiController.getPackages);

// ✅ AI suggestions (frontend bunu bekliyor)
router.get('/suggestions', aiController.getSuggestions);

// WRITE PATH → create package
router.post('/compose', aiController.composePackage);

// AI face swap — Phase 1: start prediction
router.post('/face-swap', aiController.faceSwap);
// AI face swap — Phase 2: poll prediction status
router.get('/face-swap/status/:id', aiController.getFaceSwapStatus);

module.exports = router;
