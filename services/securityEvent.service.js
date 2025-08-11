const SecurityEventModel = require('../models/SecurityEvent.model');
const CardModel = require('../models/Card.model');
const EncryptionService = require('./encryption.service');
const logger = require('../utils/logger');
const config = require('../configs/config');

// Security configuration constants
const SECURITY_CONFIG = {
  MAX_PIN_ATTEMPTS: 3,
  CARD_BLOCK_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

class SecurityService {
  static async logSecurityEvent(eventType, details, requestId = null) {
    try {
      const eventData = {
        eventType,
        userId: details.userId,
        cardId: details.cardId,
        description: details.description,
      };

      if (requestId) {
        eventData.eventId = requestId;
      }

      const event = new SecurityEventModel(eventData);
      await event.save();

      logger.warn('Security event logged', {
        eventType,
        eventId: event.eventId,
        description: details.description,
        requestId: requestId || 'auto-generated',
      });

      return event;
    } catch (error) {
      logger.error('Failed to log security event', error);
    }
  }

  static async validateCardSecurity(cardNumber, pin, requestId = null) {
    const card = await CardModel.findOne({
      cardNumber,
      'status.isActive': true,
    }).populate('associations.userId');

    if (!card) {
      await this.logSecurityEvent(
        'INVALID_CARD',
        {
          cardNumber: `****${cardNumber.slice(-4)}`,
          description: 'Invalid card number',
        },
        requestId,
      );
      return { isValid: false, error: 'INVALID_CARD' };
    }

    // Check if card is blocked
    if (card.securityInfo.isBlocked) {
      const blockExpired =
        card.securityInfo.blockedUntil &&
        new Date() > card.securityInfo.blockedUntil;

      if (!blockExpired) {
        await this.logSecurityEvent(
          'CARD_BLOCKED',
          {
            cardId: card._id,
            userId: card.associations.userId._id,
            description: 'Attempt to use blocked card',
          },
          requestId,
        );
        return { isValid: false, error: 'CARD_BLOCKED' };
      } else {
        // Auto-unblock expired temporary blocks
        card.securityInfo.isBlocked = false;
        card.securityInfo.blockedUntil = null;
        card.securityInfo.failedPinAttempts = 0;
        await card.save();
      }
    }

    // Verify PIN with timing-safe comparison
    const isValidPin = EncryptionService.verifySensitiveData(
      String(pin),
      card.securityInfo.pinHash,
      card.securityInfo.pinSalt,
    );

    if (!isValidPin) {
      card.securityInfo.failedPinAttempts += 1;
      card.securityInfo.lastFailedAttempt = new Date();

      const shouldBlock =
        card.securityInfo.failedPinAttempts >= SECURITY_CONFIG.MAX_PIN_ATTEMPTS;

      if (shouldBlock) {
        card.securityInfo.isBlocked = true;
        card.securityInfo.blockedUntil = new Date(
          Date.now() + SECURITY_CONFIG.CARD_BLOCK_DURATION,
        );
        card.securityInfo.blockReason = 'EXCESSIVE_PIN_FAILURES';

        await this.logSecurityEvent(
          'CARD_BLOCKED',
          {
            cardId: card._id,
            userId: card.associations.userId._id,
            description: 'Card blocked due to excessive PIN failures',
          },
          requestId,
        );
      }

      await card.save();

      await this.logSecurityEvent(
        'PIN_FAILURE',
        {
          cardId: card._id,
          userId: card.associations.userId._id,
          description: 'Invalid PIN attempt',
        },
        requestId,
      );

      return {
        isValid: false,
        error: shouldBlock ? 'CARD_BLOCKED' : 'INVALID_PIN',
        attemptsRemaining: Math.max(
          0,
          SECURITY_CONFIG.MAX_PIN_ATTEMPTS -
            card.securityInfo.failedPinAttempts,
        ),
      };
    }

    // Successful PIN verification - reset failed attempts
    card.securityInfo.failedPinAttempts = 0;
    card.securityInfo.lastFailedAttempt = null;
    card.usage.lastUsed = new Date();
    await card.save();

    await this.logSecurityEvent(
      'LOGIN_SUCCESS',
      {
        cardId: card._id,
        userId: card.associations.userId._id,
        description: 'Successful PIN verification',
      },
      requestId,
    );

    return { isValid: true, card };
  }

  static async checkTransactionLimits(card, transactionType, amount) {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    // Reset daily counters if it's a new day
    if (card.usage.lastResetDate < todayStart) {
      card.usage.todaysTransactions = 0;
      card.usage.todaysWithdrawals = 0;
      card.usage.lastResetDate = new Date();
      await card.save();
    }

    // Check per transaction limit
    if (amount > config.transactionLimits.perTransactionLimit) {
      return { allowed: false, reason: 'EXCEEDS_PER_TRANSACTION_LIMIT' };
    }

    if (transactionType === 'WITHDRAWAL') {
      // Check daily withdrawal limit
      if (
        card.usage.todaysWithdrawals + amount >
        config.transactionLimits.withdrawalLimit
      ) {
        return { allowed: false, reason: 'EXCEEDS_DAILY_WITHDRAWAL_LIMIT' };
      }
    }

    // Check daily transaction limit
    if (
      card.usage.todaysTransactions + amount >
      config.transactionLimits.transactionLimit
    ) {
      return { allowed: false, reason: 'EXCEEDS_DAILY_TRANSACTION_LIMIT' };
    }

    return { allowed: true };
  }
}

module.exports = SecurityService;
