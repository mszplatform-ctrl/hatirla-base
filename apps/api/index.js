// index.js — ISOLATION MODE (NO GATEWAY, NO RATE LIMIT)

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
app.use(cors());
app.use(express.json());

// Prisma Client
const prisma = new PrismaClient();

/**
 * ROOT HEALTHCHECK
 */
app.get('/', (req, res) => {
  res.json({ status: 'API running', version: '1.0.0' });
});

/**
 * BASIC PING — ISOLATION TEST
 */
app.get('/api/ping', (req, res) => {
  res.json({ msg: 'pong' });
});

/**
 * BASIC TEST ROUTE
 */
app.get('/api/test', (req, res) => {
  res.json({ test: 'working' });
});

/**
 * SERVER START
 */
const PORT =
  process.env.PORT ||
  Number(process.env.EXPRESS_PORT) ||
  3001;

app.listen(PORT, () => {
  console.log(`✅ API running on port ${PORT}`);
});

/**
 * Graceful shutdown (Render)
 */
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
