const express = require('express');
const CardController = require('../controllers/card.controller');
const authenticateSession = require('../middlewares/authenticateSession.middleware');
const handleValidationErrors = require('../middlewares/validation.middleware');
const cardValidators = require('../validators/card.validator');
const { authLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();

// POST /api/cards/validate-pin - Validate card PIN for ATM login
router.post(
  '/validate-pin',
  authLimiter,
  cardValidators.validatePin,
  handleValidationErrors,
  CardController.validatePin,
);

module.exports = router;
