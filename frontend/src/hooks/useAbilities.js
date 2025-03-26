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
      const response = await axios.get(`/characters/${characterId}/abilities`);
      
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

  // Increment ability score
  const incrementAbility = async (abilityId, currentScore) => {
    return updateAbility(abilityId, { score: currentScore + 1 });
  };

  // Decrement ability score
  const decrementAbility = async (abilityId, currentScore) => {
    if (currentScore <= 0) return true; // Already at minimum
    return updateAbility(abilityId, { score: currentScore - 1 });
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
    updateSpecialty
  };
}

export default useAbilities;