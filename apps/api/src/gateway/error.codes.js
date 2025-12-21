/**
 * Centralized error codes
 * Single source of truth for backend error semantics
 */

export const ERROR_CODES = {
  // 🔐 AUTH
  AUTH_REQUIRED: {
    code: "AUTH_REQUIRED",
    httpStatus: 401,
    message: "Authentication required",
  },

  AUTH_FORBIDDEN: {
    code: "AUTH_FORBIDDEN",
    httpStatus: 403,
    message: "You do not have permission to perform this action",
  },

  // 📦 VALIDATION
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    httpStatus: 422,
    message: "Invalid request data",
  },

  MISSING_REQUIRED_FIELD: {
    code: "MISSING_REQUIRED_FIELD",
    httpStatus: 422,
    message: "Required field is missing",
  },

  INVALID_FIELD_TYPE: {
    code: "INVALID_FIELD_TYPE",
    httpStatus: 422,
    message: "Invalid field type",
  },

  // 🔍 RESOURCE
  NOT_FOUND: {
    code: "NOT_FOUND",
    httpStatus: 404,
    message: "Resource not found",
  },

  CONFLICT: {
    code: "CONFLICT",
    httpStatus: 409,
    message: "Resource conflict",
  },

  // 🧠 BUSINESS
  BUSINESS_RULE_VIOLATION: {
    code: "BUSINESS_RULE_VIOLATION",
    httpStatus: 400,
    message: "Business rule violation",
  },

  // 💥 SYSTEM
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    httpStatus: 500,
    message: "Internal server error",
  },
};
