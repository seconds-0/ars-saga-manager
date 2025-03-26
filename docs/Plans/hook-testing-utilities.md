# Hook Testing Utilities

This document outlines the hook testing utilities created for the Ars Saga Manager project to standardize and simplify the testing of custom React hooks.

## Overview

Hook testing utilities provide a standardized approach to testing React hooks in isolation, allowing for consistent test patterns and reducing boilerplate code. These utilities extend the existing test utility framework to cover hook-specific testing needs.

## Core Hook Testing Utilities

### Setup Functions

- `setupHook`: Basic hook setup with params
- `setupHookWithQueryClient`: Test hooks with React Query
- `setupHookWithRouter`: Test hooks that use router
- `setupHookWithAuth`: Test hooks that use authentication
- `setupHookWithAllProviders`: Test hooks with all providers

### State and Environment Utilities

- `HOOK_STATES`: Predefined states for hook results (IDLE, LOADING, SUCCESS, ERROR)
- `createHookTestEnv`: Setup a standardized hook testing environment with mocked dependencies
- `waitForHookToSettle`: Utility to wait for async hook operations to complete

## Example Usage

A basic hook test using these utilities follows this pattern:

```javascript
import { act } from '@testing-library/react-hooks';
import { 
  setupHookWithQueryClient, 
  setupConsoleSuppress,
  HOOK_STATES 
} from '../__test-utils__';
import useMyHook from './useMyHook';

// Setup console error suppression
setupConsoleSuppress();

describe('useMyHook', () => {
  // Mock data and setup
  const mockId = 123;
  const mockData = { items: [{ id: 1, name: 'Item' }] };
  
  // Mock axios
  const mockGet = jest.fn().mockResolvedValue({ data: mockData });
  jest.mock('../api/axios', () => ({ get: mockGet }));

  // Setup helper
  function setupHook(options = {}) {
    return setupHookWithQueryClient(
      useMyHook,
      [options.id || mockId],
      options
    );
  }

  test('fetches data on mount', async () => {
    const { result, waitForNextUpdate } = setupHook();
    
    // Initial state
    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    // After data loads
    expect(result.current.data).toEqual(mockData.items);
    expect(result.current.isLoading).toBe(false);
  });
});
```

## Testing Patterns

When testing hooks, focus on these key areas:

1. **Initial State**: Test the default state values when the hook first renders
2. **Loading State**: Verify the loading state is correctly managed during async operations
3. **Success State**: Test that data is correctly processed and exposed after successful operations
4. **Error State**: Validate error handling and state updates after failed operations
5. **Function Calls**: Test that functions exposed by the hook work correctly
6. **Side Effects**: Ensure side effects like API calls or queries are triggered with correct parameters
7. **Cleanup**: Test any cleanup logic to prevent memory leaks

## Example Files

- **Template**: The `useHookTemplate.test.js` in the `__test-utils__/examples` directory provides a starting point for new hook tests
- **Implementation**: The `useVirtuesAndFlaws.test.js` demonstrates a complete hook test implementation

## Best Practices

1. **Use the standardized setup functions** rather than creating custom test setups
2. **Handle asynchronous operations properly** with `act` and `waitForNextUpdate`
3. **Mock external dependencies** like API calls and React Query
4. **Test all possible states** the hook can be in
5. **Test in isolation** to avoid interference from other components
6. **Follow the established hook test patterns** for consistency

## Benefits

Using these hook testing utilities provides several advantages:

1. **Consistency**: All hook tests follow the same patterns and conventions
2. **Reduced Boilerplate**: Common testing logic is extracted into reusable utilities
3. **Improved Readability**: Test files are more focused on test cases rather than setup
4. **Complete Testing**: Structured approach ensures comprehensive test coverage
5. **Easier Maintenance**: Standardized patterns make updates and refactoring simpler

## Implementation Status

The hook testing utilities have been successfully added to the project:

- ✅ Created hook testing utilities in `__test-utils__/hookUtils.js`
- ✅ Added `HOOK_STATES` predefined states
- ✅ Created example test for `useVirtuesAndFlaws` hook
- ✅ Added template file for new hook tests
- ✅ Updated documentation in `README.md` and `CLAUDE.md`

## Current Challenges

During implementation, we encountered the following challenges:

1. **React Version Compatibility**: The project uses React 18, which has some compatibility issues with `@testing-library/react-hooks`. We've modified the utilities to use `@testing-library/react` instead.

2. **Jest Module Mocking Limitations**: Jest has restrictions on mocking modules within functions, leading us to create factory functions for mocks instead of dynamic environment setup.

3. **React Query Context**: Testing hooks that use React Query requires careful setup of the QueryClientProvider context.

## Implementation Recommendations

Based on our experience, the recommended approach for hook testing is:

1. Use the `renderHook` function from `@testing-library/react` (not `react-hooks`)
2. Always include `React` as an import in hook test files
3. Create a test-specific setup function with the necessary providers
4. Use the predefined `HOOK_STATES` to test different hook states
5. Mock axios and other dependencies at the module level, not within functions

## Next Steps

1. Convert existing hook tests to use the new utilities
2. Create additional hook tests for untested hooks (useForm, etc.)
3. Extend the hook testing utilities as new testing needs emerge
4. Consider upgrading testing utilities for better React 18 compatibility