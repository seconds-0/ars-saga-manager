import React from 'react';
import { useNavigate } from 'react-router-dom';

function CharacterTile({ character, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-md rounded-lg p-6 relative">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-gray-900 hover:text-gray-800"
        aria-label="Delete character"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-dark-brown">{character.name}</h3>
      </div>
      <button
        onClick={() => navigate(`/character/${character.id}`)}
        className="mt-4 bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-150 ease-in-out"
      >
        Edit
      </button>
    </div>
  );
}

export default CharacterTile;