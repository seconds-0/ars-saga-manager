import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import api from '../../api/axios';
import { debounce } from 'lodash';
import { validateVirtuesFlaws, createValidationRules } from '../../utils/virtueFlawValidation';

function VirtueFlawSelector({ onAdd, remainingPoints, character, validationResult }) {
  const [search, setSearch] = useState('');
  const [filteredVirtuesFlaws, setFilteredVirtuesFlaws] = useState([]);

  const fetchReferenceVirtuesFlaws = async () => {
    const response = await api.get('/reference-virtues-flaws');
    return response.data;
  };

  const { data: allVirtuesFlaws, isLoading, error } = useQuery(
    'referenceVirtuesFlaws',
    fetchReferenceVirtuesFlaws,
    {
      staleTime: Infinity,
    }
  );

  useEffect(() => {
    if (allVirtuesFlaws) {
      const filtered = allVirtuesFlaws
        .filter(vf => vf.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));
      setFilteredVirtuesFlaws(filtered);
    }
  }, [search, allVirtuesFlaws]);

  const isVirtueFlawDisabled = (virtueFlaw) => {
    // Create a temporary list with the new virtue/flaw added
    const tempVirtuesFlaws = [...(character.virtuesFlaws || []), virtueFlaw];
    
    // Create validation rules
    const rules = createValidationRules({
      characterType: character.type,
      allowHermeticVirtues: character.hasTheGift,
      allowMajorVirtues: character.type !== 'grog',
      maxVirtuePoints: 10,
      maxMinorFlaws: 5,
      maxStoryFlaws: 1,
      maxPersonalityFlaws: 3,
      requireSocialStatus: true,
      requirePointBalance: true,
      checkCharacterTypeRestrictions: true,
      checkIncompatibilities: true,
      checkPrerequisites: true,
    });

    // Validate the temporary list
    const result = validateVirtuesFlaws(tempVirtuesFlaws, rules);

    // Check if adding this virtue/flaw would make the character invalid
    return !result.isValid || (virtueFlaw.type === 'Virtue' && virtueFlaw.cost > remainingPoints);
  };

  const debouncedSearch = debounce((value) => {
    setSearch(value);
  }, 300);

  if (isLoading) return <div>Loading virtues and flaws...</div>;
  if (error) return <div>Error loading virtues and flaws: {error.message}</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search virtues and flaws"
        onChange={(e) => debouncedSearch(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <div className="border p-4 h-64 overflow-y-auto">
        {filteredVirtuesFlaws.length === 0 ? (
          <div>No virtues or flaws found.</div>
        ) : (
          <ul className="space-y-2">
            {filteredVirtuesFlaws.map((vf) => {
              const isDisabled = isVirtueFlawDisabled(vf);
              return (
                <li key={vf.id} className="flex justify-between items-center">
                  <span className={isDisabled ? 'text-gray-400' : ''}>
                    {vf.name} ({vf.size})
                    {isDisabled && validationResult.warnings.some(w => w.message.includes(vf.name)) && (
                      <span className="text-xs text-red-500 ml-2">
                        (Not available)
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => onAdd(vf.id)}
                    disabled={isDisabled}
                    className="bg-blue-500 text-white px-2 py-1 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                    title={isDisabled ? 'This virtue/flaw cannot be selected' : undefined}
                  >
                    Add
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default VirtueFlawSelector;