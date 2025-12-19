// apps/api/repositories/data/package.repository.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// DB dosyasının TEK gerçek yolu
const dbPath = path.resolve(__dirname, '../../db/hatirla.sqlite');
const db = new sqlite3.Database(dbPath);

// READ
function getAllPackages() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM packages ORDER BY created_at DESC', [], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getPackageById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM packages WHERE id = ?', [id], (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// WRITE (ASLINDA BUGÜN YAPTIĞIMIZ ŞEY)
function createPackage({ items, totalPrice, currency, status, userId }) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO packages (
        items,
        total_price,
        currency,
        status,
        user_id
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      JSON.stringify(items),
      totalPrice,
      currency,
      status,
      userId || null,
    ];

    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID });
    });
  });
}

function updatePackageStatus(id, status) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE packages SET status = ? WHERE id = ?',
      [status, id],
      function (err) {
        if (err) return reject(err);
        resolve({ updated: this.changes });
      }
    );
  });
}

module.exports = {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackageStatus,
};
