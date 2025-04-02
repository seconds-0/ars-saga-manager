# Best Practices for Mocking React Contexts in Tests

## Overview

This guide provides best practices for mocking React contexts in tests. Using the right context mocks is critical to the success of component tests, as many components depend on data and functions provided by contexts.

## Available Context Mocks

The repository includes standardized mock implementations:

1. **CharacterProvider**: `/frontend/src/__mocks__/contexts/CharacterProvider.js`
   - Provides character data and operations
   - All character-related methods are mocked with Jest functions
   - Can be customized with mock data

## Utility for Rendering with Providers

A utility function is available to easily render components with the necessary providers:

```javascript
import { renderWithProviders } from '../__test-utils__/renderWithProviders';

// Basic usage with CharacterProvider
const { getByText } = renderWithProviders(<MyComponent />, {
  withCharacterProvider: true
});

// With custom character data
const { getByText } = renderWithProviders(<MyComponent />, {
  withCharacterProvider: true,
  characterData: {
    name: 'Custom Character',
    age: 35
  }
});

// With multiple providers
const { getByText } = renderWithProviders(<MyComponent />, {
  withRouter: true,
  withQueryClient: true,
  withCharacterProvider: true
});
```

## How to Mock Contexts in Tests

### Basic Pattern

```javascript
// 1. Mock the context module
jest.mock('../contexts/CharacterProvider');

// 2. Import the mock
import { CharacterProvider, useCharacter } from '../contexts/CharacterProvider';

// 3. In your test, configure the mock as needed
beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();
  
  // Set up mock implementation for specific methods if needed
  useCharacter.mockImplementation(() => ({
    character: {
      id: 'test-id',
      name: 'Test Character'
    },
    saveCharacter: jest.fn().mockResolvedValue({ data: { success: true } })
  }));
});
```

### Using the renderWithProviders Utility

```javascript
import { renderWithProviders } from '../__test-utils__/renderWithProviders';

describe('MyComponent', () => {
  it('renders character data correctly', () => {
    const { getByText } = renderWithProviders(<MyComponent />, {
      withCharacterProvider: true,
      characterData: {
        name: 'Test Character',
        age: 25
      }
    });
    
    expect(getByText('Test Character')).toBeInTheDocument();
    expect(getByText('Age: 25')).toBeInTheDocument();
  });
  
  it('calls saveCharacter when save button is clicked', () => {
    const { getByRole, getByLabelText } = renderWithProviders(<MyComponent />, {
      withCharacterProvider: true
    });
    
    // Get the mock functions from the wrapped provider
    const { saveCharacter } = useCharacter();
    
    // Interact with the component
    fireEvent.change(getByLabelText('Character Name'), { 
      target: { value: 'New Name' } 
    });
    fireEvent.click(getByRole('button', { name: /save/i }));
    
    // Verify the mock was called
    expect(saveCharacter).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'New Name' })
    );
  });
});
```

## Testing Components That Use Multiple Contexts

When a component uses multiple contexts, wrap it with all the needed providers:

```javascript
const { getByText } = renderWithProviders(<MyComponent />, {
  withCharacterProvider: true,
  withQueryClient: true,
  withRouter: true
});
```

## Accessing and Verifying Mock Function Calls

To verify that context functions are called correctly:

```javascript
// Import the context hook
import { useCharacter } from '../contexts/CharacterProvider';

// In your test
it('calls context functions correctly', () => {
  // Render the component with providers
  const { getByRole } = renderWithProviders(<MyComponent />, {
    withCharacterProvider: true
  });
  
  // Get access to the mock functions
  const { saveCharacter } = useCharacter();
  
  // Interact with the component
  fireEvent.click(getByRole('button', { name: /save/i }));
  
  // Verify the mock was called with the right arguments
  expect(saveCharacter).toHaveBeenCalledWith(
    expect.objectContaining({ /* expected data */ })
  );
});
```

## Common Pitfalls to Avoid

1. **Not Mocking the Module**
   - Always call `jest.mock('../path/to/Context')` before imports
   
2. **Not Resetting Mocks Between Tests**
   - Use `jest.clearAllMocks()` in `beforeEach` to reset all mocks
   
3. **Missing Provider in Component Tree**
   - Use `renderWithProviders` to ensure all needed providers are present
   
4. **Mock Implementation Doesn't Match Usage**
   - Ensure mock functions return values in the format components expect

## Example: Complete Test Pattern

```javascript
import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../__test-utils__/renderWithProviders';
import { useCharacter } from '../contexts/CharacterProvider';
import MyComponent from './MyComponent';

// Mock the CharacterProvider module
jest.mock('../contexts/CharacterProvider');

describe('MyComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders character data and handles interactions', () => {
    // Render with providers
    renderWithProviders(<MyComponent />, {
      withCharacterProvider: true,
      characterData: {
        name: 'Initial Name',
        age: 30
      }
    });
    
    // Get mock function from the context
    const { saveCharacter } = useCharacter();
    
    // Test initial render
    expect(screen.getByText('Initial Name')).toBeInTheDocument();
    
    // Interact with the component
    fireEvent.change(screen.getByLabelText('Name'), { 
      target: { value: 'Updated Name' } 
    });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    // Verify mock function was called
    expect(saveCharacter).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Updated Name' })
    );
  });
});
```

Using these patterns consistently will create more maintainable and reliable tests across the codebase.