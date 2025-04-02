/**
 * Script to run integration tests for batch implementation
 * This focuses on components that use the batch functionality
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'test-output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'integration-test-results.txt');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// These patterns target tests that would interact with our batch implementation
const TEST_PATTERNS = [
  'CharacterSheetComponents/AbilitiesSection',
  'CharacterSheetComponents/AbilityRow',
  'CharacterSheetComponents/CharacteristicsAndAbilitiesTab',
  'hooks/useAbilities'
];

console.log('============================================================');
console.log('🧪 Running integration tests for batch implementation');
console.log(`📝 Output will be saved to: ${OUTPUT_FILE}`);
console.log('============================================================');

let allResults = '';
let allPassed = true;

// Create header for results file
allResults += `==============================================
BATCH INTEGRATION TEST RESULTS
==============================================
Run date: ${new Date().toISOString()}

`;

// Run each test pattern individually
for (const pattern of TEST_PATTERNS) {
  console.log(`Running tests matching: ${pattern}`);
  
  try {
    const command = `npx jest --testPathPattern="${pattern}" --config=./testing/jest.config.js --no-watchman --detectOpenHandles --forceExit`;
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 120000 // 2 minute timeout per pattern
    });
    
    // Add test results
    allResults += `----------------------------------------------
TEST PATTERN: ${pattern}
----------------------------------------------
${result}

`;
    
    console.log(`✅ Tests for ${pattern} completed`);
    
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
TEST PATTERN: ${pattern} (FAILED)
----------------------------------------------
Error: ${error.message}

${error.stdout || ''}

`;
    
    console.error(`❌ Tests for ${pattern} failed`);
    
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
  
  console.log(''); // Add blank line between test patterns
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