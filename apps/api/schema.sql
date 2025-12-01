DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS hotels;
DROP TABLE IF EXISTS flights;
DROP TABLE IF EXISTS experiences;
DROP TABLE IF EXISTS referrals;
DROP TABLE IF EXISTS ai_logs;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'editor',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hotels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  city TEXT,
  country TEXT,
  images TEXT,
  rating REAL,
  price_per_night REAL,
  amenities TEXT,
  location TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flights (
  id TEXT PRIMARY KEY,
  airline TEXT NOT NULL,
  from_city TEXT,
  from_country TEXT,
  to_city TEXT,
  to_country TEXT,
  departure_time TEXT,
  arrival_time TEXT,
  price REAL,
  duration_min INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE experiences (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  city TEXT,
  country TEXT,
  images TEXT,
  category TEXT,
  price REAL,
  rating REAL,
  duration_hours INTEGER,
  location TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE referrals (
  id TEXT PRIMARY KEY,
  ref_code TEXT UNIQUE NOT NULL,
  inviter_user_id TEXT,
  invited_email TEXT,
  joined_user_id TEXT,
  clicked_at TEXT,
  joined_at TEXT
);

CREATE TABLE ai_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT,
  input TEXT,
  output TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
