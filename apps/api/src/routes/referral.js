const express = require("express");
const router = express.Router();

// GET /api/referral/test
router.get("/test", (req, res) => {
  res.json({ message: "Referral route çalışıyor!" });
});

// POST /api/referral/generate
router.post("/generate", (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId gerekli" });
  }

  const code = "REF" + Math.floor(Math.random() * 100000);
  res.json({ code });
});

module.exports = router;
