import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from '../../api/axios';

// Category config with icons and descriptions
const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories', icon: '🔍' },
  { value: 'GENERAL', label: 'General', icon: '📌', description: 'Common skills everyone can learn' },
  { value: 'ACADEMIC', label: 'Academic', icon: '📚', description: 'Scholarly and intellectual pursuits' },
  { value: 'MARTIAL', label: 'Martial', icon: '⚔️', description: 'Combat and physical skills' },
  { value: 'SUPERNATURAL', label: 'Supernatural', icon: '✨', description: 'Mystical abilities beyond normal humans' },
  { value: 'ARCANE', label: 'Arcane', icon: '🔮', description: 'Abilities related to Hermetic magic' }
];

// Component for debounced search input
function DebouncedSearchInput({ value, onChange, placeholder }) {
  const [localValue, setLocalValue] = useState(value);
  
  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);
  
  // Debounce the search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [localValue, value, onChange]);
  
  return (
    <div className="relative flex-1">
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="p-2 pl-8 border rounded w-full focus:ring-1 focus:ring-blue-300 focus:border-blue-300 focus:outline-none"
      />
      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
        🔍
      </span>
      {localValue && (
        <button
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          onClick={() => setLocalValue('')}
          title="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}

function AbilitySelector({ onSelectAbility, characterType, existingAbilities = [] }) {
  const [referenceAbilities, setReferenceAbilities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentlyAdded, setRecentlyAdded] = useState(null);

  // Fetch reference abilities
  useEffect(() => {
    const fetchAbilities = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // The axios baseURL already includes '/api'
        let url = '/reference-abilities'; // Base URL defined in server.js
        if (selectedCategory) {
          url = `/reference-abilities/category/${selectedCategory}`;
        }
        
        // Log the URL for debugging
        console.log(`Fetching reference abilities from: ${url}`);
        
        const response = await axios.get(url);
        
        // Log the response for debugging
        console.log("Reference abilities API response:", response);
        if (response.data.status === 'success') {
          setReferenceAbilities(response.data.data);
        } else {
          setError('Failed to load abilities');
        }
      } catch (err) {
        setError('Error fetching abilities: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    
    fetchAbilities();
  }, [selectedCategory]);

  // Check if an ability is appropriate for the character type
  const isAbilityAppropriate = useCallback((ability) => {
    const type = characterType?.toLowerCase() || 'companion';
    
    // Arcane abilities are restricted
    if (ability.category === 'ARCANE') {
      // Only magi can have Parma Magica
      if (ability.name === 'Parma Magica' && type !== 'magus') {
        return false;
      }
      
      // Grogs can't have most arcane abilities
      if (type === 'grog' && !['Magic Sensitivity', 'Second Sight'].includes(ability.name)) {
        return false;
      }
    }
    
    // Supernatural abilities are restricted for grogs
    if (ability.category === 'SUPERNATURAL' && type === 'grog') {
      return false;
    }
    
    // Some academic abilities might be restricted for grogs
    if (ability.category === 'ACADEMIC' && type === 'grog') {
      // Grogs can still have basic languages but not advanced academic abilities
      if (['Artes Liberales', 'Philosophiae', 'Theology'].includes(ability.name)) {
        return false;
      }
    }
    
    return true;
  }, [characterType]);

  // Filter abilities (memoized)
  const filteredAbilities = useMemo(() => {
    return referenceAbilities
      .filter(ability => {
        // Check if the ability is already selected
        const alreadySelected = (existingAbilities || []).some(
          existing => existing.ability_name.toLowerCase() === ability.name.toLowerCase()
        );
        
        // Filter by search term
        const matchesSearch = searchTerm === '' || 
          ability.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (ability.description && ability.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return !alreadySelected && matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [referenceAbilities, existingAbilities, searchTerm]);

  // Handle ability selection
  const handleSelectAbility = (ability) => {
    if (!isAbilityAppropriate(ability)) {
      alert(`${ability.name} is not appropriate for ${characterType} characters.`);
      return;
    }
    
    const newAbility = {
      ability_name: ability.name,
      category: ability.category,
      score: 0,
      experience_points: 0,
      xp_for_next_level: 5, // Default: 5 XP for next level
      specialty: null
    };
    
    onSelectAbility(newAbility);
    setRecentlyAdded(ability.name);
    
    // Clear the "recently added" status after 3 seconds
    setTimeout(() => {
      setRecentlyAdded(null);
    }, 3000);
  };

  // Get category icon
  const getCategoryIcon = (categoryValue) => {
    const found = CATEGORY_OPTIONS.find(cat => cat.value === categoryValue);
    return found ? found.icon : '';
  };

  return (
    <div className="my-6 border rounded-md shadow-sm p-4 bg-white">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <span className="mr-2">➕</span>
        Add New Ability
      </h3>
      
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        {/* Search input */}
        <DebouncedSearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search abilities..."
        />
        
        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-2 border rounded min-w-[150px] focus:ring-1 focus:ring-blue-300 focus:border-blue-300 focus:outline-none"
          aria-label="Filter by category"
        >
          {CATEGORY_OPTIONS.map(category => (
            <option key={category.value} value={category.value}>
              {category.icon} {category.label}
            </option>
          ))}
        </select>
      </div>
      
      {loading && (
        <div className="text-center py-8">
          <div className="animate-pulse text-gray-500">Loading abilities...</div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}
      
      {!loading && !error && (
        <div className="border rounded-md overflow-hidden shadow-sm">
          <div className="bg-gray-50 px-3 py-2 border-b flex justify-between items-center">
            <span className="font-medium">Available Abilities</span>
            <span className="text-sm text-gray-500">{filteredAbilities.length} found</span>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredAbilities.length > 0 ? (
              <ul className="divide-y">
                {filteredAbilities.map(ability => {
                  const appropriate = isAbilityAppropriate(ability);
                  const isRecent = ability.name === recentlyAdded;
                  
                  return (
                    <li
                      key={ability.id}
                      className={`p-3 hover:bg-blue-50 cursor-pointer flex items-start transition-colors
                        ${!appropriate ? 'opacity-50 bg-gray-50' : ''}
                        ${isRecent ? 'bg-green-50' : ''}`}
                      onClick={() => appropriate && handleSelectAbility(ability)}
                      title={!appropriate
                        ? `${ability.name} is not appropriate for ${characterType} characters`
                        : ability.description || `Add ${ability.name} ability`}
                    >
                      <div className="mr-3 text-lg mt-1">
                        {getCategoryIcon(ability.category)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{ability.name}</div>
                        <div className="text-sm text-gray-600">
                          {ability.description
                            ? ability.description.substring(0, 100) + (ability.description.length > 100 ? '...' : '')
                            : `${ability.category.toLowerCase()} ability`}
                        </div>
                      </div>
                      {isRecent && (
                        <div className="ml-2 text-green-600 text-sm flex items-center">
                          <span className="mr-1">✓</span> Added
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500 italic">
                {existingAbilities.length > 0
                  ? 'No more matching abilities available or all abilities already added.'
                  : 'No matching abilities found. Try changing your search criteria.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

AbilitySelector.propTypes = {
  onSelectAbility: PropTypes.func.isRequired,
  characterType: PropTypes.string,
  existingAbilities: PropTypes.arrayOf(
    PropTypes.shape({
      ability_name: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired
    })
  )
};

export default React.memo(AbilitySelector);