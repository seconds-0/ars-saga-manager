require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { csrfProtection, handleCsrfError } = require('./middleware/csrfProtection');
const { sequelize } = require('./models');
const { logger } = require('./utils/logger');
const { requestLogging, errorLogging } = require('./middleware/logging');

// Debug start-up information
console.log('==== SERVER STARTUP DEBUG INFO ====');
console.log('Current working directory:', process.cwd());
console.log('Node version:', process.version);
console.log('Process arguments:', process.argv);
console.log('Environment NODE_ENV:', process.env.NODE_ENV);
console.log('==== END SERVER STARTUP DEBUG INFO ====');
const { router: authRoutes, authenticateToken } = require('./routes/auth');
const characterRoutes = require('./routes/characters');
const apiLimiter = require('./middleware/rateLimiter');
const sanitizeInputs = require('./middleware/sanitizer');
const { handleError } = require('./utils/errorHandler');
const referenceVirtuesFlawsRouter = require('./routes/referenceVirtuesFlaws');
const abilitiesRouter = require('./routes/abilities');
const artsRouter = require('./routes/arts');

const app = express();

// Middleware
app.use(helmet()); // Add security headers

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // This is important for cookies
}));
app.use(express.json({ limit: '100kb' })); // Limit payload size
app.use(cookieParser());
app.use(sanitizeInputs);

// Add logging middleware
app.use(requestLogging);

// Apply rate limiter to all API routes
app.use("/api/", apiLimiter);

// CSRF protection for state-changing routes - disabled during development
if (process.env.NODE_ENV === 'production') {
  app.use('/api', csrfProtection);
  app.use(handleCsrfError);
} else {
  console.log('⚠️ CSRF protection disabled in development mode');
}

// Provide CSRF token endpoint
if (process.env.NODE_ENV === 'production') {
  app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });
} else {
  app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: 'development-mode-csrf-token' });
  });
}

// Auth routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', authenticateToken, authRoutes);
app.use('/api/characters', authenticateToken, characterRoutes);

// Reference virtues and flaws route
app.use('/api/reference-virtues-flaws', referenceVirtuesFlawsRouter);

// Abilities routes
// Mount reference abilities routes without auth to allow public access
app.use('/api/reference-abilities', abilitiesRouter);
// Mount character-specific abilities routes with auth
app.use('/api/characters', authenticateToken, abilitiesRouter);

// Arts routes
app.use('/api', artsRouter);

// Test route with version marker
app.get('/', (req, res) => {
  res.send('Ars Saga Manager API is running - VERSION MARKER 20250327');
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