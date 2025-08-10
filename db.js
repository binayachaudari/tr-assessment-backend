const mongoose = require('mongoose');
const config = require('./configs/config');
const logger = require('./utils/logger');

const connectDb = async () => {
  mongoose.connect(config.database.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
