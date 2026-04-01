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
// Supported langs: tr, en, ar, es, de, ru
// Frontend i18n currently supports tr and en only.
// Other languages fall back to EN until frontend i18n is expanded.
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

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 50 : 500,
  message: { error: 'Too many AI requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Status polling needs a higher limit: 1 poll/3s for the full 15-min window = 300 requests.
// Registered before aiLimiter so polling requests don't consume the generative quota.
const statusLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 300 : 3000,
  message: { error: 'Too many status requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
router.use('/ai/face-swap/status', statusLimiter);
router.use('/ai', aiLimiter);
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

router.use('/auth', require('../src/routes/auth'));

router.use('/ai', require('../src/routes/ai'));

router.use('/data', require('../src/routes/data'));
// router.use('/user', require('../src/routes/user')); // mock stub — disabled until real auth exists
router.use('/share', require('../src/routes/share.routes'));
router.use('/proxy-image', require('../src/routes/proxy'));

// ============================================
// 6. ERROR HANDLING
// ============================================
router.use(errorHandler);
module.exports = router;
