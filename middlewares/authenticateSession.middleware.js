// middlewares/authenticateSession.middleware.js
const HTTP_STATUS = require('../constants/httpCodes');
const SessionService = require('../services/session.service');
const logger = require('../utils/logger');

const authenticateSession = async (req, res, next) => {
  try {
    const sessionId = req.get('X-Session-ID');
    const authToken = req.get('Authorization')?.replace('Bearer ', '');

    if (!sessionId || !authToken) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Missing authentication credentials',
      });
    }

    // Validate session and token
    const sessionData = await SessionService.validateSession(
      sessionId,
      authToken,
    );

    // Attach session to request
    req.session = sessionData.session;
    req.user = sessionData.user;
    req.card = sessionData.card;

    next();
  } catch (error) {
    logger.error('Session authentication failed', {
      error: error.message,
      requestId: req.requestId,
    });

    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = authenticateSession;
