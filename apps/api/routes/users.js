const express = require("express");
const router = express.Router();

// GET /api/users?email=mock@user.com
router.get("/", (req, res) => {
  const { email } = req.query;
  if (email === "mock@user.com") {
    return res.json({ ok: true, id: 1, email, name: "Test User" });
  }
  res.status(404).json({ ok: false, message: "User not found" });
});

module.exports = router;
