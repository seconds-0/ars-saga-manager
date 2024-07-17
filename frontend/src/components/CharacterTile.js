import React from 'react';

function CharacterTile({ character, onDelete, onEdit }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 relative">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-deep-red hover:text-red-700"
        aria-label="Delete character"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h3 className="text-xl font-semibold mb-2 text-dark-brown">{character.name}</h3>
      <button
        onClick={onEdit}
        className="mt-4 bg-deep-red text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-red"
      >
        Edit
      </button>
    </div>
  );
}

export default CharacterTile;