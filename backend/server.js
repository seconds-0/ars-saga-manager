require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const { logger } = require('./utils/logger');
const { requestLogging, errorLogging } = require('./middleware/logging');
const { router: authRoutes, authenticateToken } = require('./routes/auth');
const characterRoutes = require('./routes/characters');
const apiLimiter = require('./middleware/rateLimiter');
const sanitizeInputs = require('./middleware/sanitizer');
const { handleError } = require('./utils/errorHandler');
const referenceVirtuesFlawsRouter = require('./routes/referenceVirtuesFlaws');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(sanitizeInputs);

// Add logging middleware
app.use(requestLogging);

// Apply rate limiter to all API routes
app.use("/api/", apiLimiter);

// Auth routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', authenticateToken, authRoutes);
app.use('/api/characters', authenticateToken, characterRoutes);

// Reference virtues and flaws route
app.use('/api/reference-virtues-flaws', referenceVirtuesFlawsRouter);

// Test route
app.get('/', (req, res) => {
  res.send('Ars Saga Manager API is running');
});

// Test the database connection and start server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    await sequelize.sync({ force: false });
    console.log('Database & tables created!');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info({ port: PORT }, 'Server is running');
    });
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

startServer();

// Error handling middleware (should be last)
app.use(errorLogging);
app.use((err, req, res, next) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ message: 'Something went wrong' });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ err: reason }, 'Unhandled rejection');
  process.exit(1);
});