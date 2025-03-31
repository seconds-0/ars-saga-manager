import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';

function useAbilities(characterId) {
  const [abilities, setAbilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

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
        setAbilities(response.data.data);
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
        return true;
      } else {
        setError('Failed to update ability');
        return false;
      }
    } catch (err) {
      setError('Error updating ability: ' + (err.response?.data?.message || err.message));
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
    return updateAbility(abilityId, { experience_points: currentXP + amountToAdd });
  };

  // Decrement ability experience (only if allowed by backend)
  const decrementAbilityXP = async (abilityId, currentXP, amountToSubtract = 1) => {
    if (currentXP <= 0 || amountToSubtract > currentXP) return true; // Already at minimum or would go below 0
    return updateAbility(abilityId, { experience_points: currentXP - amountToSubtract });
  };
  
  // Increment ability score by 1 level
  const incrementAbility = async (abilityId, currentScore, currentXP) => {
    // Find the ability to get its current data
    const ability = abilities.find(a => a.id === abilityId);
    if (!ability) return false;
    
    // Calculate XP needed for next level
    const xpForNextLevel = ability.xp_for_next_level || 5; // Default to 5 if not available
    
    return updateAbility(abilityId, { experience_points: currentXP + xpForNextLevel });
  };

  // Decrement ability score (only if allowed by backend)
  const decrementAbility = async (abilityId, currentScore, currentXP) => {
    if (currentScore <= 0) return true; // Already at minimum
    
    // This might not be supported by the backend in V1
    try {
      // Find the previous level's XP threshold
      return updateAbility(abilityId, { score: currentScore - 1 });
    } catch (err) {
      setError('Decreasing ability scores is not supported');
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