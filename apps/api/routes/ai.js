const express = require("express");
const router = express.Router();
const db = require("../db");

//
// 👉 GET /api/ai/suggestions
// Veritabanından tüm önerileri çeker
//
router.get("/suggestions", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM suggestions ORDER BY id DESC").all();

    const fixed = rows.map(r => ({
      id: r.id,
      type: r.type,
      payload: JSON.parse(r.payload),
      score: r.score,
      created_at: r.created_at
    }));

    res.json(fixed);
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ error: "DB error" });
  }
});


//
// 👉 POST /api/ai/compose
// Seçilen item’lardan gerçek paket oluşturur → DB'ye kaydeder
//
router.post("/compose", (req, res) => {
  try {
    const { selections } = req.body;

    const total_price = selections.reduce(
      (sum, item) => sum + (item.payload.price || 0),
      0
    );

    const stmt = db.prepare(
      "INSERT INTO packages (items, total_price) VALUES (?, ?)"
    );

    const result = stmt.run(JSON.stringify(selections), total_price);

    res.json({
      ok: true,
      package_id: result.lastInsertRowid,
      itinerary: {
        items: selections,
        total_price
      }
    });
  } catch (err) {
    console.error("Compose Error:", err);
    res.status(500).json({ error: "Compose failed" });
  }
});


//
// 👉 POST /api/ai/generate
// Mock AI önerilerini veritabanına ekler
//
router.post("/generate", (req, res) => {
  try {
    const suggestions = [
      { type: "hotel", payload: { name: "Hilton", price: 120 } },
      { type: "flight", payload: { origin: "IST → AMS", price: 250 } },
      { type: "activity", payload: { title: "Canal Tour", price: 45 } }
    ];

    const stmt = db.prepare(
      "INSERT INTO suggestions (type, payload, score) VALUES (?, ?, ?)"
    );

    suggestions.forEach(s => {
      stmt.run(s.type, JSON.stringify(s.payload), 0);
    });

    res.json({ ok: true, inserted: suggestions.length });

  } catch (err) {
    console.error("Insert Error:", err);
    res.status(500).json({ error: "DB insert error" });
  }
});

module.exports = router;


