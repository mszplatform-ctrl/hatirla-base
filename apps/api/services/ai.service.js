/**
 * AI Service
 * Business logic layer for AI-related operations
 */

const packageRepository = require('../repositories/data/package.repository');

/**
 * Get all AI packages
 */
async function getPackages() {
  const packages = await packageRepository.getAllPackages();

  return {
    status: 'ok',
    source: 'ai',
    count: packages.length,
    packages,
  };
}

/**
 * Get single package by ID
 */
async function getPackageById(id) {
  const pkg = await packageRepository.getPackageById(id);

  if (!pkg) {
    return {
      status: 'not_found',
      message: 'Package not found',
    };
  }

  return {
    status: 'ok',
    package: pkg,
  };
}

module.exports = {
  getPackages,
  getPackageById,
};
