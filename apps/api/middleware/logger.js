/**
 * Logger - Middleware + Logging Object
 */

// Logger object for manual logging
const logger = {
  info: (data) => {
    console.log('[INFO]', JSON.stringify(data, null, 2));
  },
  error: (data) => {
    console.error('[ERROR]', JSON.stringify(data, null, 2));
  },
  warn: (data) => {
    console.warn('[WARN]', JSON.stringify(data, null, 2));
  }
};

// Middleware function (legacy, if needed)
const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    console.log('[API Request]', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
  });
  
  next();
};

// Export logger object (used in gateway)
module.exports = logger;

// Export middleware if needed
module.exports.middleware = loggerMiddleware;