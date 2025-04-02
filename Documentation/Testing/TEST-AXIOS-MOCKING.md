# Best Practices for Mocking Axios in Tests

## Overview

This guide provides best practices for mocking Axios HTTP requests in tests. Inconsistent mocking patterns were the source of many test failures in our codebase. Following these guidelines will help ensure reliable and maintainable tests.

## Available Mock Implementations

The repository includes standardized mock implementations:

1. **Global Axios Mock**: `/frontend/src/__mocks__/axios.js`
   - Used for direct axios imports: `import axios from 'axios'`
   - Automatically used when you call `jest.mock('axios')`

2. **API Axios Mock**: `/frontend/src/__mocks__/api/axios.js`
   - Used for API-specific axios imports: `import api from '../api/axios'`
   - Must be explicitly mocked with `jest.mock('../api/axios')`

## How to Mock Axios in Tests

### Basic Pattern

```javascript
// 1. Mock before imports
jest.mock('axios');
jest.mock('../api/axios');

// 2. Import the mocks directly to use their methods
import mockAxios from '../__mocks__/axios';
import mockApiInstance from '../__mocks__/api/axios';

// 3. Configure mocks for specific tests
beforeEach(() => {
  // Reset all mocks to default behavior
  mockAxios.resetAllMocks();
  mockApiInstance.resetAllMocks?.() || jest.clearAllMocks();
  
  // Setup specific responses for this test
  mockApiInstance.get.mockImplementation(() => 
    Promise.resolve({ data: { testData: 'value' } })
  );
});
```

### Set Up Mock Responses

```javascript
// Default success response
mockApiInstance.get.mockImplementation(() => 
  Promise.resolve({ data: { testData: 'value' } })
);

// Error response
mockApiInstance.post.mockImplementation(() => 
  Promise.reject(new Error('Network error'))
);

// Error with response object
const errorWithResponse = new Error('Bad request');
errorWithResponse.response = {
  status: 400,
  data: { message: 'Invalid input' }
};
mockApiInstance.put.mockRejectedValue(errorWithResponse);

// Chaining mock implementations for sequential calls
mockApiInstance.get
  .mockImplementationOnce(() => Promise.resolve({ data: { first: true } }))
  .mockImplementationOnce(() => Promise.resolve({ data: { second: true } }));
```

### Testing Batch Operations

For batch operations, use the consistent response format:

```javascript
mockApiInstance.post.mockImplementation(() => 
  Promise.resolve({
    data: {
      status: 'success',
      results: [{ 
        abilityId: '123', 
        action: 'increment', 
        success: true,
        data: { id: '123', score: 2 } 
      }]
    }
  })
);
```

### Testing Assertions

```javascript
// Test that the correct API endpoint was called
expect(mockApiInstance.post).toHaveBeenCalledWith(
  '/characters/1/abilities/batch',
  expect.objectContaining({
    operations: [
      {
        abilityId: '123',
        action: 'increment',
        data: null
      }
    ]
  }),
  expect.any(Object)
);

// Test the number of calls
expect(mockApiInstance.post).toHaveBeenCalledTimes(3);
```

## Common Pitfalls to Avoid

1. **Importing Components Before Mocks**
   - Always set up mocks BEFORE importing the components or hooks under test
   
2. **Inconsistent Mocking**
   - Use the SAME mock implementation approach across tests
   - Use `mockApiInstance` consistently instead of mixing with `mockAxios`
   
3. **Not Resetting Mocks**
   - Reset mocks in `beforeEach` to ensure clean state between tests
   
4. **Missing Response Data Structure**
   - Ensure mock responses match the structure expected by the tested code

## Example Test Structure

```javascript
// Import test utilities
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Setup mocks BEFORE imports
jest.mock('axios');
jest.mock('../api/axios');

// Import mocks to access their methods
import mockAxios from '../__mocks__/axios';
import mockApiInstance from '../__mocks__/api/axios';

// Now import the component/hook to test
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  beforeEach(() => {
    // Reset all mocks
    mockAxios.resetAllMocks();
    mockApiInstance.resetAllMocks?.() || jest.clearAllMocks();
    
    // Setup default responses
    mockApiInstance.get.mockResolvedValue({ 
      data: { items: [{ id: 1, name: 'Test' }] } 
    });
  });
  
  it('fetches and displays data', async () => {
    render(<MyComponent />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(mockApiInstance.get).toHaveBeenCalledWith('/api/items');
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
  
  it('handles errors', async () => {
    // Override default mock for this test only
    mockApiInstance.get.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(<MyComponent />);
    
    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch')).toBeInTheDocument();
    });
  });
});
```

Following these patterns will result in more reliable and maintainable tests across the codebase.