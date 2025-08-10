const Card = require('../models/Card.model');
const Account = require('../models/Account.model');
const Transaction = require('../models/Transaction.model');
const SecurityService = require('./securityEvent.service');
const logger = require('../utils/logger');

class ATMService {
  static async authenticateCard(cardNumber, pin, requestId = null) {
    try {
      const result = await SecurityService.validateCardSecurity(
        cardNumber,
        pin,
        requestId,
      );
      return result;
    } catch (error) {
      logger.error('Card authentication error:', error);
      throw new Error('Authentication failed');
    }
  }

  static async getAccountBalance(cardId, accountId) {
    try {
      const [card, account] = await Promise.all([
        Card.findById(cardId),
        Account.findById(accountId),
      ]);

      if (!card || !account) {
        throw new Error('Card or account not found');
      }

      if (
        card.associations.linkedAccountId.toString() !== accountId.toString()
      ) {
        throw new Error('Account not linked to this card');
      }

      return {
        balance: account.balance,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        currency: account.currency,
      };
    } catch (error) {
      logger.error('Get balance error:', error);
      throw error;
    }
  }

  static async processWithdrawal(cardId, accountId, amount) {
    try {
      const [card, account] = await Promise.all([
        Card.findById(cardId),
        Account.findById(accountId),
      ]);

      if (!card || !account) {
        throw new Error('Card or account not found');
      }

      // Check if account has sufficient funds
      if (account.balance < amount) {
        throw new Error('Insufficient funds');
      }

      // Check transaction limits
      const limitCheck = await SecurityService.checkTransactionLimits(
        card,
        'WITHDRAWAL',
        amount,
      );

      if (!limitCheck.allowed) {
        throw new Error(`Transaction limit exceeded: ${limitCheck.reason}`);
      }

      // Create transaction record
      const transaction = new Transaction({
        type: 'WITHDRAWAL',
        amount,
        accountId,
        cardId,
        balanceBefore: account.balance,
        balanceAfter: account.balance - amount,
        status: 'COMPLETED',
        description: `ATM Withdrawal - $${amount}`,
      });

      // Update account balance
      account.balance -= amount;

      // Update card usage
      card.usage.todaysWithdrawals += amount;
      card.usage.todaysTransactions += amount;
      card.usage.totalTransactions += 1;
      card.usage.lastUsed = new Date();

      // Save all changes
      await Promise.all([transaction.save(), account.save(), card.save()]);

      return {
        transactionId: transaction._id,
        amount,
        newBalance: account.balance,
        transactionDate: transaction.createdAt,
      };
    } catch (error) {
      logger.error('Withdrawal processing error:', error);
      throw error;
    }
  }

  /**
   * Process deposit transaction
   */
  static async processDeposit(cardId, accountId, amount) {
    try {
      const [card, account] = await Promise.all([
        Card.findById(cardId),
        Account.findById(accountId),
      ]);

      if (!card || !account) {
        throw new Error('Card or account not found');
      }

      // Create transaction record
      const transaction = new Transaction({
        type: 'DEPOSIT',
        amount,
        accountId,
        cardId,
        balanceBefore: account.balance,
        balanceAfter: account.balance + amount,
        status: 'COMPLETED',
        description: `ATM Deposit - $${amount}`,
      });

      // Update account balance
      account.balance += amount;

      // Update card usage
      card.usage.todaysTransactions += amount;
      card.usage.totalTransactions += 1;
      card.usage.lastUsed = new Date();

      // Save all changes
      await Promise.all([transaction.save(), account.save(), card.save()]);

      return {
        transactionId: transaction._id,
        amount,
        newBalance: account.balance,
        transactionDate: transaction.createdAt,
      };
    } catch (error) {
      logger.error('Deposit processing error:', error);
      throw error;
    }
  }

  /**
   * Get linked account for a card
   */
  static async getLinkedAccount(cardId) {
    try {
      const card = await Card.findById(cardId).populate(
        'associations.linkedAccountId',
      );

      if (!card) {
        throw new Error('Card not found');
      }

      const account = card.associations.linkedAccountId;
      if (!account) {
        throw new Error('No linked account found for this card');
      }

      return {
        id: account._id,
        accountNumber: `****${account.accountNumber.slice(-4)}`,
        accountType: account.accountType,
        balance: account.balance,
        currency: account.currency,
      };
    } catch (error) {
      logger.error('Get linked account error:', error);
      throw error;
    }
  }
}

module.exports = ATMService;
