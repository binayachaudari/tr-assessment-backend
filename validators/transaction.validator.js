const { body, param, query } = require('express-validator');

const transactionValidators = {
  withdraw: [
    body('cardId').isMongoId().withMessage('Valid card ID is required'),
    body('accountId').isMongoId().withMessage('Valid account ID is required'),
    body('amount')
      .isFloat({ min: 0.01, max: 10000 })
      .withMessage('Amount must be between $0.01 and $10,000'),
  ],

  deposit: [
    body('cardId').isMongoId().withMessage('Valid card ID is required'),
    body('accountId').isMongoId().withMessage('Valid account ID is required'),
    body('amount')
      .isFloat({ min: 0.01, max: 50000 })
      .withMessage('Amount must be between $0.01 and $50,000'),
  ],

  checkBalance: [
    body('cardId').isMongoId().withMessage('Valid card ID is required'),
    body('accountId').isMongoId().withMessage('Valid account ID is required'),
  ],
};

module.exports = transactionValidators;
