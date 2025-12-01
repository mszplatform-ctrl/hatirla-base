const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "hatirla.sqlite");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

function main() {
  console.log("⏳ Seeding DB...");

  // Eski dosyayı sil (dev için)
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log("🧹 Eski DB silindi.");
  }

  const db = new Database(DB_PATH);

  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);
  console.log("📐 Şema oluşturuldu.");

  const insertUser = db.prepare(`
    INSERT INTO users (email) VALUES (?)
  `);
  const insertDestination = db.prepare(`
    INSERT INTO destinations (name, country, slug) VALUES (?, ?, ?)
  `);
  const insertExperience = db.prepare(`
    INSERT INTO experiences (destination_id, title, description, tags, price_range)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertReferral = db.prepare(`
    INSERT INTO referrals (user_id, code, used_count) VALUES (?, ?, ?)
  `);
  const insertReel = db.prepare(`
    INSERT INTO reels (user_id, destination_id, experience_id) VALUES (?, ?, ?)
  `);

  db.transaction(() => {
    const user1 = insertUser.run("test1@hatirla.app").lastInsertRowid;
    const user2 = insertUser.run("test2@hatirla.app").lastInsertRowid;

    const istanbul = insertDestination.run("İstanbul", "Türkiye", "istanbul").lastInsertRowid;
    const paris = insertDestination.run("Paris", "Fransa", "paris").lastInsertRowid;
    const tokyo = insertDestination.run("Tokyo", "Japonya", "tokyo").lastInsertRowid;

    insertExperience.run(
      istanbul,
      "Boğaz Tekne Turu",
      "İstanbul Boğazı'nda gün batımı tekne turu.",
      "romantic,boat,sunset",
      "mid"
    );
    insertExperience.run(
      istanbul,
      "Kadıköy Food Walk",
      "Yerel rehber eşliğinde sokak lezzetleri turu.",
      "food,local,walking",
      "low"
    );

    insertExperience.run(
      paris,
      "Eiffel Kulesi Gece Ziyareti",
      "Işık gösterisi ile Eiffel deneyimi.",
      "romantic,view,night",
      "high"
    );
    insertExperience.run(
      paris,
      "Seine Nehri Tekne Turu",
      "Şarap eşliğinde Seine nehrinde akşam turu.",
      "boat,romantic,relax",
      "mid"
    );

    insertExperience.run(
      tokyo,
      "Shibuya Gece Yürüyüşü",
      "Neon ışıklar altında Shibuya keşfi.",
      "nightlife,city,walking",
      "mid"
    );
    insertExperience.run(
      tokyo,
      "Sushi Workshop",
      "Usta şefle sushi yapım atölyesi.",
      "food,workshop,local",
      "mid"
    );

    insertReferral.run(user1, "REF-ALPHA", 3);
    insertReferral.run(user2, "REF-BETA", 0);

    insertReel.run(user1, istanbul, 1);
    insertReel.run(user2, paris, 3);
  })();

  db.close();
  console.log("✅ Seed tamamlandı!");
}

main();
