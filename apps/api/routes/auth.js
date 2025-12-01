const express = require("express");
const router = express.Router();

// MOCK LOGIN
router.post("/login", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email gerekli" });
  }

  return res.json({
    message: "Login başarılı!",
    user: {
      id: "mock-user-1",
      email,
      token: "mock-token-123"
    }
  });
});

module.exports = router;
