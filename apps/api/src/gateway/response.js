// apps/api/src/gateway/response.js

function getRequestId(req) {
  return (
    req.headers['x-request-id'] ||
    req.headers['x-correlation-id'] ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function sendSuccess(res, req, data = {}, status = 200) {
  const requestId = getRequestId(req);

  return res.status(status).json({
    success: true,
    requestId,
    ...data,
  });
}

function sendError(res, req, error, status = 500) {
  const requestId = getRequestId(req);

  const message =
    typeof error === 'string'
      ? error
      : error?.message || 'Internal Server Error';

  return res.status(status).json({
    success: false,
    requestId,
    error: message,
  });
}

module.exports = { sendSuccess, sendError, getRequestId };
