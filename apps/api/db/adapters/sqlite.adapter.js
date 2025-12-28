const db = require('../../db.js');

module.exports = {
  getAllPackages: () =>
    db.prepare(`
      SELECT *
      FROM packages
      ORDER BY created_at DESC
    `).all(),

  getPackageById: (id) =>
    db.prepare(`
      SELECT *
      FROM packages
      WHERE id = ?
    `).get(id),

  createPackage: (data) => {
    const stmt = db.prepare(`
      INSERT INTO packages (
        title,
        description,
        total_price,
        items_count,
        currency
      )
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.title,
      data.description || null,
      data.totalPrice,
      data.itemsCount,
      data.currency || 'USD'
    );

    return {
      id: result.lastInsertRowid,
      title: data.title,
      description: data.description || null,
      total_price: data.totalPrice,
      items_count: data.itemsCount,
      currency: data.currency || 'USD',
    };
  },
};
