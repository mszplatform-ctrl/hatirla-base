const express = require('express');
const router = express.Router();

// Allowlist: only proxy images from trusted CDN domains
const ALLOWED_HOSTS = [
  'cdn.fal.ai',
  'fal.media',
  'storage.googleapis.com',
  'v3.fal.media',
];

// GET /api/proxy-image?url=<encodedUrl>
router.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid url' });
  }

  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return res.status(403).json({ error: 'Host not allowed' });
  }

  if (parsed.protocol !== 'https:') {
    return res.status(400).json({ error: 'Only https URLs are allowed' });
  }

  let upstream;
  try {
    upstream = await fetch(url);
  } catch (err) {
    return res.status(502).json({ error: 'Failed to fetch upstream image' });
  }

  if (!upstream.ok) {
    return res.status(502).json({ error: `Upstream returned ${upstream.status}` });
  }

  const contentType = upstream.headers.get('content-type') || 'image/jpeg';
  if (!contentType.startsWith('image/')) {
    return res.status(502).json({ error: 'Upstream response is not an image' });
  }

  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'private, max-age=3600');

  const buffer = await upstream.arrayBuffer();
  res.end(Buffer.from(buffer));
});

module.exports = router;
