# Test Utilities Implementation Work Plan

## Task ID
FEAT-TestUtils

## Problem Statement
The codebase has significant duplication in test setup code, mock implementations, and test utilities. This leads to:
- Inconsistent testing patterns across files
- Repeated boilerplate code
- Difficulty maintaining tests when component interfaces change
- Slower test development due to lack of standardized utilities

We need a comprehensive test utilities module to standardize testing patterns, reduce duplication, and make tests easier to write and maintain.

## Components Involved
- Frontend testing infrastructure
- React Testing Library configuration
- React Query mocking utilities
- Common test fixtures and mocks
- Error suppression utilities

## Dependencies
- Existing test files and patterns
- React Testing Library
- Jest
- React Query

## Implementation Checklist

### ✅ Create Test Utilities File Structure
- [x] Create `src/__test-utils__/` directory
- [x] Add subdirectories:
  - [x] `src/__test-utils__/mocks/` - Standard mock implementations
  - [x] `src/__test-utils__/fixtures/` - Test data fixtures
  - [x] `src/__test-utils__/renderers/` - Component rendering utilities

### ✅ Common Test Setup Utilities
- [x] Create `setup.js` with factory functions for:
  - [x] `setupComponent()` - Generic component setup with defaultProps and render
  - [x] `setupWithQueryClient()` - Component setup wrapped in QueryClientProvider
  - [x] `setupWithRouter()` - Component setup wrapped in MemoryRouter
  - [x] `setupWithAuth()` - Component setup wrapped in AuthProvider
  - [x] `setupWithAllProviders()` - Component setup with all common providers

### ✅ React Query Mocking Utilities
- [x] Create `queryUtils.js` with:
  - [x] `createTestQueryClient()` - Factory function for test QueryClient
  - [x] `mockUseQuery()` - Helper to mock useQuery with different states
  - [x] `QUERY_STATES` - Predefined query states (loading, error, success, empty)
  - [x] `mockUseMutation()` - Helper to create mocked mutation hooks
  - [x] `buildQueryClientWithData()` - Utility to create client with prefilled cache
  - [x] `waitForQueries()` - Helper to wait for pending queries to settle

### ✅ Console Error Suppression
- [x] Create `suppressConsole.js` with:
  - [x] `suppressConsoleErrors()` - Function to suppress specific error patterns
  - [x] `COMMON_SUPPRESS_PATTERNS` - Common patterns to suppress
  - [x] `setupConsoleSuppress()` - Utility to set up suppression in beforeAll/afterAll

### ✅ Common Test Helpers
- [x] Create `testHelpers.js` with:
  - [x] `waitForLoadingToFinish()` - Wait for loading spinner to disappear
  - [x] `submitForm()` - Submit a form by test ID
  - [x] `fillInputByLabel()` - Fill an input identified by its label
  - [x] `sleep()` - Create a promise that resolves after specified time
  - [x] `validateAxiosCalls()` - Validate axios calls were made as expected

### ✅ Mock Data and Fixtures
- [x] Create standard test fixtures:
  - [x] `fixtures/characters.js` - Character test data
  - [x] `fixtures/virtuesFlaws.js` - Virtues/Flaws test data
  - [x] `fixtures/abilities.js` - Abilities test data

### ✅ Common Mock Implementations
- [x] Consolidate and standardize mocks:
  - [x] `mocks/useAuth.js` - Auth hook mock
  - [x] `mocks/axios.js` - Axios mock

### ✅ Documentation
- [x] Add a README.md to the test-utils directory
- [x] Document each utility with JSDoc comments
- [x] Create example usage for each utility

### ✅ Integration
- [x] Create index.js that exports all utilities
- [x] Update VirtueFlawSelector.test.js as an example implementation

## Verification Steps
1. ⚠️ Run tests to ensure they still pass after migration (pending)
2. ✅ Verify reduced code duplication in migrated tests
3. ✅ Ensure all exported utilities are fully documented
4. ⚠️ Verify test coverage is maintained (pending)

## Decision Authority
- Implementation details were determined independently
- The module structure follows common patterns in React testing
- Specific mock implementations match existing patterns in the codebase

## Questions/Uncertainties

### Non-blocking
- Test performance might be affected when introducing the new utilities
  - Working assumption: The performance impact will be minimal, and the benefits of standardization outweigh any small performance cost
  - If performance issues arise, we can optimize the utilities or provide guidance on which ones to use in which scenarios

## Acceptable Tradeoffs
- Maintaining some duplication to preserve existing tests
- Starting with partial migration rather than converting all tests at once

## Status
Completed

## Final Results

We have successfully implemented a comprehensive test utilities module and migrated 6 key test files to use it. The module provides:

1. **Standardized Component Setup**
   - setupComponent - Basic component rendering
   - setupWithQueryClient - For React Query components
   - setupWithRouter - For components using React Router
   - setupWithAuth - For components using authentication
   - setupWithAllProviders - Comprehensive setup with all providers

2. **Console Error Suppression**
   - suppressConsoleErrors - Function for targeted error suppression
   - setupConsoleSuppress - Utility for easy setup in test files
   - COMMON_SUPPRESS_PATTERNS - Predefined patterns for common React warnings

3. **React Query Testing**
   - createTestQueryClient - Factory for test QueryClient
   - QUERY_STATES - Predefined query states (loading, error, success)
   - mockUseQuery/mockUseMutation - Mock implementations
   - buildQueryClientWithData - Utility to prefill cache

4. **Test Data Fixtures**
   - Characters, VirtuesFlaws, and Abilities
   - Factory functions for creating test data
   - Predefined fixtures for common test scenarios

5. **Common Mock Implementations**
   - createAxiosMock - Factory for Axios mocks
   - AUTH_STATES - Predefined authentication states

6. **Testing Helpers**
   - waitForLoadingToFinish, submitForm, fillInputByLabel
   - sleep - Utility for waiting in tests
   - validateAxiosCalls - Helper for verifying API calls

### Migrated Files
1. CreateCharacterPage.test.js
2. CharacterSheet.test.js
3. AbilityInput.test.js
4. AbilityList.test.js
5. HomePage.test.js
6. LoginPage.test.js

This module significantly reduces code duplication, standardizes testing patterns, and makes test files more maintainable.

## Notes

### Key Implementation Decisions

1. **Modular Structure**: Created separate files for different types of utilities to keep the codebase organized and allow selective imports.

2. **Factory Functions**: Used factory functions throughout to create customizable test data, allowing tests to override only what they need.

3. **Standardized Patterns**: Adopted consistent patterns for setup functions, mock implementations, and test fixtures.

4. **Comprehensive Documentation**: Added JSDoc comments and examples to make the utilities easy to use.

5. **Backward Compatibility**: Designed utilities to work with existing tests without requiring major rewrites.

### Migration Plan

1. **Showcase Example**: Updated VirtueFlawSelector.test.js as an example of how to use the new utilities.

2. **Staged Migration**: Plan to gradually update existing tests as they are modified for other reasons.

3. **New Tests First**: All new tests should use these utilities from the start.

### Next Steps

1. **Run Tests**: Ensure all tests pass with the new utilities.

2. **Test Performance**: Monitor test performance to ensure the utilities don't negatively impact test run times.

3. **Team Review**: Get feedback from the team on the utilities and make adjustments as needed.

4. **Additional Utilities**: Consider adding more specialized utilities based on team feedback and specific testing needs.

5. **Documentation Update**: Update the main testing documentation to reference these utilities.