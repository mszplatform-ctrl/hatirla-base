const crypto = require('crypto');
const { error } = require('./error');

const generateRequestId = () =>
  Date.now() + '-' + crypto.randomBytes(6).toString('hex');

const success = (res, data = {}) => {
  res.json({
    success: true,
    requestId: res.locals.requestId,
    ...data,
  });
};

const handler = (fn) => async (req, res) => {
  try {
    res.locals.requestId = generateRequestId();
    await fn(req, res);
  } catch (err) {
    console.error('[API ERROR]', err);
    error(res, err);
  }
};

module.exports = {
  success,
  handler,
};
