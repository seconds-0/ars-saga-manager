// backend/middleware/sanitizer.js

const sanitizeHtml = require('sanitize-html');

const sanitizeInputs = (req, res, next) => {
  for (const [key, value] of Object.entries(req.body)) {
    if (typeof value === 'string') {
      req.body[key] = sanitizeHtml(value);
    }
  }
  next();
};

module.exports = sanitizeInputs;