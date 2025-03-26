import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from 'react-query';
import api from '../../api/axios';
// We're not using these functions directly in this component anymore
// import { validateVirtuesFlaws, createValidationRules } from '../../utils/virtueFlawValidation';

function VirtueFlawSelector({ onAdd, remainingPoints = 0, character, canAddVirtueFlaw, validationResult = { isValid: true, warnings: [] } }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showDetails, setShowDetails] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

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

  // Search is now debounced directly in the input's onChange handler

  // We no longer need the validation rules here as the parent component handles validation
  // and passes the canAddVirtueFlaw function

  // Determine if a virtue/flaw is a house virtue
  const isHouseVirtue = useCallback((virtueFlaw) => {
    if (!character?.house) return false;
    return virtueFlaw.is_house_virtue && virtueFlaw.house === character.house;
  }, [character?.house]);

  // Function to get warning messages for a virtue/flaw
  const getWarningMessages = useCallback((virtueFlaw) => {
    // Get any warnings from the validation result passed from parent
    if (validationResult?.warnings) {
      // Find warnings targeting this virtue/flaw
      const itemWarnings = validationResult.warnings
        .filter(w => 
          (w.targets && w.targets.includes(virtueFlaw.name)) || 
          (w.target === virtueFlaw.name)
        )
        .map(w => w.message);
        
      return itemWarnings;
    }
    return [];
  }, [validationResult]);

  // Use the canAddVirtueFlaw function passed from parent 
  // instead of recalculating validation for each item
  const isVirtueFlawDisabled = useCallback((virtueFlaw) => {
    // If canAddVirtueFlaw is provided, use it
    if (typeof canAddVirtueFlaw === 'function') {
      return !canAddVirtueFlaw(virtueFlaw);
    }
    
    // Fallback if canAddVirtueFlaw isn't provided
    
    // House virtues are always available if they match the character's house
    if (isHouseVirtue(virtueFlaw)) return false;
    
    // Simple check for point constraints (without full validation)
    const hasEnoughPoints = virtueFlaw.type !== 'Virtue' || 
      (virtueFlaw.size === 'Minor' && remainingPoints >= 1) || 
      (virtueFlaw.size === 'Major' && remainingPoints >= 3);
    
    return !hasEnoughPoints;
  }, [canAddVirtueFlaw, isHouseVirtue, remainingPoints]);

  // We no longer need these warning display functions since
  // all warnings are shown in the central VirtueFlawValidationMessages component

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

    // Filter by search term, category, and type
    const filtered = allVirtuesFlaws.filter(vf => {
      const matchesSearch = vf.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || vf.category === selectedCategory;
      const matchesType = selectedType === 'all' || vf.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
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
      .flatMap(([category, items]) => [
        // Add category header
        { isHeader: true, category },
        // Sort items within category
        ...sortItems(items)
      ]);
  }, [search, selectedCategory, selectedType, allVirtuesFlaws, isHouseVirtue, sortItems]);

  if (isLoading) return <div>Loading virtues and flaws...</div>;
  if (error) return <div>Error loading virtues and flaws: {error.message}</div>;

  return (
    <div role="region" aria-label="Virtue and Flaw Selection">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search virtues and flaws"
          onChange={(e) => {
            // Clear any previous timers
            if (window.searchTimer) clearTimeout(window.searchTimer);
            
            // Set a new timer
            window.searchTimer = setTimeout(() => {
              setSearch(e.target.value);
            }, 300);
          }}
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

      {/* General warnings are now handled by the central VirtueFlawValidationMessages component */}

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
                  
                  {isDisabled && (
                    <div 
                      className="text-sm text-red-500"
                      role="alert"
                    >
                      Not available
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
                      {item.requires_specification && (
                        <div className="mt-1 text-amber-600">
                          <strong>Note:</strong> After adding, you'll need to specify a {item.specification_type}.
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