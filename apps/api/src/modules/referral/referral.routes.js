const express = require('express');
const router = express.Router();
const referralController = require('./referral.controller');

router.get('/code/:code', referralController.getReferralByCode);
router.get('/user/:userId', referralController.getUserReferrals);
router.post('/generate', referralController.generateReferral);

module.exports = router;