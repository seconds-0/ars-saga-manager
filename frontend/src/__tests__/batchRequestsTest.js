/**
 * Comprehensive tests for the batch requests functionality
 */
const { renderHook, act } = require('@testing-library/react-hooks');

// Create mock function for post
const mockPost = jest.fn().mockImplementation(() => 
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

// Mock the API module
jest.mock('../api/axios', () => ({
  post: mockPost,
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
}));

// Import the hook after mocking dependencies
const useBatchRequests = require('../hooks/useBatchRequests').default;

describe('useBatchRequests - Comprehensive Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('initializes with default values', () => {
    const { result } = renderHook(() => useBatchRequests());
    
    expect(result.current.queueLength).toBe(0);
    expect(result.current.pendingOperationsCount).toBe(0);
    expect(result.current.isBatchProcessing).toBe(false);
    expect(typeof result.current.addOperation).toBe('function');
    expect(typeof result.current.addIncrementOperation).toBe('function');
    expect(typeof result.current.addDecrementOperation).toBe('function');
    expect(typeof result.current.addUpdateOperation).toBe('function');
    expect(typeof result.current.isOperationPending).toBe('function');
  });
  
  test('adds an operation to the queue', () => {
    const { result } = renderHook(() => useBatchRequests());
    
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
  
  test('processes the queue after batch window', async () => {
    const onSuccess = jest.fn();
    
    const { result } = renderHook(() => useBatchRequests({
      batchWindow: 100,
      onSuccess
    }));
    
    // Add operation to the queue
    act(() => {
      result.current.addOperation({
        endpoint: 'characters/1/abilities/batch',
        resourceId: '123',
        action: 'increment',
        data: null
      });
    });
    
    // Fast-forward timers to trigger processing
    act(() => {
      jest.advanceTimersByTime(200);
    });
    
    // Wait for the promises to resolve
    await act(async () => {
      await Promise.resolve();
    });
    
    // Verify API was called with correct parameters
    expect(mockPost).toHaveBeenCalledWith(
      '/characters/1/abilities/batch',
      expect.objectContaining({
        operations: [
          expect.objectContaining({
            abilityId: '123',
            action: 'increment',
          })
        ]
      }),
      expect.any(Object)
    );
    
    // Verify success callback was called
    expect(onSuccess).toHaveBeenCalled();
    
    // Queue should be empty after processing
    expect(result.current.queueLength).toBe(0);
  });
  
  test('helper methods format operations correctly', () => {
    const { result } = renderHook(() => useBatchRequests());
    
    // Test increment operation
    act(() => {
      result.current.addIncrementOperation('1', '123', { test: 'metadata' });
    });
    
    expect(result.current.queueLength).toBe(1);
    
    // Test decrement operation
    act(() => {
      result.current.addDecrementOperation('1', '456', { test: 'metadata' });
    });
    
    expect(result.current.queueLength).toBe(2);
    
    // Test update operation
    const updateData = { score: 3, experience_points: 15 };
    act(() => {
      result.current.addUpdateOperation('1', '789', updateData, { test: 'metadata' });
    });
    
    expect(result.current.queueLength).toBe(3);
  });
  
  test('throttles operations for the same resource', () => {
    const { result } = renderHook(() => useBatchRequests());
    
    let opId1, opId2;
    
    // Add first operation
    act(() => {
      opId1 = result.current.addOperation({
        endpoint: 'characters/1/abilities/batch',
        resourceId: '123',
        action: 'increment',
        data: null
      });
    });
    
    // Add another operation for the same resource
    act(() => {
      opId2 = result.current.addOperation({
        endpoint: 'characters/1/abilities/batch',
        resourceId: '123',
        action: 'update',
        data: { score: 3 }
      });
    });
    
    // Second operation should be throttled (same ID returned)
    expect(opId1).toBe(opId2);
    expect(result.current.queueLength).toBe(1);
  });
  
  test('checks for pending operations correctly', () => {
    const { result } = renderHook(() => useBatchRequests());
    
    // Initially nothing is pending
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
      metadata?.type === 'testOperation'
    )).toBe(true);
    
    // Check with non-matching predicate
    expect(result.current.isOperationPending(metadata => 
      metadata?.type === 'differentType'
    )).toBe(false);
  });
  
  test('processes batch immediately with flushBatch', async () => {
    const { result } = renderHook(() => useBatchRequests());
    
    // Add operation
    act(() => {
      result.current.addOperation({
        endpoint: 'characters/1/abilities/batch',
        resourceId: '123',
        action: 'increment',
        data: null
      });
    });
    
    // Call flush to process immediately
    await act(async () => {
      await result.current.flushBatch();
    });
    
    // API should have been called
    expect(mockPost).toHaveBeenCalled();
    
    // Queue should be empty
    expect(result.current.queueLength).toBe(0);
  });
});