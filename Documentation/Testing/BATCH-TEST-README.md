# Batch Implementation Tests

This README provides instructions for testing the batch request implementation that addresses the 429 rate limit errors experienced when using ability increments/decrements.

## Quick Start

```bash
# Run all batch implementation tests
node test-batch-implementation.js

# Verify batch integration into the codebase
node verify-batch-integration.js

# All output will be saved to the test-output/ directory
```

## Running Tests

From the repository root, run the main test script:

```bash
node test-batch-implementation.js
```

This script will:

1. Run batch-specific unit tests
2. Run integration tests for components using the batch implementation
3. Run tests related to the batch functionality from the full test suite

All test results will be saved to the `test-output/` directory.

## Individual Test Scripts

If you want to run specific test types individually, you can use the following commands from the `frontend` directory:

```bash
# Run batch-specific unit tests
cd frontend && npm run test:batch

# Run integration tests
cd frontend && npm run test:integration

# Run all tests and save the results
cd frontend && npm run test:report

# Run tests matching a specific pattern
cd frontend && npm run test:report "useBatch|AbilitiesSection"
```

Each of these commands will generate a results file in the `frontend` directory.

## Understanding Test Results

The test results file contains:

- Overall test status (passed/failed)
- Summary of each test run
- Detailed output from each test script
- Error messages for any failed tests

When reviewing test results, focus on:

1. Test Suite Status: Look for `Test Suites: X passed, Y failed, Z total`
2. Individual Test Status: Look for `Tests: X passed, Y failed, Z total`
3. Error Messages: These provide details on why tests failed

## Implementation Details

The batch request implementation:

1. Collects multiple ability operations and sends them in batches
2. Implements optimistic updates for immediate UI feedback
3. Handles errors with proper rollback mechanisms
4. Uses throttling to prevent overwhelming the server
5. Has retry logic for failed operations (with maximum retry limits)
6. Properly manages state to prevent race conditions
7. Cleans up resources when components unmount

The main files involved in this implementation:

- `/frontend/src/hooks/useBatchRequests.js`: The core batch processing system
- `/frontend/src/hooks/useAbilities.js`: Integration with abilities management
- `/frontend/src/components/CharacterSheetComponents/AbilityRow.js`: UI component using the batch system

## Troubleshooting

If tests are failing:

1. Check console output for specific error messages
2. Verify that all dependencies are installed (`npm install` in the frontend directory)
3. Make sure Jest is installed correctly
4. Try running with increased timeout values in the test scripts
5. Look for specific test failures to identify issues with the implementation

## Running Individual Test Files

If you need to debug specific test files, you can run them directly using:

```bash
cd frontend && npx jest src/__tests__/finalBatchTest.js --no-watchman
```

Replace `finalBatchTest.js` with the specific test file you want to run.