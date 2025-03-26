import React, { useState, useEffect, useMemo, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import CharacteristicInput from './CharacteristicInput';
import AbilityList from './AbilityList';
import AbilitySelector from './AbilitySelector';
import Toast from '../Toast';
import useAbilities from '../../hooks/useAbilities';

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

  // Get abilities from custom hook
  const abilitiesHook = useAbilities(character?.id);
  const abilities = abilitiesHook?.abilities || [];
  const abilitiesLoading = abilitiesHook?.loading || false;
  const abilitiesError = abilitiesHook?.error || null;
  const addAbility = abilitiesHook?.addAbility || (() => Promise.resolve(true));
  const incrementAbility = abilitiesHook?.incrementAbility || (() => Promise.resolve(true));
  const decrementAbility = abilitiesHook?.decrementAbility || (() => Promise.resolve(true));
  const updateSpecialty = abilitiesHook?.updateSpecialty || (() => Promise.resolve(true));

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

  // Memoized validation for save button
  const canSave = useMemo(() => {
    return availablePoints >= 0;
  }, [availablePoints]);

  // Handle saving character data
  const handleSave = async () => {
    try {
      const updatedData = {
        ...characteristics,
        use_cunning,
        total_improvement_points: totalPoints
      };
      
      await onSave(updatedData);
      setToastMessage('Characteristics saved successfully');
      setToastType('success');
    } catch (error) {
      console.error('Error saving characteristics:', error);
      setToastMessage('Failed to save characteristics. Please try again.');
      setToastType('error');
    }
  };

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
        <div className="mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={use_cunning}
              onChange={() => setUseCunning(!use_cunning)}
              className="mr-2 h-4 w-4"
            />
            <span className="select-none">Use Cunning instead of Intelligence</span>
          </label>
        </div>
        
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
          <button
            onClick={handleSave}
            className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors 
              ${!canSave ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!canSave}
          >
            Save Characteristics
          </button>
        </div>
      </section>
      
      {/* Abilities Section */}
      <section>
        <h2 className="text-xl font-bold mb-4">Abilities</h2>
        
        {abilitiesLoading && <p className="text-gray-500">Loading abilities...</p>}
        {abilitiesError && <p className="text-red-500">{abilitiesError}</p>}
        
        {!abilitiesLoading && !abilitiesError && (
          <>
            <AbilityList
              abilities={abilities}
              onIncrementAbility={incrementAbility}
              onDecrementAbility={decrementAbility}
              onUpdateSpecialty={updateSpecialty}
            />
            
            <AbilitySelector
              onSelectAbility={handleAddAbility}
              characterType={character?.character_type || 'companion'}
              existingAbilities={abilities}
            />
          </>
        )}
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
    character_type: PropTypes.string
  }),
  onSave: PropTypes.func.isRequired
};

export default React.memo(CharacteristicsAndAbilitiesTab);