const express = require('express');
const router = express.Router();

const aiController = require('../../controllers/ai/ai.controller');
const { optionalJWT, verifyJWT } = require('../../middleware/auth.middleware');

// AI service root (sanity check)
router.get('/', (req, res) => {
  res.json({
    status: 'ai service online',
    endpoints: ['/packages', '/suggestions', '/compose'],
    language: req.lang || 'tr',
  });
});

// READ PATH → packages
router.get('/packages/:id', aiController.getPackage);
router.get('/packages', aiController.getPackages);

// ✅ AI suggestions (frontend bunu bekliyor)
router.get('/suggestions', aiController.getSuggestions);

// WRITE PATH → create package (optionalJWT: attaches req.userId if token present)
router.post('/compose', optionalJWT, aiController.composePackage);

// READ PATH → packages owned by authenticated user
router.get('/my-packages', verifyJWT, aiController.getMyPackages);

// AI face swap via fal.ai flux-pro/kontext (async polling)
router.post('/face-swap', aiController.submitFaceSwap);
router.get('/face-swap/status/:jobId', aiController.getFaceSwapStatus);

module.exports = router;
