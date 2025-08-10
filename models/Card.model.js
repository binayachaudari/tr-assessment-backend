const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: /^\d{16}$/,
    },
    cardInfo: {
      cardType: {
        type: String,
        required: true,
        enum: ['STAR', 'PULSE', 'MAESTRO', 'MASTERCARD', 'PLUS', 'VISA'],
        uppercase: true,
      },
      expiryDate: {
        type: Date,
        required: true,
      },
      cvvHash: { type: String, required: true },
    },
    securityInfo: {
      pinHash: { type: String, required: true },
      pinSalt: { type: String, required: true },
      failedPinAttempts: { type: Number, default: 0 },
      lastFailedAttempt: { type: Date, default: null },
      isBlocked: { type: Boolean, default: false },
      blockedUntil: { type: Date, default: null },
      blockReason: { type: String, default: null },
    },
    usage: {
      lastUsed: { type: Date, default: null },
      totalTransactions: { type: Number, default: 0 },
      todaysTransactions: { type: Number, default: 0 },
      todaysWithdrawals: { type: Number, default: 0 },
      lastResetDate: { type: Date, default: Date.now },
    },
    status: {
      isActive: { type: Boolean, default: true },
      activatedAt: { type: Date, default: null },
      deactivatedAt: { type: Date, default: null },
      replacementCard: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
    },
    associations: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      primaryAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
      },
      linkedAccounts: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
      ],
    },
  },
  {
    timestamps: true,
  },
);

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
