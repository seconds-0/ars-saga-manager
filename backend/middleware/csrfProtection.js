// backend/middleware/csrfProtection.js

const csrf = require('csurf');
const { logger } = require('../utils/logger');

// Configure CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Error handler for CSRF errors
const handleCsrfError = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  // Handle CSRF token errors
  logger.warn('CSRF validation failed:', {
    path: req.path,
    method: req.method,
    ip: req.ip,
    headers: req.headers
  });
  
  // Send forbidden response
  res.status(403).json({ message: 'Invalid or missing CSRF token' });
};

module.exports = {
  csrfProtection,
  handleCsrfError
};