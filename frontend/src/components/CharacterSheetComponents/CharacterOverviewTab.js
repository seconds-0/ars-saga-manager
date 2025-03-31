import React, { useState } from 'react';

function CharacterOverviewTab({ character, onSave }) {
  const [age, setAge] = useState(character.age || 25);

  const handleAgeChange = (e) => {
    // Handle empty input or parse the integer
    const inputValue = e.target.value.trim();
    // Update local state immediately
    setAge(inputValue === '' ? '' : parseInt(inputValue, 10)); 
    // *** Removed the onSave call from here ***
  };

  const handleSave = () => {
    // *** This function seems unused now, could be removed, but leaving for now ***
    // Only call onSave if the age has changed and is valid
    const numericAge = parseInt(age, 10);
    if (!isNaN(numericAge) && numericAge >= 5 && numericAge !== character.age) {
      onSave({ 
        ...character, 
        age: numericAge, 
        recalculateXp: true 
      });
    }
  };

  const handleBlur = () => {
    let finalAge = age; // Start with the current state value

    // Handle empty input: default to original age or 25
    if (age === '') {
      finalAge = character.age || 25;
      setAge(finalAge); // Update state to reflect the default
    } else {
      // Parse the current state value
      const numericAge = parseInt(age, 10);

      // Validate: if not a number or less than 5, set to 5
      if (isNaN(numericAge) || numericAge < 5) {
        finalAge = 5;
        setAge(finalAge); // Update state to reflect the minimum
      } else {
        // If it was a valid number already, keep it
        finalAge = numericAge; 
      }
    }

    // Now, check if the final valid age is different from the original character age
    if (finalAge !== character.age) {
      console.log('Saving age on blur. Final valid age:', finalAge, 'Original age:', character.age);
      // Pass ONLY the changed data, not the whole character object
      onSave({
        age: finalAge,
        recalculateXp: true
      });
      
      // Add a visual feedback while experience is recalculating
      const expElements = document.querySelectorAll('.experience-value');
      expElements.forEach(el => {
        el.classList.add('animate-pulse', 'text-amber-600');
        setTimeout(() => {
          el.classList.remove('animate-pulse', 'text-amber-600');
        }, 2000); // Remove after 2 seconds
      });
    } else {
       console.log('Age not changed from original on blur, not saving.');
    }
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
                value={age === '' ? '' : age}
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
          <p><span className="font-semibold">General Exp Available:</span> <span className="experience-value">{character.general_exp_available || 0}</span></p>
          
          {/* Only show Magical Exp for Magi */}
          {character.character_type && character.character_type.toLowerCase() === 'magus' && (
            <p><span className="font-semibold">Magical Exp Available:</span> <span className="experience-value">{character.magical_exp_available || 0}</span></p>
          )}
          
          {/* Display restricted experience pools */}
          {character.restricted_exp_pools && character.restricted_exp_pools.length > 0 && (
            <div className="mt-2">
              <h4 className="font-semibold">Restricted Experience:</h4>
              <ul className="list-disc pl-5">
                {character.restricted_exp_pools.map((pool, index) => (
                  <li key={index}>
                    From {pool.source_virtue_flaw}: <span className="experience-value">{pool.amount - (pool.spent || 0)}</span> Exp
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