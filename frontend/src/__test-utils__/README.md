# Test Utilities

This directory contains utilities to help standardize and simplify testing in the Ars Saga Manager application. These utilities aim to reduce code duplication, ensure consistent testing patterns, and make it easier to write and maintain tests.

## Core Utilities

### Setup Tools (`setup.js`)

Provides functions for setting up component tests with different wrappers:

- `setupComponent`: Basic component setup with props
- `setupWithQueryClient`: Wraps component in QueryClientProvider
- `setupWithRouter`: Wraps component in Router
- `setupWithAuth`: Wraps component in AuthProvider
- `setupWithAllProviders`: Wraps component with all common providers

Example usage:

```javascript
import { setupWithAllProviders } from '../__test-utils__/setup';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = setupWithAllProviders(MyComponent, { defaultProp: 'value' });
    expect(getByText('Expected Content')).toBeInTheDocument();
  });
});
```

### Hook Testing Utilities (`hookUtils.js`)

Provides functions for testing React hooks in isolation:

- `setupHook`: Basic hook setup with params
- `setupHookWithQueryClient`: Test hooks with React Query
- `setupHookWithRouter`: Test hooks that use router
- `setupHookWithAuth`: Test hooks that use authentication
- `setupHookWithAllProviders`: Test hooks with all providers
- `HOOK_STATES`: Predefined states for hook results (IDLE, LOADING, SUCCESS, ERROR)
- `createHookTestEnv`: Setup a standardized hook testing environment
- `waitForHookToSettle`: Utility to wait for async hook operations to complete

Example usage:

```javascript
import { setupHookWithQueryClient, HOOK_STATES } from '../__test-utils__/hookUtils';
import useMyHook from './useMyHook';

describe('useMyHook', () => {
  it('fetches data successfully', async () => {
    const { result, waitForNextUpdate } = setupHookWithQueryClient(useMyHook, ['param1']);
    
    // Initial state
    expect(result.current.isLoading).toBe(true);
    
    await waitForNextUpdate();
    
    // After data loads
    expect(result.current.data).toEqual(['item1', 'item2']);
    expect(result.current.isLoading).toBe(false);
  });
});
```

### Error Suppression (`suppressConsole.js`)

Provides utilities to suppress specific console errors during tests:

- `suppressConsoleErrors`: Suppress specific console error patterns
- `setupConsoleSuppress`: Setup error suppression for the entire test file

Example usage:

```javascript
import { setupConsoleSuppress } from '../__test-utils__/suppressConsole';

// Setup error suppression for the entire test
setupConsoleSuppress(['Warning: An update to Component']);

describe('MyComponent', () => {
  // Tests will not show specified console errors
});
```

### React Query Utilities (`queryUtils.js`)

Helpers for testing components that use React Query:

- `QUERY_STATES`: Predefined query states (loading, error, success, etc.)
- `mockUseQuery`: Create a mock for useQuery
- `mockUseMutation`: Create a mock for useMutation
- `buildQueryClientWithData`: Create a QueryClient with prefilled cache data
- `waitForQueries`: Utility to wait for all queries to settle

Example usage:

```javascript
import { QUERY_STATES, mockUseQuery } from '../__test-utils__/queryUtils';

// Mock the useQuery hook
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: mockUseQuery(QUERY_STATES.SUCCESS_WITH_DATA([{id: 1, name: 'Item'}])),
}));
```

### Test Helpers (`testHelpers.js`)

Common helper functions for testing:

- `waitForLoadingToFinish`: Wait for loading spinner to disappear
- `submitForm`: Submit a form by test ID
- `fillInputByLabel`: Fill an input identified by its label
- `sleep`: Create a promise that resolves after specified time
- `validateAxiosCalls`: Validate axios calls were made as expected

Example usage:

```javascript
import { waitForLoadingToFinish, fillInputByLabel } from '../__test-utils__/testHelpers';

it('submits the form correctly', async () => {
  const { getByTestId } = render(<MyForm />);
  
  fillInputByLabel('Name', 'Test User');
  userEvent.click(getByTestId('submit-button'));
  
  await waitForLoadingToFinish();
  expect(getByText('Success')).toBeInTheDocument();
});
```

## Mocks

### Axios Mock (`mocks/axios.js`)

Standardized mock for axios:

- `createAxiosMock`: Create an axios mock instance
- `setupAxiosSuccess`: Configure axios mock to return success responses
- `setupAxiosError`: Configure axios mock to return error responses

Example usage:

```javascript
import { createAxiosMock, setupAxiosSuccess } from '../__test-utils__/mocks/axios';

jest.mock('../api/axios', () => {
  const mockAxios = createAxiosMock();
  setupAxiosSuccess(mockAxios, {
    '/api/characters': [{ id: 1, name: 'Character 1' }],
  });
  return mockAxios;
});
```

### Auth Hook Mock (`mocks/useAuth.js`)

Standardized mock for the Auth hook:

- `createMockAuthState`: Create mock auth state
- `AUTH_STATES`: Predefined auth states (authenticated, unauthenticated, loading, error)
- `mockUseAuth`: Create a mock for useAuth
- `createTestUser`: Create a test user object

Example usage:

```javascript
import { AUTH_STATES, mockUseAuth } from '../__test-utils__/mocks/useAuth';

jest.mock('../useAuth', () => ({
  ...jest.requireActual('../useAuth'),
  useAuth: mockUseAuth(AUTH_STATES.AUTHENTICATED),
}));
```

## Fixtures

### Character Fixtures (`fixtures/characters.js`)

Test data for characters:

- `createTestCharacter`: Create a test character
- `createTestCharacters`: Create a collection of test characters
- `CHARACTER_FIXTURES`: Predefined character objects (MAGUS, COMPANION, GROG, EMPTY)
- `TEST_CHARACTER_LIST`: Array of test characters

### Virtue/Flaw Fixtures (`fixtures/virtuesFlaws.js`)

Test data for virtues and flaws:

- `createTestVirtueFlaw`: Create a test virtue or flaw
- `createTestVirtuesFlaws`: Create a collection of test virtues/flaws
- `VIRTUE_FIXTURES`: Predefined virtue objects
- `FLAW_FIXTURES`: Predefined flaw objects
- `TEST_VIRTUES_FLAWS`: Combined list of virtues and flaws
- `CHARACTER_VIRTUES_FLAWS`: Predefined character virtues and flaws

### Ability Fixtures (`fixtures/abilities.js`)

Test data for abilities:

- `createTestAbility`: Create a test ability
- `createTestAbilities`: Create a collection of test abilities
- `ABILITY_FIXTURES`: Predefined ability objects by type
- `TEST_ABILITIES`: Combined list of test abilities
- `CHARACTER_ABILITIES`: Predefined character abilities

## Usage Guidelines

1. **Import What You Need**: Only import the utilities you need for your specific test
2. **Use Factory Functions**: Use the factory functions to create custom test data
3. **Prefer Composition**: Combine utilities as needed for complex test scenarios
4. **Keep Tests Clean**: Use these utilities to keep your test files clean and focused
5. **Consistent Patterns**: Follow the established patterns when extending or using these utilities

## Example: Complete Test Setup

```javascript
import React from 'react';
import { setupWithAllProviders } from '../__test-utils__/setup';
import { setupConsoleSuppress } from '../__test-utils__/suppressConsole';
import { createAxiosMock, setupAxiosSuccess } from '../__test-utils__/mocks/axios';
import { CHARACTER_FIXTURES } from '../__test-utils__/fixtures/characters';
import { TEST_VIRTUES_FLAWS } from '../__test-utils__/fixtures/virtuesFlaws';
import MyComponent from './MyComponent';

// Setup console error suppression
setupConsoleSuppress();

// Mock axios
jest.mock('../api/axios', () => {
  const mockAxios = createAxiosMock();
  setupAxiosSuccess(mockAxios, {
    '/api/characters/1': CHARACTER_FIXTURES.MAGUS,
    '/api/virtues-flaws': TEST_VIRTUES_FLAWS,
  });
  return mockAxios;
});

describe('MyComponent', () => {
  function setup(customProps = {}) {
    const defaultProps = {
      characterId: '1',
    };

    return setupWithAllProviders(MyComponent, defaultProps, customProps);
  }

  it('renders successfully', () => {
    const { getByText } = setup();
    expect(getByText('Character Sheet')).toBeInTheDocument();
  });
});
```