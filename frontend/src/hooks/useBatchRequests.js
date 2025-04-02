import { useState, useRef, useCallback, useEffect } from 'react';
import api from '../api/axios';

/**
 * Hook for batching API requests to avoid rate limiting
 * 
 * This hook collects API operations into batches and sends them to the server,
 * helping to avoid rate limiting issues while maintaining a responsive UI.
 * 
 * @param {Object} options Configuration options
 * @param {number} options.batchWindow Time in ms to collect operations before sending (default: 250ms)
 * @param {number} options.maxBatchSize Maximum operations in a single batch (default: 5)
 * @param {Function} options.onSuccess Callback when operations succeed
 * @param {Function} options.onError Callback when operations fail
 * @returns {Object} Batch request utilities
 */
function useBatchRequests(options = {}) {
  const {
    batchWindow = 250,
    maxBatchSize = 5,
    onSuccess,
    onError
  } = options;
  
  // Queue for storing pending operations
  const [queue, setQueue] = useState([]);
  
  // Track if a batch is currently being processed
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  
  // Track pending operations by ID
  const [pendingOperations, setPendingOperations] = useState({});

  // Store timers for cleanup
  const batchTimerRef = useRef(null);
  
  // Track retry counts for each operation
  const retryCountRef = useRef({});
  const MAX_RETRIES = 2;
  
  // For debugging
  const debugMode = true;
  const debug = (...args) => {
    if (debugMode) {
      console.log('[BatchRequests]', ...args);
    }
  };
  
  /**
   * Process a single operation
   * Handles sending the request and processing the result
   * 
   * @param {Object} operation The operation to process
   * @returns {Promise<Object>} The result of the operation
   */
  const processSingleOperation = useCallback(async (operation) => {
    const { endpoint, resourceId, action, data, metadata } = operation;
    const operationId = metadata?.operationId;
    
    // Format the operation for the API
    const formattedOperation = {
      abilityId: resourceId,
      action,
      data
    };
    
    debug(`Processing operation: ${action} for resource ${resourceId}`);
    
    try {
      // Make sure we use the correct path format (don't duplicate /api)
      // Ensure consistent path handling:
      // 1. If it starts with '/', use it as is
      // 2. Otherwise, add a '/' prefix
      // This makes our tests more reliable and consistent
      const endpointPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      // Send the request with a shorter timeout
      // Using explicit payload format to ensure consistency
      const payload = {
        operations: [formattedOperation],
        allOrNothing: false
      };
      
      const config = {
        timeout: 5000 // 5 second timeout
      };
      
      const response = await api.post(endpointPath, payload, config);
      
      // Process the result
      if (response.data && response.data.status === 'success') {
        debug(`Request to ${endpoint} succeeded`);
        
        // Get the result (should be just one)
        const result = response.data.results[0];
        
        // Call appropriate callback
        if (result.success && onSuccess) {
          onSuccess([{
            ...result,
            metadata
          }]);
        } else if (!result.success && onError) {
          onError([{
            ...result,
            metadata
          }]);
        }
        
        return { 
          success: true, 
          result: {
            ...result,
            metadata
          }
        };
      } else {
        throw new Error(response.data?.message || 'Request failed with unknown error');
      }
    } catch (error) {
      debug(`Request failed: ${error.message}`);
      
      // Call error callback
      if (onError) {
        onError([{
          abilityId: resourceId,
          action,
          success: false,
          error: error.message || 'Error in request',
          metadata
        }]);
      }
      
      return { 
        success: false, 
        error,
        metadata
      };
    }
  }, [onSuccess, onError]);
  
  /**
   * Process operations in the queue
   */
  const processBatch = useCallback(async () => {
    // Clear any existing timer
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
      batchTimerRef.current = null;
    }
    
    // If no operations or already processing, exit early
    if (queue.length === 0) {
      debug('No operations to process, skipping batch');
      return;
    }
    
    if (isBatchProcessing) {
      debug('Already processing a batch, skipping');
      return;
    }
    
    // Set processing flag to prevent concurrent batches
    setIsBatchProcessing(true);
    
    try {
      // Get a copy of the operations to process (up to maxBatchSize)
      const operationsToProcess = [...queue].slice(0, maxBatchSize);
      debug(`Processing batch of ${operationsToProcess.length} operations`);
      
      // Remove these operations from the queue
      setQueue(prev => prev.slice(operationsToProcess.length));
      
      // Process each operation one by one for stability
      // This is more reliable than trying to batch them all in a single request
      for (const operation of operationsToProcess) {
        const operationId = operation.metadata?.operationId;
        
        // Skip operations that have been retried too many times
        if (operationId && retryCountRef.current[operationId] >= MAX_RETRIES) {
          debug(`Operation ${operationId} has been retried ${retryCountRef.current[operationId]} times, abandoning`);
          
          // Remove from pending operations
          setPendingOperations(prev => {
            const newPending = { ...prev };
            delete newPending[operationId];
            return newPending;
          });
          
          // Clear retry count
          delete retryCountRef.current[operationId];
          
          continue;
        }
        
        // Increment retry count
        if (operationId) {
          retryCountRef.current[operationId] = (retryCountRef.current[operationId] || 0) + 1;
        }
        
        // Process this operation
        const result = await processSingleOperation(operation);
        
        // If successful, clean up
        if (result.success) {
          // Remove from pending operations
          if (operationId) {
            setPendingOperations(prev => {
              const newPending = { ...prev };
              delete newPending[operationId];
              return newPending;
            });
            
            // Clear retry count
            delete retryCountRef.current[operationId];
          }
        } else {
          // On failure, check if we should retry based on error type
          const isRetryableError = 
            result.error?.code === 'ECONNABORTED' || 
            result.error?.code === 'ERR_NETWORK' ||
            result.error?.message?.includes('timeout');
          
          // If not retryable or max retries reached, clean up
          if (!isRetryableError || !operationId || retryCountRef.current[operationId] >= MAX_RETRIES) {
            if (operationId) {
              setPendingOperations(prev => {
                const newPending = { ...prev };
                delete newPending[operationId];
                return newPending;
              });
              
              // Clear retry count if done with this operation
              delete retryCountRef.current[operationId];
            }
          }
        }
      }
    } finally {
      // Clear processing flag
      setIsBatchProcessing(false);
      
      // Schedule next batch if needed with a delay
      setTimeout(() => {
        if (queue.length > 0) {
          debug(`Scheduling next batch with ${queue.length} operations remaining`);
          scheduleBatch();
        }
      }, 100); // Small delay to let React state updates settle
    }
  }, [queue, isBatchProcessing, maxBatchSize, processSingleOperation]);
  
  /**
   * Schedule a batch to be processed
   */
  const scheduleBatch = useCallback(() => {
    // If already scheduled or processing, do nothing
    if (batchTimerRef.current) {
      return;
    }
    
    if (isBatchProcessing) {
      return;
    }
    
    debug(`Scheduling batch processing in ${batchWindow}ms`);
    
    // Start a new timer
    batchTimerRef.current = setTimeout(() => {
      batchTimerRef.current = null;
      processBatch();
    }, batchWindow);
  }, [batchWindow, processBatch, isBatchProcessing]);
  
  /**
   * Add an operation to the batch queue
   * @param {Object} operation The operation to add
   * @returns {string} The operation ID
   */
  const addOperation = useCallback((operation) => {
    // Generate a unique operation ID
    const operationId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    
    debug(`Adding operation: ${operation.action} for resource ${operation.resourceId}`);
    
    // Enhanced operation with metadata
    const enhancedOperation = {
      ...operation,
      metadata: {
        ...(operation.metadata || {}),
        operationId,
        timestamp: Date.now()
      }
    };
    
    // SAFETY: Check for any operations for this resource that are already pending
    const pendingOpsForResource = Object.values(pendingOperations).filter(op => 
      op.resourceId === operation.resourceId
    );
    
    // If any operations for this resource are pending, skip this one
    if (pendingOpsForResource.length > 0) {
      debug(`Throttling: Operation for resource ${operation.resourceId} skipped (operation pending)`);
      return pendingOpsForResource[0].metadata.operationId;
    }
    
    // Add to queue, replacing existing operations for the same resource
    setQueue(prevQueue => {
      // Make a copy of the queue
      const newQueue = [...prevQueue];
      
      // Check for existing operation for the same resource
      const existingIndex = newQueue.findIndex(op => 
        op.resourceId === operation.resourceId
      );
      
      if (existingIndex >= 0) {
        // Replace existing operation
        debug(`Replacing existing operation for resource ${operation.resourceId}`);
        newQueue[existingIndex] = enhancedOperation;
      } else {
        // Add as new operation
        newQueue.push(enhancedOperation);
      }
      
      return newQueue;
    });
    
    // Add to pending operations
    setPendingOperations(prev => ({
      ...prev,
      [operationId]: enhancedOperation
    }));
    
    // Schedule processing
    scheduleBatch();
    
    return operationId;
  }, [scheduleBatch, pendingOperations]);
  
  /**
   * Add an ability increment operation to the batch
   * @param {string} characterId Character ID
   * @param {string} abilityId Ability ID to increment
   * @param {Object} metadata Additional metadata
   * @returns {string} Operation ID
   */
  const addIncrementOperation = useCallback((characterId, abilityId, metadata = {}) => {
    return addOperation({
      endpoint: `characters/${characterId}/abilities/batch`, // No leading slash
      resourceId: abilityId,
      action: 'increment',
      data: null,
      metadata
    });
  }, [addOperation]);
  
  /**
   * Add an ability decrement operation to the batch
   * @param {string} characterId Character ID
   * @param {string} abilityId Ability ID to decrement
   * @param {Object} metadata Additional metadata
   * @returns {string} Operation ID
   */
  const addDecrementOperation = useCallback((characterId, abilityId, metadata = {}) => {
    return addOperation({
      endpoint: `characters/${characterId}/abilities/batch`, // No leading slash
      resourceId: abilityId,
      action: 'decrement',
      data: null,
      metadata
    });
  }, [addOperation]);
  
  /**
   * Add an ability update operation to the batch
   * @param {string} characterId Character ID
   * @param {string} abilityId Ability ID to update
   * @param {Object} data Update data
   * @param {Object} metadata Additional metadata
   * @returns {string} Operation ID
   */
  const addUpdateOperation = useCallback((characterId, abilityId, data, metadata = {}) => {
    return addOperation({
      endpoint: `characters/${characterId}/abilities/batch`, // No leading slash
      resourceId: abilityId,
      action: 'update',
      data,
      metadata
    });
  }, [addOperation]);
  
  /**
   * Check if an operation is pending for the given predicate
   * @param {Function} predicateFn Function to test against metadata
   * @returns {boolean} True if the operation is pending
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
   * Force immediate processing of the current batch
   * @returns {Promise} Result of batch processing
   */
  const flushBatch = useCallback(() => {
    debug('Manually flushing batch queue');
    return processBatch();
  }, [processBatch]);
  
  // Clean up on mount/unmount
  useEffect(() => {
    // On mount, log init
    debug('Batch hook initialized');
    
    // Cleanup on unmount
    return () => {
      debug('Batch hook unmounting, cleaning up');
      
      // Clear any timers
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
        batchTimerRef.current = null;
      }
    };
  }, []);
  
  // Return public API
  return {
    addOperation,
    addIncrementOperation,
    addDecrementOperation,
    addUpdateOperation,
    isOperationPending,
    getAllPendingOperations,
    flushBatch,
    queueLength: queue.length,
    pendingOperationsCount: Object.keys(pendingOperations).length,
    isBatchProcessing
  };
}

export default useBatchRequests;