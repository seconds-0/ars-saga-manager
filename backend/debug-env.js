// Load environment variables
require('dotenv').config();

// Debug environment variables
console.log('Environment Variables:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[SET]' : '[NOT SET]');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Working Directory:', process.cwd());

// Check for dotenv path
const path = require('path');
console.log('Full path to .env:', path.resolve(__dirname, '.env'));
console.log('File exists:', require('fs').existsSync(path.resolve(__dirname, '.env')));

// Test JWT operations
if (process.env.JWT_SECRET) {
  try {
    const jwt = require('jsonwebtoken');
    const testToken = jwt.sign({ test: 'payload' }, process.env.JWT_SECRET);
    console.log('Token created successfully:', testToken ? '[SUCCESS]' : '[FAILED]');
    const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('Token verification successful:', decoded ? '[SUCCESS]' : '[FAILED]');
  } catch (error) {
    console.error('Error with JWT operations:', error);
  }
}