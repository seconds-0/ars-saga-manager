// backend/middleware/authRateLimiter.js

const rateLimit = require("express-rate-limit");

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

// Rate limiting configuration with relaxed settings for development
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 100 : 30, // Much higher limit in development
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { 
    message: 'Too many requests, please try again later.' 
  },
  skipSuccessfulRequests: true, // Don't count successful requests against the limit
});

module.exports = authLimiter;