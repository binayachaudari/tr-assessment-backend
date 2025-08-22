const ATMService = require('../services/atm.service');
const logger = require('../utils/logger');
const httpCodes = require('../constants/httpCodes');

class TransactionController {
  static async withdraw(req, res, next) {
    try {
      const { amount } = req.body;
      const { card } = req;

      const result = await ATMService.processWithdrawal(
        card._id,
        card.associations.linkedAccountId,
        amount,
      );

      res.status(httpCodes.OK).json({
        success: true,
        message: 'Withdrawal successful',
        data: result,
      });
    } catch (error) {
      logger.error('Withdrawal error:', error);
      next(error);
    }
  }

  static async deposit(req, res, next) {
    try {
      const { amount } = req.body;
      const { card } = req;

      const result = await ATMService.processDeposit(
        card._id,
        card.associations.linkedAccountId,
        amount,
      );

      res.status(httpCodes.OK).json({
        success: true,
        message: 'Deposit successful',
        data: result,
      });
    } catch (error) {
      logger.error('Deposit error:', error);

      next(error);
    }
  }

  static async checkBalance(req, res, next) {
    try {
      const { card } = req;

      if (!card) {
        return res.status(httpCodes.NOT_FOUND).json({
          success: false,
          message: 'Card not found',
        });
      }

      const result = await ATMService.getAccountBalance(
        card._id,
        card.associations.linkedAccountId,
      );

      res.status(httpCodes.OK).json({
        success: true,
        message: 'Balance inquiry successful',
        data: {
          balance: result.balance,
          accountNumber: `****${result.accountNumber.slice(-4)}`,
          accountType: result.accountType,
          currency: result.currency,
        },
      });
    } catch (error) {
      logger.error('Balance inquiry error:', error);
      next(error);
    }
  }

  static async showRecentTransaction(req, res, next) {
    try {
      const { card } = req;
      const result = await ATMService.getRecentTransactions(card._id);
      return res.status(httpCodes.OK).json({
        success: true,
        message: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TransactionController;
