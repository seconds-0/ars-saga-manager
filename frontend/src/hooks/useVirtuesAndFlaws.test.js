import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { useVirtuesAndFlaws } from './useVirtuesAndFlaws';
import { 
  setupConsoleSuppress,
  HOOK_STATES,
  VIRTUE_FIXTURES,
  FLAW_FIXTURES
} from '../__test-utils__';
import { QueryClient, QueryClientProvider } from 'react-query';

// Setup console error suppression
setupConsoleSuppress();

describe('useVirtuesAndFlaws', () => {
  const mockCharacterId = 123;
  const mockVirtuesFlaws = [
    { id: 1, reference_virtue_flaw: VIRTUE_FIXTURES.MINOR_GENERAL },
    { id: 2, reference_virtue_flaw: FLAW_FIXTURES.MINOR_GENERAL }
  ];
  const mockData = {
    virtuesFlaws: mockVirtuesFlaws,
    remainingPoints: 0
  };

  // Create API mock functions
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  const mockDelete = jest.fn();

  // Mock axios
  jest.mock('../api/axios', () => ({
    get: mockGet,
    post: mockPost,
    delete: mockDelete
  }));

  // Mock queryClient
  const mockInvalidateQueries = jest.fn();
  const mockQueryClient = {
    invalidateQueries: mockInvalidateQueries
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue({ data: mockData });
    mockPost.mockResolvedValue({ data: { status: 'success' } });
    mockDelete.mockResolvedValue({ data: { status: 'success' } });
  });

  /**
   * Helper function to setup the hook for testing
   */
  function setupHook(options = {}) {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });
    
    const wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    return {
      ...renderHook(() => useVirtuesAndFlaws(options.characterId || mockCharacterId), { wrapper }),
      queryClient
    };
  }

  describe('Initial loading', () => {
    test('fetches virtues and flaws on mount', async () => {
      const { result, waitForNextUpdate } = setupHook();
      
      // Initial state should have default values
      expect(result.current.virtuesFlaws).toEqual([]);
      expect(result.current.remainingPoints).toBe(0);
      expect(result.current.isLoading).toBe(true);
      
      // Wait for the query to complete
      await waitForNextUpdate();
      
      // After fetch, should have the mock data
      expect(result.current.virtuesFlaws).toEqual(mockVirtuesFlaws);
      expect(result.current.remainingPoints).toBe(0);
      expect(result.current.isLoading).toBe(false);
      
      // Verify API call
      expect(mockGet).toHaveBeenCalledWith(`/characters/${mockCharacterId}/virtues-flaws`);
    });
    
    test('handles API error', async () => {
      const mockError = new Error('API error');
      mockGet.mockRejectedValueOnce(mockError);
      
      const { result, waitForNextUpdate } = setupHook();
      
      await waitForNextUpdate();
      
      expect(result.current.error).toBe(mockError);
      expect(result.current.isLoading).toBe(false);
    });
  });
  
  describe('addVirtueFlaw', () => {
    test('adds a virtue/flaw and invalidates queries', async () => {
      const { result, waitForNextUpdate } = setupHook();
      
      // Wait for initial query to complete
      await waitForNextUpdate();
      
      const referenceVirtueFlawId = 5;
      
      await act(async () => {
        await result.current.addVirtueFlaw.mutateAsync({ referenceVirtueFlawId });
      });
      
      // Verify API call
      expect(mockPost).toHaveBeenCalledWith(
        `/characters/${mockCharacterId}/virtues-flaws`,
        { referenceVirtueFlawId }
      );
      
      // Verify query invalidation
      expect(mockInvalidateQueries).toHaveBeenCalledWith(['virtuesFlaws', mockCharacterId]);
    });
    
    test('handles error when adding a virtue/flaw', async () => {
      const mockError = new Error('Post error');
      mockPost.mockRejectedValueOnce(mockError);
      
      const { result, waitForNextUpdate } = setupHook();
      
      // Wait for initial query to complete
      await waitForNextUpdate();
      
      let error;
      await act(async () => {
        try {
          await result.current.addVirtueFlaw.mutateAsync({ referenceVirtueFlawId: 5 });
        } catch (e) {
          error = e;
        }
      });
      
      expect(error).toBe(mockError);
    });
  });
  
  describe('removeVirtueFlaw', () => {
    test('removes a virtue/flaw and invalidates queries', async () => {
      const { result, waitForNextUpdate } = setupHook();
      
      // Wait for initial query to complete
      await waitForNextUpdate();
      
      const virtueFlawId = 1;
      
      await act(async () => {
        await result.current.removeVirtueFlaw.mutateAsync(virtueFlawId);
      });
      
      // Verify API call
      expect(mockDelete).toHaveBeenCalledWith(
        `/characters/${mockCharacterId}/virtues-flaws/${virtueFlawId}`
      );
      
      // Verify query invalidation
      expect(mockInvalidateQueries).toHaveBeenCalledWith(['virtuesFlaws', mockCharacterId]);
    });
    
    test('handles error when removing a virtue/flaw', async () => {
      const mockError = new Error('Delete error');
      mockDelete.mockRejectedValueOnce(mockError);
      
      const { result, waitForNextUpdate } = setupHook();
      
      // Wait for initial query to complete
      await waitForNextUpdate();
      
      let error;
      await act(async () => {
        try {
          await result.current.removeVirtueFlaw.mutateAsync(1);
        } catch (e) {
          error = e;
        }
      });
      
      expect(error).toBe(mockError);
    });
  });
});