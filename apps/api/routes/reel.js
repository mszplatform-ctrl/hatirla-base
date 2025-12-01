const express = require('express');
const router = express.Router();

router.post('/generate', (req, res) => {
  res.json({ jobId: 'mock-job-123' });
});

router.get('/status/:id', (req, res) => {
  res.json({
    status: 'done',
    reel_url: 'https://example.com/mock-reel.mp4'
  });
});

module.exports = router;
