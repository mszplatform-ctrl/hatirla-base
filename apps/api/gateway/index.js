/**
 * API Gateway - Centralized Routing & Security Layer
 * 
 * Features:
 * - Request ID tracking
 * - Language resolver (i18n)
 * - Environment-based rate limiting
 * - Request/Response logging
 * - Error handling
 */
const express = require('express');
const { randomUUID } = require('crypto');
const rateLimit = require('express-rate-limit');
const logger = require('../middleware/logger');
const errorHandler = require('../middleware/errorHandler');
const router = express.Router();
// ============================================
// 1. REQUEST ID GENERATION
// ============================================
router.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
});
// ============================================
// 1.5. LANGUAGE RESOLVER (i18n)
// ============================================
router.use((req, res, next) => {
  const header = req.headers['accept-language'];
  const queryLang = req.query.lang;
  const lang = (queryLang || header || 'tr').slice(0, 2).toLowerCase();
  
  // Validate against supported languages
  req.lang = ['tr', 'en', 'ar', 'es', 'de', 'ru'].includes(lang) ? lang : 'tr';
  
  next();
});
// ============================================
// 2. RATE LIMITING - ENVIRONMENT AWARE
// ============================================
const isProd = process.env.NODE_ENV === 'production';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
router.use(limiter);
// ============================================
// 3. REQUEST LOGGING WITH REQUEST ID
// ============================================
router.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      requestId: req.requestId,
      lang: req.lang,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
});
// ============================================
// 4. AUTHENTICATION (Placeholder - inactive)
// ============================================
const authenticate = (req, res, next) => {
  // TODO: Implement JWT/Session validation
  next();
};
// Şimdilik kapalı:
// router.use(authenticate);
// ============================================
// 5. SERVICE ROUTING
// ============================================
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    language: req.lang
  });
});

// BETA: AI routes temporarily disabled (no package.repository yet)
// router.use('/ai', require('../src/routes/ai'));

router.use('/data', require('../src/routes/data'));
// ============================================
// 6. ERROR HANDLING
// ============================================
router.use(errorHandler);
module.exports = router;
