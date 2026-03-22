const express = require('express');
const router = express.Router();

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const imageUrl = `${process.env.R2_PUBLIC_URL}/${id}.jpg`;
  const appUrl = 'https://xotiji.app';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My XOTIJI Space Selfie</title>
  <meta property="og:title" content="My XOTIJI Space Selfie" />
  <meta property="og:description" content="I just placed myself in an iconic destination with XOTIJI ✨" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${appUrl}/s/${id}" />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta name="twitter:title" content="My XOTIJI Space Selfie" />
  <meta name="twitter:description" content="I just placed myself in an iconic destination with XOTIJI ✨" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #000; color: #fff; font-family: sans-serif; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }
    img { max-width: 90vw; max-height: 70vh; border-radius: 12px; }
    a { color: #fff; text-decoration: none; background: #1a1a1a; border: 1px solid #333; padding: 12px 24px; border-radius: 8px; font-size: 14px; }
    a:hover { background: #222; }
  </style>
</head>
<body>
  <img src="${imageUrl}" alt="XOTIJI Space Selfie" />
  <a href="${appUrl}">✨ Create your own at xotiji.app</a>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

module.exports = router;
