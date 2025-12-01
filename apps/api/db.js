const path = require("path");
const Database = require("better-sqlite3");

// DB yolunu belirle
const DB_PATH = path.join(__dirname, "db", "hatirla.sqlite");

// Tek bir shared connection
const db = new Database(DB_PATH, { verbose: console.log });

module.exports = db;
