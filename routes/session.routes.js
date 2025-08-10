const express = require('express');
const { sessionLimiter } = require('../middlewares/rateLimit.middleware');
const SessionController = require('../controllers/session.controller');

const router = express.Router();

// Only keep the end session route for logout functionality
router.delete('/:sessionId', sessionLimiter, SessionController.endSession);

module.exports = router;
