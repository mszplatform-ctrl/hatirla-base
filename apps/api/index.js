// index.js (Express + Prisma + NeonDB)

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const gateway = require('./gateway');

const app = express();
app.use(cors());
app.use(express.json());

// API Gateway - Tüm /api/* istekleri gateway'den geçer
app.use('/api', gateway);

// Prisma Client
const prisma = new PrismaClient();

// ROOT test endpoint
app.get('/', (req, res) => {
  res.json({ status: 'API running', version: '1.0.0' });
});

/* ===========================================
    LEGACY ROUTES REMOVED
    All /api/data/* routes now go through gateway
    All /api/ai/* routes now go through gateway
   =========================================== */

// SERVER START
const PORT =
  process.env.PORT ||
  Number(process.env.EXPRESS_PORT) ||
  3001;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

// Render kapanırken Prisma bağlantısını düzgün kapat
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});