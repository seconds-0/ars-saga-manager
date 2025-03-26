import React, { useState } from 'react';

function CharacterOverviewTab({ character, onSave }) {
  const [age, setAge] = useState(character.age || 20);

  const handleAgeChange = (e) => {
    const newAge = parseInt(e.target.value);
    setAge(newAge);
  };

  const handleSave = () => {
    // Only call onSave if the age has changed
    if (age !== character.age) {
      onSave({ 
        ...character, 
        age, 
        // Set recalculateXp to true to trigger recalculation on server
        recalculateXp: true 
      });
    }
  };

  const handleBlur = () => {
    // Validate age is at least 5
    if (age < 5) {
      setAge(5);
      // Call onSave with the corrected age
      if (character.age !== 5) {
        onSave({ 
          ...character, 
          age: 5,
          recalculateXp: true 
        });
      }
      return;
    }
    handleSave();
  };

  // Format restricted exp pools for display
  const formatRestriction = (restriction) => {
    const { type, value } = restriction;
    if (type === 'category') {
      return `${value} Abilities only`;
    } else if (type === 'ability_list') {
      return Array.isArray(value) ? value.join(' or ') + ' only' : value;
    } else if (type === 'ability_name') {
      return `${value} only`;
    }
    return 'Unknown restriction';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mb-4">Character Overview</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p><span className="font-semibold">Name:</span> {character.name}</p>
          <p><span className="font-semibold">Type:</span> {character.character_type}</p>
          
          <div className="mt-4">
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="number"
                name="age"
                id="age"
                min="5"
                value={age}
                onChange={handleAgeChange}
                onBlur={handleBlur}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            {age < 5 && (
              <p className="mt-1 text-sm text-red-600">Age must be at least 5</p>
            )}
          </div>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-md shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Experience</h3>
          <p><span className="font-semibold">General Exp Available:</span> {character.general_exp_available || 0}</p>
          
          {/* Only show Magical Exp for Magi */}
          {character.character_type && character.character_type.toLowerCase() === 'magus' && (
            <p><span className="font-semibold">Magical Exp Available:</span> {character.magical_exp_available || 0}</p>
          )}
          
          {/* Display restricted experience pools */}
          {character.restricted_exp_pools && character.restricted_exp_pools.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold">Restricted Experience:</h4>
              <ul className="list-disc pl-5">
                {character.restricted_exp_pools.map((pool, index) => (
                  <li key={index}>
                    From {pool.source_virtue_flaw}: {pool.amount - (pool.spent || 0)} Exp
                    ({formatRestriction(pool.restrictions)})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CharacterOverviewTab;