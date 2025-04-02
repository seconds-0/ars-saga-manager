import { act, waitFor } from '@testing-library/react';
import { setupHookWithQueryClient } from '../__test-utils__/hookUtils';
import { suppressConsoleErrors } from '../__test-utils__/suppressConsole';
import useAbilities from '../hooks/useAbilities';

// Mock dependencies
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

jest.mock('../api/axios', () => ({
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete,
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

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

jest.mock('../contexts/CharacterProvider', () => ({
  useCharacter: jest.fn().mockReturnValue({
    character: {
      id: '123',
      general_exp_available: 100
    },
    updateCharacter: jest.fn((updateFn) => {
      // Call the update function with mock character and return mock updated character
      updateFn({ id: '123', general_exp_available: 100 });
      return Promise.resolve();
    })
  })
}));

// Mock abilities data
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
    jest.useFakeTimers();
    
    // Mock successful ability fetching
    mockGet.mockResolvedValue({
      data: {
        status: 'success',
        data: mockAbilities
      }
    });
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  it('initializes and fetches abilities', async () => {
    const { result } = setupHookWithQueryClient(useAbilities, ['123']);
    
    // Initially will be loading
    expect(result.current.loading).toBe(true);
    
    // Let the abilities load
    await act(async () => {
      await Promise.resolve();
    });
    
    // Should have called the API once
    expect(mockGet).toHaveBeenCalledWith('/characters/123/abilities');
    
    // Loading should be false, abilities should be set
    expect(result.current.loading).toBe(false);
    expect(result.current.abilities).toEqual(mockAbilities);
  });
  
  it('handles incrementing ability using batch operations', async () => {
    const { result } = setupHookWithQueryClient(useAbilities, ['123']);
    
    // Let abilities load
    await act(async () => {
      await Promise.resolve();
    });
    
    // Get the mocked useBatchRequests
    const useBatchRequests = require('../hooks/useBatchRequests');
    const mockedBatchRequests = useBatchRequests.mock.results[0].value;
    
    // Increment the ability
    await act(async () => {
      await result.current.incrementAbility('1', 2, 15);
    });
    
    // Should have called addIncrementOperation with correct params
    expect(mockedBatchRequests.addIncrementOperation).toHaveBeenCalledWith(
      '123', // characterId
      '1',   // abilityId
      expect.objectContaining({
        type: 'abilityIncrement',
        abilityId: '1',
        abilityName: 'Test Ability',
        originalScore: 2,
        originalXP: 15,
        targetScore: 3, // Score incremented by 1
        experienceChanges: expect.any(Object),
        rollback: expect.any(Function)
      })
    );
    
    // Ability should be updated optimistically in the local state
    expect(result.current.abilities[0].score).toBe(3); // Incremented
  });
  
  it('handles decrementing ability using batch operations', async () => {
    const { result } = setupHookWithQueryClient(useAbilities, ['123']);
    
    // Let abilities load
    await act(async () => {
      await Promise.resolve();
    });
    
    // Get the mocked useBatchRequests
    const useBatchRequests = require('../hooks/useBatchRequests');
    const mockedBatchRequests = useBatchRequests.mock.results[0].value;
    
    // Decrement the ability
    await act(async () => {
      await result.current.decrementAbility('1', 2, 15);
    });
    
    // Should have called addDecrementOperation with correct params
    expect(mockedBatchRequests.addDecrementOperation).toHaveBeenCalledWith(
      '123', // characterId
      '1',   // abilityId
      expect.objectContaining({
        type: 'abilityDecrement',
        abilityId: '1',
        abilityName: 'Test Ability',
        originalScore: 2,
        originalXP: 15,
        targetScore: 1, // Score decremented by 1
        experienceChanges: expect.any(Object),
        rollback: expect.any(Function)
      })
    );
    
    // Ability should be updated optimistically in the local state
    expect(result.current.abilities[0].score).toBe(1); // Decremented
  });
  
  it('handles incrementing XP using batch operations', async () => {
    const { result } = setupHookWithQueryClient(useAbilities, ['123']);
    
    // Let abilities load
    await act(async () => {
      await Promise.resolve();
    });
    
    // Get the mocked useBatchRequests
    const useBatchRequests = require('../hooks/useBatchRequests');
    const mockedBatchRequests = useBatchRequests.mock.results[0].value;
    
    // Increment XP
    await act(async () => {
      await result.current.incrementAbilityXP('1', 15, 5);
    });
    
    // Should have called addUpdateOperation with correct params
    expect(mockedBatchRequests.addUpdateOperation).toHaveBeenCalledWith(
      '123', // characterId
      '1',   // abilityId
      expect.objectContaining({
        score: 2, // Score stays the same
        experience_points: 20 // 15 + 5
      }),
      expect.objectContaining({
        type: 'abilityUpdate',
        abilityId: '1',
        operation: 'incrementXP',
        originalXP: 15,
        targetXP: 20,
        experienceChanges: expect.any(Object),
        rollback: expect.any(Function)
      })
    );
    
    // Ability should be updated optimistically in the local state
    expect(result.current.abilities[0].experience_points).toBe(20);
  });
  
  it('skips operations for abilities with pending operations', async () => {
    // Mock isOperationPending to return true
    const useBatchRequests = require('../hooks/useBatchRequests');
    useBatchRequests.mockImplementation(() => ({
      addIncrementOperation: jest.fn(),
      addDecrementOperation: jest.fn(),
      addUpdateOperation: jest.fn(),
      isOperationPending: jest.fn().mockReturnValue(true), // This ability has a pending operation
      getAllPendingOperations: jest.fn().mockReturnValue([]),
      flushBatch: jest.fn(),
      queueLength: 0,
      pendingOperationsCount: 1,
      isBatchProcessing: false
    }));
    
    const { result } = setupHookWithQueryClient(useAbilities, ['123']);
    
    // Let abilities load
    await act(async () => {
      await Promise.resolve();
    });
    
    // Get the mocked useBatchRequests
    const mockedBatchRequests = useBatchRequests.mock.results[0].value;
    
    // Try to increment the ability
    await act(async () => {
      await result.current.incrementAbility('1', 2, 15);
    });
    
    // Should not have called addIncrementOperation
    expect(mockedBatchRequests.addIncrementOperation).not.toHaveBeenCalled();
    
    // Ability state should not change
    expect(result.current.abilities[0].score).toBe(2); // Unchanged
  });
  
  it('propagates batch operation errors correctly', async () => {
    const { result } = setupHookWithQueryClient(useAbilities, ['123']);
    
    // Let abilities load
    await act(async () => {
      await Promise.resolve();
    });
    
    // Setup error state
    suppressConsoleErrors(() => {
      // Trigger batch error callback
      const { onError } = require('../hooks/useBatchRequests').mock.calls[0][0];
      
      act(() => {
        onError([{
          abilityId: '1',
          action: 'increment',
          success: false,
          error: 'Test error',
          metadata: {
            type: 'abilityIncrement',
            abilityId: '1',
            rollback: jest.fn()
          }
        }]);
      });
    });
    
    // Error state should be set
    expect(result.current.error).toBeTruthy();
    expect(result.current.error).toContain('Error');
  });
});