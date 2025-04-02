# BUG-TestFailures

## Task ID: BUG-TestFailures

## Problem Statement
The test suite is currently failing with 251 test failures across multiple components. These need to be fixed in order to ensure proper functionality and to maintain code quality. Our modified test reporting system has successfully identified the failures, but the error details are currently limited.

## Components Involved
- Frontend test mocks, particularly axios mocks
- Hook tests: useBatchRequests, useVirtuesAndFlaws, useAbilities, useAuth, CharacterProvider
- Component tests: RegisterForm, VirtueFlawDetails, AbilityList, CharacterSheet, etc.
- Multiple test utilities and fixtures

## Dependencies
- Jest testing framework
- React Testing Library
- Mock implementations for axios and other external dependencies
- Custom test utilities in `__test-utils__` directory

## Implementation Checklist

### Phase 1: Analyze and Fix Mock Implementations
- [x] Improve the test extraction script to capture detailed error information
- [ ] Update global axios mock implementation for consistent behavior
- [ ] Fix axios mock implementation in useBatchRequests.test.js
- [ ] Add consistent mockApiInstance implementation for all tests
- [ ] Ensure mock implementations support both direct usage and api.create() pattern

### Phase 2: Focus on Core Hook Tests
- [ ] Fix useBatchRequests.test.js failures
- [ ] Fix useAuth.test.js failures
- [ ] Fix useVirtuesAndFlaws.test.js failures
- [ ] Fix useAbilities.test.js failures
- [ ] Fix CharacterProvider.test.js failures

### Phase 3: Fix Component Tests
- [ ] Fix RegisterForm.test.js failures
- [ ] Fix VirtueFlawSelector related test failures
- [ ] Fix CharacterSheetComponents test failures
- [ ] Fix DebouncedSearchTest.test.js failures
- [ ] Fix AbilityList.test.js failures
- [ ] Fix VirtueFlawDetails.test.js failures

### Phase 4: Comprehensive Test Patterns
- [ ] Create standardized mock implementations for common dependencies
- [ ] Create a testing best practices guide for this codebase
- [ ] Update CLAUDE.md with testing guidelines

## Verification Steps
1. Run `npm run test:report` to generate new test results
2. Run `node scripts/extract-test-failures.js` to extract failures
3. Verify each category of failures has been fixed
4. Ensure no regression in previously passing tests

## Decision Authority
I can make independent implementation decisions for:
- Mock implementation details
- Test assertion fixes
- Minor code adjustments to support testing

Will require user input for:
- Significant changes to component behavior
- Changes to core business logic
- Architectural changes to the test framework

## Questions/Uncertainties
### Blocking
- Is there a specific structure for passing mock implementations across tests?
- Should we update the test implementation approaches or just fix the immediate failures?

### Non-blocking
- What is the expected behavior of the batch request system?
- Are there specific test utilities that should be used consistently?

## Acceptable Tradeoffs
- Skipping complex integration tests if they require significant refactoring
- Focusing on fixing the most critical hook tests first
- Potentially marking some flaky tests as skipped if they're not critical

## Status
In Progress

## Notes
After running the tests and analyzing the failures, we've identified several categories of issues:

### 1. Context Provider Missing Issues
Many component tests fail because they're using hooks that require a provider component (especially CharacterProvider) higher in the component tree. Errors like:
- `useCharacter must be used within a CharacterProvider` 
- `useVirtuesAndFlaws must be used within a VirtuesAndFlawsProvider`

### 2. Axios Mock Implementation Issues
The tests have inconsistent axios mocking implementations:
- Some tests use direct imports of axios, others use '../api/axios'
- Some tests mock the imports differently
- Different response formats for similar API calls

### 3. Component Interaction Issues
Component integration tests that depend on other components are failing:
- VirtueFlawSelector can't be found in DebouncedSearchTest
- AbilityList interactions have incorrect parameter expectations

### 4. React Query Issues
Tests that depend on React Query are failing:
- QueryClient not provided or incorrectly mocked
- Query key conflicts between tests

### 5. Timing and Async Issues
Tests with timers and asynchronous code are failing:
- useBatchRequests tests have race conditions
- Debounced operations aren't being properly tested

### Action Plan:

1. Create standardized mock implementations for:
   - Character context
   - Auth context
   - QueryClient
   - Axios

2. Fix component tests hierarchically:
   - First fix the core utility hooks (useBatchRequests, etc.)
   - Then fix component tests that use these hooks
   - Finally fix integration tests that use multiple components

3. Standardize test setups:
   - Create consistent render utilities for components that need providers
   - Standardize timer and async handling

The improvements we've made so far include:
- Created a comprehensive mock for axios that supports all common use cases
- Improved the test reporting system for easier debugging
- Added documentation for best practices in axios mocking (TEST-AXIOS-MOCKING.md)
- Fixed the basic path handling in useBatchRequests to be more consistent

Next immediate steps:
1. Create a mock CharacterProvider for tests
2. Fix the useBatchRequests tests
3. Fix the component tests that depend on CharacterProvider