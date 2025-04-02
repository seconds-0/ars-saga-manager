import React, { useState, useEffect, useMemo, useReducer, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import CharacteristicInput from './CharacteristicInput';
import AbilityList from './AbilityList';
import AbilitySelector from './AbilitySelector';
import Toast from '../Toast';
import useAbilities from '../../hooks/useAbilities';
import { useCharacter } from '../../contexts/CharacterProvider';

// Constants for characteristic groups
const PHYSICAL_CHARACTERISTICS = ['Strength', 'Stamina', 'Dexterity', 'Quickness'];
const MENTAL_CHARACTERISTICS = ['Intelligence', 'Presence', 'Communication', 'Perception'];

// Reducer to manage characteristics state
function characteristicsReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE':
      return action.payload;
    case 'INCREMENT':
      return {
        ...state,
        [action.payload]: state[action.payload] + 1
      };
    case 'DECREMENT':
      return {
        ...state,
        [action.payload]: state[action.payload] - 1
      };
    default:
      return state;
  }
}

function CharacteristicsAndAbilitiesTab({ character, onSave }) {
  // Use reducer for characteristics state management
  const [characteristics, dispatch] = useReducer(characteristicsReducer, {
    strength: 0, stamina: 0, dexterity: 0, quickness: 0,
    intelligence: 0, presence: 0, communication: 0, perception: 0
  });
  
  const [use_cunning, setUseCunning] = useState(false);
  const [totalPoints, setTotalPoints] = useState(7);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  // Get character context for pending operations
  const { isOperationPending, getAllPendingOperations } = useCharacter();

  // Get abilities from custom hook
  const abilitiesHook = useAbilities(character?.id);
  const abilities = abilitiesHook?.abilities || [];
  const abilitiesLoading = abilitiesHook?.loading || false;
  const abilitiesError = abilitiesHook?.error || null;
  const addAbility = abilitiesHook?.addAbility || (() => Promise.resolve(true));
  const incrementAbility = abilitiesHook?.incrementAbility || (() => Promise.resolve(true));
  const decrementAbility = abilitiesHook?.decrementAbility || (() => Promise.resolve(true));
  const incrementAbilityXP = abilitiesHook?.incrementAbilityXP || (() => Promise.resolve(true));
  const updateSpecialty = abilitiesHook?.updateSpecialty || (() => Promise.resolve(true));
  
  // Get pending operations for abilities
  const pendingAbilityOperations = useMemo(() => {
    // Get all pending operations
    const operations = getAllPendingOperations();
    
    // Group operations by ability ID
    return operations.reduce((acc, op) => {
      // Skip operations that aren't about abilities
      if (!op.metadata || !op.metadata.abilityId || 
          !['abilityIncrement', 'abilityDecrement', 'abilityUpdate'].includes(op.metadata.type)) {
        return acc;
      }
      
      const { abilityId, type } = op.metadata;
      
      if (!acc[abilityId]) {
        acc[abilityId] = {};
      }
      
      // Set specific operation flags
      if (type === 'abilityIncrement') {
        acc[abilityId].increment = true;
      } else if (type === 'abilityDecrement') {
        acc[abilityId].decrement = true;
      } else if (type === 'abilityUpdate') {
        acc[abilityId].xp = true;
      }
      
      return acc;
    }, {});
  }, [getAllPendingOperations]);

  // Initialize character data
  useEffect(() => {
    if (character) {
      const characteristicValues = {
        strength: character.strength || 0,
        stamina: character.stamina || 0,
        dexterity: character.dexterity || 0,
        quickness: character.quickness || 0,
        intelligence: character.intelligence || 0,
        presence: character.presence || 0,
        communication: character.communication || 0,
        perception: character.perception || 0
      };
      dispatch({ type: 'INITIALIZE', payload: characteristicValues });
      setUseCunning(character.use_cunning || false);
      setTotalPoints(character.total_improvement_points || 7);
    }
  }, [character]);

  // Memoized cost calculation function
  const getCost = useCallback((currentValue, increment) => {
    if (increment) {
      switch (currentValue) {
        case -3: return 3;
        case -2: return 2;
        case -1: return 1;
        case 0: return 1;
        case 1: return 2;
        case 2: return 3;
        default: return 0;
      }
    } else {
      switch (currentValue) {
        case 3: return 3;
        case 2: return 2;
        case 1: return 1;
        case 0: return 1;
        case -1: return 2;
        case -2: return 3;
        default: return 0;
      }
    }
  }, []);

  // Memoized calculation for spent points
  const calculateSpentPoints = useCallback(() => {
    return Object.values(characteristics).reduce((total, value) => {
      if (value > 0) return total + (value * (value + 1)) / 2;
      if (value < 0) return total - (Math.abs(value) * (Math.abs(value) + 1)) / 2;
      return total;
    }, 0);
  }, [characteristics]);

  // Memoized calculation for available points
  const availablePoints = useMemo(() => {
    return totalPoints - calculateSpentPoints();
  }, [totalPoints, calculateSpentPoints]);

  // Handler for incrementing a characteristic
  const handleIncrement = useCallback((characteristic) => {
    if (characteristics[characteristic] < 3) {
      const cost = getCost(characteristics[characteristic], true);
      if (availablePoints >= cost) {
        dispatch({ type: 'INCREMENT', payload: characteristic });
      } else {
        setToastMessage('Not enough improvement points available');
        setToastType('error');
      }
    } else {
      setToastMessage('Characteristic cannot exceed +3');
      setToastType('error');
    }
  }, [characteristics, availablePoints, getCost]);

  // Handler for decrementing a characteristic
  const handleDecrement = useCallback((characteristic) => {
    if (characteristics[characteristic] > -3) {
      dispatch({ type: 'DECREMENT', payload: characteristic });
    } else {
      setToastMessage('Characteristic cannot be less than -3');
      setToastType('error');
    }
  }, [characteristics]);

  // Use ref to store previous values for comparison
  const prevValuesRef = useRef({
    characteristics: null,
    use_cunning: null,
    totalPoints: null
  });

  // Auto-save characteristics when they change
  useEffect(() => {
    // Only proceed if the points are valid
    if (availablePoints < 0) return;
    
    // Check if values actually changed compared to previous save
    const hasCharacteristicsChanged = JSON.stringify(characteristics) !== JSON.stringify(prevValuesRef.current.characteristics);
    const hasUseCunningChanged = use_cunning !== prevValuesRef.current.use_cunning;
    const hasTotalPointsChanged = totalPoints !== prevValuesRef.current.totalPoints;
    
    // Only save if something actually changed
    if (!hasCharacteristicsChanged && !hasUseCunningChanged && !hasTotalPointsChanged) {
      console.log('No changes detected, skipping save');
      return;
    }
    
    const saveCharacteristics = async () => {
      try {
        console.log('Saving characteristics due to detected changes');
        const updatedData = {
          ...characteristics,
          use_cunning,
          total_improvement_points: totalPoints
        };
        
        // Update the previous values ref before saving
        prevValuesRef.current = {
          characteristics: JSON.parse(JSON.stringify(characteristics)),
          use_cunning,
          totalPoints
        };
        
        await onSave(updatedData);
        // No need to show a toast for automatic saves
      } catch (error) {
        console.error('Error saving characteristics:', error);
        setToastMessage('Failed to save characteristics automatically. Please reload the page.');
        setToastType('error');
      }
    };
    
    // Add a longer delay to avoid too many saves - increased to 2 seconds
    const timer = setTimeout(saveCharacteristics, 2000);
    return () => clearTimeout(timer);
    
    // Intentionally omit onSave from dependency array to prevent infinite loops
    // We're using the current value via function closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characteristics, use_cunning, totalPoints, availablePoints]);

  // Handle adding a new ability
  const handleAddAbility = async (abilityData) => {
    try {
      const success = await addAbility(abilityData);
      if (success) {
        setToastMessage(`Added ${abilityData.ability_name} ability`);
        setToastType('success');
      }
    } catch (error) {
      setToastMessage(`Failed to add ability: ${error.message}`);
      setToastType('error');
    }
  };

  // Render a characteristic input with proper props
  const renderCharacteristic = useCallback((char) => {
    const lowerChar = char.toLowerCase();
    const value = characteristics[lowerChar];
    const cost = getCost(value, true);
    
    return (
      <div key={char} className="mb-2">
        <CharacteristicInput
          name={char}
          baseValue={value}
          onIncrement={() => handleIncrement(lowerChar)}
          onDecrement={() => handleDecrement(lowerChar)}
          cost={cost}
          disabled={value >= 3 || (value < 3 && cost > availablePoints)}
        />
      </div>
    );
  }, [characteristics, handleIncrement, handleDecrement, getCost, availablePoints]);

  return (
    <div className="space-y-6">
      {/* Characteristics Section */}
      <section>
        <h2 className="text-xl font-bold mb-4">Characteristics</h2>
        {/* Hide "Use Cunning" option completely until animals are added */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="font-semibold mb-2 text-gray-700">Physical</h3>
            {PHYSICAL_CHARACTERISTICS.map(renderCharacteristic)}
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="font-semibold mb-2 text-gray-700">Mental</h3>
            {MENTAL_CHARACTERISTICS.map(renderCharacteristic)}
          </div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <p className="font-semibold text-lg" data-testid="available-points">
            Available Improvement Points: 
            <span className={`ml-1 ${availablePoints < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {availablePoints}
            </span>
          </p>
          {availablePoints < 0 && (
            <span className="text-red-600">
              Over budget! Please reduce some characteristics.
            </span>
          )}
        </div>
      </section>
      
      {/* Abilities Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <h2 className="text-xl font-bold">Abilities</h2>
            <div className="ml-2 text-gray-500 cursor-help group relative" title="Click on ability scores to toggle score/XP view">
              <span className="text-sm">ⓘ</span>
              <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-3 z-10 text-sm">
                <p className="font-semibold mb-1">Experience Points:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Click on score/XP to toggle view</li>
                  <li>Add XP in increments of 1 or the full amount needed for next level</li>
                  <li>XP will be spent from restricted pools first, then magical or general</li>
                  <li>Abilities increase automatically when XP threshold is reached</li>
                </ul>
              </div>
            </div>
          </div>
          {character && (
            <div className="flex flex-wrap gap-2">
              <div className="bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                <span className="font-medium text-blue-700">General XP:</span>
                <span className="ml-1">{character.general_exp_available || 0}</span>
              </div>
              {/* Only show magical XP for magi */}
              {character.character_type && character.character_type.toLowerCase() === 'magus' && (
                <div className="bg-green-50 px-3 py-1 rounded-md border border-green-100">
                  <span className="font-medium text-green-700">Magical XP:</span>
                  <span className="ml-1">{character.magical_exp_available || 0}</span>
                </div>
              )}
              
              {/* Render restricted XP pools if available */}
              {character.restricted_exp_pools && Array.isArray(character.restricted_exp_pools) ? (
                // Handle array format (from backend)
                character.restricted_exp_pools.map((pool, idx) => (
                  (pool.amount - (pool.spent || 0)) > 0 && (
                    <div key={idx} className="bg-purple-50 px-3 py-1 rounded-md border border-purple-100">
                      <span className="font-medium text-purple-700">{pool.source_virtue_flaw || 'Restricted'} XP:</span>
                      <span className="ml-1">{pool.amount - (pool.spent || 0)}</span>
                    </div>
                  )
                ))
              ) : (
                // Handle object format (possibly from older data)
                character.restricted_exp_pools && Object.entries(character.restricted_exp_pools).map(([category, amount]) => (
                  amount > 0 && (
                    <div key={category} className="bg-purple-50 px-3 py-1 rounded-md border border-purple-100">
                      <span className="font-medium text-purple-700">{category} XP:</span>
                      <span className="ml-1">{amount}</span>
                    </div>
                  )
                ))
              )}
            </div>
          )}
        </div>
        
        {abilitiesLoading && <p className="text-gray-500">Loading abilities...</p>}
        
        {/* Display error messages in a more visible format */}
        {abilitiesError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 text-red-700">
            <div className="flex items-start">
              <div className="mr-3">⚠️</div>
              <div>{abilitiesError}</div>
            </div>
          </div>
        )}
        
        {/* Always show abilities list even if there was an error */}
        <AbilityList
          abilities={abilities}
          onIncrementAbility={incrementAbility}
          onDecrementAbility={decrementAbility}
          onIncrementXP={incrementAbilityXP}
          onUpdateSpecialty={updateSpecialty}
          pendingOperations={pendingAbilityOperations}
        />
        
        <AbilitySelector
          onSelectAbility={handleAddAbility}
          characterType={character?.character_type || 'companion'}
          existingAbilities={abilities}
        />
      </section>
      
      {/* Toast notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
}

CharacteristicsAndAbilitiesTab.propTypes = {
  character: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    strength: PropTypes.number,
    stamina: PropTypes.number,
    dexterity: PropTypes.number,
    quickness: PropTypes.number,
    intelligence: PropTypes.number,
    presence: PropTypes.number,
    communication: PropTypes.number,
    perception: PropTypes.number,
    use_cunning: PropTypes.bool,
    total_improvement_points: PropTypes.number,
    character_type: PropTypes.string,
    age: PropTypes.number,
    general_exp_available: PropTypes.number,
    magical_exp_available: PropTypes.number,
    restricted_exp_pools: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
  }),
  onSave: PropTypes.func.isRequired
};

export default React.memo(CharacteristicsAndAbilitiesTab);