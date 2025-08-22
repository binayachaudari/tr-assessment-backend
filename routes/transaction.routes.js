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

router.get(
  '/recent',
  authenticateSession,
  TransactionController.showRecentTransaction,
);

// POST /api/transactions/balance - ATM Balance Inquiry
router.get('/balance', authenticateSession, TransactionController.checkBalance);

module.exports = router;
