import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

function EditCharacterPage() {
  const [characterName, setCharacterName] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  const fetchCharacter = useCallback(async () => {
    try {
      const response = await api.get(`/characters/${id}`);
      setCharacterName(response.data.name);
    } catch (error) {
      console.error('Error fetching character:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchCharacter();
  }, [fetchCharacter]);

  const handleSave = async () => {
    if (characterName.trim()) {
      try {
        await api.put(`/characters/${id}`, { name: characterName });
        navigate('/home');
      } catch (error) {
        console.error('Error updating character:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Edit Character</h2>
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

export default EditCharacterPage;