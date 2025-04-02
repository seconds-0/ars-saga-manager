import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useQueryClient } from 'react-query';
import { useCharacter } from '../contexts/CharacterProvider';
import useOptimisticUpdate from './useOptimisticUpdate';
import useBatchRequests from './useBatchRequests';

function useAbilities(characterId) {
  // Helper for debugging
  const debug = (...args) => console.log('[useAbilities]', ...args);
  const [abilities, setAbilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Get the character context for optimistic updates
  const { character, updateCharacter } = useCharacter();
  
  // Set up optimistic updates for abilities
  const { 
    performOptimisticUpdate, 
    isOperationPending, 
    getAllPendingOperations 
  } = useOptimisticUpdate({
    onSuccess: (result, metadata) => {
      // On successful ability update, refresh ability data
      if (metadata.type === 'abilityUpdate' || metadata.type === 'abilityIncrement' || 
          metadata.type === 'abilityDecrement') {
        // Abilities are already updated optimistically, no need to fetch again
        console.log(`Ability ${metadata.abilityId} updated successfully:`, result);
      }
    },
    onError: (error, metadata) => {
      setError(`Error ${metadata.operation} ability: ${error.message}`);
    }
  });
  
  // Get the query client for invalidating queries
  const queryClient = useQueryClient();
  
  // Set up batch requests hook
  const batchRequests = useBatchRequests({
    batchWindow: 200, // 200ms collection window
    maxBatchSize: 10,  // Max 10 operations per batch
    onSuccess: (results) => {
      // Process successful batch operations
      console.log('Batch operations succeeded:', results);
      
      // Update local state with the results
      const abilityUpdates = {};
      
      results.forEach(result => {
        if (result.success && result.data) {
          abilityUpdates[result.abilityId] = result.data;
        }
      });
      
      // Update abilities that have new data
      if (Object.keys(abilityUpdates).length > 0) {
        setAbilities(prev => prev.map(ability => {
          if (abilityUpdates[ability.id]) {
            return {
              ...ability,
              ...abilityUpdates[ability.id]
            };
          }
          return ability;
        }));
      }
      
      // Invalidate character query to refresh experience
      queryClient.invalidateQueries(['character', characterId]);
    },
    onError: (errors) => {
      // Process batch operation errors
      console.error('Batch operations failed:', errors);
      
      // Construct error message from first error or a summary
      let errorMessage = 'Error updating abilities';
      
      if (errors.length === 1) {
        errorMessage = `Error: ${errors[0].error}`;
      } else if (errors.length > 1) {
        errorMessage = `Multiple errors (${errors.length}) updating abilities`;
      }
      
      setError(errorMessage);
      
      // Roll back any optimistic updates that failed
      errors.forEach(err => {
        if (err.metadata && err.metadata.rollback) {
          err.metadata.rollback();
        }
      });
    }
  });

  // Fetch abilities for the character
  const fetchAbilities = useCallback(async () => {
    if (!characterId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Log the URL for debugging
      console.log(`Fetching abilities from: /characters/${characterId}/abilities`);
      
      const response = await axios.get(`/characters/${characterId}/abilities`);
      
      // Log the response for debugging
      console.log("Abilities API response:", response);
      
      if (response.data.status === 'success') {
        const abilities = response.data.data;
        console.log("Debug - Abilities data received:", abilities);
        
        // Check for any abilities with large discrepancies between score and effective_score
        abilities.forEach(ability => {
          if (ability.effective_score !== null && 
              Math.abs(ability.effective_score - ability.score) > 5) {
            console.warn(`Large score discrepancy for ${ability.ability_name}:`, 
                        `base=${ability.score}, effective=${ability.effective_score}`);
          }
        });
        
        setAbilities(abilities);
      } else {
        setError('Failed to load abilities');
      }
    } catch (err) {
      setError('Error fetching abilities: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  // Initial load of abilities
  useEffect(() => {
    fetchAbilities();
  }, [fetchAbilities]);

  // Add a new ability
  const addAbility = async (newAbility) => {
    if (!characterId) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await axios.post(`/characters/${characterId}/abilities`, newAbility);
      
      if (response.data.status === 'success') {
        // Refresh the abilities list
        await fetchAbilities();
        
        // Also invalidate and refetch character data to update XP display
        queryClient.invalidateQueries(['character', characterId]);
        queryClient.refetchQueries(['character', characterId], { 
          active: true,
          inactive: true
        });
        
        return true;
      } else {
        setError('Failed to add ability');
        return false;
      }
    } catch (err) {
      setError('Error adding ability: ' + (err.response?.data?.message || err.message));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Update an ability
  const updateAbility = async (abilityId, updates) => {
    if (!characterId || !abilityId) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await axios.put(`/characters/${characterId}/abilities/${abilityId}`, updates);
      
      if (response.data.status === 'success') {
        // Update the ability in the local state
        setAbilities(prevAbilities => 
          prevAbilities.map(ability => 
            ability.id === abilityId ? { ...ability, ...response.data.data } : ability
          )
        );
        
        // Invalidate character query to refresh the available XP display
        queryClient.invalidateQueries(['character', characterId]);
        
        // Force an immediate refetch to get the updated experience values
        queryClient.refetchQueries(['character', characterId], { 
          active: true,
          inactive: true
        });
        
        return true;
      } else {
        setError('Failed to update ability');
        return false;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      
      // Check for specific error conditions
      if (err.response?.status === 400 && err.response?.data?.message === 'Insufficient Experience') {
        setError(`Not enough experience points available (${err.response?.data?.details?.available || 0} available, ${err.response?.data?.details?.required || 0} required)`);
      } else {
        setError('Error updating ability: ' + errorMsg);
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Delete an ability
  const deleteAbility = async (abilityId) => {
    if (!characterId || !abilityId) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      const response = await axios.delete(`/characters/${characterId}/abilities/${abilityId}`);
      
      if (response.data.status === 'success') {
        // Remove the ability from the local state
        setAbilities(prevAbilities => 
          prevAbilities.filter(ability => ability.id !== abilityId)
        );
        
        // Also invalidate and refetch character data to update XP display
        // This would be important if the backend refunds XP when abilities are deleted
        queryClient.invalidateQueries(['character', characterId]);
        queryClient.refetchQueries(['character', characterId], { 
          active: true,
          inactive: true
        });
        
        return true;
      } else {
        setError('Failed to delete ability');
        return false;
      }
    } catch (err) {
      setError('Error deleting ability: ' + (err.response?.data?.message || err.message));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Increment ability experience
  const incrementAbilityXP = async (abilityId, currentXP, amountToAdd = 1) => {
    // To prevent rapid double clicks, check if there's any pending operation for this ability
    // This includes any type of ability update (increment, decrement, or direct update)
    const isAbilityBeingModified = 
      isOperationPending(metadata => metadata.abilityId === abilityId) || 
      batchRequests.isOperationPending(metadata => metadata.abilityId === abilityId);
    
    if (isAbilityBeingModified) {
      console.log(`Operation already in progress for ability ${abilityId} - ignoring request`);
      return true; // Return true to avoid displaying errors
    }
    
    try {
      // Find the ability to get its current data
      const ability = abilities.find(a => a.id === abilityId);
      if (!ability) return false;
      
      // Make sure we have access to the character context
      if (!character) {
        console.error("Character data not available for XP update");
        setError("Unable to update ability: character data not available");
        return false;
      }
      
      // Calculate values for the operation
      const targetXP = currentXP + amountToAdd;
      
      // Determine if this XP increase should result in a score increase
      // Get current score from the ability object
      const currentScore = ability.score || 0;
      
      // Calculate XP thresholds for current and next score levels
      const currentScoreXP = calculateXPForTargetScore(currentScore);
      const nextScoreXP = calculateXPForTargetScore(currentScore + 1);
      
      // Check if the new XP crosses the threshold for the next level
      const newScore = (targetXP >= nextScoreXP) ? (currentScore + 1) : currentScore;
      
      console.log(`XP Increment for ${ability.ability_name}: ${currentXP} -> ${targetXP}`);
      console.log(`Score threshold: current(${currentScore}): ${currentScoreXP}, next(${currentScore + 1}): ${nextScoreXP}`);
      if (newScore > currentScore) {
        console.log(`Score will increase from ${currentScore} to ${newScore}`);
      }
      
      // Track which XP pool will be affected (simplified for now - always use general)
      const experienceChanges = { general_exp_available: -amountToAdd };
      
      // Update the ability in our local state with both XP and score
      const updateAbilityState = () => {
        setAbilities(prev => {
          return prev.map(a => {
            if (a.id === abilityId) {
              // Calculate the bonus (if any) from effective_score
              const bonus = (a.effective_score !== null && a.effective_score !== undefined) 
                ? a.effective_score - a.score 
                : 0;
              
              // Apply the same bonus to the new score for effective_score
              const newEffectiveScore = (newScore !== currentScore && bonus !== 0) 
                ? newScore + bonus 
                : (newScore !== currentScore) ? newScore : a.effective_score;
              
              console.log(`Optimistic update for ${a.ability_name}: score ${a.score}->${newScore}, effective ${a.effective_score}->${newEffectiveScore}`);
              
              return { 
                ...a, 
                score: newScore, 
                effective_score: newEffectiveScore,
                experience_points: targetXP 
              };
            }
            return a;
          });
        });
      };
      
      // Update character XP optimistically
      const updateCharacterXP = () => {
        updateCharacter(
          // Update function
          (character) => {
            // Update general XP (simplified version - in real implementation, we would handle multiple XP pools)
            return {
              ...character,
              general_exp_available: character.general_exp_available - amountToAdd
            };
          },
          // Don't send XP data to server - ability update will handle that
          {},
          // Metadata
          {
            type: 'spendExperience',
            experienceChanges,
            abilityId,
            abilityName: ability.ability_name
          }
        );
      };
      
      // Rollback function in case of error
      const rollbackState = () => {
        // Restore the original ability state with both XP and score
        setAbilities(prev => 
          prev.map(a => a.id === abilityId 
            ? { ...a, score: currentScore, experience_points: currentXP } 
            : a
          )
        );
      };
      
      // Apply optimistic updates
      updateAbilityState();
      updateCharacterXP();
      
      // Add to batch request
      batchRequests.addUpdateOperation(
        characterId,
        abilityId,
        { 
          score: newScore,
          experience_points: targetXP 
        },
        {
          type: 'abilityUpdate',
          abilityId,
          abilityName: ability.ability_name,
          operation: 'incrementXP',
          originalScore: currentScore,
          originalXP: currentXP,
          targetScore: newScore,
          targetXP,
          experienceChanges,
          rollback: rollbackState
        }
      );
      
      return true;
    } catch (err) {
      setError('Error incrementing XP: ' + (err.response?.data?.message || err.message));
      return false;
    }
  };

  // Decrement ability experience (only if allowed by backend)
  const decrementAbilityXP = async (abilityId, currentXP, amountToSubtract = 1) => {
    if (currentXP <= 0 || amountToSubtract > currentXP) return true; // Already at minimum or would go below 0
    
    // To prevent rapid double clicks, check if there's any pending operation for this ability
    // This includes any type of ability update (increment, decrement, or direct update)
    const isAbilityBeingModified = 
      isOperationPending(metadata => metadata.abilityId === abilityId) || 
      batchRequests.isOperationPending(metadata => metadata.abilityId === abilityId);
    
    if (isAbilityBeingModified) {
      console.log(`Operation already in progress for ability ${abilityId} - ignoring request`);
      return true; // Return true to avoid displaying errors
    }
    
    try {
      // Find the ability to get its current data
      const ability = abilities.find(a => a.id === abilityId);
      if (!ability) return false;
      
      // Make sure we have access to the character context
      if (!character) {
        console.error("Character data not available for XP update");
        setError("Unable to update ability: character data not available");
        return false;
      }
      
      // Calculate values for the operation
      const targetXP = currentXP - amountToSubtract;
      
      // Determine if this XP decrease should result in a score decrease
      // Get current score from the ability object
      const currentScore = ability.score || 0;
      
      // Calculate XP thresholds for current and previous score levels
      const currentScoreXP = calculateXPForTargetScore(currentScore);
      const prevScoreXP = currentScore > 0 ? calculateXPForTargetScore(currentScore - 1) : 0;
      
      // Check if the new XP drops below the threshold for the current level
      const newScore = (targetXP < currentScoreXP && targetXP >= prevScoreXP) ? (currentScore - 1) : currentScore;
      
      console.log(`XP Decrement for ${ability.ability_name}: ${currentXP} -> ${targetXP}`);
      console.log(`Score thresholds: current(${currentScore}): ${currentScoreXP}, prev(${currentScore - 1}): ${prevScoreXP}`);
      if (newScore < currentScore) {
        console.log(`Score will decrease from ${currentScore} to ${newScore}`);
      }
      
      // Track which XP pool will be affected (simplified for now - always refund to general)
      const experienceChanges = { general_exp_available: amountToSubtract };
      
      // Update the ability in our local state with both XP and score
      const updateAbilityState = () => {
        setAbilities(prev => {
          return prev.map(a => {
            if (a.id === abilityId) {
              // Calculate the bonus (if any) from effective_score
              const bonus = (a.effective_score !== null && a.effective_score !== undefined) 
                ? a.effective_score - a.score 
                : 0;
              
              // Apply the same bonus to the new score for effective_score
              const newEffectiveScore = (newScore !== currentScore && bonus !== 0) 
                ? newScore + bonus 
                : (newScore !== currentScore) ? newScore : a.effective_score;
              
              console.log(`Optimistic update for ${a.ability_name}: score ${a.score}->${newScore}, effective ${a.effective_score}->${newEffectiveScore}`);
              
              return { 
                ...a, 
                score: newScore, 
                effective_score: newEffectiveScore,
                experience_points: targetXP 
              };
            }
            return a;
          });
        });
      };
      
      // Update character XP optimistically
      const updateCharacterXP = () => {
        updateCharacter(
          // Update function
          (character) => {
            // Refund to general XP (simplified - in real implementation, handle multiple pools)
            return {
              ...character,
              general_exp_available: character.general_exp_available + amountToSubtract
            };
          },
          // Don't send XP data to server - ability update will handle that
          {},
          // Metadata
          {
            type: 'refundExperience',
            experienceChanges,
            abilityId,
            abilityName: ability.ability_name
          }
        );
      };
      
      // Rollback function in case of error
      const rollbackState = () => {
        // Restore the original ability state with both XP and score
        setAbilities(prev => 
          prev.map(a => a.id === abilityId 
            ? { ...a, score: currentScore, experience_points: currentXP } 
            : a
          )
        );
      };
      
      // Apply optimistic updates
      updateAbilityState();
      updateCharacterXP();
      
      // Add to batch request
      batchRequests.addUpdateOperation(
        characterId,
        abilityId,
        { 
          score: newScore,
          experience_points: targetXP 
        },
        {
          type: 'abilityUpdate',
          abilityId,
          abilityName: ability.ability_name,
          operation: 'decrementXP',
          originalScore: currentScore,
          originalXP: currentXP,
          targetScore: newScore,
          targetXP,
          experienceChanges,
          rollback: rollbackState
        }
      );
      
      return true;
    } catch (err) {
      setError('Error decrementing XP: ' + (err.response?.data?.message || err.message));
      return false;
    }
  };
  
  // Calculate XP needed to reach a specific score
  const calculateXPForTargetScore = (targetScore) => {
    if (targetScore <= 0) return 0;
    
    let totalXP = 0;
    let increment = 5;
    
    for (let i = 1; i <= targetScore; i++) {
      totalXP += increment;
      increment += 5;
    }
    
    return totalXP;
  };

  /**
   * Calculate available XP for a specific ability
   * @param {Object} character Character data
   * @param {Object} ability Ability data
   * @returns {number} Total available XP
   */
  const calculateAvailableXP = useCallback((character, ability) => {
    if (!character) return 0;
    
    let totalAvailableXP = 0;
    
    // Add general XP
    totalAvailableXP += character.general_exp_available || 0;
    
    // Add magical XP if applicable
    if (character.character_type?.toLowerCase() === 'magus' && 
        (ability.category === 'ARCANE' || ability.category === 'SUPERNATURAL')) {
      totalAvailableXP += character.magical_exp_available || 0;
    }
    
    // Add any relevant restricted pools
    if (character.restricted_exp_pools && Array.isArray(character.restricted_exp_pools)) {
      character.restricted_exp_pools.forEach(pool => {
        if (pool.restrictions) {
          const { type, value } = pool.restrictions;
          const canUsePool = 
            (type === 'ability_name' && value === ability.ability_name) ||
            (type === 'ability_list' && Array.isArray(value) && value.includes(ability.ability_name)) ||
            (type === 'category' && value === ability.category);
            
          if (canUsePool) {
            totalAvailableXP += (pool.amount - (pool.spent || 0));
          }
        }
      });
    }
    
    return totalAvailableXP;
  }, []);

  // Increment ability score by 1 level with optimistic updates
  const incrementAbility = async (abilityId, currentScore, currentXP) => {
    // Find the ability to get its current data
    const ability = abilities.find(a => a.id === abilityId);
    if (!ability) return false;
    
    // To prevent rapid double clicks, check if there's any pending operation for this ability
    // This includes any type of ability update (increment, decrement, or direct update)
    const isAbilityBeingModified = 
      isOperationPending(metadata => metadata.abilityId === abilityId) || 
      batchRequests.isOperationPending(metadata => metadata.abilityId === abilityId);
    
    if (isAbilityBeingModified) {
      debug(`Operation already in progress for ability ${abilityId} - ignoring request`);
      return true; // Return true to avoid displaying errors
    }
    
    // Make sure we have access to the character context
    if (!character) {
      console.error("Character data not available for XP update");
      setError("Unable to update ability: character data not available");
      return false;
    }
    
    // Calculate values for the operation
    const targetScore = currentScore + 1;
    const targetXP = calculateXPForTargetScore(targetScore);
    const xpNeeded = targetXP - currentXP;
    
    console.log(`Incrementing ${ability.ability_name} from score ${currentScore} (${currentXP} XP) to score ${targetScore} (${targetXP} XP)`);
    console.log(`XP needed: ${xpNeeded}`);
    
    // Pre-validate that we have enough XP
    const availableXP = calculateAvailableXP(character, ability);
    if (availableXP < xpNeeded) {
      setError(`Not enough experience points available (${availableXP} available, ${xpNeeded} required)`);
      return false;
    }
    
    // Track which XP pool will be affected (simplified for now - always use general)
    // In a real implementation, we would need logic to determine which pools to use
    const experienceChanges = { general_exp_available: -xpNeeded };
    
    try {
      // First, perform the optimistic UI update
      const updateAbilityState = () => {
        // Update the ability in our local state with both XP and score
        // Also preserve the effective_score relationship if there's a bonus
        setAbilities(prev => {
          return prev.map(a => {
            if (a.id === abilityId) {
              // Calculate the bonus (if any) from effective_score
              const bonus = (a.effective_score !== null && a.effective_score !== undefined) 
                ? a.effective_score - a.score 
                : 0;
              
              // Apply the same bonus to the new score for effective_score
              const newEffectiveScore = bonus !== 0 ? targetScore + bonus : targetScore;
              
              console.log(`Optimistic update for ${a.ability_name}: score ${a.score}->${targetScore}, effective ${a.effective_score}->${newEffectiveScore}`);
              
              return { 
                ...a, 
                score: targetScore, 
                effective_score: newEffectiveScore,
                experience_points: targetXP 
              };
            }
            return a;
          });
        });
      };
      
      // Update character XP optimistically
      const updateCharacterXP = () => {
        updateCharacter(
          // Update function for local state
          (character) => {
            // Update general XP (simplified version)
            return {
              ...character,
              general_exp_available: character.general_exp_available - xpNeeded
            };
          },
          // Don't send XP data to server - ability update will handle that
          {}, 
          // Metadata
          {
            type: 'spendExperience',
            experienceChanges,
            abilityId,
            abilityName: ability.ability_name
          }
        );
      };
      
      // Rollback function in case of error
      const rollbackState = () => {
        // Restore the original ability state with both XP and score
        setAbilities(prev => 
          prev.map(a => a.id === abilityId 
            ? { ...a, score: currentScore, experience_points: currentXP } 
            : a
          )
        );
        
        // Character XP state will be rolled back by the Character context
      };
      
      // Apply the optimistic updates
      updateAbilityState();
      updateCharacterXP();
      
      // Add the operation to the batch queue
      batchRequests.addIncrementOperation(characterId, abilityId, {
        type: 'abilityIncrement',
        abilityId,
        abilityName: ability.ability_name,
        originalScore: currentScore,
        originalXP: currentXP,
        targetScore,
        targetXP,
        experienceChanges,
        rollback: rollbackState
      });
      
      return true;
    } catch (error) {
      console.error('Error incrementing ability:', error);
      return false;
    }
  };

  // Decrement ability score with optimistic updates
  const decrementAbility = async (abilityId, currentScore, currentXP) => {
    if (currentScore <= 0) return true; // Already at minimum
    
    // Find the ability
    const ability = abilities.find(a => a.id === abilityId);
    if (!ability) return false;
    
    // To prevent rapid double clicks, check if there's any pending operation for this ability
    // This includes any type of ability update (increment, decrement, or direct update)
    const isAbilityBeingModified = 
      isOperationPending(metadata => metadata.abilityId === abilityId) || 
      batchRequests.isOperationPending(metadata => metadata.abilityId === abilityId);
    
    if (isAbilityBeingModified) {
      debug(`Operation already in progress for ability ${abilityId} - ignoring request`);
      return true; // Return true to avoid displaying errors
    }
    
    // Make sure we have access to the character context
    if (!character) {
      console.error("Character data not available for XP update");
      setError("Unable to update ability: character data not available");
      return false;
    }
    
    // Calculate values for the operation
    const targetScore = currentScore - 1;
    const targetXP = calculateXPForTargetScore(targetScore);
    const xpRefund = currentXP - targetXP;
    
    console.log(`Decrementing ${ability.ability_name} from score ${currentScore} (${currentXP} XP) to score ${targetScore} (${targetXP} XP)`);
    console.log(`XP refund: ${xpRefund}`);
    
    // Track which XP pool will be affected (simplified for now - always refund to general)
    const experienceChanges = { general_exp_available: xpRefund };
    
    try {
      // First, perform the optimistic UI update
      const updateAbilityState = () => {
        // Update the ability in our local state with both XP and score
        // Also preserve the effective_score relationship if there's a bonus
        setAbilities(prev => {
          return prev.map(a => {
            if (a.id === abilityId) {
              // Calculate the bonus (if any) from effective_score
              const bonus = (a.effective_score !== null && a.effective_score !== undefined) 
                ? a.effective_score - a.score 
                : 0;
              
              // Apply the same bonus to the new score for effective_score
              const newEffectiveScore = bonus !== 0 ? targetScore + bonus : targetScore;
              
              console.log(`Optimistic update for ${a.ability_name}: score ${a.score}->${targetScore}, effective ${a.effective_score}->${newEffectiveScore}`);
              
              return { 
                ...a, 
                score: targetScore, 
                effective_score: newEffectiveScore,
                experience_points: targetXP 
              };
            }
            return a;
          });
        });
      };
      
      // Update character XP optimistically
      const updateCharacterXP = () => {
        updateCharacter(
          // Update function
          (character) => {
            // Refund to general XP (simplified)
            return {
              ...character,
              general_exp_available: character.general_exp_available + xpRefund
            };
          },
          // Don't send XP data to server - ability update will handle that
          {},
          // Metadata
          {
            type: 'refundExperience',
            experienceChanges,
            abilityId,
            abilityName: ability.ability_name
          }
        );
      };
      
      // Rollback function in case of error
      const rollbackState = () => {
        // Restore the original ability state with both XP and score
        setAbilities(prev => 
          prev.map(a => a.id === abilityId 
            ? { ...a, score: currentScore, experience_points: currentXP } 
            : a
          )
        );
        
        // Character XP state will be rolled back by the Character context
      };
      
      // Apply the optimistic updates
      updateAbilityState();
      updateCharacterXP();
      
      // Add the operation to the batch queue
      batchRequests.addDecrementOperation(characterId, abilityId, {
        type: 'abilityDecrement',
        abilityId,
        abilityName: ability.ability_name,
        originalScore: currentScore,
        originalXP: currentXP,
        targetScore,
        targetXP,
        experienceChanges,
        rollback: rollbackState
      });
      
      return true;
    } catch (error) {
      console.error('Error decrementing ability:', error);
      return false;
    }
  };

  // Update ability specialty
  const updateSpecialty = async (abilityId, specialty) => {
    return updateAbility(abilityId, { specialty });
  };

  return {
    abilities,
    loading,
    error,
    isSaving,
    fetchAbilities,
    addAbility,
    updateAbility,
    deleteAbility,
    incrementAbility,
    decrementAbility,
    incrementAbilityXP,
    decrementAbilityXP,
    updateSpecialty
  };
}

export default useAbilities;