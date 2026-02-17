/**
 * Package Repository - Data access layer
 * Mock implementation for beta (will connect to DB later)
 */

// In-memory store (beta)
const packages = [];

async function getAllPackages() {
  return packages;
}

async function createPackage({ userId, items, totalPrice, currency, status }) {
  const newPackage = {
    id: 'pkg_' + Date.now(),
    userId,
    items,
    totalPrice,
    currency: currency || 'USD',
    status: status || 'draft',
    createdAt: new Date().toISOString(),
  };
  packages.push(newPackage);
  return newPackage;
}

module.exports = {
  getAllPackages,
  createPackage,
};
