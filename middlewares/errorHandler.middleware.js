const logger = require('../utils/logger');
const HTTP_STATUS = require('../constants/httpCodes');

const errorHandler = (err, req, res, next) => {
  logger.error({
    requestId: req.id,
    error: err.message,
    stack: err.stack,
    url: req?.url,
    method: req?.method,
    status: HTTP_STATUS.INTERNAL_ERROR,
    timestamp: new Date().toISOString(),
  });
  res.status(HTTP_STATUS.INTERNAL_ERROR).send('Something went wrong');
};

module.exports = errorHandler;
