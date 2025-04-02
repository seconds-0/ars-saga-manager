/**
 * Comprehensive test runner script
 * 
 * This script:
 * 1. Runs backend tests
 * 2. Runs frontend tests with reporting
 * 3. Extracts failures into categorized files
 * 4. Generates a summary report
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', 'test-output');
const FAILURES_DIR = path.join(OUTPUT_DIR, 'failures');
const BACKEND_DIR = path.join(OUTPUT_DIR, 'backend');
const FRONTEND_DIR = path.join(OUTPUT_DIR, 'frontend');
const SUMMARY_FILE = path.join(OUTPUT_DIR, 'test-summary.md');

// Create output directories
[OUTPUT_DIR, FAILURES_DIR, BACKEND_DIR, FRONTEND_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Clear previous test results
function clearDirectory(directory) {
  if (fs.existsSync(directory)) {
    fs.readdirSync(directory).forEach(file => {
      const filePath = path.join(directory, file);
      if (fs.statSync(filePath).isDirectory()) {
        clearDirectory(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
  }
}

// Get timestamp for file naming
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Main function to run all tests
function runAllTests() {
  console.log('=========================================================');
  console.log('🧪 Running Comprehensive Test Suite');
  console.log('=========================================================');
  
  // Start timing
  const startTime = new Date();
  
  // Clear previous results
  console.log('🧹 Clearing previous test results...');
  clearDirectory(FAILURES_DIR);
  
  // Test results
  let backendSuccess = false;
  let frontendSuccess = false;
  let backendOutput = '';
  let frontendOutput = '';
  let backendError = null;
  let frontendError = null;
  
  // Run backend tests
  console.log('\n🔍 Running Backend Tests...');
  try {
    backendOutput = execSync('cd backend && npm test', { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 60000 // 1 minute timeout
    });
    
    // Write output to file
    fs.writeFileSync(path.join(BACKEND_DIR, `${timestamp}-backend-results.txt`), backendOutput);
    console.log('✅ Backend tests completed successfully');
    backendSuccess = true;
  } catch (error) {
    backendError = error;
    backendOutput = error.stdout || '';
    
    // Write error output to file
    fs.writeFileSync(path.join(BACKEND_DIR, `${timestamp}-backend-errors.txt`), 
      `Exit code: ${error.status || 'unknown'}\n\n${backendOutput}`
    );
    console.log('❌ Backend tests failed');
  }
  
  // Run frontend tests
  console.log('\n🔍 Running Frontend Tests with Reporting...');
  try {
    frontendOutput = execSync('cd frontend && npm run test:report', { 
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 300000 // 5 minute timeout
    });
    
    // Write output to file
    fs.writeFileSync(path.join(FRONTEND_DIR, `${timestamp}-frontend-results.txt`), frontendOutput);
    console.log('✅ Frontend tests completed');
    frontendSuccess = true;
  } catch (error) {
    frontendError = error;
    frontendOutput = error.stdout || '';
    
    // Write error output to file
    fs.writeFileSync(path.join(FRONTEND_DIR, `${timestamp}-frontend-errors.txt`), 
      `Exit code: ${error.status || 'unknown'}\n\n${frontendOutput}`
    );
    console.log('❌ Frontend tests failed');
  }
  
  // Extract test failures
  console.log('\n🔍 Extracting test failures...');
  try {
    execSync('node scripts/extract-test-failures.js', { stdio: 'inherit' });
    console.log('✅ Failures extracted successfully');
  } catch (error) {
    console.error('❌ Failed to extract failures:', error.message);
  }
  
  // Calculate duration
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  
  // Generate summary report
  console.log('\n📊 Generating test summary report...');
  generateSummary({
    timestamp: startTime.toISOString(),
    duration,
    backendSuccess,
    frontendSuccess,
    backendError,
    frontendError
  });
  
  // Final output
  console.log('\n=========================================================');
  console.log(`🏁 Test run completed in ${duration.toFixed(2)} seconds`);
  console.log(`📝 Summary report available at: ${SUMMARY_FILE}`);
  console.log('=========================================================');
  
  // Show status
  if (backendSuccess && frontendSuccess) {
    console.log('✅ All tests passed successfully!');
  } else {
    console.log('❌ Some tests failed. Check the report for details.');
    
    // Return non-zero exit code if any tests failed
    process.exit(1);
  }
}

// Generate summary report
function generateSummary(data) {
  const { timestamp, duration, backendSuccess, frontendSuccess, backendError, frontendError } = data;
  
  let summaryContent = `# Test Run Summary\n\n`;
  summaryContent += `Generated: ${timestamp}\n`;
  summaryContent += `Duration: ${duration.toFixed(2)} seconds\n\n`;
  
  // Overall status
  summaryContent += `## Overall Status\n\n`;
  summaryContent += `- Backend: ${backendSuccess ? '✅ PASSED' : '❌ FAILED'}\n`;
  summaryContent += `- Frontend: ${frontendSuccess ? '✅ PASSED' : '❌ FAILED'}\n\n`;
  
  // Error details if any
  if (!backendSuccess || !frontendSuccess) {
    summaryContent += `## Error Details\n\n`;
    
    if (!backendSuccess && backendError) {
      summaryContent += `### Backend Error\n\n`;
      summaryContent += `Exit code: ${backendError.status || 'unknown'}\n`;
      if (backendError.message) {
        summaryContent += `\`\`\`\n${backendError.message}\n\`\`\`\n\n`;
      }
    }
    
    if (!frontendSuccess && frontendError) {
      summaryContent += `### Frontend Error\n\n`;
      summaryContent += `Exit code: ${frontendError.status || 'unknown'}\n`;
      if (frontendError.message) {
        summaryContent += `\`\`\`\n${frontendError.message}\n\`\`\`\n\n`;
      }
    }
  }
  
  // Test output locations
  summaryContent += `## Test Results Location\n\n`;
  summaryContent += `- Detailed backend results: \`${path.join(BACKEND_DIR, `${timestamp}-backend-${backendSuccess ? 'results' : 'errors'}.txt`)}\`\n`;
  summaryContent += `- Detailed frontend results: \`${path.join(FRONTEND_DIR, `${timestamp}-frontend-${frontendSuccess ? 'results' : 'errors'}.txt`)}\`\n`;
  summaryContent += `- Failure analysis: \`${path.join(FAILURES_DIR, 'summary.md')}\`\n`;
  
  // Write summary file
  fs.writeFileSync(SUMMARY_FILE, summaryContent);
}

// Run all tests
runAllTests();