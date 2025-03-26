/**
 * Batched Test Runner for Ars Saga Manager
 * 
 * This script runs tests in smaller batches to avoid WSL timeouts,
 * collects results from all batches, and generates a comprehensive report.
 */
const { execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const execAsync = promisify(exec);
const glob = promisify(require('glob'));

// Define paths
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');
const resultsDir = path.join(rootDir, 'test-results');
const reportPath = path.join(resultsDir, 'batched-test-report.md');

// Create the results directory if it doesn't exist
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Configuration
const DEFAULT_BATCH_SIZE = 5; // Default number of test files per batch
const BATCH_TIMEOUT_MS = 50000; // 50 seconds timeout per batch

// CLI arguments parsing
const args = process.argv.slice(2);
const batchSize = args.find(arg => arg.startsWith('--batch-size='))
  ? parseInt(args.find(arg => arg.startsWith('--batch-size=')).replace('--batch-size=', ''), 10)
  : DEFAULT_BATCH_SIZE;
const changedOnly = args.includes('--changed-only');
const frontendOnly = args.includes('--frontend');
const backendOnly = args.includes('--backend');
const verbose = args.includes('--verbose');
const testPattern = args.find(arg => arg.startsWith('--pattern='))?.replace('--pattern=', '');

/**
 * Gets a list of recently changed files using git
 * @returns {Promise<string[]>} Array of changed file paths
 */
async function getChangedFiles() {
  try {
    const { stdout } = await execAsync('git diff --name-only HEAD~5 HEAD', { cwd: rootDir });
    return stdout.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error getting changed files:', error.message);
    return [];
  }
}

/**
 * Extracts test files related to changed source files
 * @param {string[]} changedFiles Array of changed file paths
 * @returns {Object} Object with backend and frontend test paths
 */
async function getTestsForChangedFiles(changedFiles) {
  const backendTests = new Set();
  const frontendTests = new Set();

  // For each changed file, find related test files
  for (const file of changedFiles) {
    if (file.includes('backend/') && file.endsWith('.js') && !file.endsWith('.test.js')) {
      // Extract the base name to look for matching test files
      const baseName = path.basename(file, '.js');
      const testPattern = path.join(backendDir, '**', `${baseName}.test.js`);
      const matchingTests = await glob(testPattern);
      matchingTests.forEach(test => backendTests.add(test));
    } 
    else if (file.includes('frontend/src/') && file.endsWith('.js') && !file.endsWith('.test.js')) {
      // Extract the base name to look for matching test files
      const baseName = path.basename(file, '.js');
      const testPattern = path.join(frontendDir, 'src', '**', `${baseName}.test.js`);
      const matchingTests = await glob(testPattern);
      matchingTests.forEach(test => frontendTests.add(test));
    }
  }

  return { 
    backend: Array.from(backendTests), 
    frontend: Array.from(frontendTests) 
  };
}

/**
 * Discovers all test files in the project
 * @returns {Promise<Object>} Object with backend and frontend test paths
 */
async function discoverAllTestFiles() {
  const backendTests = await glob(path.join(backendDir, '**', '*.test.js'));
  const frontendTests = await glob(path.join(frontendDir, 'src', '**', '*.test.js'));

  // Filter by pattern if provided
  if (testPattern) {
    const regex = new RegExp(testPattern, 'i');
    return {
      backend: backendTests.filter(test => regex.test(test)),
      frontend: frontendTests.filter(test => regex.test(test))
    };
  }

  return { backend: backendTests, frontend: frontendTests };
}

/**
 * Groups test files by their parent directory
 * @param {string[]} testFiles Array of test file paths
 * @returns {Object} Object with directory keys and array of test files
 */
function groupTestsByDirectory(testFiles) {
  const groups = {};
  
  testFiles.forEach(file => {
    const dir = path.dirname(file);
    if (!groups[dir]) {
      groups[dir] = [];
    }
    groups[dir].push(file);
  });

  return groups;
}

/**
 * Creates batches of test files
 * @param {string[]} testFiles Array of test file paths
 * @param {number} batchSize Maximum number of tests per batch
 * @returns {Array<string[]>} Array of test file batches
 */
function createTestBatches(testFiles, size = DEFAULT_BATCH_SIZE) {
  // First try to group by directory
  const groupedTests = groupTestsByDirectory(testFiles);
  
  // Flatten groups into batches, respecting batch size
  const batches = [];
  let currentBatch = [];
  
  // Process each directory group
  Object.values(groupedTests).forEach(group => {
    // If group is larger than batch size, split it further
    if (group.length > size) {
      // Add complete group to batches array
      for (let i = 0; i < group.length; i += size) {
        batches.push(group.slice(i, i + size));
      }
    } 
    // If current batch + group would exceed batch size, start a new batch
    else if (currentBatch.length + group.length > size) {
      if (currentBatch.length > 0) {
        batches.push(currentBatch);
      }
      currentBatch = [...group];
    } 
    // Otherwise add group to current batch
    else {
      currentBatch.push(...group);
    }
  });
  
  // Don't forget the last batch
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }
  
  return batches;
}

/**
 * Runs a batch of tests
 * @param {string[]} testFiles Array of test file paths
 * @param {string} cwd Current working directory (backend or frontend)
 * @param {boolean} isFrontend Whether these are frontend tests
 * @returns {Promise<Object>} Test results
 */
async function runTestBatch(testFiles, cwd, isFrontend) {
  // Create a temporary file with list of tests to run
  const testPaths = testFiles.map(file => path.relative(cwd, file));
  const batchId = `batch-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const outputFile = path.join(resultsDir, `${batchId}-results.json`);
  
  try {
    let command = 'npx jest';
    
    // Add frontend-specific config
    if (isFrontend) {
      command += ' --config=./testing/jest.config.js';
    }
    
    // Add test files
    command += ` ${testPaths.join(' ')}`;
    
    // Add JSON reporter for parsing
    command += ` --json --outputFile="${outputFile}"`;
    
    if (verbose) {
      console.log(`Running command: ${command}`);
    } else {
      console.log(`Running batch with ${testFiles.length} tests...`);
    }
    
    // Run with a timeout to avoid hanging
    const { stdout, stderr } = await execAsync(command, { 
      cwd, 
      timeout: BATCH_TIMEOUT_MS,
      maxBuffer: 5 * 1024 * 1024 // 5MB buffer
    });
    
    if (verbose) {
      console.log(stdout);
      if (stderr) console.error(stderr);
    }
    
    // Read the results JSON file
    const results = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    
    // Clean up the temporary file
    fs.unlinkSync(outputFile);
    
    return {
      success: results.numFailedTests === 0,
      results,
      stdout,
      stderr
    };
  } catch (error) {
    console.error(`Error running test batch: ${error.message}`);
    
    // Try to read results file if it exists
    let results = null;
    if (fs.existsSync(outputFile)) {
      try {
        results = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
        fs.unlinkSync(outputFile);
      } catch (e) {
        console.error(`Failed to read results file: ${e.message}`);
      }
    }
    
    return {
      success: false,
      error: error.message,
      results,
      stdout: error.stdout,
      stderr: error.stderr
    };
  }
}

/**
 * Formats a test report in markdown
 * @param {Object} allResults Combined test results from all batches
 * @returns {string} Markdown formatted report
 */
function formatTestReport(allResults) {
  const { backend, frontend } = allResults;
  
  let report = `# Batched Test Run Report\n\n`;
  report += `Generated on: ${new Date().toISOString()}\n\n`;
  
  // Summary section
  report += `## Summary\n\n`;
  
  const backendStats = calculateStats(backend);
  const frontendStats = calculateStats(frontend);
  const totalStats = {
    total: backendStats.total + frontendStats.total,
    passed: backendStats.passed + frontendStats.passed,
    failed: backendStats.failed + frontendStats.failed,
    skipped: backendStats.skipped + frontendStats.skipped,
    duration: backendStats.duration + frontendStats.duration
  };
  
  report += `| Area | Tests | Passed | Failed | Skipped | Duration |\n`;
  report += `|------|-------|--------|--------|---------|----------|\n`;
  if (backend.length > 0) {
    report += `| Backend | ${backendStats.total} | ${backendStats.passed} | ${backendStats.failed} | ${backendStats.skipped} | ${(backendStats.duration/1000).toFixed(2)}s |\n`;
  }
  if (frontend.length > 0) {
    report += `| Frontend | ${frontendStats.total} | ${frontendStats.passed} | ${frontendStats.failed} | ${frontendStats.skipped} | ${(frontendStats.duration/1000).toFixed(2)}s |\n`;
  }
  report += `| **Total** | **${totalStats.total}** | **${totalStats.passed}** | **${totalStats.failed}** | **${totalStats.skipped}** | **${(totalStats.duration/1000).toFixed(2)}s** |\n\n`;
  
  // Failed tests section
  const failedTests = [...getFailedTests(backend), ...getFailedTests(frontend)];
  
  if (failedTests.length > 0) {
    report += `## Failed Tests\n\n`;
    
    failedTests.forEach(test => {
      report += `### ${test.testPath}\n\n`;
      report += `**Test:** ${test.name}\n\n`;
      report += `**Error:** ${test.error}\n\n`;
      if (test.errorStack) {
        report += "```\n";
        report += test.errorStack;
        report += "\n```\n\n";
      }
    });
  } else {
    report += `## All Tests Passed! 🎉\n\n`;
  }
  
  // Batch information
  report += `## Batch Information\n\n`;
  report += `- Backend batches: ${backend.length}\n`;
  report += `- Frontend batches: ${frontend.length}\n`;
  report += `- Batch size: ${batchSize}\n`;
  report += `- Run with ${changedOnly ? 'changed files only' : 'all tests'}\n`;
  
  return report;
}

/**
 * Calculates test statistics
 * @param {Array} batches Array of batch results
 * @returns {Object} Stats object
 */
function calculateStats(batches) {
  const stats = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    duration: 0
  };
  
  batches.forEach(batch => {
    if (batch.results) {
      stats.total += batch.results.numTotalTests || 0;
      stats.passed += batch.results.numPassedTests || 0;
      stats.failed += batch.results.numFailedTests || 0;
      stats.skipped += batch.results.numPendingTests || 0;
      stats.duration += batch.results.testResults.reduce((sum, result) => sum + result.endTime - result.startTime, 0);
    }
  });
  
  return stats;
}

/**
 * Extracts failed test information
 * @param {Array} batches Array of batch results
 * @returns {Array} Array of failed test details
 */
function getFailedTests(batches) {
  const failedTests = [];
  
  batches.forEach(batch => {
    if (batch.results && batch.results.testResults) {
      batch.results.testResults.forEach(testFile => {
        testFile.assertionResults
          .filter(assertion => assertion.status === 'failed')
          .forEach(assertion => {
            failedTests.push({
              testPath: testFile.name,
              name: assertion.fullName || assertion.title,
              error: assertion.failureMessages?.[0]?.split('\n')[0] || 'Unknown error',
              errorStack: assertion.failureMessages?.[0] || ''
            });
          });
      });
    }
  });
  
  return failedTests;
}

/**
 * Main function to run tests in batches
 */
async function runTests() {
  console.log('🧪 Ars Saga Manager Batched Test Runner 🧪');
  console.log('===========================================');
  console.log(`Mode: ${changedOnly ? 'Changed Files Only' : 'All Tests'}`);
  console.log(`Batch Size: ${batchSize} tests per batch`);
  
  // Get test files
  let testFiles;
  if (changedOnly) {
    const changedFiles = await getChangedFiles();
    console.log(`Found ${changedFiles.length} changed files`);
    testFiles = await getTestsForChangedFiles(changedFiles);
  } else {
    testFiles = await discoverAllTestFiles();
  }
  
  // Apply backend/frontend only filters
  if (frontendOnly) {
    testFiles.backend = [];
  }
  if (backendOnly) {
    testFiles.frontend = [];
  }
  
  console.log(`Discovered ${testFiles.backend.length} backend tests and ${testFiles.frontend.length} frontend tests`);
  
  // Create batches
  const backendBatches = createTestBatches(testFiles.backend, batchSize);
  const frontendBatches = createTestBatches(testFiles.frontend, batchSize);
  
  console.log(`Created ${backendBatches.length} backend batches and ${frontendBatches.length} frontend batches`);
  
  // Run backend batches
  const backendResults = [];
  if (backendBatches.length > 0) {
    console.log('\n📋 Running Backend Test Batches');
    console.log('-----------------------------------');
    
    for (let i = 0; i < backendBatches.length; i++) {
      console.log(`Running backend batch ${i+1}/${backendBatches.length}...`);
      const result = await runTestBatch(backendBatches[i], backendDir, false);
      backendResults.push(result);
      // Short delay to avoid resource contention
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Run frontend batches
  const frontendResults = [];
  if (frontendBatches.length > 0) {
    console.log('\n📋 Running Frontend Test Batches');
    console.log('-----------------------------------');
    
    for (let i = 0; i < frontendBatches.length; i++) {
      console.log(`Running frontend batch ${i+1}/${frontendBatches.length}...`);
      const result = await runTestBatch(frontendBatches[i], frontendDir, true);
      frontendResults.push(result);
      // Short delay to avoid resource contention
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Generate final report
  const allResults = {
    backend: backendResults,
    frontend: frontendResults
  };
  
  const report = formatTestReport(allResults);
  fs.writeFileSync(reportPath, report);
  
  // Calculate overall success
  const backendSuccess = backendResults.every(r => r.success);
  const frontendSuccess = frontendResults.every(r => r.success);
  const allSuccess = backendSuccess && frontendSuccess;
  
  // Print summary
  console.log('\n📊 Test Run Summary');
  console.log('-----------------------------------');
  console.log(`Backend: ${backendSuccess ? '✅ All Passed' : '❌ Tests Failed'}`);
  console.log(`Frontend: ${frontendSuccess ? '✅ All Passed' : '❌ Tests Failed'}`);
  console.log(`Overall: ${allSuccess ? '✅ All Passed' : '❌ Tests Failed'}`);
  console.log(`\nDetailed report saved to: ${reportPath}`);
  
  // Return exit code
  process.exit(allSuccess ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});