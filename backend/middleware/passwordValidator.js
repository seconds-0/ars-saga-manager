// backend/middleware/passwordValidator.js

const { logger } = require('../utils/logger');

/**
 * Middleware to validate password strength
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const validatePassword = (req, res, next) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }
  
  // Initialize error list
  const errors = [];
  
  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Number check
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // If there are any errors, return them
  if (errors.length > 0) {
    logger.warn('Password validation failed:', { 
      email: req.body.email,
      errorCount: errors.length
    });
    return res.status(400).json({ 
      message: 'Password does not meet requirements',
      errors
    });
  }
  
  // Password passes all checks
  next();
};

module.exports = validatePassword;