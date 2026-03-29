const express = require('express');
const router = express.Router();

// Allowlist: any subdomain of these trusted domains is permitted
const ALLOWED_SUFFIXES = [
  'fal.media',   // covers v3.fal.media, storage.v3.fal.media, cdn.fal.media, etc.
  'fal.ai',      // covers cdn.fal.ai, etc.
  'storage.googleapis.com',
];

function isAllowedHost(hostname) {
  return ALLOWED_SUFFIXES.some(
    suffix => hostname === suffix || hostname.endsWith('.' + suffix)
  );
}

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

  if (!isAllowedHost(parsed.hostname)) {
    console.error('[proxy-image] Blocked host:', parsed.hostname, 'url:', url);
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
