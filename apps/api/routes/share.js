const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.json({
    message: 'Paket başarıyla paylaşıldı!',
    shareLink: 'https://example.com/shared/trip-123'
  });
});

module.exports = router;
