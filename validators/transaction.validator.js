const { body } = require('express-validator');

const transactionValidators = {
  withdraw: [
    body('amount')
      .isFloat({ min: 1, max: 10000 })
      .withMessage('Amount must be between $1 and $10,000'),
  ],

  deposit: [
    body('amount')
      .isFloat({ min: 1, max: 50000 })
      .withMessage('Amount must be between $1 and $50,000'),
  ],
};

module.exports = transactionValidators;
