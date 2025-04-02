/**
 * Tests for useAbilities integration with batch requests
 */
const { renderHook, act } = require('@testing-library/react-hooks');

// Mock API calls
const mockGet = jest.fn();
const mockPost = jest.fn();

jest.mock('../api/axios', () => ({
  get: mockGet,
  post: mockPost,
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
}));

// Mock the useBatchRequests hook
jest.mock('../hooks/useBatchRequests', () => {
  return jest.fn().mockImplementation(() => ({
    addIncrementOperation: jest.fn(),
    addDecrementOperation: jest.fn(),
    addUpdateOperation: jest.fn(),
    isOperationPending: jest.fn().mockReturnValue(false),
    getAllPendingOperations: jest.fn().mockReturnValue([]),
    flushBatch: jest.fn(),
    queueLength: 0,
    pendingOperationsCount: 0,
    isBatchProcessing: false
  }));
});

// Mock the character context
jest.mock('../contexts/CharacterProvider', () => ({
  useCharacter: jest.fn().mockImplementation(() => ({
    character: {
      id: '123',
      general_exp_available: 100
    },
    updateCharacter: jest.fn().mockImplementation((updateFn) => {
      // Call the update function with mock character
      updateFn({ id: '123', general_exp_available: 100 });
      return Promise.resolve();
    })
  }))
}));

// Import after mocking dependencies
const useAbilities = require('../hooks/useAbilities').default;
const useBatchRequests = require('../hooks/useBatchRequests');

// Mock data for testing
const mockAbilities = [
  {
    id: '1',
    ability_name: 'Test Ability',
    score: 2,
    effective_score: 2,
    experience_points: 15,
    category: 'GENERAL'
  }
];

describe('useAbilities with Batch Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup success response for abilities
    mockGet.mockResolvedValue({
      data: {
        status: 'success',
        data: mockAbilities
      }
    });
  });
  
  test('fetches abilities on initialization', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAbilities('123'));
    
    // Initially loading should be true
    expect(result.current.loading).toBe(true);
    
    // Wait for data to load
    await waitForNextUpdate();
    
    // API should have been called
    expect(mockGet).toHaveBeenCalledWith('/characters/123/abilities');
    
    // Loading should be false, data should be set
    expect(result.current.loading).toBe(false);
    expect(result.current.abilities).toEqual(mockAbilities);
  });
  
  test('increments ability using batch operations', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAbilities('123'));
    
    // Wait for initial data load
    await waitForNextUpdate();
    
    // Get mock batch requests hook
    const mockedBatchRequests = useBatchRequests.mock.results[0].value;
    
    // Call increment
    await act(async () => {
      await result.current.incrementAbility('1', 2, 15);
    });
    
    // Should have called addIncrementOperation
    expect(mockedBatchRequests.addIncrementOperation).toHaveBeenCalledWith(
      '123', // characterId
      '1',   // abilityId
      expect.objectContaining({
        type: 'abilityIncrement',
        abilityId: '1',
        abilityName: 'Test Ability',
        originalScore: 2,
        originalXP: 15,
        targetScore: 3 // Score incremented by 1
      })
    );
    
    // Ability should be updated optimistically
    expect(result.current.abilities[0].score).toBe(3);
  });
  
  test('decrements ability using batch operations', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAbilities('123'));
    
    // Wait for initial data load
    await waitForNextUpdate();
    
    // Get mock batch requests hook
    const mockedBatchRequests = useBatchRequests.mock.results[0].value;
    
    // Call decrement
    await act(async () => {
      await result.current.decrementAbility('1', 2, 15);
    });
    
    // Should have called addDecrementOperation
    expect(mockedBatchRequests.addDecrementOperation).toHaveBeenCalledWith(
      '123', // characterId
      '1',   // abilityId
      expect.objectContaining({
        type: 'abilityDecrement',
        abilityId: '1',
        abilityName: 'Test Ability',
        originalScore: 2,
        originalXP: 15,
        targetScore: 1 // Score decremented by 1
      })
    );
    
    // Ability should be updated optimistically
    expect(result.current.abilities[0].score).toBe(1);
  });
});