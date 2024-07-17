import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import parchmentBg from '../parchment-bg.jpg';

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
    <div className="min-h-screen bg-cream" style={{backgroundImage: `url(${parchmentBg})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Create Character</h2>
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Enter character name"
            className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-deep-red"
          />
          <div className="flex justify-between">
            <button
              onClick={() => navigate('/home')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!characterName.trim()}
              className={`${
                characterName.trim() ? 'bg-deep-red hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'
              } text-white font-bold py-2 px-4 rounded transition duration-300`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateCharacterPage;