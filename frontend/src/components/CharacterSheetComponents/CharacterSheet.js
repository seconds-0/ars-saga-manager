import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import PropTypes from 'prop-types';
import CharacterSheetTabs from './CharacterSheetTabs';

// CharacterSheet: Main component for displaying and editing character information
function CharacterSheet() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCharacter();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  // fetchCharacter: Retrieves character data from the server and updates state
  const fetchCharacter = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/characters/${id}`);
      if (response.data && response.data.id) {
        setCharacter(response.data);
      } else {
        throw new Error('Invalid character data received');
      }
    } catch (error) {
      console.error('Error fetching character:', error);
      setError('Failed to load character data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // handleSave: Sends updated character data to the server and refreshes local state
  const handleSave = async (updatedData) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.put(`/characters/${id}`, updatedData);
      await fetchCharacter(); // Refresh character data
    } catch (error) {
      console.error('Error updating character:', error);
      setError('Failed to save character data. Please try again later.');
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

  if (!character) {
    return <div>Character not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{character.characterName}</h1>
      <CharacterSheetTabs character={character} onSave={handleSave} />
    </div>
  );
}

CharacterSheet.propTypes = {
  id: PropTypes.string
};

export default CharacterSheet;