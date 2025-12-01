-- Tabloları temizle (dev için)
DROP TABLE IF EXISTS reels;
DROP TABLE IF EXISTS referrals;
DROP TABLE IF EXISTS experiences;
DROP TABLE IF EXISTS destinations;
DROP TABLE IF EXISTS users;

-- USERS
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DESTINATIONS
CREATE TABLE destinations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

-- EXPERIENCES
CREATE TABLE experiences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  destination_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT,
  price_range TEXT,
  FOREIGN KEY (destination_id) REFERENCES destinations(id)
);

-- REFERRALS
CREATE TABLE referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  code TEXT NOT NULL UNIQUE,
  used_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- REELS
CREATE TABLE reels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  destination_id INTEGER,
  experience_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (destination_id) REFERENCES destinations(id),
  FOREIGN KEY (experience_id) REFERENCES experiences(id)
);

