// apps/api/repositories/data/package.repository.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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

// WRITE
function createPackage({ items, totalPrice, currency, status, userId }) {
  console.log('🗄️ [REPO] createPackage called');
  console.log('📦 [REPO] Input:', { items, totalPrice, currency, status, userId });

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

    console.log('🗄️ [REPO] SQL:', sql);
    console.log('🗄️ [REPO] Params:', params);

    db.run(sql, params, function (err) {
      if (err) {
        console.error('💣 [REPO] DB Error:', err.message);
        console.error('💣 [REPO] Stack:', err.stack);
        return reject(err);
      }

      const result = { id: this.lastID };
      console.log('✅ [REPO] Insert successful:', result);
      resolve(result);
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