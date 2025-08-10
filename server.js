const express = require('express');
const config = require('./configs/config');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const connectDb = require('./db');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler.middleware');
const { generalLimiter } = require('./middlewares/rateLimit.middleware');
const logger = require('./utils/logger');

const app = express();

// Connect to MongoDB
connectDb();

// Security middleware
app.use(helmet());
app.use(compression());
app.use(cors(config.cors));
app.use(generalLimiter);

// Body parsing middleware
app.use(
  express.json({
    limit: '10kb',
    strict: true,
  }),
);

app.use(
  express.urlencoded({
    extended: false,
    limit: '10kb',
  }),
);

// Request logging middleware
app.use((req, res, next) => {
  req.requestId = require('crypto').randomUUID();
  res.setHeader('X-Request-ID', req.requestId);
  logger.info(`${req.method} ${req.url}`, { requestId: req.requestId });
  next();
});

// Routes
app.use('/api/v1', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Healthy',
  });
});

// 404 handler
app.all('/{*any}', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Not Found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = app;
