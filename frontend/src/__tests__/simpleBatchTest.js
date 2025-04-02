/**
 * Super simple test for batch operations
 * This file focuses only on basic functionality without complex scenarios
 */

// Import React hooks for testing
const { renderHook, act } = require('@testing-library/react-hooks');

// Mock the API service
jest.mock('../api/axios', () => ({
  post: jest.fn().mockImplementation(() => 
    Promise.resolve({
      data: {
        status: 'success',
        results: [{ success: true }]
      }
    })
  ),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
}));

// Import the hook after mocking dependencies
const useBatchRequests = require('../hooks/useBatchRequests').default;

describe('Batch Requests - Basic Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('initializes with empty queue', () => {
    const { result } = renderHook(() => useBatchRequests());
    
    expect(result.current.queueLength).toBe(0);
    expect(typeof result.current.addOperation).toBe('function');
  });
  
  test('adds operation to queue', () => {
    const { result } = renderHook(() => useBatchRequests());
    
    act(() => {
      result.current.addOperation({
        endpoint: 'test-endpoint',
        resourceId: '123',
        action: 'test-action',
        data: null
      });
    });
    
    expect(result.current.queueLength).toBe(1);
  });
});