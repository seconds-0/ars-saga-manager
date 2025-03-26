import React from 'react';
import PropTypes from 'prop-types';

function CharacterTile({ character, onDelete, onEdit }) {
  // Character type badges with appropriate colors
  const getTypeBadge = () => {
    const type = character.character_type?.toLowerCase() || 'unknown';
    switch (type) {
      case 'magus':
        return <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Magus</span>;
      case 'companion':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Companion</span>;
      case 'grog':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Grog</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Unknown</span>;
    }
  };

  // Get an appropriate icon based on character attributes
  const getCharacterIcon = () => {
    return (
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-500 mb-4">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    );
  };

  return (
    <div 
      className="bg-white shadow-md rounded-lg p-6 relative hover:shadow-lg transition-shadow border border-gray-100 flex flex-col"
      data-testid="character-tile"
    >
      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Delete character"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Character content */}
      <div className="flex flex-col items-center text-center mb-4">
        {getCharacterIcon()}
        <h3 className="text-xl font-semibold mb-1 text-gray-900 line-clamp-1">{character.name}</h3>
        <div className="mb-2">
          {getTypeBadge()}
        </div>
      </div>

      {/* Character attributes (if available) */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-4 mt-auto">
        {character.intelligence !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-500">Int:</span>
            <span className="font-medium">{character.intelligence > 0 ? `+${character.intelligence}` : character.intelligence}</span>
          </div>
        )}
        {character.strength !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-500">Str:</span>
            <span className="font-medium">{character.strength > 0 ? `+${character.strength}` : character.strength}</span>
          </div>
        )}
        {character.stamina !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-500">Sta:</span>
            <span className="font-medium">{character.stamina > 0 ? `+${character.stamina}` : character.stamina}</span>
          </div>
        )}
        {character.communication !== undefined && (
          <div className="flex justify-between">
            <span className="text-gray-500">Com:</span>
            <span className="font-medium">{character.communication > 0 ? `+${character.communication}` : character.communication}</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <button
        onClick={onEdit}
        className="w-full bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150 ease-in-out"
      >
        View Character
      </button>
    </div>
  );
}

CharacterTile.propTypes = {
  character: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    character_type: PropTypes.string,
    intelligence: PropTypes.number,
    strength: PropTypes.number,
    stamina: PropTypes.number,
    communication: PropTypes.number
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired
};

export default React.memo(CharacterTile);