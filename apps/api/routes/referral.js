const express = require('express');
const router = express.Router();

// Basit referral kodu üretici mock endpoint
router.get('/create', (req, res) => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  res.json({ referralCode: code });
});

module.exports = router;
