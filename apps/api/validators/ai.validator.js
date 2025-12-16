/**
 * AI Validators - Input Validation Layer
 * Validates incoming requests before processing
 */

class AIValidator {
  /**
   * Validate compose package request
   */
  validateComposeRequest(req, res, next) {
    const { selections } = req.body;

    if (!selections) {
      return res.status(400).json({
        success: false,
        error: 'selections field is required'
      });
    }

    if (!Array.isArray(selections)) {
      return res.status(400).json({
        success: false,
        error: 'selections must be an array'
      });
    }

    if (selections.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'selections cannot be empty'
      });
    }

    // Validate each selection has required fields
    for (const selection of selections) {
      if (!selection.type) {
        return res.status(400).json({
          success: false,
          error: 'Each selection must have a type'
        });
      }

      if (!selection.payload) {
        return res.status(400).json({
          success: false,
          error: 'Each selection must have a payload'
        });
      }
    }

    next();
  }

  /**
   * Validate generate suggestions request
   */
  validateGenerateRequest(req, res, next) {
    // Context is optional, but if provided should be an object
    const { context } = req.body;

    if (context && typeof context !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'context must be an object'
      });
    }

    next();
  }
}

module.exports = new AIValidator();
