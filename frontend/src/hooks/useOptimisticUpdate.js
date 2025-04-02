import { useState, useCallback } from 'react';

/**
 * Hook for handling optimistic updates with automatic rollback on error
 * @param {Object} options Configuration options
 * @param {Function} options.onSuccess Function to call on successful update
 * @param {Function} options.onError Function to call on error
 * @param {number} options.retryCount Number of retries on network failure (default: 0)
 * @param {number} options.retryDelay Delay between retries in ms (default: 1000)
 * @returns {Object} Optimistic update utilities
 */
function useOptimisticUpdate(options = {}) {
  const {
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000
  } = options;

  // Track pending operations
  const [pendingOperations, setPendingOperations] = useState({});

  /**
   * Perform an optimistic update with automatic rollback on error
   * @param {Function} updateFn Function to update local state optimistically
   * @param {Function} apiFn Function that returns a promise for the API call
   * @param {Function} rollbackFn Function to restore previous state on error
   * @param {Object} metadata Additional data about the operation
   * @returns {Promise} Resolution of the API call
   */
  const performOptimisticUpdate = useCallback(async (
    updateFn,
    apiFn,
    rollbackFn,
    metadata = {}
  ) => {
    // Generate unique operation ID
    const operationId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    
    // Apply optimistic update immediately
    updateFn();
    
    // Track this operation as pending
    setPendingOperations(prev => ({
      ...prev,
      [operationId]: {
        id: operationId,
        startTime: Date.now(),
        metadata
      }
    }));
    
    // Helper for retry logic
    const executeWithRetry = async (retriesLeft) => {
      try {
        // Make the actual API call
        const result = await apiFn();
        
        // Remove from pending operations
        setPendingOperations(prev => {
          const { [operationId]: _, ...rest } = prev;
          return rest;
        });
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess(result, metadata);
        }
        
        return result;
      } catch (error) {
        // If we have retries left and it's a network error, retry
        if (retriesLeft > 0 && (error.message.includes('network') || error.code === 'ECONNABORTED')) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return executeWithRetry(retriesLeft - 1);
        }
        
        // No retries left or not a network error, perform rollback
        rollbackFn();
        
        // Remove from pending operations
        setPendingOperations(prev => {
          const { [operationId]: _, ...rest } = prev;
          return rest;
        });
        
        // Call error callback if provided
        if (onError) {
          onError(error, metadata);
        }
        
        throw error;
      }
    };
    
    // Start execution with retry logic
    return executeWithRetry(retryCount);
  }, [onSuccess, onError, retryCount, retryDelay]);

  /**
   * Check if a specific operation is pending based on metadata predicate
   * @param {Function} predicateFn Function that takes metadata and returns boolean
   * @returns {boolean} True if any matching operation is pending
   */
  const isOperationPending = useCallback((predicateFn) => {
    return Object.values(pendingOperations).some(op => predicateFn(op.metadata));
  }, [pendingOperations]);

  /**
   * Get all pending operations
   * @returns {Array} Array of pending operations
   */
  const getAllPendingOperations = useCallback(() => {
    return Object.values(pendingOperations);
  }, [pendingOperations]);

  /**
   * Get pending operations filtered by metadata predicate
   * @param {Function} predicateFn Function that takes metadata and returns boolean
   * @returns {Array} Filtered array of pending operations
   */
  const getPendingOperations = useCallback((predicateFn) => {
    return Object.values(pendingOperations).filter(op => predicateFn(op.metadata));
  }, [pendingOperations]);

  return {
    performOptimisticUpdate,
    isOperationPending,
    getAllPendingOperations,
    getPendingOperations,
    pendingOperationsCount: Object.keys(pendingOperations).length
  };
}

export default useOptimisticUpdate;