// Minimal Jest configuration for batch request tests
const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname, '..'),
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!axios|camelcase)'
  ],
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.js'
  ]
};