// apps/api/src/gateway/response.js

function getRequestId(req, res) {
  return (
    res?.getHeader?.('X-Request-Id') ||
    req.headers['x-request-id'] ||
    req.headers['x-correlation-id'] ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
}

function sendSuccess(res, req, data = {}, status = 200) {
  const requestId = getRequestId(req, res);

  return res.status(status).json({
    success: true,
    requestId,
    data
  });
}

function sendError(res, req, error) {
  const requestId = getRequestId(req, res);

  return res.status(error?.status || 500).json({
    success: false,
    requestId,
    error: {
      code: error?.code || 'INTERNAL_ERROR',
      message: error?.message || 'Internal Server Error',
      details: error?.details || null
    }
  });
}

module.exports = {
  sendSuccess,
  sendError,
  getRequestId
};
