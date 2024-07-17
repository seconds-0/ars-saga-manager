import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function CreateCharacterPage() {
  const [characterName, setCharacterName] = useState('');
  const navigate = useNavigate();

  const handleSave = async () => {
    if (characterName.trim()) {
      try {
        const response = await api.post('/characters', { name: characterName });
        console.log('Character created:', response.data);
        navigate('/home');
      } catch (error) {
        console.error('Error creating character:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          console.error('Response headers:', error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Create Character</h2>
        <input
          type="text"
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
          placeholder="Enter character name"
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/home')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!characterName.trim()}
            className={`${
              characterName.trim() ? 'bg-blue-500 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'
            } text-white font-bold py-2 px-4 rounded`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateCharacterPage;