/**
 * Script to verify that the batch implementation is properly integrated
 * This script checks key files to ensure they're using the batch system
 */
const fs = require('fs');
const path = require('path');

// Configuration
const FRONTEND_DIR = path.join(__dirname, 'frontend');
const OUTPUT_DIR = path.join(__dirname, 'test-output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'batch-integration-check.txt');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Files that should be using the batch system
const FILES_TO_CHECK = [
  {
    path: 'src/hooks/useAbilities.js',
    patterns: [
      'useBatchRequests',
      'batchRequests.addIncrementOperation',
      'batchRequests.addDecrementOperation',
      'batchRequests.isOperationPending'
    ]
  },
  {
    path: 'src/components/CharacterSheetComponents/AbilityRow.js',
    patterns: [
      'incrementAbility',
      'decrementAbility'
    ]
  },
  {
    path: 'src/components/CharacterSheetComponents/AbilitiesSection.js',
    patterns: [
      'useAbilities'
    ]
  },
  {
    path: 'src/hooks/useBatchRequests.js',
    patterns: [
      'addOperation',
      'processBatch',
      'retryCountRef',
      'MAX_RETRIES'
    ]
  }
];

console.log('==============================================================');
console.log('🔍 BATCH INTEGRATION VERIFICATION');
console.log('==============================================================');
console.log('Checking key files to verify batch implementation integration');
console.log(`Results will be saved to: ${OUTPUT_FILE}`);
console.log('==============================================================');

let results = `==============================================================
BATCH IMPLEMENTATION INTEGRATION CHECK
==============================================================
Repository: ${__dirname}
Run date: ${new Date().toISOString()}

`;

let overallStatus = true;

// Check each file for the required patterns
for (const fileCheck of FILES_TO_CHECK) {
  const filePath = path.join(FRONTEND_DIR, fileCheck.path);
  console.log(`\nChecking: ${fileCheck.path}`);
  
  results += `\n--------------------------------------------------------------\n`;
  results += `FILE: ${fileCheck.path}\n`;
  results += `--------------------------------------------------------------\n\n`;
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    results += `ERROR: File not found\n`;
    overallStatus = false;
    continue;
  }
  
  // Read the file content
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check for each pattern
  const patternResults = [];
  
  for (const pattern of fileCheck.patterns) {
    const found = content.includes(pattern);
    patternResults.push({ pattern, found });
    
    console.log(`${found ? '✅' : '❌'} Pattern: ${pattern}`);
    results += `${found ? '✅' : '❌'} Pattern: ${pattern}\n`;
    
    if (!found) {
      overallStatus = false;
    }
  }
  
  // Add pattern summary
  const foundCount = patternResults.filter(p => p.found).length;
  const statusText = foundCount === patternResults.length ? 'PASSED' : 'FAILED';
  
  console.log(`Status: ${statusText} (${foundCount}/${patternResults.length} patterns found)`);
  results += `\nStatus: ${statusText} (${foundCount}/${patternResults.length} patterns found)\n`;
}

// Add overall summary
results += `\n==============================================================
OVERALL STATUS: ${overallStatus ? 'PASSED' : 'FAILED'}
==============================================================\n`;

// Save results to file
fs.writeFileSync(OUTPUT_FILE, results);

// Print final summary
console.log('\n==============================================================');
console.log('📊 VERIFICATION SUMMARY');
console.log('==============================================================');
console.log(`Overall status: ${overallStatus ? '✅ PASSED' : '❌ FAILED'}`);
console.log(`📝 Full results saved to: ${OUTPUT_FILE}`);
console.log('==============================================================');