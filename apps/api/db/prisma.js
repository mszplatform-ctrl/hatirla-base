/**
 * Shared Prisma Client Instance
 * Prevents connection leaks in production
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;