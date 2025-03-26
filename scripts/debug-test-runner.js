/**
 * Diagnostic Test Runner for WSL Issues
 * 
 * This script runs tests with verbose output and performance metrics
 * to help diagnose WSL timeout issues.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Print system information to help diagnose issues
console.log('=== System Information ===');
console.log(`Node version: ${process.version}`);
console.log(`OS: ${os.type()} ${os.release()}`);
console.log(`CPU: ${os.cpus()[0].model} x ${os.cpus().length}`);
console.log(`Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)} GB`);
console.log(`Free Memory: ${Math.round(os.freemem() / 1024 / 1024 / 1024)} GB`);
console.log('========================\n');

// Define paths
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');

// Parse args
const args = process.argv.slice(2);
const testPath = args[0] || 'src/test-minimal.test.js';
const isVerbose = args.includes('--verbose');
const noCache = args.includes('--no-cache');

console.log(`Running test: ${testPath}`);
console.log(`Verbose mode: ${isVerbose ? 'enabled' : 'disabled'}`);
console.log(`Cache: ${noCache ? 'disabled' : 'enabled'}`);
console.log('-------------------------\n');

// Performance measurement
const startTime = Date.now();

try {
  // Build command
  let command = `npx jest --config=./testing/jest.config.js ${testPath}`;
  
  if (isVerbose) {
    command += ' --verbose';
  }
  
  if (noCache) {
    command += ' --no-cache';
  }
  
  // Display the command we're running
  console.log(`Executing: ${command}\n`);
  
  // Run the test
  const output = execSync(command, { 
    cwd: frontendDir, 
    stdio: 'inherit',
    encoding: 'utf8'
  });
  
  // Calculate performance metrics
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log(`\n=== Performance Summary ===`);
  console.log(`Total execution time: ${duration.toFixed(2)} seconds`);
  console.log(`========================\n`);
  
  process.exit(0);
} catch (error) {
  // Calculate performance metrics even on failure
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.error(`\n=== Error Summary ===`);
  console.error(`Error code: ${error.status || 'unknown'}`);
  console.error(`Error message: ${error.message}`);
  console.error(`Total execution time: ${duration.toFixed(2)} seconds`);
  console.error(`===================\n`);
  
  process.exit(1);
}