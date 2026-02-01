const db = require('./db');

console.log('=== BACKEND STATUS ===');
console.log('DB Path:', db.name);

const tables = db.prepare('SELECT name FROM sqlite_master WHERE type=?').all('table');
console.log('\nTables:', tables.map(t => t.name).join(', '));

tables.forEach(t => {
  const count = db.prepare('SELECT COUNT(*) as c FROM ' + t.name).get();
  console.log('  ' + t.name + ': ' + count.c + ' rows');
});

console.log('\n=== GATEWAY ROUTES ===');
const fs = require('fs');
const gatewayContent = fs.readFileSync('gateway/index.js', 'utf8');
const routes = gatewayContent.match(/router\.use\([^)]+\)/g) || [];
routes.forEach(r => console.log('  ' + r));
