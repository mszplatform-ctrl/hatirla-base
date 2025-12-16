/**
 * AI Controller
 * Handles HTTP layer for AI endpoints
 */

const aiService = require('../services/ai.service');

/**
 * GET /api/ai/packages
 */
async function getPackages(req, res, next) {
  try {
    const result = await aiService.getPackages();
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/ai/packages/:id
 */
async function getPackageById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await aiService.getPackageById(Number(id));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPackages,
  getPackageById,
};
