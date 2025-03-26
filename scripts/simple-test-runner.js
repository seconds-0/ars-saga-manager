/**
 * Simple Test Runner for Ars Saga Manager
 * 
 * This script bypasses Jest's overhead to run basic tests directly in Node.js,
 * which avoids the WSL performance issues. It's intended for quick validation
 * of simple functionality during development, not as a replacement for the
 * full test suite.
 */
const fs = require('fs');
const path = require('path');

// Simple color functions without external dependencies
const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`
};

// Parse command line arguments
const testFiles = process.argv.slice(2);
if (testFiles.length === 0) {
  console.error('Error: No test files specified');
  console.log('Usage: node simple-test-runner.js path/to/test1.js path/to/test2.js');
  process.exit(1);
}

// Simple assertion functions
global.expect = (actual) => ({
  toBe: (expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${expected} but got ${actual}`);
    }
    return true;
  },
  toEqual: (expected) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    }
    return true;
  },
  toBeGreaterThan: (expected) => {
    if (!(actual > expected)) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
    return true;
  },
  toBeLessThan: (expected) => {
    if (!(actual < expected)) {
      throw new Error(`Expected ${actual} to be less than ${expected}`);
    }
    return true;
  },
  toBeDefined: () => {
    if (actual === undefined) {
      throw new Error('Expected value to be defined');
    }
    return true;
  },
  toBeUndefined: () => {
    if (actual !== undefined) {
      throw new Error(`Expected value to be undefined, but got ${actual}`);
    }
    return true;
  },
  toBeNull: () => {
    if (actual !== null) {
      throw new Error(`Expected value to be null, but got ${actual}`);
    }
    return true;
  },
  toBeTruthy: () => {
    if (!actual) {
      throw new Error(`Expected ${actual} to be truthy`);
    }
    return true;
  },
  toBeFalsy: () => {
    if (actual) {
      throw new Error(`Expected ${actual} to be falsy`);
    }
    return true;
  },
  toMatch: (regex) => {
    if (!regex.test(actual)) {
      throw new Error(`Expected ${actual} to match ${regex}`);
    }
    return true;
  },
  toContain: (expected) => {
    if (!actual.includes(expected)) {
      throw new Error(`Expected ${actual} to contain ${expected}`);
    }
    return true;
  }
});

// Define global test functions
global.test = (name, fn) => {
  const testObj = {
    name,
    fn,
    isOnly: false
  };
  
  testQueue.push(testObj);
  return testObj;
};

global.test.only = (name, fn) => {
  const testObj = {
    name, 
    fn,
    isOnly: true
  };
  
  testQueue.push(testObj);
  hasOnly = true;
  return testObj;
};

global.describe = (name, fn) => {
  currentDescribe = name;
  fn();
  currentDescribe = null;
};

// Keep track of tests to run
let testQueue = [];
let hasOnly = false;
let currentDescribe = null;

// Create a custom require function to handle relative paths
function requireTest(testFile) {
  let resolvedPath;
  
  if (path.isAbsolute(testFile)) {
    resolvedPath = testFile;
  } else {
    resolvedPath = path.resolve(process.cwd(), testFile);
  }
  
  try {
    // Clear the require cache to ensure fresh execution
    delete require.cache[resolvedPath];
    require(resolvedPath);
  } catch (error) {
    console.error(`Error loading test file ${testFile}:`, error);
    process.exit(1);
  }
}

// Run a single test file
function runTestFile(testFile) {
  console.log(chalk.blue(`\nRunning tests in ${testFile}:`));
  
  // Reset test queue
  testQueue = [];
  hasOnly = false;
  
  // Load tests
  requireTest(testFile);
  
  // Filter tests if any are marked as .only
  const testsToRun = hasOnly ? testQueue.filter(t => t.isOnly) : testQueue;
  
  // Run tests
  const results = {
    passed: 0,
    failed: 0,
    failures: []
  };
  
  testsToRun.forEach(test => {
    try {
      const startTime = Date.now();
      test.fn();
      const endTime = Date.now();
      
      console.log(chalk.green(`✓ ${test.name} (${endTime - startTime}ms)`));
      results.passed++;
    } catch (error) {
      console.log(chalk.red(`✗ ${test.name}`));
      console.log(chalk.red(`  ${error.message}`));
      results.failed++;
      results.failures.push({
        name: test.name,
        error: error.message
      });
    }
  });
  
  return results;
}

// Run all test files
function runAllTests() {
  const startTime = Date.now();
  let totalPassed = 0;
  let totalFailed = 0;
  const failedTests = [];
  
  testFiles.forEach(testFile => {
    const results = runTestFile(testFile);
    totalPassed += results.passed;
    totalFailed += results.failed;
    
    results.failures.forEach(failure => {
      failedTests.push({
        file: testFile,
        ...failure
      });
    });
  });
  
  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  
  // Print summary
  console.log(chalk.blue('\nTest Summary:'));
  console.log(`Total: ${totalPassed + totalFailed}, Passed: ${totalPassed}, Failed: ${totalFailed}`);
  console.log(`Time: ${totalTime.toFixed(2)}s`);
  
  if (failedTests.length > 0) {
    console.log(chalk.red('\nFailed Tests:'));
    failedTests.forEach(failure => {
      console.log(chalk.red(`✗ ${failure.file}: ${failure.name}`));
      console.log(chalk.red(`  ${failure.error}`));
    });
    
    process.exit(1);
  }
}

// Mock some common browser APIs
global.document = {
  createElement: () => ({}),
  querySelector: () => ({}),
  querySelectorAll: () => [],
  getElementById: () => ({})
};

global.window = {
  location: {},
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

global.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

global.fetch = () => Promise.resolve({ 
  json: () => Promise.resolve({}) 
});

global.console = {
  ...console,
  log: console.log,
  error: console.error,
  warn: console.warn
};

// Run the tests
runAllTests();