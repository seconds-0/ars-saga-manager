/**
 * Specific script to run batch-related tests
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'test-output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'frontend-batch-test-results.txt');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
const TEST_FILES = [
  'src/__tests__/finalBatchTest.js',
  'src/__tests__/simpleBatchTest.js',
  'src/__tests__/batchRequestsTest.js',
  'src/__tests__/abilitiesBatchTest.js'
];

console.log('============================================================');
console.log('🧪 Running batch-specific tests');
console.log(`📝 Output will be saved to: ${OUTPUT_FILE}`);
console.log('============================================================');

let allResults = '';
let allPassed = true;

// Create header for results file
allResults += `==============================================
BATCH IMPLEMENTATION TEST RESULTS
==============================================
Run date: ${new Date().toISOString()}

`;

// Run each test file individually
for (const testFile of TEST_FILES) {
  console.log(`Running tests for: ${testFile}`);
  
  try {
    const command = `npx jest ${testFile} --config=./testing/simpleJestConfig.js --no-watchman --detectOpenHandles --forceExit`;
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 60000 // 1 minute timeout per test file
    });
    
    // Add test file results
    allResults += `----------------------------------------------
TEST FILE: ${testFile}
----------------------------------------------
${result}

`;
    
    console.log(`✅ Tests for ${testFile} completed`);
    
    // Extract test summary
    const lines = result.split('\n');
    const summaryLines = lines.filter(line => 
      line.includes('Test Suites:') || 
      line.includes('Tests:') || 
      line.includes('Snapshots:') ||
      line.includes('Time:')
    );
    
    if (summaryLines.length > 0) {
      console.log('Summary:');
      summaryLines.forEach(line => console.log(`  ${line}`));
    }
    
  } catch (error) {
    allPassed = false;
    allResults += `----------------------------------------------
TEST FILE: ${testFile} (FAILED)
----------------------------------------------
Error: ${error.message}

${error.stdout || ''}

`;
    
    console.error(`❌ Tests for ${testFile} failed`);
    
    // Try to extract test summary from failure
    if (error.stdout) {
      const lines = error.stdout.split('\n');
      const summaryLines = lines.filter(line => 
        line.includes('Test Suites:') || 
        line.includes('Tests:') || 
        line.includes('Snapshots:') ||
        line.includes('Time:')
      );
      
      if (summaryLines.length > 0) {
        console.log('Summary:');
        summaryLines.forEach(line => console.log(`  ${line}`));
      }
    }
  }
  
  console.log(''); // Add blank line between test files
}

// Add final status
allResults += `==============================================
OVERALL STATUS: ${allPassed ? 'PASSED' : 'FAILED'}
==============================================`;

// Save to output file
fs.writeFileSync(OUTPUT_FILE, allResults);

console.log('============================================================');
console.log(`📝 All test results saved to: ${OUTPUT_FILE}`);
console.log(`📊 Overall status: ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);
console.log('============================================================');