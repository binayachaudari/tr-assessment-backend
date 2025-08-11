const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Account = require('../models/Account.model');
const Card = require('../models/Card.model');
const SecurityEvent = require('../models/SecurityEvent.model');
const EncryptionService = require('../services/encryption.service');
const config = require('../configs/config');
const logger = require('../utils/logger');

async function connectDB() {
  try {
    await mongoose.connect(config.database.url);
    logger.info('Connected to MongoDB for seeding');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  try {
    await User.deleteMany({});
    await Account.deleteMany({});
    await Card.deleteMany({});
    await SecurityEvent.deleteMany({});
    logger.info('Database cleared');
  } catch (error) {
    logger.error('Error clearing database:', error);
  }
}

async function createPeterParkerData() {
  try {
    // Create Peter Parker user
    const user = new User({
      firstName: 'Peter',
      lastName: 'Parker',
      email: 'peter.parker@example.com',
      phone: '+1-555-SPIDER',
      isActive: true,
    });
    await user.save();
    logger.info('Created user: Peter Parker');

    // Create checking account
    const checkingAccount = new Account({
      accountNumber: '1234567890123456',
      accountType: 'CHECKING',
      balance: 5000.0,
      currency: 'CAD',
      userId: user._id,
      isActive: true,
    });
    await checkingAccount.save();
    logger.info('Created checking account for Peter Parker');

    // Create savings account
    const savingsAccount = new Account({
      accountNumber: '9876543210987654',
      accountType: 'SAVINGS',
      balance: 15000.0,
      currency: 'CAD',
      userId: user._id,
      isActive: true,
    });
    await savingsAccount.save();
    logger.info('Created savings account for Peter Parker');

    // Create card PIN hash (PIN: 1234)
    const pinData = EncryptionService.hashSensitiveData('1234');

    // Create CVV hash (CVV: 123)
    const cvvData = EncryptionService.hashSensitiveData('123');

    // Create card
    const card = new Card({
      cardNumber: '4532123456789012',
      cardInfo: {
        cardType: 'VISA',
        expiryDate: new Date('2027-12-31'),
        cvvHash: cvvData.hash,
      },
      securityInfo: {
        pinHash: pinData.hash,
        pinSalt: pinData.salt,
        pinLastChanged: new Date(),
        failedPinAttempts: 0,
        lastFailedAttempt: null,
        isBlocked: false,
        blockedUntil: null,
        blockReason: null,
      },
      usage: {
        lastUsed: null,
        totalTransactions: 0,
        todaysTransactions: 0,
        todaysWithdrawals: 0,
        lastResetDate: new Date(),
      },
      limits: {
        dailyWithdrawalLimit: 1000,
        dailyTransactionLimit: 2000,
        perTransactionLimit: 500,
      },
      status: {
        isActive: true,
        activatedAt: new Date(),
        deactivatedAt: null,
        replacementCard: null,
      },
      associations: {
        userId: user._id,
        primaryAccountId: checkingAccount._id,
        linkedAccountId: savingsAccount._id,
      },
    });
    await card.save();
    logger.info('Created card for Peter Parker');

    return {
      user,
      checkingAccount,
      savingsAccount,
      card,
    };
  } catch (error) {
    logger.error('Error creating Peter Parker data:', error);
    throw error;
  }
}

async function seed() {
  try {
    await connectDB();
    await clearDatabase();

    const peterData = await createPeterParkerData();

    logger.info('Seeding completed successfully!');
    logger.info('=== Peter Parker ATM Demo Account ===');
    logger.info(`User ID: ${peterData.user._id}`);
    logger.info(`Card Number: ${peterData.card.cardNumber}`);
    logger.info(`PIN: 1234`);
    logger.info(`CVV: 123`);
    logger.info(
      `Checking Account: ${peterData.checkingAccount.accountNumber} (Balance: $${peterData.checkingAccount.balance})`,
    );
    logger.info(
      `Savings Account: ${peterData.savingsAccount.accountNumber} (Balance: $${peterData.savingsAccount.balance})`,
    );
    logger.info('======================================');
  } catch (error) {
    logger.error('Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
}

// Run seeder if called directly
if (require.main === module) {
  seed();
}

module.exports = { seed, createPeterParkerData };
