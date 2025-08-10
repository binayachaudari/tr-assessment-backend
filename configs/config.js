const validateEnv = require('../utils/validateEnv');

const env = validateEnv();

module.exports = {
  port: env.PORT || 8848,
  database: {
    url: process.env.MONGODB_URI,
  },
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(', ') || [
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-ATM-ID',
      'X-Session-ID',
    ],
    maxAge: 86400, // 24 hours
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: '5m',
  },
};
