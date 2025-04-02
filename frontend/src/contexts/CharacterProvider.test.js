import { renderHook, act } from '@testing-library/react-hooks';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter, Route } from 'react-router-dom';
import { CharacterProvider, useCharacter } from './CharacterProvider';
import api from '../api/axios';

// Mock API
jest.mock('../api/axios');

// Sample character data
const mockCharacter = {
  id: '123',
  name: 'Test Character',
  character_type: 'magus',
  general_exp_available: 100,
  magical_exp_available: 50,
  restricted_exp_pools: []
};

// Setup for tests
const createWrapper = (characterId = '123') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/characters/${characterId}`]}>
        <Route path="/characters/:id">
          <CharacterProvider>
            {children}
          </CharacterProvider>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CharacterProvider', () => {
  beforeEach(() => {
    // Mock API responses
    api.get.mockResolvedValue({ data: mockCharacter });
    api.put.mockResolvedValue({ data: { ...mockCharacter, general_exp_available: 80 } });
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('provides character data', async () => {
    const { result, waitFor } = renderHook(() => useCharacter(), {
      wrapper: createWrapper()
    });
    
    // Initially loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for data to load
    await waitFor(() => !result.current.isLoading);
    
    // Should have character data
    expect(result.current.character).toEqual(mockCharacter);
    expect(api.get).toHaveBeenCalledWith('/characters/123');
  });
  
  test('handles optimistic updates', async () => {
    const { result, waitFor } = renderHook(() => useCharacter(), {
      wrapper: createWrapper()
    });
    
    // Wait for initial data to load
    await waitFor(() => !result.current.isLoading);
    
    // Perform an optimistic update
    act(() => {
      result.current.updateCharacter(
        // Update function
        (char) => ({
          ...char,
          general_exp_available: char.general_exp_available - 20
        }),
        // Server data
        { general_exp_available: 80 },
        // Metadata
        { 
          type: 'spendExperience',
          experienceChanges: { general_exp_available: -20 }
        }
      );
    });
    
    // Character should be optimistically updated
    expect(result.current.character.general_exp_available).toBe(80);
    expect(result.current.hasPendingOperations).toBe(true);
    
    // API should be called
    expect(api.put).toHaveBeenCalledWith('/characters/123', { general_exp_available: 80 });
    
    // Wait for API response
    await waitFor(() => !result.current.hasPendingOperations);
    
    // Should update with server value after API response
    expect(result.current.character.general_exp_available).toBe(80);
  });
  
  test('handles API errors by rolling back optimistic updates', async () => {
    // Mock API error
    api.put.mockRejectedValueOnce(new Error('API Error'));
    
    const { result, waitFor } = renderHook(() => useCharacter(), {
      wrapper: createWrapper()
    });
    
    // Wait for initial data to load
    await waitFor(() => !result.current.isLoading);
    
    // Capture the initial state
    const initialGeneralXP = result.current.character.general_exp_available;
    
    // Perform an optimistic update that will fail
    await act(async () => {
      try {
        await result.current.updateCharacter(
          // Update function
          (char) => ({
            ...char,
            general_exp_available: char.general_exp_available - 20
          }),
          // Server data
          { general_exp_available: 80 },
          // Metadata
          { 
            type: 'spendExperience',
            experienceChanges: { general_exp_available: -20 }
          }
        );
      } catch (e) {
        // Expected error
      }
    });
    
    // State should be rolled back to initial values
    expect(result.current.character.general_exp_available).toBe(initialGeneralXP);
    expect(result.current.hasPendingOperations).toBe(false);
  });
});