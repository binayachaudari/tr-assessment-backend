// controllers/card.controller.js
const ATMService = require('../services/atm.service');
const SessionService = require('../services/session.service');
const logger = require('../utils/logger');
const httpCodes = require('../constants/httpCodes');

class CardController {
  static async validatePin(req, res, next) {
    try {
      const { cardNumber, pin } = req.body;
      const requestId = req.requestId;

      const validation = await ATMService.authenticateCard(
        cardNumber,
        pin,
        requestId,
      );

      if (!validation.isValid) {
        return res.status(httpCodes.UNAUTHORIZED).json({
          success: false,
          message: validation.error,
          attemptsRemaining: validation.attemptsRemaining,
        });
      }

      // Create session immediately after successful PIN validation
      const card = validation.card;
      const userId = card.associations.userId;

      const sessionData = await SessionService.createSession(
        card._id,
        userId,
        requestId,
      );

      res.status(httpCodes.OK).json({
        success: true,
        message: 'PIN validated successfully',
        data: {
          sessionId: sessionData.sessionId,
          token: sessionData.token,
          expiresAt: sessionData.expiresAt,
          cardInfo: {
            cardNumber: `****${card.cardNumber.slice(-4)}`,
            cardType: card.cardInfo.cardType,
            limits: card.limits,
          },
        },
      });
    } catch (error) {
      logger.error('Card PIN validation error:', error);
      res.status(httpCodes.INTERNAL_ERROR).json({
        success: false,
        message: 'Authentication failed',
      });
    }
  }
}

module.exports = CardController;
