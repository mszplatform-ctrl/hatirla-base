/**
 * User Repository - Data access layer
 * Raw pg queries, same pattern as package.repository.js
 */

const db = require('../db');

function mapRow(row) {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    name: row.name,
    createdAt: row.created_at,
  };
}

async function createUser({ id, email, passwordHash, name }) {
  const { rows } = await db.query(
    `INSERT INTO users (id, email, password_hash, name)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, email, passwordHash, name || null]
  );
  return mapRow(rows[0]);
}

async function getUserByEmail(email) {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return rows.length ? mapRow(rows[0]) : null;
}

async function getUserById(id) {
  const { rows } = await db.query(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return rows.length ? mapRow(rows[0]) : null;
}

module.exports = { createUser, getUserByEmail, getUserById };
