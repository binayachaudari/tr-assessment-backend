const { body, param } = require('express-validator');

const cardValidators = {
  validatePin: [
    body('cardNumber')
      .isLength({ min: 16, max: 16 })
      .isNumeric()
      .withMessage('Card number must be exactly 16 digits'),
    body('pin')
      .isLength({ min: 4, max: 4 })
      .isNumeric()
      .withMessage('PIN must be exactly 4 digits'),
  ],
};

module.exports = cardValidators;
