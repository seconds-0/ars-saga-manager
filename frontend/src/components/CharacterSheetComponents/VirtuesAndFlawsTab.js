import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../api/axios';
import VirtueFlawList from './VirtueFlawList';
import VirtueFlawSelector from './VirtueFlawSelector';

// VirtuesAndFlawsTab: Component for managing a character's virtues and flaws
function VirtuesAndFlawsTab({ character, onSave }) {
  const [virtuesFlaws, setVirtuesFlaws] = useState([]);
  const [eligibleVirtuesFlaws, setEligibleVirtuesFlaws] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const remainingPoints = character.maxVirtueFlawPoints - character.virtueFlawPoints;

  useEffect(() => {
    fetchVirtuesFlaws();
    fetchEligibleVirtuesFlaws();
  }, [character.id]); // Add character.id as a dependency

  // fetchVirtuesFlaws: Retrieves the character's current virtues and flaws
  const fetchVirtuesFlaws = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/characters/${character.id}/virtues-flaws`);
      setVirtuesFlaws(response.data);
    } catch (error) {
      console.error('Error fetching virtues and flaws:', error);
      setError('Failed to load virtues and flaws. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // fetchEligibleVirtuesFlaws: Retrieves virtues and flaws that the character is eligible to take
  const fetchEligibleVirtuesFlaws = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/characters/${character.id}/eligible-virtues-flaws`);
      setEligibleVirtuesFlaws(response.data);
    } catch (error) {
      console.error('Error fetching eligible virtues and flaws:', error);
      setError('Failed to load eligible virtues and flaws. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // handleAddVirtueFlaw: Adds a new virtue or flaw to the character
  const handleAddVirtueFlaw = async (selectedVirtueFlaw) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/characters/${character.id}/virtues-flaws`, {
        referenceVirtueFlawId: selectedVirtueFlaw.id,
        cost: selectedVirtueFlaw.size === 'Major' ? 3 : 1,
        selections: {} // TODO: Add logic for selections if needed
      });
      await fetchVirtuesFlaws();
      await fetchEligibleVirtuesFlaws();
      onSave(); // Trigger parent component to refresh character data
    } catch (error) {
      console.error('Error adding virtue or flaw:', error);
      setError('Failed to add virtue or flaw. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // handleRemoveVirtueFlaw: Removes a virtue or flaw from the character
  const handleRemoveVirtueFlaw = async (virtueFlawId) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.delete(`/characters/${character.id}/virtues-flaws/${virtueFlawId}`);
      await fetchVirtuesFlaws();
      await fetchEligibleVirtuesFlaws();
      onSave(); // Trigger parent component to refresh character data
    } catch (error) {
      console.error('Error removing virtue or flaw:', error);
      setError('Failed to remove virtue or flaw. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Virtues & Flaws</h2>
      <VirtueFlawList 
        virtuesFlaws={virtuesFlaws} 
        onRemove={handleRemoveVirtueFlaw} 
      />
      <VirtueFlawSelector 
        eligibleVirtuesFlaws={eligibleVirtuesFlaws} 
        onAdd={handleAddVirtueFlaw}
        remainingPoints={remainingPoints}
      />
    </div>
  );
}

VirtuesAndFlawsTab.propTypes = {
  character: PropTypes.shape({
    id: PropTypes.number.isRequired,
    maxVirtueFlawPoints: PropTypes.number.isRequired,
    virtueFlawPoints: PropTypes.number.isRequired,
    // Add other required character properties
  }).isRequired,
  onSave: PropTypes.func.isRequired,
};

export default VirtuesAndFlawsTab;