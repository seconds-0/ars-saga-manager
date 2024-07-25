import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Toast from '../Toast';
import api from '../../api/axios';
import CharacterSheetTabs from './CharacterSheetTabs';

function CharacterSheet() {
  const [character, setCharacter] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const response = await api.get(`/characters/${id}`);
        setCharacter(response.data);
      } catch (error) {
        console.error('Error fetching character:', error);
        setToastMessage('Error fetching character data');
        setToastType('error');
      }
    };

    fetchCharacter();
  }, [id]);

  const handleSave = async (updatedData) => {
    try {
      const response = await api.put(`/characters/${id}`, updatedData);
      setCharacter(response.data);
      setToastMessage('Character updated successfully!');
      setToastType('success');
    } catch (error) {
      console.error('Error updating character:', error);
      setToastMessage('Failed to update character. Please try again.');
      setToastType('error');
    }
  };

  if (!character) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <h2 className="text-2xl font-bold">Character Sheet: {character.characterName}</h2>
          <button
            onClick={() => navigate('/characters')}
            className="bg-gray-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-150 ease-in-out"
          >
            Back to Characters
          </button>
        </div>
        <CharacterSheetTabs character={character} onSave={handleSave} />
      </div>
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
}

export default CharacterSheet;