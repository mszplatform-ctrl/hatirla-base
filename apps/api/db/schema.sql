-- Drop all tables in dependency order
DROP TABLE IF EXISTS ai_logs;
DROP TABLE IF EXISTS referrals;
DROP TABLE IF EXISTS packages;
DROP TABLE IF EXISTS suggestions;
DROP TABLE IF EXISTS experiences;
DROP TABLE IF EXISTS flights;
DROP TABLE IF EXISTS hotels;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS users;

-- USERS
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMIN USERS
CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HOTELS
CREATE TABLE hotels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  description_tr TEXT,
  city TEXT,
  country TEXT,
  images TEXT,
  rating REAL,
  price_per_night REAL,
  amenities TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FLIGHTS
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXPERIENCES
CREATE TABLE experiences (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  description_tr TEXT,
  city TEXT,
  country TEXT,
  images TEXT,
  category TEXT,
  price REAL,
  rating REAL,
  duration_hours INTEGER,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REFERRALS
CREATE TABLE referrals (
  id TEXT PRIMARY KEY,
  ref_code TEXT UNIQUE NOT NULL,
  inviter_user_id TEXT,
  invited_email TEXT,
  joined_user_id TEXT,
  clicked_at TEXT,
  joined_at TEXT
);

-- PACKAGES
CREATE TABLE packages (
  id SERIAL PRIMARY KEY,
  items TEXT NOT NULL,
  total_price REAL NOT NULL,
  user_id TEXT,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUGGESTIONS
CREATE TABLE suggestions (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  score REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI LOGS
CREATE TABLE ai_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT,
  input TEXT,
  output TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
