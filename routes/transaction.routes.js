const express = require('express');
const TransactionController = require('../controllers/transaction.controller');
const authenticateSession = require('../middlewares/authenticateSession.middleware');
const handleValidationErrors = require('../middlewares/validation.middleware');
const transactionValidators = require('../validators/transaction.validator');
const { transactionLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();

// POST /api/transactions/withdraw - ATM Cash Withdrawal
router.post(
  '/withdraw',
  transactionLimiter,
  authenticateSession,
  transactionValidators.withdraw,
  handleValidationErrors,
  TransactionController.withdraw,
);

// POST /api/transactions/deposit - ATM Cash Deposit
router.post(
  '/deposit',
  transactionLimiter,
  authenticateSession,
  transactionValidators.deposit,
  handleValidationErrors,
  TransactionController.deposit,
);

// POST /api/transactions/balance - ATM Balance Inquiry
router.post(
  '/balance',
  transactionLimiter,
  authenticateSession,
  transactionValidators.checkBalance,
  handleValidationErrors,
  TransactionController.checkBalance,
);

module.exports = router;
