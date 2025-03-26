/**
 * Script to run tests in both backend and frontend
 * This script works around bash command limitations
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define paths
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

// Utility to run a command and print output
function runCommand(command, cwd) {
  console.log(`\n🧪 Running command: ${command}\n`);
  try {
    // Set encoding to 'utf8' to get string output instead of Buffer
    const output = execSync(command, { 
      cwd, 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    return { success: true, output };
  } catch (error) {
    console.error(`❌ Command failed with error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Check if directories exist
if (!fs.existsSync(backendDir)) {
  console.error(`❌ Backend directory not found at: ${backendDir}`);
  process.exit(1);
}

if (!fs.existsSync(frontendDir)) {
  console.error(`❌ Frontend directory not found at: ${frontendDir}`);
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const runBackend = args.includes('--backend') || args.length === 0;
const runFrontend = args.includes('--frontend') || args.length === 0;
const testName = args.find(arg => arg.startsWith('--test='))?.replace('--test=', '');

console.log('🧪 Ars Saga Manager Test Runner 🧪');
console.log('===================================');

// Run backend tests
if (runBackend) {
  console.log('\n📋 Running Backend Tests');
  console.log('-----------------------------------');
  
  const backendCommand = testName 
    ? `npx jest -t "${testName}"` 
    : 'npx jest';
  
  const backendResult = runCommand(backendCommand, backendDir);
  
  if (!backendResult.success) {
    console.log('⚠️ Backend tests failed or had errors');
  }
}

// Run frontend tests
if (runFrontend) {
  console.log('\n📋 Running Frontend Tests');
  console.log('-----------------------------------');
  
  const frontendCommand = testName 
    ? `npx jest --config=./testing/jest.config.js -t "${testName}"` 
    : 'npx jest --config=./testing/jest.config.js';
  
  const frontendResult = runCommand(frontendCommand, frontendDir);
  
  if (!frontendResult.success) {
    console.log('⚠️ Frontend tests failed or had errors');
  }
}

console.log('\n✅ Test script execution completed');