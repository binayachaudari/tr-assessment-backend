const mongoose = require('mongoose');
const config = require('./configs/config');
const logger = require('./utils/logger');

require('./models/User.model');
require('./models/Account.model');
require('./models/Card.model');
require('./models/Transaction.model');
require('./models/SecurityEvent.model');
require('./models/Session.model');

const connectDb = async () => {
  mongoose.connect(config.database.url, {
    retryWrites: true,
    writeConcern: 'majority',
  });

  mongoose.connection.on('error', error => {
    logger.error('Database connection error:', error);
  });

  mongoose.connection.on('connected', () => {
    logger.info('Connected to MongoDB successfully');
  });
};

module.exports = connectDb;
