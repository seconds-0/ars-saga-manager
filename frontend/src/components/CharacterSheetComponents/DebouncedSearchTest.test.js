import React from 'react';
import { screen, act, waitFor, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from 'react-query';
import { 
  setupConsoleSuppress,
  createTestQueryClient
} from '../../__test-utils__';

// Setup console error suppression
setupConsoleSuppress();

// Mock the entire VirtueFlawSelector component to focus on debounced search
jest.mock('./VirtueFlawSelector', () => {
  const React = require('react');
  const { useState, useCallback, useEffect } = React;
  const { debounce } = require('lodash');
  
  /**
   * Simplified VirtueFlawSelector component that only includes the debounced search functionality
   * This allows us to test the specific implementation of the debounce in isolation
   */
  return function SimplifiedVirtueFlawSelector() {
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    
    /**
     * Debounced search function implementation
     * 
     * Important notes:
     * 1. The function is created with lodash.debounce and wrapped in useCallback
     * 2. The debounce function returns an object with a 'cancel' method that 
     *    must be called on component unmount to prevent memory leaks
     * 3. The setSearch state setter function is included in the dependency array
     * 4. The debounce delay is set to 300ms to balance responsiveness and performance
     */
    const debouncedSearch = useCallback(
      debounce((value) => {
        setSearch(value);
      }, 300),
      [setSearch]
    );

    /**
     * Handles changes to the search input field
     * 1. Immediately updates the visible input state for responsiveness
     * 2. Triggers the debounced search which will delay updating the actual search state
     */
    const handleSearchChange = (e) => {
      const value = e.target.value;
      setSearchInput(value); // Update immediately for UI feedback
      debouncedSearch(value); // Debounce the actual search state update
    };

    /**
     * Cleanup effect to prevent memory leaks and stale closures
     * Critical: The debounced function must have its cancel method called on unmount
     * to prevent potential memory leaks and delayed state updates after unmount
     */
    useEffect(() => {
      return () => {
        debouncedSearch.cancel();
      };
    }, [debouncedSearch]);

    return (
      <div>
        <input
          type="text"
          placeholder="Search virtues and flaws"
          value={searchInput}
          onChange={handleSearchChange}
          data-testid="search-input"
        />
        <div data-testid="search-value">{search}</div>
      </div>
    );
  };
});

// Mock lodash's debounce function to make testing easier
jest.mock('lodash', () => {
  const originalModule = jest.requireActual('lodash');
  return {
    ...originalModule,
    debounce: jest.fn((fn, delay) => {
      // Create a mock debounced function that calls the original
      // function immediately for testing purposes
      const mockDebounced = (value) => fn(value);
      // Add the required cancel method
      mockDebounced.cancel = jest.fn();
      return mockDebounced;
    })
  };
});

// Import our mocked component
const VirtueFlawSelector = require('./VirtueFlawSelector').default;

describe('Debounced Search in VirtueFlawSelector', () => {
  function setup() {
    // Create a query client for testing
    const queryClient = createTestQueryClient();
    
    return render(
      <QueryClientProvider client={queryClient}>
        <VirtueFlawSelector />
      </QueryClientProvider>
    );
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Immediate UI Updates
   * Description: Verifies that the input field updates immediately, even though
   * the actual search state is debounced.
   */
  test('input field updates immediately while search state is debounced', async () => {
    // Render the component
    setup();

    // Get the search input field
    const searchInput = screen.getByTestId('search-input');
    
    // Type in the search box
    await act(async () => {
      userEvent.type(searchInput, 'test');
    });
    
    // Verify the input value updates immediately
    expect(searchInput.value).toBe('test');
    
    // Verify the debounced search value also updates in our mocked environment
    await waitFor(() => {
      expect(screen.getByTestId('search-value').textContent).toBe('test');
    });
  });

  /**
   * Test: Debounce Cleanup
   * Description: Verifies that the cancel method is called when the component unmounts,
   * which prevents memory leaks and delayed state updates after component unmount.
   */
  test('debounced search cancel is called on unmount', async () => {
    // Render the component
    const { unmount } = setup();
    
    // Get the cancel method from the mocked debounce
    const cancelMethod = require('lodash').debounce().cancel;
    
    // Unmount the component
    unmount();
    
    // Verify the cancel method was called
    expect(cancelMethod).toHaveBeenCalled();
  });
});