import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacteristicsAndAbilitiesTab from './CharacteristicsAndAbilitiesTab';
import { CharacterProvider } from '../../contexts/CharacterProvider';

// Mock necessary hooks and components
jest.mock('../../hooks/useAbilities', () => {
  const mockAddAbility = jest.fn().mockResolvedValue(true);
  const mockIncrementAbility = jest.fn().mockResolvedValue(true);
  const mockDecrementAbility = jest.fn().mockResolvedValue(true);
  const mockUpdateSpecialty = jest.fn().mockResolvedValue(true);
  const mockIncrementAbilityXP = jest.fn().mockResolvedValue(true);
  
  return jest.fn().mockImplementation(() => ({
    abilities: [],
    loading: false,
    error: null,
    addAbility: mockAddAbility,
    incrementAbility: mockIncrementAbility,
    decrementAbility: mockDecrementAbility,
    incrementAbilityXP: mockIncrementAbilityXP,
    updateSpecialty: mockUpdateSpecialty
  }));
});

// Mock the hook directly rather than the module
const mockUseCharacter = {
  character: {
    id: 'test-id',
    strength: 0,
    stamina: 0,
    dexterity: 0,
    quickness: 0,
    intelligence: 0,
    presence: 0,
    communication: 0,
    perception: 0,
    total_improvement_points: 7,
    use_cunning: false,
    character_type: 'magus'
  },
  isLoading: false,
  error: null,
  isOperationPending: jest.fn(() => false),
  // Make sure this returns an array that won't cause errors in the component
  getAllPendingOperations: jest.fn(() => []), 
  updateCharacter: jest.fn((updateFn) => Promise.resolve({ data: {} }))
};

jest.mock('../../contexts/CharacterProvider', () => ({
  useCharacter: () => mockUseCharacter
}));

// Mock simple components
jest.mock('./CharacteristicInput', () => {
  return function MockCharacteristicInput({ name, baseValue, onIncrement, onDecrement }) {
    return (
      <div data-testid={`characteristic-input-${name.toLowerCase()}`}>
        <span>{name}</span>
        <span data-testid={`characteristic-input-${name.toLowerCase()}-value`}>{baseValue}</span>
        <button
          data-testid={`characteristic-input-${name.toLowerCase()}-decrement`}
          onClick={onDecrement}
        >
          -
        </button>
        <button
          data-testid={`characteristic-input-${name.toLowerCase()}-increment`}
          onClick={onIncrement}
        >
          +
        </button>
      </div>
    );
  };
});

jest.mock('./AbilityList', () => {
  return function MockAbilityList() {
    return <div data-testid="ability-list">AbilityList</div>;
  };
});

jest.mock('./AbilitySelector', () => {
  return function MockAbilitySelector() {
    return <div data-testid="ability-selector">AbilitySelector</div>;
  };
});

jest.mock('../../components/Toast', () => ({ message, type }) => (
  <div data-testid="toast" data-type={type}>
    {message}
  </div>
));

const mockOnSave = jest.fn().mockResolvedValue(undefined);

describe('CharacteristicsAndAbilitiesTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default values', () => {
    render(
      <CharacteristicsAndAbilitiesTab 
        character={{
          id: 'test-character-id',
          strength: 0,
          stamina: 0,
          dexterity: 0,
          quickness: 0,
          intelligence: 0,
          presence: 0,
          communication: 0,
          perception: 0,
          total_improvement_points: 7,
          use_cunning: false,
          character_type: 'magus'
        }}
        onSave={mockOnSave}
      />
    );

    // Basic assertions to verify rendering
    expect(screen.getByText('Characteristics')).toBeInTheDocument();
    expect(screen.getByText('Physical')).toBeInTheDocument();
    expect(screen.getByText('Mental')).toBeInTheDocument();
    
    // Check characteristic inputs
    const characteristics = ['strength', 'stamina', 'dexterity', 'quickness', 'intelligence', 'presence', 'communication', 'perception'];
    characteristics.forEach(char => {
      const name = char.charAt(0).toUpperCase() + char.slice(1);
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });
});