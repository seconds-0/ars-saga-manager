/**
 * Simple test runner for batch requests implementation
 */
const { execSync } = require('child_process');
const path = require('path');

// Configuration
const testPath = process.argv[2] || 'src/__tests__/simpleBatchTest.js';
const fullTestPath = path.join(__dirname, '..', testPath);

console.log(`🧪 Running simplified test for: ${testPath}`);
console.log('===============================================');

try {
  // Run the test with minimal config
  const result = execSync(
    `npx jest ${fullTestPath} --config=./testing/simpleJestConfig.js --no-watchman --detectOpenHandles --forceExit --runInBand`,
    { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test',
        FORCE_COLOR: '1'
      }
    }
  );
  
  console.log('===============================================');
  console.log('✅ Tests completed successfully');
} catch (error) {
  console.log('===============================================');
  console.error('❌ Tests failed with error:', error.message);
  process.exit(1);
}