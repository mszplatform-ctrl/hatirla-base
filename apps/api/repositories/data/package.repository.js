// apps/api/repositories/data/package.repository.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * READ — All packages
 */
async function getAllPackages() {
  console.log('🗄️ [REPO] getAllPackages');

  return prisma.package.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * READ — Single package
 */
async function getPackageById(id) {
  console.log('🗄️ [REPO] getPackageById:', id);

  return prisma.package.findUnique({
    where: { id: Number(id) },
  });
}

/**
 * WRITE — Create package
 */
async function createPackage({ items, totalPrice, currency, status, userId }) {
  console.log('🗄️ [REPO] createPackage called');
  console.log('📦 [REPO] Input:', {
    items,
    totalPrice,
    currency,
    status,
    userId,
  });

  const result = await prisma.package.create({
    data: {
      items,
      totalPrice,
      currency,
      status,
      userId: userId || null,
    },
  });

  console.log('✅ [REPO] Insert successful:', result);
  return result;
}

/**
 * WRITE — Update status
 */
async function updatePackageStatus(id, status) {
  console.log('🗄️ [REPO] updatePackageStatus:', { id, status });

  const result = await prisma.package.update({
    where: { id: Number(id) },
    data: { status },
  });

  return result;
}

module.exports = {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackageStatus,
};
