// services/session.service.js
const Session = require('../models/Session.model');
const jwt = require('jsonwebtoken');
const config = require('../configs/config');
const logger = require('../utils/logger');

class SessionService {
  static async createSession(cardId, userId, requestId = null) {
    try {
      await this.endExistingSessions(cardId);

      const session = new Session({
        cardId,
        userId,
        startTime: new Date(),
        isActive: true,
        transactionIds: [],
      });

      await session.save();

      const token = this.generateJWTToken(session._id, cardId, userId);

      logger.info('Session created successfully', {
        sessionId: session._id,
        cardId,
        userId,
        requestId,
      });

      return {
        sessionId: session._id,
        token,
        expiresAt: new Date(Date.now() + config.session.expirationTime),
        session,
      };
    } catch (error) {
      logger.error('Session creation failed', {
        error: error.message,
        cardId,
        userId,
        requestId,
      });
      throw new Error('Failed to create session');
    }
  }

  /**
   * End an existing session
   */
  static async endSession(sessionId) {
    try {
      const session = await Session.findById(sessionId);

      if (!session) {
        throw new Error('Session not found');
      }

      if (!session.isActive) {
        throw new Error('Session already ended');
      }

      // End the session
      session.isActive = false;
      session.endTime = new Date();
      await session.save();

      logger.info('Session ended successfully', {
        sessionId: session._id,
        duration: session.endTime - session.startTime,
        transactionCount: session.transactionIds.length,
      });

      return {
        sessionId: session._id,
        duration: session.endTime - session.startTime,
        transactionCount: session.transactionIds.length,
      };
    } catch (error) {
      logger.error('Session end failed', {
        error: error.message,
        sessionId,
      });
      throw error;
    }
  }

  /**
   * Validate session and token
   */
  static async validateSession(sessionId, token) {
    try {
      // Verify JWT token
      const tokenPayload = this.verifyJWTToken(token);
      if (!tokenPayload) {
        throw new Error('Invalid or expired token');
      }

      // Verify session ID matches token
      if (tokenPayload.sessionId !== sessionId) {
        throw new Error('Session ID mismatch');
      }

      // Find active session
      const session = await Session.findOne({
        _id: sessionId,
        isActive: true,
        endTime: { $exists: false },
      })
        .populate('cardId')
        .populate('userId');

      if (!session) {
        throw new Error('Invalid or expired session');
      }

      // Check session timeout (5 minutes)
      const sessionAge = Date.now() - session.startTime.getTime();
      const SESSION_TIMEOUT = config.session.expirationTime;

      if (sessionAge > SESSION_TIMEOUT) {
        // Auto-end expired session
        session.isActive = false;
        session.endTime = new Date();
        await session.save();

        throw new Error('Session expired due to inactivity');
      }

      return {
        session,
        user: session.userId,
        card: session.cardId,
      };
    } catch (error) {
      logger.error('Session validation failed', {
        error: error.message,
        sessionId,
      });
      throw error;
    }
  }

  /**
   * End all existing active sessions for a card
   */
  static async endExistingSessions(cardId) {
    try {
      const existingSessions = await Session.find({
        cardId,
        isActive: true,
      });

      for (const session of existingSessions) {
        session.isActive = false;
        session.endTime = new Date();
        await session.save();

        logger.info('Existing session ended', {
          sessionId: session._id,
          cardId,
          reason: 'New session creation',
        });
      }
    } catch (error) {
      logger.error('End existing sessions failed', {
        error: error.message,
        cardId,
      });
      // Don't throw error here as it's not critical
    }
  }

  /**
   * Generate JWT token for session
   */
  static generateJWTToken(sessionId, cardId, userId) {
    return jwt.sign(
      {
        sessionId,
        cardId,
        userId,
        iat: Math.floor(Date.now() / 1000),
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
        algorithm: config.jwt.algorithm,
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      },
    );
  }

  /**
   * Verify JWT token
   */
  static verifyJWTToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret, {
        algorithms: [config.jwt.algorithm],
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
      });
    } catch (error) {
      logger.warn('JWT verification failed', { error: error.message });
      return null;
    }
  }
}

module.exports = SessionService;
