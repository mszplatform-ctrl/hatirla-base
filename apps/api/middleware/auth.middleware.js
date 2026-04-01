/**
 * Auth Middleware
 * verifyJWT  — requires a valid Bearer token; throws AUTH_REQUIRED on failure
 * optionalJWT — attaches req.userId if a valid token is present; continues silently if absent
 */

const jwt = require('jsonwebtoken');
const { AppError } = require('../src/gateway/error');

function verifyJWT(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError('AUTH_REQUIRED');
  }
  const token = header.slice(7);
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    const payload = jwt.verify(token, secret);
    req.userId = payload.sub;
    next();
  } catch {
    throw new AppError('AUTH_REQUIRED');
  }
}

function optionalJWT(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }
  const token = header.slice(7);
  try {
    const secret = process.env.JWT_SECRET;
    if (secret) {
      const payload = jwt.verify(token, secret);
      req.userId = payload.sub;
    }
  } catch {
    // Invalid or expired token — treat as unauthenticated, continue silently
  }
  next();
}

module.exports = { verifyJWT, optionalJWT };
