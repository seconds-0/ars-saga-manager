import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery } from 'react-query';
import api from '../../api/axios';
import { debounce } from 'lodash';
import { validateVirtuesFlaws, createValidationRules } from '../../utils/virtueFlawValidation';

function VirtueFlawSelector({ onAdd, remainingPoints = 0, character, validationResult = { isValid: true, warnings: [] } }) {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showDetails, setShowDetails] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showOnlyEligible, setShowOnlyEligible] = useState(true);

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

  // Memoize the debounced search function
  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearch(value);
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Memoize validation rules
  const validationRules = useMemo(() => {
    // Get the character type from the appropriate property (character_type from API, normalized to lowercase)
    const characterType = character?.character_type?.toLowerCase();
    
    if (!characterType) return null;
    
    return createValidationRules(characterType, {
      allowHermeticVirtues: character.has_the_gift,
      allowMajorVirtues: characterType !== 'grog',
      maxVirtuePoints: 10,
      maxMinorFlaws: 5,
      maxStoryFlaws: 1,
      maxPersonalityFlaws: 3,
      requireSocialStatus: true,
      requirePointBalance: true,
      checkCharacterTypeRestrictions: true,
      checkIncompatibilities: true,
      checkPrerequisites: true,
      house: character.house_id,
    });
  }, [character?.character_type, character?.has_the_gift, character?.house_id]);

  // Determine if a virtue/flaw is a house virtue
  const isHouseVirtue = useCallback((virtueFlaw) => {
    if (!character?.house_id) return false;
    return virtueFlaw.is_house_virtue && virtueFlaw.house_id === character.house_id;
  }, [character?.house_id]);

  // Memoize the isVirtueFlawDisabled function
  const isVirtueFlawDisabled = useCallback((virtueFlaw) => {
    // House virtues are always available if they match the character's house
    if (isHouseVirtue(virtueFlaw)) return false;
    
    // Get the character type from the appropriate property
    const characterType = character?.character_type?.toLowerCase();
    
    // Early return if we don't have required data
    if (!characterType || !validationRules) return true;

    try {
      // Create a temporary list with the new virtue/flaw added
      const tempVirtuesFlaws = [
        ...(character.virtuesFlaws || []),
        {
          referenceVirtueFlaw: virtueFlaw,
          is_house_virtue_flaw: false,
        }
      ];
      
      // Validate the temporary list
      const result = validateVirtuesFlaws(tempVirtuesFlaws, validationRules);

      // Check if adding this virtue/flaw would make the character invalid
      return !result.isValid || 
            (!isHouseVirtue(virtueFlaw) && virtueFlaw.type === 'Virtue' && 
              ((virtueFlaw.size === 'Minor' && remainingPoints < 1) || 
              (virtueFlaw.size === 'Major' && remainingPoints < 3)));
    } catch (error) {
      // If validation fails for any reason, disable the virtue/flaw
      console.error("Error in isVirtueFlawDisabled:", error);
      return true;
    }
  }, [character?.character_type, character?.virtuesFlaws, remainingPoints, validationRules, isHouseVirtue]);

  // Get warning messages for a specific virtue/flaw with type safety
  const getWarningMessages = useCallback((virtueFlaw) => {
    if (!virtueFlaw?.name || !validationResult?.warnings) return [];
    return (validationResult.warnings || [])
      .filter(w => w?.message?.includes(virtueFlaw.name))
      .map(w => w.message || '');
  }, [validationResult]);

  // Get general warning messages that aren't tied to a specific virtue/flaw
  const getGeneralWarnings = useCallback(() => {
    if (!allVirtuesFlaws || !validationResult?.warnings) return [];
    
    return (validationResult.warnings || [])
      .map(w => w.message || '')
      .filter(msg => !allVirtuesFlaws.some(vf => 
        // Only check against visible virtues/flaws to avoid circular dependency
        msg.includes(vf.name) && vf.name.toLowerCase().includes(search.toLowerCase())
      ));
  }, [validationResult, allVirtuesFlaws, search]);

  // Get point cost for a virtue/flaw
  const getPointCost = useCallback((virtueFlaw) => {
    if (virtueFlaw.type === 'Flaw') return 0;
    return virtueFlaw.size === 'Major' ? 3 : 1;
  }, []);

  // Get categories for filter dropdown
  const categories = useMemo(() => {
    if (!allVirtuesFlaws) return [];
    const cats = new Set(allVirtuesFlaws.map(vf => vf.category));
    return ['all', ...Array.from(cats).sort()];
  }, [allVirtuesFlaws]);

  // Sort items based on current sort settings
  const sortItems = useCallback((items) => {
    return [...items].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortBy) {
        case 'name':
          return direction * a.name.localeCompare(b.name);
        case 'type':
          return direction * (
            a.type === b.type 
              ? a.name.localeCompare(b.name)
              : a.type.localeCompare(b.type)
          );
        case 'size':
          const sizeOrder = { 'Free': 0, 'Minor': 1, 'Major': 2 };
          return direction * (
            sizeOrder[a.size] === sizeOrder[b.size]
              ? a.name.localeCompare(b.name)
              : sizeOrder[a.size] - sizeOrder[b.size]
          );
        default:
          return 0;
      }
    });
  }, [sortBy, sortDirection]);

  // Enhanced memoized filtered virtues/flaws
  const filteredVirtuesFlaws = useMemo(() => {
    if (!allVirtuesFlaws) return [];

    // Filter by search term, category, type, and eligibility
    const filtered = allVirtuesFlaws.filter(vf => {
      const matchesSearch = vf.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || vf.category === selectedCategory;
      const matchesType = selectedType === 'all' || vf.type === selectedType;
      const isEligible = !showOnlyEligible || !isVirtueFlawDisabled(vf);
      
      return matchesSearch && matchesCategory && matchesType && isEligible;
    });

    // Group by category
    const grouped = filtered.reduce((acc, vf) => {
      const key = isHouseVirtue(vf) ? 'house' : vf.category;
      if (!acc[key]) acc[key] = [];
      acc[key].push(vf);
      return acc;
    }, {});

    // Sort within groups and flatten
    return Object.entries(grouped)
      .sort(([a], [b]) => {
        if (a === 'house') return -1;
        if (b === 'house') return 1;
        if (a === 'The Gift') return -1;
        if (b === 'The Gift') return 1;
        return a.localeCompare(b);
      })
      .flatMap(([category, items]) => {
        if (items.length === 0) return [];
        return [
          // Add category header
          { isHeader: true, category },
          // Sort items within category
          ...sortItems(items)
        ];
      });
  }, [search, selectedCategory, selectedType, showOnlyEligible, allVirtuesFlaws, isHouseVirtue, sortItems, isVirtueFlawDisabled]);

  if (isLoading) return <div>Loading virtues and flaws...</div>;
  if (error) return <div>Error loading virtues and flaws: {error.message}</div>;

  return (
    <div role="region" aria-label="Virtue and Flaw Selection">
      <div className="space-y-4 mb-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search virtues and flaws"
            value={searchInput}
            onChange={handleSearchChange}
            className="flex-grow p-2 border rounded"
            aria-label="Search virtues and flaws"
            role="searchbox"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded"
            aria-label="Filter by category"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="p-2 border rounded"
            aria-label="Filter by type"
          >
            <option value="all">All Types</option>
            <option value="Virtue">Virtues</option>
            <option value="Flaw">Flaws</option>
          </select>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 border rounded"
              aria-label="Sort by"
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="size">Size</option>
            </select>
            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 border rounded hover:bg-gray-50"
              aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              title={`Sort ${sortDirection === 'asc' ? 'Z to A' : 'A to Z'}`}
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showOnlyEligible"
            checked={showOnlyEligible}
            onChange={(e) => setShowOnlyEligible(e.target.checked)}
            className="mr-2 h-4 w-4"
          />
          <label htmlFor="showOnlyEligible" className="text-sm text-gray-700">
            Only show eligible choices
          </label>
        </div>
      </div>

      {getGeneralWarnings().length > 0 && (
        <div 
          className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded"
          role="alert"
        >
          {getGeneralWarnings().map((warning, index) => (
            <div key={index}>{warning}</div>
          ))}
        </div>
      )}

      <div className="mb-2 text-sm text-gray-600">
        Remaining Points: {remainingPoints}
      </div>

      <div 
        className="border p-4 h-96 overflow-y-auto"
        role="listbox"
        aria-label="Available virtues and flaws"
      >
        {filteredVirtuesFlaws.length === 0 ? (
          <div role="status">No virtues or flaws found.</div>
        ) : (
          <ul className="space-y-2">
            {filteredVirtuesFlaws.map((item, index) => {
              if (item.isHeader) {
                return (
                  <li key={item.category} className="font-bold text-gray-700 pt-4 first:pt-0">
                    {item.category}
                  </li>
                );
              }

              const isDisabled = isVirtueFlawDisabled(item);
              const isHouse = isHouseVirtue(item);
              const warnings = getWarningMessages(item);
              const warningText = warnings.length > 0 ? warnings.join('. ') : '';
              const pointCost = getPointCost(item);
              
              return (
                <li 
                  key={item.id} 
                  className="flex flex-col space-y-2 p-2 hover:bg-gray-50 rounded"
                  role="option"
                  aria-selected={false}
                  aria-disabled={isDisabled}
                >
                  <div className="flex justify-between items-start">
                    <div className={`flex-grow ${isDisabled ? 'text-gray-400' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-gray-500">({item.size})</span>
                        {pointCost > 0 && (
                          <span className="text-sm text-blue-600">
                            {pointCost} point{pointCost > 1 ? 's' : ''}
                          </span>
                        )}
                        {isHouse && (
                          <span 
                            className="text-green-600 text-sm"
                            role="note"
                            aria-label="House Virtue"
                          >
                            House Virtue
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setShowDetails(showDetails === item.id ? null : item.id)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        {showDetails === item.id ? 'Hide details' : 'Show details'}
                      </button>
                    </div>
                    <button
                      onClick={() => onAdd(item.id)}
                      disabled={isDisabled}
                      className="bg-blue-500 text-white px-3 py-1 rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
                      title={warningText}
                      aria-label={`Add ${item.name}${warningText ? `. ${warningText}` : ''}`}
                    >
                      Add
                    </button>
                  </div>
                  
                  {isDisabled && warnings.length > 0 && (
                    <div 
                      className="text-sm text-red-500"
                      role="alert"
                    >
                      Not available - {warnings[0]}
                    </div>
                  )}

                  {showDetails === item.id && (
                    <div className="text-sm text-gray-600 mt-2">
                      <p>{item.description}</p>
                      {item.prerequisites?.length > 0 && (
                        <div className="mt-1">
                          <strong>Prerequisites:</strong> {item.prerequisites.join(', ')}
                        </div>
                      )}
                      {item.incompatible_with?.length > 0 && (
                        <div className="mt-1">
                          <strong>Incompatible with:</strong> {item.incompatible_with.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
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