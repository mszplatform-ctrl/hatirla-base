const db = require('./db');
const schema = db.prepare('PRAGMA table_info(hotels)').all();
console.log('Hotels columns:', schema.map(s => s.name).join(', '));
