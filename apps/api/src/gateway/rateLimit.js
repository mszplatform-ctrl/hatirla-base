const rateLimit = require("express-rate-limit");

const isDev = process.env.NODE_ENV !== "production";

/**
 * Compose endpoint rate limit
 * - dev: relaxed
 * - prod/beta: strict
 */
const composeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: isDev ? 120 : 20,    // dev: 120 / prod: 20
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests, please try again later",
    },
  },
});

module.exports = {
  composeRateLimit,
};
