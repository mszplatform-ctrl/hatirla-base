/**
 * Central Error Handler
 * Env-aware (dev / beta / prod)
 */

const { ERROR_CODES } = require("./error.codes");

const isDev = process.env.NODE_ENV !== "production";

class AppError extends Error {
  constructor(errorKey = "INTERNAL_ERROR", meta = null) {
    const def = ERROR_CODES[errorKey] || ERROR_CODES.INTERNAL_ERROR;

    super(def.message);

    this.code = def.code;
    this.status = def.httpStatus;
    this.meta = meta;
  }
}

const error = (res, err, statusOverride) => {
  let status = statusOverride || err.status || 500;
  let code = err.code || "INTERNAL_ERROR";
  let message = err.message || "Unexpected error";

  // Eğer ERROR_CODES içinden geliyorsa normalize et
  if (ERROR_CODES[code]) {
    status = ERROR_CODES[code].httpStatus;
    message = ERROR_CODES[code].message;
  }

  const payload = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (isDev) {
    payload.error.stack = err.stack;
    payload.error.meta = err.meta || null;
  }

  return res.status(status).json(payload);
};

module.exports = {
  AppError,
  error,
};
