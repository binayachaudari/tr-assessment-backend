const Session = require('../models/Session.model');
const logger = require('../utils/logger');
const httpCodes = require('../constants/httpCodes');

class SessionController {
  static async endSession(req, res, next) {
    try {
      const { sessionId } = req.params;

      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(httpCodes.NOT_FOUND).json({
          success: false,
          message: 'Session not found',
        });
      }

      if (!session.isActive) {
        return res.status(httpCodes.BAD_REQUEST).json({
          success: false,
          message: 'Session already ended',
        });
      }

      // End the session
      session.isActive = false;
      session.endTime = new Date();
      await session.save();

      res.status(httpCodes.OK).json({
        success: true,
        message: 'Session ended successfully',
        data: {
          sessionId: session._id,
          duration: session.endTime - session.startTime,
          transactionCount: session.transactionIds.length,
        },
      });
    } catch (error) {
      logger.error('End session error:', error);
      next(error);
    }
  }
}

module.exports = SessionController;
