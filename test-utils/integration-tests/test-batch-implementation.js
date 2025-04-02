/**
 * Master script to run batch implementation tests from the repository root
 * This script runs all batch tests and saves the results to a file
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const FRONTEND_DIR = path.join(__dirname, 'frontend');
const OUTPUT_DIR = path.join(__dirname, 'test-output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'batch-test-results.txt');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('==============================================================');
console.log('🧪 BATCH IMPLEMENTATION TEST RUNNER');
console.log('==============================================================');
console.log('This script runs tests for the batch request implementation');
console.log(`Results will be saved to: ${OUTPUT_FILE}`);
console.log('==============================================================');

// Check if frontend directory exists
if (!fs.existsSync(FRONTEND_DIR)) {
  console.error(`❌ Frontend directory not found: ${FRONTEND_DIR}`);
  process.exit(1);
}

// Create header for results file
let allResults = `==============================================================
BATCH IMPLEMENTATION TEST RESULTS
==============================================================
Repository: ${__dirname}
Run date: ${new Date().toISOString()}

`;

// Run the three types of tests
const testTypes = [
  {
    name: 'Batch Unit Tests',
    script: 'testing/runBatchTests.js',
    resultFile: 'batch-test-results.txt'
  },
  {
    name: 'Integration Tests',
    script: 'testing/runIntegrationTests.js',
    resultFile: 'integration-test-results.txt'
  },
  {
    name: 'Full Test Suite',
    script: 'testing/runTestsAndReport.js',
    args: ['useBatch'],
    resultFile: 'test-results.txt'
  }
];

const testResults = {
  passed: 0,
  failed: 0,
  total: testTypes.length
};

for (const test of testTypes) {
  console.log(`\n🧪 Running: ${test.name}`);
  
  try {
    // Construct command
    const args = test.args ? test.args.join(' ') : '';
    const command = `node ${test.script} ${args}`;
    
    // Execute the test script in the frontend directory
    execSync(command, { 
      cwd: FRONTEND_DIR,
      stdio: 'inherit',
      timeout: 300000 // 5 minutes timeout
    });
    
    // Read the results file
    const resultFilePath = path.join(FRONTEND_DIR, test.resultFile);
    if (fs.existsSync(resultFilePath)) {
      const resultContent = fs.readFileSync(resultFilePath, 'utf8');
      
      // Add to the aggregated results
      allResults += `\n--------------------------------------------------------------\n`;
      allResults += `TEST RESULTS: ${test.name}\n`;
      allResults += `--------------------------------------------------------------\n\n`;
      allResults += resultContent + '\n\n';
      
      // Check if the test passed
      const passed = !resultContent.includes('OVERALL STATUS: FAILED');
      testResults.passed += passed ? 1 : 0;
      testResults.failed += passed ? 0 : 1;
      
      console.log(`✅ ${test.name} completed`);
      console.log(`📝 Results saved to: ${resultFilePath}`);
    } else {
      console.log(`⚠️ Warning: Results file not found: ${resultFilePath}`);
      testResults.failed += 1;
    }
    
  } catch (error) {
    testResults.failed += 1;
    console.error(`❌ ${test.name} failed with error:`);
    console.error(error.message);
    
    // Add error information to results
    allResults += `\n--------------------------------------------------------------\n`;
    allResults += `TEST ERROR: ${test.name}\n`;
    allResults += `--------------------------------------------------------------\n\n`;
    allResults += `Error: ${error.message}\n\n`;
  }
}

// Add summary to the results
allResults += `==============================================================
SUMMARY
==============================================================
Tests passed: ${testResults.passed}/${testResults.total}
Tests failed: ${testResults.failed}/${testResults.total}
Overall status: ${testResults.failed === 0 ? 'PASSED' : 'FAILED'}
==============================================================`;

// Save aggregated results to the main output file
fs.writeFileSync(OUTPUT_FILE, allResults);

// Print final summary
console.log('\n==============================================================');
console.log('📊 TEST SUMMARY');
console.log('==============================================================');
console.log(`Tests passed: ${testResults.passed}/${testResults.total}`);
console.log(`Tests failed: ${testResults.failed}/${testResults.total}`);
console.log(`Overall status: ${testResults.failed === 0 ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`📝 Full results saved to: ${OUTPUT_FILE}`);
console.log('==============================================================');