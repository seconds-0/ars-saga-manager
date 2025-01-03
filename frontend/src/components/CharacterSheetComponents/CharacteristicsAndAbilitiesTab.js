import React, { useState, useEffect } from 'react';
import CharacteristicInput from './CharacteristicInput';
import Toast from '../Toast';

function CharacteristicsAndAbilitiesTab({ character, onSave }) {
  const [characteristics, setCharacteristics] = useState({
    strength: 0, stamina: 0, dexterity: 0, quickness: 0,
    intelligence: 0, presence: 0, communication: 0, perception: 0
  });
  const [useCunning, setUseCunning] = useState(false);
  const [totalPoints, setTotalPoints] = useState(7);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

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
      setCharacteristics(characteristicValues);
      setUseCunning(character.useCunning || false);
      setTotalPoints(character.totalImprovementPoints || 7);
    }
  }, [character]);

  const getCost = (currentValue, increment) => {
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
  };

  const calculateSpentPoints = () => {
    return Object.values(characteristics).reduce((total, value) => {
      if (value > 0) return total + (value * (value + 1)) / 2;
      if (value < 0) return total - (Math.abs(value) * (Math.abs(value) + 1)) / 2;
      return total;
    }, 0);
  };

  const getAvailablePoints = () => totalPoints - calculateSpentPoints();

  const handleIncrement = (characteristic) => {
    if (characteristics[characteristic] < 3) {
      const cost = getCost(characteristics[characteristic], true);
      if (getAvailablePoints() >= cost) {
        setCharacteristics(prev => ({
          ...prev,
          [characteristic]: prev[characteristic] + 1
        }));
      } else {
        setToastMessage('Not enough improvement points available');
        setToastType('error');
      }
    } else {
      setToastMessage('Characteristic cannot exceed +3');
      setToastType('error');
    }
  };

  const handleDecrement = (characteristic) => {
    if (characteristics[characteristic] > -3) {
      setCharacteristics(prev => ({
        ...prev,
        [characteristic]: prev[characteristic] - 1
      }));
    } else {
      setToastMessage('Characteristic cannot be less than -3');
      setToastType('error');
    }
  };

  const handleSave = async () => {
    try {
      const characteristicsToSave = {
        ...characteristics,
        useCunning,
        totalImprovementPoints: totalPoints
      };
      
      console.log('Saving characteristics:', characteristicsToSave);
      await onSave(characteristicsToSave);
      setToastMessage('Characteristics saved successfully');
      setToastType('success');
    } catch (error) {
      console.error('Error saving characteristics:', error);
      setToastMessage('Failed to save characteristics. Please try again.');
      setToastType('error');
    }
  };

  const renderCharacteristic = (char) => (
    <div key={char} className="mb-2">
      <CharacteristicInput
        name={char}
        baseValue={characteristics[char.toLowerCase()]}
        onIncrement={() => handleIncrement(char.toLowerCase())}
        onDecrement={() => handleDecrement(char.toLowerCase())}
      />
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Characteristics</h2>
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={useCunning}
            onChange={() => setUseCunning(!useCunning)}
            className="mr-2"
          />
          Use Cunning instead of Intelligence
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Physical</h3>
          {['Strength', 'Stamina', 'Dexterity', 'Quickness'].map(renderCharacteristic)}
        </div>
        <div>
          <h3 className="font-semibold mb-2">Mental</h3>
          {['Intelligence', 'Presence', 'Communication', 'Perception'].map(renderCharacteristic)}
        </div>
      </div>
      <div className="mt-4">
        <p className="font-semibold" data-testid="available-points">
          Available Improvement Points: {getAvailablePoints()}
        </p>
      </div>
      <button
        onClick={handleSave}
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={getAvailablePoints() < 0}
      >
        Save Characteristics
      </button>
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

export default CharacteristicsAndAbilitiesTab;