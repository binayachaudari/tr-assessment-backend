const config = require('../configs/config');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

const generateSecureToken = (payload, expiresIn = config.jwt.expiresIn) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn,
    algorithm: config.jwt.algorithm,
    issuer: config.jwt.issuer,
    audience: config.jwt.audience,
  });
};

const verifySecureToken = token => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      algorithm: config.jwt.algorithm,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });
    return decoded;
  } catch (error) {
    logger.warn('JWT verification failed', { error: error.message });
    return null;
  }
};

module.exports = {
  generateSecureToken,
  verifySecureToken,
};
