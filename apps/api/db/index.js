const provider = process.env.DB_PROVIDER || 'sqlite';

let adapter;

if (provider === 'prisma') {
  adapter = require('./adapters/prisma.adapter');
} else if (provider === 'sqlite') {
  adapter = require('./adapters/sqlite.adapter');
} else {
  throw new Error(`Unknown DB_PROVIDER: ${provider}`);
}

module.exports = adapter;

