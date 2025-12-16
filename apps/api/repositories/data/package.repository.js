/**
 * Package Repository
 * DB access layer for AI Packages
 * Only talks to Prisma / Database
 */

const prisma = require('../../db/prisma');

/**
 * Get all packages (latest first)
 */
async function getAllPackages() {
  return prisma.package.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get single package by ID
 */
async function getPackageById(id) {
  if (!id) return null;

  return prisma.package.findUnique({
    where: {
      id: Number(id),
    },
  });
}

/**
 * Create new AI package
 */
async function createPackage(data) {
  return prisma.package.create({
    data: {
      userId: data.userId ?? null,
      items: data.items,
      totalPrice: data.totalPrice,
      currency: data.currency ?? 'EUR',
      summary: data.summary ?? null,
      aiComment: data.aiComment ?? null,
      status: data.status ?? 'draft',
    },
  });
}

/**
 * Update package status
 */
async function updatePackageStatus(id, status) {
  return prisma.package.update({
    where: {
      id: Number(id),
    },
    data: {
      status,
    },
  });
}

module.exports = {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackageStatus,
};
