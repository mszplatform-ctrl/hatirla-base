/**
 * AI Controller - HTTP Request/Response Handler
 * Handles routing and HTTP layer for AI endpoints
 */

const aiService = require('../../services/ai/ai.service');

// ✅ DOĞRU PATH’LER (SRC ALTINDAN)
const { composeSchema } = require('../../src/validation/compose.schema');
const { AppError } = require('../../src/gateway/error');

class AIController {
  /**
   * GET /api/ai/suggestions
   */
  async getSuggestions(req, res) {
    try {
      const suggestions = await aiService.getSuggestions(req.lang || 'tr');
      res.json(suggestions);
    } catch (error) {
      console.error('[AI Controller] Get suggestions error:', error);
      throw error;
    }
  }

  /**
   * POST /api/ai/generate
   */
  async generateSuggestions(req, res) {
    try {
      const context = req.body || {};
      const result = await aiService.generateSuggestions(context);
      res.json(result);
    } catch (error) {
      console.error('[AI Controller] Generate error:', error);
      throw error;
    }
  }

  /**
   * POST /api/ai/compose
   * Compose travel package from selections
   */
  async composePackage(req, res) {
    try {
      // ✅ VALIDATION CONTROLLER KATMANINDA
      const data = composeSchema.parse(req.body);

      // ✅ SERVICE OBJE BEKLİYOR → OBJE GÖNDER
      const result = await aiService.composePackage({
        selections: data.selections,
        language: data.language,
        userId: null
      });

      res.json({
        success: true,
        itinerary: result.package
      });
    } catch (error) {
      // ✅ ZOD ERROR → 422
      if (error.name === 'ZodError') {
        throw new AppError(
          'Invalid request data',
          'VALIDATION_ERROR',
          422,
          error.errors
        );
      }

      console.error('[AI Controller] Compose error:', error);
      throw error;
    }
  }

  /**
   * GET /api/ai/packages
   */
  async getPackages(req, res) {
    try {
      const result = await aiService.getPackages();
      res.json(result);
    } catch (error) {
      console.error('[AI Controller] Get packages error:', error);
      throw error;
    }
  }
}

module.exports = new AIController();
