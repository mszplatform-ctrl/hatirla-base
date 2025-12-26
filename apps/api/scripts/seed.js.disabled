const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./data.db');

db.serialize(() => {
  // Kullanıcı tablosu
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    email TEXT,
    name TEXT
  )`);

  // Örnek kullanıcı
  db.run(`INSERT INTO users (email, name) VALUES ('test@example.com', 'Test User')`);

  // Otel tablosu
  db.run(`CREATE TABLE IF NOT EXISTS hotels (
    id INTEGER PRIMARY KEY,
    name TEXT,
    price INTEGER
  )`);
  db.run(`INSERT INTO hotels (name, price) VALUES ('Test Hotel', 100)`);

  // Buraya diğer tabloları ekleyebilirsin (flights, experiences, itineraries, reels, referrals, badges)

  console.log('Seed tamamlandı');
});

db.close();
