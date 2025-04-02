/**
 * Script to run tests and save results to a file
 * This allows running tests in the background and reviewing results later
 * It also runs an extraction script to organize failures into separate files
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'test-output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'test-results.txt');
const LOG_FILE = path.join(OUTPUT_DIR, 'test-run.log');
const FAILURES_DIR = path.join(OUTPUT_DIR, 'failures');
const EXTRACT_SCRIPT = path.join(__dirname, '..', '..', 'scripts', 'extract-test-failures.js');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Ensure failures directory exists
if (!fs.existsSync(FAILURES_DIR)) {
  fs.mkdirSync(FAILURES_DIR, { recursive: true });
}
const TIMEOUT = 600000; // 10 minutes timeout

// Get test pattern from command line args if provided
const testPattern = process.argv[2] || '';
const testCommand = testPattern 
  ? `npm test -- --watchAll=false --testPathPattern="${testPattern}"` 
  : 'npm test -- --watchAll=false';

console.log('============================================================');
console.log(`🧪 Running tests: ${testCommand}`);
console.log(`📝 Output will be saved to: ${OUTPUT_FILE}`);
console.log(`📄 Full logs will be saved to: ${LOG_FILE}`);
console.log('============================================================');

try {
  // Run the tests and capture output
  const startTime = new Date();
  console.log(`⏱️  Started at: ${startTime.toLocaleTimeString()}`);
  
  const result = execSync(testCommand, { 
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: TIMEOUT,
    maxBuffer: 10 * 1024 * 1024 // 10MB buffer
  });
  
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  
  // Format the result
  const formattedResult = 
`==============================================================
TEST RESULTS
==============================================================
Test command: ${testCommand}
Started: ${startTime.toISOString()}
Finished: ${endTime.toISOString()}
Duration: ${duration.toFixed(2)} seconds

${result}

==============================================================
End of test results
==============================================================`;

  // Save to output file
  fs.writeFileSync(OUTPUT_FILE, formattedResult);
  fs.writeFileSync(LOG_FILE, result);
  
  console.log(`✅ Tests completed in ${duration.toFixed(2)} seconds`);
  console.log(`📝 Results saved to: ${OUTPUT_FILE}`);
  console.log(`📄 Full logs saved to: ${LOG_FILE}`);
  
  // Run extraction script to organize failures if it exists
  try {
    if (fs.existsSync(EXTRACT_SCRIPT)) {
      console.log('🔍 Extracting test failures...');
      execSync(`node ${EXTRACT_SCRIPT}`, { stdio: 'inherit' });
      console.log('✅ Failures extracted and organized');
    } else {
      console.log('⚠️ Extraction script not found at:', EXTRACT_SCRIPT);
    }
  } catch (extractError) {
    console.error('⚠️ Error extracting failures:', extractError.message);
  }
  
  // Output a summary of test results
  const lines = result.split('\n');
  const summaryLines = lines.filter(line => 
    line.includes('Test Suites:') || 
    line.includes('Tests:') || 
    line.includes('Snapshots:') ||
    line.includes('Time:')
  );
  
  if (summaryLines.length > 0) {
    console.log('\nTest Summary:');
    summaryLines.forEach(line => console.log(line));
  }
  
} catch (error) {
  const errorMessage = 
`==============================================================
TEST ERROR
==============================================================
Test command: ${testCommand}
Error: ${error.message}

${error.stdout || ''}
==============================================================
End of test error
==============================================================`;

  // Save error to output file
  fs.writeFileSync(OUTPUT_FILE, errorMessage);
  if (error.stdout) {
    fs.writeFileSync(LOG_FILE, error.stdout);
  }
  
  console.error('❌ Tests failed with error:');
  console.error(error.message);
  
  // Try to extract test summary even from failed runs
  if (error.stdout) {
    const lines = error.stdout.split('\n');
    const summaryLines = lines.filter(line => 
      line.includes('Test Suites:') || 
      line.includes('Tests:') || 
      line.includes('Snapshots:') ||
      line.includes('Time:')
    );
    
    if (summaryLines.length > 0) {
      console.log('\nTest Summary:');
      summaryLines.forEach(line => console.log(line));
    }
  }
  
  console.log(`📝 Error details saved to: ${OUTPUT_FILE}`);
  
  // Run extraction script even for failed runs
  try {
    if (fs.existsSync(EXTRACT_SCRIPT)) {
      console.log('🔍 Extracting test failures...');
      execSync(`node ${EXTRACT_SCRIPT}`, { stdio: 'inherit' });
      console.log('✅ Failures extracted and organized');
    } else {
      console.log('⚠️ Extraction script not found at:', EXTRACT_SCRIPT);
    }
  } catch (extractError) {
    console.error('⚠️ Error extracting failures:', extractError.message);
  }
  
  process.exit(1);
}