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
    secret: process.env.JWT_SECRET,
    expiresIn: '5m',
    algorithm: 'HS256',
    issuer: 'ATM_SYSTEM',
    audience: 'ATM_CLIENT',
  },
  encryption: {
    algorithm: 'aes-256-gcm',
    key: process.env.ENCRYPTION_KEY,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    generalAPILimit: 100,
    authAPILimit: 5,
    transactionAPILimit: 10,
    cardAPILimit: 20,
    sessionAPILimit: 10,
    managementAPILimit: 50,
  },
};
