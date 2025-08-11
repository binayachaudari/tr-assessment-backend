const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(
      ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`,
    ),
  ),
  defaultMeta: { service: 'atm-backend' },
  transports: [new winston.transports.Console()],
});

module.exports = logger;
