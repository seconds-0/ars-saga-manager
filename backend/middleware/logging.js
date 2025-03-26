const { createRequestLogger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Request logging middleware
const requestLogging = (req, res, next) => {
  // Generate request ID if not present
  req.id = req.id || uuidv4();
  
  // Create a child logger for this request
  req.log = createRequestLogger(req);

  // Log the incoming request
  req.log.info({
    req: {
      body: req.body,
      query: req.query,
      params: req.params
    }
  }, 'Incoming request');

  // Log response on finish
  res.on('finish', () => {
    req.log.info({
      res: {
        statusCode: res.statusCode,
        responseTime: Date.now() - req._startTime
      }
    }, 'Request completed');
  });

  // Store request start time
  req._startTime = Date.now();
  next();
};

// Error logging middleware
const errorLogging = (err, req, res, next) => {
  if (!req.log) {
    req.log = createRequestLogger(req);
  }

  // Log the error with context
  req.log.error({
    err: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    req: {
      body: req.body,
      query: req.query,
      params: req.params
    }
  }, 'Request error');

  next(err);
};

module.exports = {
  requestLogging,
  errorLogging
}; 