const express = require("express");
const cors = require("cors");  // CORS eklendi
const app = express();
const PORT = 4000;

// Body parser
app.use(express.json());
app.use(cors());               // CORS middleware aktif

// Referral route
const referralRouter = require("./routes/referral.js");
app.use("/api/referral", referralRouter);

// Test endpoint (opsiyonel, doğrulamak için)
app.get("/api/referral/test", (req, res) => {
  res.json({ message: "Referral endpoint çalışıyor!" });
});

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
