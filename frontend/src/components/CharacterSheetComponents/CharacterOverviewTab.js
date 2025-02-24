import React from 'react';

function CharacterOverviewTab({ character, onSave }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Character Overview</h2>
      <p>Name: {character.name}</p>
      <p>Type: {character.character_type}</p>
      {/* Add more overview information here */}
    </div>
  );
}

export default CharacterOverviewTab;