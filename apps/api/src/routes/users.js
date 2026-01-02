const express = require('express');
const router = express.Router();

// GET /api/users
router.get('/', (req, res) => {
  res.json([{ id: 'u1', name: 'Test User' }]);
});

// POST /api/users
router.post('/', (req, res) => {
  const { name } = req.body;
  res.json({ id: 'u2', name });
});

module.exports = router;
