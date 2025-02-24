const pino = require('pino');

// Define log levels based on environment
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Create the logger instance
const logger = pino({
  level,
  // Enable pretty printing in development
  transport: process.env.NODE_ENV !== 'production' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          levelFirst: true,
          translateTime: 'SYS:standard'
        }
      }
    : undefined,
  // Add timestamp and environment info
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version
  },
  // Redact sensitive information
  redact: [
    'req.headers.authorization',
    'req.headers.cookie',
    'req.body.password',
    'req.body.confirmPassword'
  ]
});

// Export a function to create child loggers with request context
const createRequestLogger = (req) => {
  return logger.child({
    reqId: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip
  });
};

module.exports = {
  logger,
  createRequestLogger
};