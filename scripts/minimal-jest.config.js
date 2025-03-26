/**
 * Minimal Jest Configuration
 * 
 * This config strips down all the complex setup to identify performance bottlenecks
 */
module.exports = {
  // Only run in node environment, not jsdom
  testEnvironment: 'node',
  
  // No transformations
  transform: {},
  
  // No reporters except default console
  reporters: ["default"],
  
  // No setup files
  setupFiles: [],
  setupFilesAfterEnv: [],
  
  // No module name mapping
  moduleNameMapper: {},
  
  // Don't track coverage
  collectCoverage: false,
  
  // Simple test match
  testMatch: ['<rootDir>/../frontend/src/test-minimal.test.js'],
  
  // Turn off all other features
  watchman: false,
  cache: false,
  haste: {
    enableSymlinks: false
  }
};