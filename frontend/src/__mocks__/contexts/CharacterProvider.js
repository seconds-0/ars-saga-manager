/**
 * Mock CharacterProvider for tests
 * 
 * This mock implementation provides the CharacterContext interface
 * needed by components that use useCharacter hook, without the actual
 * implementation details or API calls.
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

// Create the context
const CharacterContext = createContext(null);

// Default test character data - updated to match the shape expected by CharacteristicsAndAbilitiesTab
const DEFAULT_CHARACTER = {
  id: 'test-character-id',
  name: 'Test Character',
  age: 25,
  character_type: 'magus',
  // Individual characteristics used directly by component
  strength: 0,
  stamina: 0,
  dexterity: 0,
  quickness: 0,
  intelligence: 0,
  presence: 0,
  communication: 0,
  perception: 0,
  total_improvement_points: 7,
  use_cunning: false,
  general_exp_available: 45,
  magical_exp_available: 30,
  restricted_exp_pools: {
    'ACADEMIC': 15
  },
  virtues: [],
  flaws: [],
  abilities: [],
  house: null
};

// Provider component
export const CharacterProvider = ({ children, mockData = {} }) => {
  // Component state
  const [character, setCharacter] = useState({
    ...DEFAULT_CHARACTER,
    ...mockData
  });
  const [serverCharacter, setServerCharacter] = useState({
    ...DEFAULT_CHARACTER,
    ...mockData
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get effective character as used by the component
  const getEffectiveCharacter = useCallback(() => {
    return character;
  }, [character]);

  // Mock methods with expected interfaces
  const updateCharacter = jest.fn((updateFn, updateData = {}) => {
    // Apply update function
    const updatedChar = updateFn(character);
    setCharacter(updatedChar);
    
    // Return promise that resolves to updated character
    return Promise.resolve({
      data: {
        status: 'success',
        data: updatedChar
      }
    });
  });

  const fetchCharacter = jest.fn(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCharacter(curr => ({ ...curr, ...mockData }));
      setServerCharacter(curr => ({ ...curr, ...mockData }));
    }, 10);
    return Promise.resolve();
  });
  
  // Add missing methods for pending operations with proper implementation
  const isOperationPending = jest.fn((predicate) => {
    // If called with a function, execute it to determine if operation is pending
    if (typeof predicate === 'function') {
      // Always return false in tests
      return false;
    }
    // Support legacy interface where operationType and metadata were separate params
    return false;
  });

  const getAllPendingOperations = jest.fn(() => {
    return []; // Default mock implementation - no pending operations
  });
  
  const getPendingOperations = jest.fn(() => {
    return []; // Default mock implementation - no filtered operations
  });
  
  const getPendingExperienceChanges = jest.fn(() => {
    return {}; // Default mock implementation - no pending experience changes
  });

  // Context value matching the shape expected by CharacteristicsAndAbilitiesTab
  const value = {
    character: getEffectiveCharacter(),
    serverCharacter,
    isLoading: loading,
    error,
    updateCharacter,
    fetchCharacter,
    isOperationPending,
    getAllPendingOperations,
    getPendingOperations,
    getPendingExperienceChanges,
    hasPendingOperations: false,
    pendingExperienceChanges: {}
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

// Hook to use the context
export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
};

export default CharacterProvider;