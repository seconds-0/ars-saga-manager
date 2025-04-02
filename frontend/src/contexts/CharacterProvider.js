import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import isEqual from 'lodash/isEqual';
import api from '../api/axios';
import useOptimisticUpdate from '../hooks/useOptimisticUpdate';

// Create context
const CharacterContext = createContext(null);

/**
 * Provider component for character data with optimistic updates
 */
export function CharacterProvider({ children }) {
  const { id: characterId } = useParams();
  const queryClient = useQueryClient();
  
  // Server state via React Query
  const { 
    data: serverCharacter, 
    isLoading: isServerLoading, 
    error: serverError,
    refetch: refetchCharacter
  } = useQuery(
    ['character', characterId], 
    () => api.get(`/characters/${characterId}`).then(res => res.data),
    {
      enabled: !!characterId,
      refetchOnWindowFocus: false,
      retry: 1
    }
  );
  
  // Local optimistic state
  const [optimisticCharacter, setOptimisticCharacter] = useState(null);
  
  // Set up optimistic update hook
  const { 
    performOptimisticUpdate, 
    isOperationPending, 
    getAllPendingOperations
  } = useOptimisticUpdate({
    onSuccess: () => {
      // Refetch to get the latest server state
      refetchCharacter();
    }
  });
  
  // Sync optimistic state with server state when it changes
  useEffect(() => {
    if (serverCharacter && (!optimisticCharacter || !isEqual(serverCharacter, optimisticCharacter))) {
      setOptimisticCharacter(serverCharacter);
    }
  }, [serverCharacter, optimisticCharacter]);
  
  /**
   * Update character data optimistically
   * @param {Function} updateFn Function to update optimistic state
   * @param {Object} updateData Data to send to the server
   * @param {Object} metadata Additional metadata about the operation
   * @returns {Promise} API call result
   */
  const updateCharacter = useCallback((updateFn, updateData, metadata = {}) => {
    if (!characterId || !optimisticCharacter) return Promise.reject(new Error('No character loaded'));
    
    // Check if updateData is empty - if so, we'll skip the API call but still update optimistic state
    const isEmpty = !updateData || Object.keys(updateData).length === 0;
    
    return performOptimisticUpdate(
      // Optimistic update function
      () => {
        // Update the local state with the update function
        const updatedChar = updateFn(optimisticCharacter);
        console.log('Character optimistically updated:', 
          updatedChar ? 
            `Available XP: ${updatedChar.general_exp_available || 0}` : 
            'No character data');
        setOptimisticCharacter(updatedChar);
      },
      // API call - if updateData is empty, resolve immediately with success to avoid server call
      () => {
        if (isEmpty) {
          // Skip the API call and return a mock success response
          console.log('Skipping character server update (no data to send)');
          return Promise.resolve({ 
            status: 'success', 
            data: { message: 'Optimistic update only - no server call needed' } 
          });
        }
        console.log('Sending character update to server:', updateData);
        return api.put(`/characters/${characterId}`, updateData);
      },
      // Rollback function
      () => {
        console.log('Rolling back optimistic character update');
        setOptimisticCharacter(serverCharacter);
      },
      // Metadata
      {
        type: 'characterUpdate',
        characterId,
        skipServerUpdate: isEmpty,
        ...metadata
      }
    );
  }, [characterId, optimisticCharacter, serverCharacter, performOptimisticUpdate]);
  
  /**
   * Get the total experience changes pending from operations
   * @returns {Object} Object with experience changes by pool type
   */
  const getPendingExperienceChanges = useCallback(() => {
    const operations = getAllPendingOperations();
    
    return operations.reduce((changes, op) => {
      const { type, experienceChanges } = op.metadata;
      
      // Only process operations with experience changes
      if (type && experienceChanges) {
        Object.entries(experienceChanges).forEach(([key, value]) => {
          changes[key] = (changes[key] || 0) + value;
        });
      }
      
      return changes;
    }, {});
  }, [getAllPendingOperations]);
  
  /**
   * Get character with pending experience changes applied
   * @returns {Object} Character with pending changes
   */
  const getEffectiveCharacter = useCallback(() => {
    if (!optimisticCharacter) return null;
    
    const pendingChanges = getPendingExperienceChanges();
    if (Object.keys(pendingChanges).length === 0) return optimisticCharacter;
    
    // Apply pending changes
    return {
      ...optimisticCharacter,
      // Apply specific experience pool changes
      general_exp_available: 
        (optimisticCharacter.general_exp_available || 0) + 
        (pendingChanges.general_exp_available || 0),
      magical_exp_available: 
        (optimisticCharacter.magical_exp_available || 0) + 
        (pendingChanges.magical_exp_available || 0),
      // Handle restricted pools if needed
      restricted_exp_pools: optimisticCharacter.restricted_exp_pools
        ? optimisticCharacter.restricted_exp_pools.map(pool => {
            const poolChange = pendingChanges[`restricted_pool_${pool.id}`];
            if (!poolChange) return pool;
            
            return {
              ...pool,
              spent: (pool.spent || 0) - poolChange // Note: changes are stored as positive for refunds
            };
          })
        : []
    };
  }, [optimisticCharacter, getPendingExperienceChanges]);
  
  // The value we're providing to consumers
  const value = {
    character: getEffectiveCharacter(),
    serverCharacter,
    isLoading: isServerLoading && !optimisticCharacter,
    error: serverError,
    updateCharacter,
    isOperationPending,
    getAllPendingOperations,
    hasPendingOperations: getAllPendingOperations().length > 0,
    pendingExperienceChanges: getPendingExperienceChanges()
  };
  
  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}

/**
 * Hook to access the character context
 * @returns {Object} Character context value
 */
export function useCharacter() {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within a CharacterProvider');
  }
  return context;
}

export default CharacterProvider;