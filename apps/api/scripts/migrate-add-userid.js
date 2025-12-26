const db = require('./db');

try {
  db.prepare(`
    ALTER TABLE packages
    ADD COLUMN user_id TEXT;
  `).run();

  console.log('✅ user_id column added to packages');
} catch (err) {
  console.error('❌ Migration error:', err.message);
}
