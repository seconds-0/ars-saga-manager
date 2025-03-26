# Batched Test Runner Implementation Plan

## Task ID: TOOL-BatchedTestRunner

## Problem Statement
Running all tests in the Ars Saga Manager codebase together causes WSL timeouts (around 1 minute). We need a solution that runs tests in smaller batches, collects the results, and presents them in a way that Claude can easily analyze to identify and fix failing tests.

## Components Involved
- Test runner script (new)
- Frontend Jest tests
- Backend Jest tests
- Test result formatter/collector (new)
- Package.json scripts

## Dependencies
- Jest testing framework
- Node.js file system operations
- Understanding of test organization and patterns
- Existing test running scripts

## Implementation Checklist
- [ ] Create a script to discover and group test files
  - [ ] Identify all test files in frontend and backend
  - [ ] Group tests by directory/component for logical batching
  - [ ] Support prioritization of tests for recently modified files
- [ ] Implement batch execution mechanism
  - [ ] Run test batches in sequence with configurable batch size
  - [ ] Capture output and results from each batch
  - [ ] Provide progress indicators during execution
- [ ] Build results collection and reporting
  - [ ] Combine results from all batches into a single report
  - [ ] Format results for easy analysis by Claude
  - [ ] Include metadata about test runs (duration, batch info)
- [ ] Add failure analysis helpers
  - [ ] Extract relevant error information from failing tests
  - [ ] Group related failures for easier debugging
  - [ ] Highlight common error patterns
- [ ] Create utility functions for running tests on changed files
  - [ ] Detect recently modified files using git
  - [ ] Run only tests relevant to recent changes
- [ ] Update package.json with new scripts
  - [ ] Add script for full batched test run
  - [ ] Add script for running tests on changed files
- [ ] Write documentation
  - [ ] Update CLAUDE.md with new testing approach
  - [ ] Document script usage and options

## Verification Steps
- [ ] Run the batched test runner on the full test suite
  - [ ] Verify all tests are discovered and executed
  - [ ] Confirm no WSL timeouts occur
- [ ] Test the "changed files only" functionality
  - [ ] Modify a file and verify only relevant tests run
- [ ] Validate results formatting
  - [ ] Ensure result output is clear and understandable
  - [ ] Check that failing tests provide sufficient context for debugging

## Decision Authority
- I can make decisions on:
  - Implementation details and code structure
  - Grouping strategy for batching tests
  - Format of the result output
  - Default batch size and timing
- User input needed for:
  - Confirming the test runner works correctly with the WSL environment
  - Final approval of the approach

## Questions/Uncertainties
### Blocking
- What's the exact mechanism of the WSL timeout? Is it CPU, memory, or time-based?
  - Assumption: Time-based timeout around 1 minute of continuous processing
- How should we handle console output during test runs? Capture and show later, or stream in real-time?
  - Assumption: Capture and summarize, with option to see full logs

### Non-blocking
- What's the optimal batch size for tests?
  - Assumption: Start with directory-based grouping and adjust based on results
- Should test results be saved across runs for trend analysis?
  - Assumption: Not initially, but could be added as an enhancement

## Acceptable Tradeoffs
- Slightly slower total execution time is acceptable for reliability
- Some duplication of test setup between batches is acceptable
- Simplified test output format is acceptable if it improves reliability
- Initial version may not have all features (like trending) but should be expandable

## Status
Completed with Issues

## Notes
The script should be designed for maintainability and clarity first, with performance as a secondary consideration. Since it's primarily a developer tool to aid Claude in test diagnosis, clear output and reliability are the most important factors.

### Implementation Decisions
- Used directory-based grouping as the primary batching strategy to keep related tests together
- Set a default batch size of 5 test files per batch, which should keep execution time under the WSL timeout threshold
- Added JSON output capture to provide structured test results for analysis
- Created markdown report format that's optimized for Claude to parse and understand test failures
- Implemented a "changed files only" mode that uses git to detect recently modified files
- Added verbose flag for debugging test execution issues
- Used async/await pattern throughout for better error handling and readability
- Added timeout handling to prevent individual batches from hanging indefinitely

### Known Issues
- Tests consistently fail or timeout in the WSL environment, even with batching
- When tests fail, detailed error information isn't consistently captured in the report
- Even minimal tests with simple rendering checks fail to complete
- The issues appear to be environment-specific rather than test-specific

### Future Enhancements
- Add result caching to avoid re-running passing tests
- Implement parallel batch execution (with careful resource management)
- Add trend analysis to track test performance over time
- Create a visual representation of test results
- Improve test-to-source file mapping for more accurate changed file detection
- Add retry mechanism for failed tests
- Implement more detailed error reporting for debugging test failures
- Investigate alternative test execution environments to mitigate WSL issues