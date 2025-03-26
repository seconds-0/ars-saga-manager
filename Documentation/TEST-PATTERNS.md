# Ars Saga Manager Testing Patterns

This document outlines the established testing patterns for the Ars Saga Manager project. These patterns ensure consistency, maintainability, and reliability across our test suite.

## Table of Contents
- [Test Structure](#test-structure)
- [Setup Functions](#setup-functions)
- [Test Organization](#test-organization)
- [Mocking Strategy](#mocking-strategy)
- [Error Handling](#error-handling)
- [Async Testing](#async-testing)
- [Component Testing](#component-testing)
- [Hook Testing](#hook-testing)
- [Utilities Testing](#utilities-testing)
- [Recommended Testing Tools](#recommended-testing-tools)

## Test Structure

Each test file should follow this general structure:

```javascript
// 1. Imports 
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ComponentToTest from './ComponentToTest';

// 2. Mocks
jest.mock('../dependencyPath');

// 3. Console handling
const originalConsole = { log: console.log, error: console.error };
beforeEach(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});
afterEach(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
});

// 4. Setup function
function setup(props = {}) {
  // Default props
  const defaultProps = { ... };
  
  // Render with merged props
  const utils = render(<ComponentToTest {...defaultProps} {...props} />);
  
  // Return utils and elements/helpers
  return {
    ...utils,
    elementOne: screen.getByTestId('element-one'),
    // Helper functions
    doSomething: () => { ... }
  };
}

// 5. Test suite
describe('ComponentToTest', () => {
  describe('Rendering', () => {
    test('renders without crashing', () => { ... });
    // More rendering tests
  });
  
  describe('User Interactions', () => {
    test('handles click events', () => { ... });
    // More interaction tests
  });
  
  // More test groups
});
```

## Setup Functions

Every test file should have a standard setup function:

### For Component Tests:

```javascript
/**
 * Setup function for ComponentName tests
 * @param {Object} props - Custom props to override defaults
 * @returns {Object} - Render utils and common elements/helpers
 */
function setup(props = {}) {
  const defaultProps = {
    // Set sensible defaults for required props
    onAction: jest.fn(),
    items: [],
    // etc.
  };
  
  const mergedProps = { ...defaultProps, ...props };
  const utils = render(<ComponentName {...mergedProps} />);
  
  return {
    ...utils,
    // Common elements that tests will need
    button: screen.getByRole('button', { name: /submit/i }),
    input: screen.getByLabelText(/name/i),
    // Helper functions for common test actions
    fillForm: (data = {}) => {
      fireEvent.change(screen.getByLabelText(/name/i), {
        target: { value: data.name || 'Test Name' }
      });
      // Fill other fields...
    },
    // Expose mocked functions for assertions
    onAction: mergedProps.onAction
  };
}
```

### For Hook Tests:

```javascript
/**
 * Setup function for useHookName tests
 * @param {Object} options - Test configuration options
 * @returns {Object} - Hook result and test helpers
 */
function setupHookTest(options = {}) {
  // Default test data
  const defaultData = { ... };
  
  // Mock API responses
  const apiResponse = options.apiResponse || { data: defaultData };
  
  // Setup API mocks
  jest.clearAllMocks();
  axios.get.mockResolvedValue(apiResponse);
  
  // Allow for custom error behavior
  if (options.apiError) {
    axios.get.mockRejectedValueOnce(options.apiError);
  }
  
  // Render the hook
  const hookResult = renderHook(() => useHookName(options.param));
  
  return {
    ...hookResult,
    defaultData
  };
}
```

## Test Organization

Organize tests using nested `describe` blocks by functionality:

```javascript
describe('ComponentName', () => {
  // Group 1: Initial rendering
  describe('Rendering', () => {
    test('renders without crashing', () => { ... });
    test('renders all required elements', () => { ... });
    test('applies correct default styles', () => { ... });
  });
  
  // Group 2: User interactions
  describe('User Interactions', () => {
    test('handles click events', () => { ... });
    test('updates on input change', () => { ... });
    test('submits the form correctly', () => { ... });
  });
  
  // Group 3: API interactions
  describe('API Interactions', () => {
    test('fetches data on mount', () => { ... });
    test('handles successful API responses', () => { ... });
    test('handles API errors gracefully', () => { ... });
  });
  
  // Group 4: Edge cases
  describe('Edge Cases', () => {
    test('handles empty data', () => { ... });
    test('handles loading state', () => { ... });
    test('handles error state', () => { ... });
  });
});
```

## Mocking Strategy

### External Dependencies

Always mock external dependencies:

```javascript
// Mock direct import
jest.mock('../api/axios');

// Mock component dependency with implementation
jest.mock('./Toast', () => {
  return function MockToast({ message, type, onClose }) {
    return (
      <div data-testid="mock-toast" onClick={onClose} className={type}>
        {message}
      </div>
    );
  };
});

// Mock hook dependencies
jest.mock('../hooks/useAuth', () => ({
  __esModule: true,
  default: () => ({
    user: { id: 1, name: 'Test User' },
    isAuthenticated: true,
    login: jest.fn().mockResolvedValue(true),
    logout: jest.fn()
  })
}));
```

### Reset Mocks Between Tests

```javascript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## Error Handling

### Suppress Console Errors During Tests

```javascript
// Suppress console logs/errors during tests
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeEach(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});
```

### Test Error States

Always include tests for error handling:

```javascript
test('displays error message when API call fails', async () => {
  // Mock API error
  axios.get.mockRejectedValueOnce(new Error('Network error'));
  
  const { result, waitForNextUpdate } = setupHookTest();
  
  await waitForNextUpdate();
  
  expect(result.current.error).toBeTruthy();
  expect(screen.getByText(/error/i)).toBeInTheDocument();
});
```

## Async Testing

### Use act() for State Updates

```javascript
test('updates state asynchronously', async () => {
  const { result } = setupHookTest();
  
  await act(async () => {
    await result.current.fetchData();
  });
  
  expect(result.current.data).toEqual(expectedData);
});
```

### Use waitFor() for Async UI Updates

```javascript
test('shows loading then content', async () => {
  setup();
  
  // Assert loading state
  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  
  // Wait for content to appear
  await waitFor(() => {
    expect(screen.getByText('Content loaded')).toBeInTheDocument();
  });
  
  // Assert loading is gone
  expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
});
```

## Component Testing

Focus on testing behavior, not implementation details:

### Testing Rendered Output

```javascript
test('renders user information', () => {
  const { getByText } = setup({
    user: { name: 'John Doe', email: 'john@example.com' }
  });
  
  expect(getByText('John Doe')).toBeInTheDocument();
  expect(getByText('john@example.com')).toBeInTheDocument();
});
```

### Testing User Interactions

```javascript
test('updates count when button is clicked', () => {
  const { getByRole, getByText } = setup();
  
  // Initial state
  expect(getByText('Count: 0')).toBeInTheDocument();
  
  // Trigger action
  fireEvent.click(getByRole('button', { name: /increment/i }));
  
  // Assert result
  expect(getByText('Count: 1')).toBeInTheDocument();
});
```

### Testing Conditional Rendering

```javascript
test('shows different UI based on isLoggedIn prop', () => {
  // Test logged out state
  const { rerender, getByText, queryByText } = setup({ isLoggedIn: false });
  
  expect(getByText('Please log in')).toBeInTheDocument();
  expect(queryByText('Welcome back')).not.toBeInTheDocument();
  
  // Test logged in state
  rerender(<ComponentName isLoggedIn={true} />);
  
  expect(queryByText('Please log in')).not.toBeInTheDocument();
  expect(getByText('Welcome back')).toBeInTheDocument();
});
```

## Hook Testing

Test hooks in isolation using `renderHook`:

### Basic Hook Testing

```javascript
test('hook returns expected initial values', () => {
  const { result } = renderHook(() => useCustomHook());
  
  expect(result.current.count).toBe(0);
  expect(typeof result.current.increment).toBe('function');
});
```

### Testing Hook Effects

```javascript
test('hook fetches data on mount', async () => {
  const { result, waitForNextUpdate } = renderHook(() => useDataFetching('users'));
  
  // Initial state
  expect(result.current.loading).toBe(true);
  expect(result.current.data).toEqual([]);
  
  // Wait for effect to complete
  await waitForNextUpdate();
  
  // Updated state
  expect(result.current.loading).toBe(false);
  expect(result.current.data).toEqual(expectedData);
});
```

### Testing Hook Updates

```javascript
test('hook updates state correctly', async () => {
  const { result } = renderHook(() => useCounter());
  
  // Update state
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.count).toBe(1);
});
```

## Utilities Testing

For utility functions, use direct testing with simple assertions:

```javascript
describe('formatDate utility', () => {
  test('formats date correctly with default format', () => {
    const date = new Date('2025-01-15T12:00:00Z');
    expect(formatDate(date)).toBe('01/15/2025');
  });
  
  test('formats date with custom format', () => {
    const date = new Date('2025-01-15T12:00:00Z');
    expect(formatDate(date, 'YYYY-MM-DD')).toBe('2025-01-15');
  });
  
  test('handles invalid date input', () => {
    expect(formatDate(null)).toBe('Invalid date');
    expect(formatDate('not-a-date')).toBe('Invalid date');
  });
});
```

## Recommended Testing Tools

### 1. Regular Jest Testing

For full Jest testing with React Testing Library:
```bash
# Run all tests with Jest
npm test

# Run specific tests
npm test -- -t "test name pattern"

# Run tests for a specific file
npm test -- path/to/file.test.js
```

### 2. Batched Test Runner

For running tests in WSL without timeouts:
```bash
# Run all tests in batches
npm run test:batched

# Run frontend tests only
npm run test:batched:frontend

# Run tests with custom batch size
npm run test:batched -- --batch-size=3
```

### 3. Simple Test Runner

For ultra-fast testing of non-UI utilities:
```bash
# Run simple tests
npm run test:simple path/to/file.simple.test.js
```

### 4. Docker-based Testing

For isolated testing environment:
```bash
# Run all tests in Docker
npm run test:docker

# Build and run tests
npm run test:docker:build
```

## Example Test Files

Reference these thoroughly commented test files for examples of our testing patterns:

1. **Component Tests**:
   - RegisterForm.test.js - Form component with validation and API interactions
   - LoadingSpinner.test.js - Simple UI component with styling
   - VirtueFlawValidationMessages.test.js - Component with conditional rendering

2. **Hook Tests**:
   - useAbilities.test.js - Data fetching hook with CRUD operations

3. **Utility Tests**:
   - virtueFlawPoints.simple.test.js - Pure utility functions for calculation