const express = require('express');
const cardRoutes = require('./card.routes');
const transactionRoutes = require('./transaction.routes');
const sessionRoutes = require('./session.routes');

const router = express.Router();

// Mount only ATM-specific route modules
router.use('/cards', cardRoutes);
router.use('/transactions', transactionRoutes);
router.use('/sessions', sessionRoutes);

module.exports = router;
