/**
 * AI Controller - HTTP Request/Response Handler
 * Handles routing and HTTP layer for AI endpoints
 */
const aiService = require('../../services/ai/ai.service');

class AIController {
  /**
   * GET /api/ai/suggestions
   * Fetch all AI suggestions
   */
  async getSuggestions(req, res) {
    try {
      const suggestions = await aiService.getSuggestions();
      res.json(suggestions);
    } catch (error) {
      console.error('[AI Controller] Get suggestions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch suggestions',
      });
    }
  }

  /**
   * POST /api/ai/generate
   * Generate new AI suggestions
   */
  async generateSuggestions(req, res) {
    try {
      const context = req.body || {};
      const result = await aiService.generateSuggestions(context);
      res.json(result);
    } catch (error) {
      console.error('[AI Controller] Generate error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate suggestions',
      });
    }
  }

  /**
   * POST /api/ai/compose
   * Compose travel package from selections
   */
  async composePackage(req, res) {
    try {
      const { selections, language } = req.body;

      if (!selections) {
        return res.status(400).json({
          success: false,
          error: 'Missing selections',
        });
      }

      const result = await aiService.composePackage(selections, language);

      res.json({
        success: true,
        itinerary: result.package,
      });
    } catch (error) {
      console.error('[AI Controller] Compose error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to compose package',
      });
    }
  }

  /**
   * GET /api/ai/packages
   * Get all packages (REAL DB FLOW)
   */
  async getPackages(req, res) {
    try {
      const result = await aiService.getPackages();
      res.json(result);
    } catch (error) {
      console.error('[AI Controller] Get packages error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch packages',
      });
    }
  }
}

module.exports = new AIController();
