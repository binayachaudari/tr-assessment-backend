const ATMService = require('../services/atm.service');
const logger = require('../utils/logger');
const httpCodes = require('../constants/httpCodes');

class TransactionController {
  static async withdraw(req, res, next) {
    try {
      const { cardId, accountId, amount } = req.body;

      // Validate inputs
      if (!cardId || !accountId || !amount || amount <= 0) {
        return res.status(httpCodes.BAD_REQUEST).json({
          success: false,
          message: 'Card ID, account ID, and valid amount are required',
        });
      }

      const result = await ATMService.processWithdrawal(
        cardId,
        accountId,
        amount,
      );

      res.status(httpCodes.OK).json({
        success: true,
        message: 'Withdrawal successful',
        data: result,
      });
    } catch (error) {
      logger.error('Withdrawal error:', error);

      let statusCode = httpCodes.INTERNAL_ERROR;
      if (error.message.includes('Insufficient funds')) {
        statusCode = httpCodes.BAD_REQUEST;
      } else if (error.message.includes('limit exceeded')) {
        statusCode = httpCodes.FORBIDDEN;
      } else if (error.message.includes('not found')) {
        statusCode = httpCodes.NOT_FOUND;
      }

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async deposit(req, res, next) {
    try {
      const { cardId, accountId, amount } = req.body;

      // Validate inputs
      if (!cardId || !accountId || !amount || amount <= 0) {
        return res.status(httpCodes.BAD_REQUEST).json({
          success: false,
          message: 'Card ID, account ID, and valid amount are required',
        });
      }

      const result = await ATMService.processDeposit(cardId, accountId, amount);

      res.status(httpCodes.OK).json({
        success: true,
        message: 'Deposit successful',
        data: result,
      });
    } catch (error) {
      logger.error('Deposit error:', error);

      let statusCode = httpCodes.INTERNAL_ERROR;
      if (error.message.includes('not found')) {
        statusCode = httpCodes.NOT_FOUND;
      }

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async checkBalance(req, res, next) {
    try {
      const { cardId, accountId } = req.body;

      // Validate inputs
      if (!cardId || !accountId) {
        return res.status(httpCodes.BAD_REQUEST).json({
          success: false,
          message: 'Card ID and account ID are required',
        });
      }

      const result = await ATMService.getAccountBalance(cardId, accountId);

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

      let statusCode = httpCodes.INTERNAL_ERROR;
      if (error.message.includes('not found')) {
        statusCode = httpCodes.NOT_FOUND;
      } else if (error.message.includes('not linked')) {
        statusCode = httpCodes.FORBIDDEN;
      }

      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = TransactionController;
