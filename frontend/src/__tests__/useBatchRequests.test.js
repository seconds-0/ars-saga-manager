import { act, waitFor } from '@testing-library/react';
import { setupHook } from '../__test-utils__/hookUtils';
import { suppressConsoleErrors } from '../__test-utils__/suppressConsole';

/**
 * Setup test mocks before importing anything that might use them
 * This ensures our mocks are in place before any module imports
 */

// Default batch response for testing
const DEFAULT_BATCH_SUCCESS_RESPONSE = {
  status: 'success',
  results: [{ 
    abilityId: '123', 
    action: 'increment', 
    success: true,
    data: { id: '123', score: 2 } 
  }]
};

// Import our mocks
jest.mock('axios');
jest.mock('../api/axios');

// Need to import the mocks to access their methods
import mockAxios from '../__mocks__/axios';
import mockApiInstance from '../__mocks__/api/axios';

// Customize the api mock for batch testing
mockApiInstance.post.mockImplementation(() => 
  Promise.resolve({ 
    data: DEFAULT_BATCH_SUCCESS_RESPONSE 
  })
);

// Import after the mock is set up
import useBatchRequests from '../hooks/useBatchRequests';

describe('useBatchRequests', () => {
  // Setup
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Reset the default mock implementations
    mockAxios.resetAllMocks();
    mockApiInstance.resetAllMocks?.() || jest.clearAllMocks();
    
    // Set up batch response for testing
    mockApiInstance.post.mockImplementation(() => 
      Promise.resolve({
        data: DEFAULT_BATCH_SUCCESS_RESPONSE
      })
    );
    
    // Ensure the mockAxios.post has the same implementation
    // This is required since the tests might use either mock
    mockAxios.post.mockImplementation(() => 
      Promise.resolve({
        data: DEFAULT_BATCH_SUCCESS_RESPONSE
      })
    );
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  // Improved helper function to advance timers and wait for promises
  const advanceTimersAndAwaitPromises = async () => {
    // Run all timers
    await act(async () => {
      jest.runAllTimers();
    });
    
    // Wait for promise microtasks to complete
    await act(async () => {
      // This uses setImmediate which runs after promises but before timers
      await new Promise(resolve => setImmediate(resolve));
    });
    
    // Run any new timers created during promise resolution
    await act(async () => {
      jest.runAllTimers();
    });
    
    // Final wait for any promise microtasks
    await act(async () => {
      await Promise.resolve();
    });
  };

  it('initializes with default values', () => {
    const { result } = setupHook(useBatchRequests);
    
    expect(result.current.queueLength).toBe(0);
    expect(result.current.pendingOperationsCount).toBe(0);
    expect(result.current.isBatchProcessing).toBe(false);
    expect(typeof result.current.addOperation).toBe('function');
    expect(typeof result.current.addIncrementOperation).toBe('function');
    expect(typeof result.current.addDecrementOperation).toBe('function');
    expect(typeof result.current.addUpdateOperation).toBe('function');
    expect(typeof result.current.isOperationPending).toBe('function');
    expect(typeof result.current.getAllPendingOperations).toBe('function');
    expect(typeof result.current.flushBatch).toBe('function');
  });

  it('adds an operation to the queue', async () => {
    const { result } = setupHook(useBatchRequests);
    
    act(() => {
      result.current.addOperation({
        endpoint: 'characters/1/abilities/batch',
        resourceId: '123',
        action: 'increment',
        data: null
      });
    });
    
    expect(result.current.queueLength).toBe(1);
    expect(result.current.pendingOperationsCount).toBe(1);
  });

  it('processes the queue after batch window', async () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();
    
    const { result } = setupHook(useBatchRequests, [{ 
      batchWindow: 100,
      onSuccess,
      onError
    }]);
    
    // Add an operation
    act(() => {
      result.current.addOperation({
        endpoint: 'characters/1/abilities/batch',
        resourceId: '123',
        action: 'increment',
        data: null
      });
    });
    
    // Advance timers to trigger batch processing
    await advanceTimersAndAwaitPromises();
    
    // Verify axios was called correctly with the right endpoint and payload
    expect(mockApiInstance.post).toHaveBeenCalledWith(
      '/characters/1/abilities/batch',
      {
        operations: [
          {
            abilityId: '123',
            action: 'increment',
            data: null
          }
        ],
        allOrNothing: false
      },
      expect.objectContaining({
        timeout: 5000
      })
    );
    
    // Success callback should be called
    expect(onSuccess).toHaveBeenCalled();
    
    // Queue should be empty now
    expect(result.current.queueLength).toBe(0);
    expect(result.current.pendingOperationsCount).toBe(0);
  });

  it('throttles operations for the same resource', async () => {
    const { result } = setupHook(useBatchRequests);
    
    // Add first operation
    let opId1;
    act(() => {
      opId1 = result.current.addOperation({
        endpoint: 'characters/1/abilities/batch',
        resourceId: '123',
        action: 'increment',
        data: null
      });
    });
    
    // Immediately add another operation for the same resource
    let opId2;
    act(() => {
      opId2 = result.current.addOperation({
        endpoint: 'characters/1/abilities/batch',
        resourceId: '123',
        action: 'increment',
        data: null
      });
    });
    
    // Second operation should be throttled and return the same ID
    expect(opId1).toBe(opId2);
    
    // Only one operation should be in the queue
    expect(result.current.queueLength).toBe(1);
  });

  it('handles errors correctly', async () => {
    // Setup error response
    mockApiInstance.post.mockImplementationOnce(() => 
      Promise.reject(new Error('Test error'))
    );
    
    const onError = jest.fn();
    
    const { result } = setupHook(useBatchRequests, [{ 
      batchWindow: 100,
      onError
    }]);
    
    // Suppress console errors for this test
    suppressConsoleErrors(() => {
      // Add an operation
      act(() => {
        result.current.addOperation({
          endpoint: 'characters/1/abilities/batch',
          resourceId: '123',
          action: 'increment',
          data: null
        });
      });
    });
    
    // Advance timers to trigger batch processing
    await advanceTimersAndAwaitPromises();
    
    // Error callback should be called
    expect(onError).toHaveBeenCalledWith([
      expect.objectContaining({
        success: false,
        error: 'Test error'
      })
    ]);
    
    // Queue should be empty (operation processed, even though it failed)
    expect(result.current.queueLength).toBe(0);
  });

  it('calls flushBatch to process immediately', async () => {
    const { result } = setupHook(useBatchRequests);
    
    // Add an operation
    act(() => {
      result.current.addOperation({
        endpoint: 'characters/1/abilities/batch',
        resourceId: '123',
        action: 'increment',
        data: null
      });
    });
    
    // Call flushBatch to process immediately
    act(() => {
      result.current.flushBatch();
    });
    
    // Let promises resolve
    await act(async () => {
      await Promise.resolve();
    });
    
    // Verify axios was called
    expect(mockApiInstance.post).toHaveBeenCalled();
    
    // Queue should be empty
    expect(result.current.queueLength).toBe(0);
  });

  it('correctly handles addIncrementOperation helper', async () => {
    const { result } = setupHook(useBatchRequests);
    
    act(() => {
      result.current.addIncrementOperation('1', '123', { testMeta: 'value' });
    });
    
    // Check queue has one item
    expect(result.current.queueLength).toBe(1);
    
    // Advance timers
    await advanceTimersAndAwaitPromises();
    
    // Verify correct endpoint and payload
    expect(mockApiInstance.post).toHaveBeenCalledWith(
      '/characters/1/abilities/batch',
      expect.objectContaining({
        operations: [
          {
            abilityId: '123',
            action: 'increment',
            data: null
          }
        ],
        allOrNothing: false
      }),
      expect.any(Object)
    );
  });

  it('correctly handles addDecrementOperation helper', async () => {
    const { result } = setupHook(useBatchRequests);
    
    act(() => {
      result.current.addDecrementOperation('1', '123');
    });
    
    // Check queue has one item
    expect(result.current.queueLength).toBe(1);
    
    // Advance timers
    await advanceTimersAndAwaitPromises();
    
    // Verify correct endpoint and payload
    expect(mockApiInstance.post).toHaveBeenCalledWith(
      '/characters/1/abilities/batch',
      expect.objectContaining({
        operations: [
          {
            abilityId: '123',
            action: 'decrement',
            data: null
          }
        ],
        allOrNothing: false
      }),
      expect.any(Object)
    );
  });

  it('correctly handles addUpdateOperation helper', async () => {
    const { result } = setupHook(useBatchRequests);
    
    const updateData = { score: 3, experience_points: 15 };
    
    act(() => {
      result.current.addUpdateOperation('1', '123', updateData);
    });
    
    // Check queue has one item
    expect(result.current.queueLength).toBe(1);
    
    // Advance timers
    await advanceTimersAndAwaitPromises();
    
    // Verify correct endpoint and payload
    expect(mockApiInstance.post).toHaveBeenCalledWith(
      '/characters/1/abilities/batch',
      expect.objectContaining({
        operations: [
          {
            abilityId: '123',
            action: 'update',
            data: updateData
          }
        ],
        allOrNothing: false
      }),
      expect.any(Object)
    );
  });

  it('checks if operations are pending correctly', async () => {
    const { result } = setupHook(useBatchRequests);
    
    // Initially nothing should be pending
    expect(result.current.isOperationPending(() => true)).toBe(false);
    
    // Add operation with metadata
    act(() => {
      result.current.addOperation({
        endpoint: 'characters/1/abilities/batch',
        resourceId: '123',
        action: 'increment',
        metadata: {
          type: 'testOperation',
          testId: '456'
        }
      });
    });
    
    // Check with matching predicate
    expect(result.current.isOperationPending(metadata => 
      metadata.type === 'testOperation'
    )).toBe(true);
    
    // Check with non-matching predicate
    expect(result.current.isOperationPending(metadata => 
      metadata.type === 'differentType'
    )).toBe(false);
  });

  it('handles server errors correctly', async () => {
    // Setup error response from server (status success but operation failed)
    mockApiInstance.post.mockImplementationOnce(() => 
      Promise.resolve({
        data: {
          status: 'success',
          results: [{ 
            abilityId: '123', 
            action: 'increment', 
            success: false,
            error: 'Server rejected operation'
          }]
        }
      })
    );
    
    const onSuccess = jest.fn();
    const onError = jest.fn();
    
    const { result } = setupHook(useBatchRequests, [{ 
      batchWindow: 100,
      onSuccess,
      onError
    }]);
    
    suppressConsoleErrors(() => {
      // Add an operation
      act(() => {
        result.current.addOperation({
          endpoint: 'characters/1/abilities/batch',
          resourceId: '123',
          action: 'increment',
          data: null
        });
      });
    });
    
    // Advance timers
    await advanceTimersAndAwaitPromises();
    
    // Error callback should be called
    expect(onError).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('retries failed operations up to MAX_RETRIES times', async () => {
    // Setup error responses
    mockApiInstance.post
      .mockImplementationOnce(() => Promise.reject(new Error('Network error')))
      .mockImplementationOnce(() => Promise.reject(new Error('Network error')))
      .mockImplementationOnce(() => Promise.resolve({
        data: {
          status: 'success',
          results: [{ 
            abilityId: '123', 
            action: 'increment', 
            success: true,
            data: { id: '123', score: 2 } 
          }]
        }
      }));
    
    const onSuccess = jest.fn();
    const onError = jest.fn();
    
    const { result } = setupHook(useBatchRequests, [{ 
      batchWindow: 100,
      onSuccess,
      onError
    }]);
    
    suppressConsoleErrors(() => {
      // Add an operation
      act(() => {
        result.current.addOperation({
          endpoint: 'characters/1/abilities/batch',
          resourceId: '123',
          action: 'increment',
          data: null
        });
      });
    });
    
    // First attempt - will fail
    await advanceTimersAndAwaitPromises();
    expect(onError).toHaveBeenCalledTimes(1);
    
    // Operation will be retried in the next batch
    await advanceTimersAndAwaitPromises();
    expect(onError).toHaveBeenCalledTimes(2);
    
    // Final retry - should succeed
    await advanceTimersAndAwaitPromises();
    expect(onSuccess).toHaveBeenCalledTimes(1);
    
    // Axios should have been called 3 times
    expect(mockApiInstance.post).toHaveBeenCalledTimes(3);
  });
});