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
      console.log('Saving character data:', updatedData);
      const response = await api.put(`/characters/${id}`, updatedData);
      console.log('Server response:', response.data);
      setCharacter(response.data);
      setToastMessage('Character updated successfully!');
      setToastType('success');
    } catch (error) {
      console.error('Error updating character:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        setToastMessage(`Failed to update character: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        setToastMessage('No response received from server. Please try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        setToastMessage('An error occurred while updating the character. Please try again.');
      }
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