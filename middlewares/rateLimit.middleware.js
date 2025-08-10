const rateLimit = require('express-rate-limit');
const config = require('../configs/config');

const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.generalAPILimit,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    retryAfter: `${Math.ceil(config.rateLimit.windowMs / 1000)} seconds`,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => {
    return req.path === '/health' || req.path === '/api/health';
  },
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authAPILimit,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    retryAfter: `${Math.ceil(config.rateLimit.windowMs / 1000)} seconds`,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// Rate limiter for transaction endpoints
const transactionLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.transactionAPILimit,
  message: {
    success: false,
    message:
      'Transaction limit exceeded, please wait before making more transactions',
    retryAfter: `${Math.ceil(config.rateLimit.windowMs / 1000)} seconds`,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for session creation
const sessionLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.sessionAPILimit,
  message: {
    success: false,
    message: 'Session creation limit exceeded, please try again later',
    retryAfter: `${Math.ceil(config.rateLimit.windowMs / 1000)} seconds`,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  transactionLimiter,
  sessionLimiter,
};
