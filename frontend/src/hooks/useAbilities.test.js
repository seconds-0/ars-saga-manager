import { renderHook, act } from '@testing-library/react-hooks';
import useAbilities from './useAbilities';
import { 
  setupConsoleSuppress, 
  createAxiosMock 
} from '../__test-utils__';

// Setup console error suppression
setupConsoleSuppress();

// Create a mock axios instance with all the methods we need
const mockAxios = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  create: jest.fn(() => mockAxios),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() }
  }
};

// Mock both axios and the local api instance
jest.mock('axios', () => mockAxios);
jest.mock('../api/axios', () => mockAxios);

/**
 * Test data and setup function for useAbilities tests
 */
function setupHookTest(options = {}) {
  // Default test data
  const mockCharacterId = options.characterId ?? 123;
  const mockAbilities = options.abilities ?? [
    { id: 1, ability_name: 'Athletics', score: 2, category: 'GENERAL', specialty: 'Running' },
    { id: 2, ability_name: 'Latin', score: 4, category: 'ACADEMIC', specialty: null }
  ];
  
  // Default API responses
  const getResponse = options.getResponse ?? { status: 'success', data: mockAbilities };
  const postResponse = options.postResponse ?? { 
    status: 'success', 
    data: { id: 3, ability_name: 'Awareness', score: 1 } 
  };
  const putResponse = options.putResponse ?? { 
    status: 'success', 
    data: { id: 1, ability_name: 'Athletics', score: 3 } 
  };
  const deleteResponse = options.deleteResponse ?? { 
    status: 'success', 
    message: 'Ability deleted' 
  };
  
  // Setup API mocks
  jest.clearAllMocks();
  mockAxios.get.mockResolvedValue({ data: getResponse });
  mockAxios.post.mockResolvedValue({ data: postResponse });
  mockAxios.put.mockResolvedValue({ data: putResponse });
  mockAxios.delete.mockResolvedValue({ data: deleteResponse });
  
  // Allow for custom error behavior
  if (options.getError) {
    mockAxios.get.mockRejectedValueOnce(options.getError);
  }
  
  // Render the hook
  const hookResult = renderHook(() => useAbilities(mockCharacterId));
  
  return {
    ...hookResult,
    mockCharacterId,
    mockAbilities
  };
}

describe('useAbilities hook', () => {
  describe('Initial loading', () => {
    test('fetches abilities on mount', async () => {
      const { result, waitForNextUpdate, mockAbilities, mockCharacterId } = setupHookTest();
      
      // Initial state
      expect(result.current.abilities).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
      
      await waitForNextUpdate();
      
      // After fetch completes
      expect(result.current.abilities).toEqual(mockAbilities);
      expect(result.current.loading).toBe(false);
      expect(mockAxios.get).toHaveBeenCalledWith(`/characters/${mockCharacterId}/abilities`);
    });
    
    test('does not fetch if characterId is not provided', () => {
      setupHookTest({ characterId: null });
      expect(mockAxios.get).not.toHaveBeenCalled();
    });
    
    test('handles error during fetch', async () => {
      const { result, waitForNextUpdate } = setupHookTest({
        getError: new Error('Network error')
      });
      
      await waitForNextUpdate();
      
      expect(result.current.error).toMatch(/Error fetching abilities/);
      expect(result.current.loading).toBe(false);
    });
  });
  
  describe('CRUD operations', () => {
    test('handles add ability', async () => {
      const { result, waitForNextUpdate, mockAbilities, mockCharacterId } = setupHookTest();
      
      await waitForNextUpdate();
      
      const newAbility = {
        ability_name: 'Awareness',
        category: 'GENERAL',
        score: 1,
        specialty: null
      };
      
      // Reset the get mock to return updated abilities list
      mockAxios.get.mockResolvedValueOnce({
        data: {
          status: 'success',
          data: [...mockAbilities, { id: 3, ...newAbility }]
        }
      });
      
      await act(async () => {
        const success = await result.current.addAbility(newAbility);
        expect(success).toBe(true);
      });
      
      expect(mockAxios.post).toHaveBeenCalledWith(
        `/characters/${mockCharacterId}/abilities`,
        newAbility
      );
      
      // Should have triggered a refetch
      expect(mockAxios.get).toHaveBeenCalledTimes(2);
    });
    
    test('handles delete ability', async () => {
      const { result, waitForNextUpdate, mockCharacterId } = setupHookTest();
      
      await waitForNextUpdate();
      
      const abilityId = 1;
      
      await act(async () => {
        const success = await result.current.deleteAbility(abilityId);
        expect(success).toBe(true);
      });
      
      expect(mockAxios.delete).toHaveBeenCalledWith(
        `/characters/${mockCharacterId}/abilities/${abilityId}`
      );
      
      // Should have updated local state by filtering out the deleted ability
      expect(result.current.abilities.find(a => a.id === abilityId)).toBeUndefined();
    });
  });
  
  describe('Ability score operations', () => {
    test('handles increment ability', async () => {
      const { result, waitForNextUpdate, mockCharacterId } = setupHookTest();
      
      await waitForNextUpdate();
      
      const abilityId = 1;
      const currentScore = 2;
      const currentXP = 15; // XP for level 2
      const targetXP = 30;  // XP for level 3
      
      await act(async () => {
        const success = await result.current.incrementAbility(abilityId, currentScore, currentXP);
        expect(success).toBe(true);
      });
      
      expect(mockAxios.put).toHaveBeenCalledWith(
        `/characters/${mockCharacterId}/abilities/${abilityId}`,
        { experience_points: targetXP }
      );
    });
    
    test('handles decrement ability', async () => {
      const { result, waitForNextUpdate, mockCharacterId } = setupHookTest();
      
      await waitForNextUpdate();
      
      const abilityId = 1;
      const currentScore = 2;
      const currentXP = 15; // XP for level 2
      const targetXP = 5;   // XP for level 1
      
      await act(async () => {
        const success = await result.current.decrementAbility(abilityId, currentScore, currentXP);
        expect(success).toBe(true);
      });
      
      expect(mockAxios.put).toHaveBeenCalledWith(
        `/characters/${mockCharacterId}/abilities/${abilityId}`,
        { 
          score: currentScore - 1,
          experience_points: targetXP
        }
      );
    });
    
    test('prevents decrementing ability below score 0', async () => {
      const { result, waitForNextUpdate } = setupHookTest();
      
      await waitForNextUpdate();
      
      const abilityId = 1;
      const currentScore = 0;
      const currentXP = 0;
      
      await act(async () => {
        const success = await result.current.decrementAbility(abilityId, currentScore, currentXP);
        expect(success).toBe(true); // Returns true without making API call
      });
      
      // Verify no API call was made
      expect(mockAxios.put).not.toHaveBeenCalled();
    });
    
    test('handles incrementing with experience points', async () => {
      const { result, waitForNextUpdate, mockCharacterId } = setupHookTest();
      
      await waitForNextUpdate();
      
      const abilityId = 1;
      const currentXP = 15;
      const amountToAdd = 5;
      
      await act(async () => {
        const success = await result.current.incrementAbilityXP(abilityId, currentXP, amountToAdd);
        expect(success).toBe(true);
      });
      
      expect(mockAxios.put).toHaveBeenCalledWith(
        `/characters/${mockCharacterId}/abilities/${abilityId}`,
        { experience_points: currentXP + amountToAdd }
      );
    });
    
    test('handles decrementing with experience points', async () => {
      const { result, waitForNextUpdate, mockCharacterId } = setupHookTest();
      
      await waitForNextUpdate();
      
      const abilityId = 1;
      const currentXP = 15;
      const amountToSubtract = 5;
      
      await act(async () => {
        const success = await result.current.decrementAbilityXP(abilityId, currentXP, amountToSubtract);
        expect(success).toBe(true);
      });
      
      expect(mockAxios.put).toHaveBeenCalledWith(
        `/characters/${mockCharacterId}/abilities/${abilityId}`,
        { experience_points: currentXP - amountToSubtract }
      );
    });
    
    test('prevents decrementing XP below 0', async () => {
      const { result, waitForNextUpdate } = setupHookTest();
      
      await waitForNextUpdate();
      
      const abilityId = 1;
      const currentXP = 5;
      const amountToSubtract = 10; // More than current XP
      
      await act(async () => {
        const success = await result.current.decrementAbilityXP(abilityId, currentXP, amountToSubtract);
        expect(success).toBe(true); // Returns true without making API call
      });
      
      // Verify no API call was made
      expect(mockAxios.put).not.toHaveBeenCalled();
    });
  });
  
  describe('Specialty operations', () => {
    test('handles update specialty', async () => {
      const { result, waitForNextUpdate, mockCharacterId } = setupHookTest();
      
      await waitForNextUpdate();
      
      const abilityId = 1;
      const specialty = 'New Specialty';
      
      await act(async () => {
        const success = await result.current.updateSpecialty(abilityId, specialty);
        expect(success).toBe(true);
      });
      
      expect(mockAxios.put).toHaveBeenCalledWith(
        `/characters/${mockCharacterId}/abilities/${abilityId}`,
        { specialty }
      );
    });
  });
  
  describe('Error handling', () => {
    test('sets error state when API requests fail', async () => {
      // Setup with a successful initial load but failed update
      const { result, waitForNextUpdate, mockCharacterId } = setupHookTest();
      
      await waitForNextUpdate();
      
      // Mock a failed API call
      mockAxios.put.mockRejectedValueOnce(new Error('Update failed'));
      
      await act(async () => {
        const success = await result.current.updateAbility(1, { score: 5 });
        expect(success).toBe(false);
      });
      
      expect(result.current.error).toMatch(/Error updating ability/);
    });
  });
});