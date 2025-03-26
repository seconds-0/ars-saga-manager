# Test Utilities

This directory contains utilities for testing the Ars Saga Manager application.

## Contents

- `batched-test-runner.js` - Runs tests in batches to avoid timeout issues in WSL
- `debug-test-runner.js` - Runs tests with debug output for troubleshooting
- `minimal-jest.config.js` - Minimal Jest configuration for quick testing
- `run-tests.js` - Main script for running tests
- `simple-test-runner.js` - Lightweight test runner for quick tests
- `test-migration-summary.md` - Summary of test migration changes

## Usage

Run tests using the npm scripts defined in `package.json`:

```bash
# Run all tests with batching (good for WSL)
npm run test:batched

# Run tests with debug output
npm run test:debug

# Run tests with the simple test runner (fastest)
npm run test:simple
```

For more detailed instructions, see the test documentation in the `docs/testing` directory.