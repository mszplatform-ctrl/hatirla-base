/**
 * Package Repository - Data access layer
 * PostgreSQL implementation (Phase 1)
 */

const db = require('../db');

function mapRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    items: JSON.parse(row.items),
    totalPrice: row.total_price,
    currency: row.currency,
    status: row.status,
    itinerary: row.itinerary ? JSON.parse(row.itinerary) : { days: [], summary: '' },
    language: row.language,
    createdAt: row.created_at,
  };
}

async function getAllPackages() {
  const { rows } = await db.query(
    'SELECT * FROM packages ORDER BY created_at DESC'
  );
  return rows.map(mapRow);
}

async function createPackage({ userId, items, totalPrice, currency, status, itinerary, language }) {
  const { rows } = await db.query(
    `INSERT INTO packages (items, total_price, user_id, currency, status, itinerary, language)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      JSON.stringify(items),
      totalPrice,
      userId || null,
      currency || 'USD',
      status || 'draft',
      itinerary ? JSON.stringify(itinerary) : null,
      language || 'tr',
    ]
  );
  return mapRow(rows[0]);
}

module.exports = {
  getAllPackages,
  createPackage,
};
