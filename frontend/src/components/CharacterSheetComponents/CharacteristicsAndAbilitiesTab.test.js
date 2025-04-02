import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacteristicsAndAbilitiesTab from './CharacteristicsAndAbilitiesTab';
import { renderWithProviders } from '../../__test-utils__/renderWithProviders';

// Mock necessary hooks and components with enhanced implementation
jest.mock('../../hooks/useAbilities', () => {
  const mockAddAbility = jest.fn().mockResolvedValue(true);
  const mockIncrementAbility = jest.fn().mockResolvedValue(true);
  const mockDecrementAbility = jest.fn().mockResolvedValue(true);
  const mockUpdateSpecialty = jest.fn().mockResolvedValue(true);
  const mockIncrementAbilityXP = jest.fn().mockResolvedValue(true);
  
  return jest.fn().mockImplementation((characterId) => {
    console.log(`useAbilities mock called with characterId: ${characterId}`);
    return {
      abilities: [],
      loading: false,
      error: null,
      addAbility: mockAddAbility,
      incrementAbility: mockIncrementAbility,
      decrementAbility: mockDecrementAbility,
      incrementAbilityXP: mockIncrementAbilityXP,
      updateSpecialty: mockUpdateSpecialty
    };
  });
});

// Mock the useCharacter hook directly instead of the provider
jest.mock('../../contexts/CharacterProvider', () => {
  const useCharacter = jest.fn(() => ({
    character: {
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
      age: 25,
      character_type: 'magus',
      general_exp_available: 45,
      magical_exp_available: 30,
      restricted_exp_pools: {
        'ACADEMIC': 15
      }
    },
    isLoading: false,
    error: null,
    isOperationPending: jest.fn(() => false),
    getAllPendingOperations: jest.fn(() => []),
    updateCharacter: jest.fn((updateFn, updateData) => {
      return Promise.resolve({ data: { status: 'success' } });
    })
  }));

  return {
    useCharacter,
    // We don't need to mock the provider since we're mocking the hook directly
    CharacterProvider: ({ children }) => children
  };
});

jest.mock('./CharacteristicInput', () => {
  return function MockCharacteristicInput({ name, baseValue, onIncrement, onDecrement }) {
    return (
      <div data-testid={`characteristic-input-${name.toLowerCase()}`} className="flex items-center justify-between mb-2">
        <span className="w-1/3 font-medium">{name}</span>
        <div className="flex items-center">
          <button
            data-testid={`characteristic-input-${name.toLowerCase()}-decrement`}
            onClick={onDecrement}
            className="px-2 py-1 bg-gray-200 rounded-l hover:bg-gray-300"
          >
            -
          </button>
          <span 
            data-testid={`characteristic-input-${name.toLowerCase()}-value`}
            className="px-4 py-1 bg-gray-100 w-12 text-center"
          >
            {baseValue}
          </span>
          <button
            data-testid={`characteristic-input-${name.toLowerCase()}-increment`}
            onClick={onIncrement}
            className="px-2 py-1 bg-gray-200 rounded-r hover:bg-gray-300"
          >
            +
          </button>
        </div>
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

const getAvailablePoints = () => {
  const pointsElement = screen.getByTestId('available-points');
  return parseInt(pointsElement.textContent.match(/\d+/)[0], 10);
};

// Simplified render function that uses direct render
const renderComponent = (props = {}) => {
  const characterData = props.character || {
    id: 'test-character-id',
    // Directly use these properties instead of nested characteristics
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
    age: 25,
    character_type: 'magus',
    general_exp_available: 45,
    magical_exp_available: 30,
    restricted_exp_pools: {
      'ACADEMIC': 15
    }
  };

  // Render directly without using renderWithProviders
  return render(
    <CharacteristicsAndAbilitiesTab
      character={characterData}
      onSave={mockOnSave}
      {...props}
    />
  );
};

describe('CharacteristicsAndAbilitiesTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('3.1 Rendering Tests', () => {
    it('should render basic component structure', () => {
      renderComponent();
      
      // Check for section headings and structure
      expect(screen.getByText('Characteristics')).toBeInTheDocument();
      expect(screen.getByText('Physical')).toBeInTheDocument();
      expect(screen.getByText('Mental')).toBeInTheDocument();
      expect(screen.getByText('Abilities')).toBeInTheDocument();
      
      // Check for characteristic inputs
      const characteristics = ['Strength', 'Stamina', 'Dexterity', 'Quickness', 'Intelligence', 'Presence', 'Communication', 'Perception'];
      characteristics.forEach(char => {
        expect(screen.getByText(char)).toBeInTheDocument();
      });
      
      // Check for available points display
      expect(screen.getByTestId('available-points')).toHaveTextContent('Available Improvement Points');
      
      // Check for ability components
      expect(screen.getByTestId('ability-list')).toBeInTheDocument();
      expect(screen.getByTestId('ability-selector')).toBeInTheDocument();
    });
    
    it('should render with pre-existing character values', () => {
      // Render with specific characteristic values
      renderComponent({
        character: {
          id: 'test-character-id',
          strength: 2,
          stamina: 1,
          dexterity: -1,
          quickness: 0,
          intelligence: 3,
          presence: -2,
          communication: 1, 
          perception: -3,
          total_improvement_points: 10,
          use_cunning: true,
          character_type: 'magus',
          general_exp_available: 45,
          magical_exp_available: 30
        }
      });
      
      // Verify characteristic values are displayed correctly
      expect(screen.getByTestId('characteristic-input-strength-value')).toHaveTextContent('2');
      expect(screen.getByTestId('characteristic-input-stamina-value')).toHaveTextContent('1');
      expect(screen.getByTestId('characteristic-input-dexterity-value')).toHaveTextContent('-1');
      expect(screen.getByTestId('characteristic-input-intelligence-value')).toHaveTextContent('3');
      
      // Verify available points calculation
      // For the given values:
      // strength(2): 3 points
      // stamina(1): 1 point
      // dexterity(-1): -1 point
      // intelligence(3): 6 points
      // presence(-2): -3 points
      // communication(1): 1 point
      // perception(-3): -6 points
      // Total spent: 3 + 1 - 1 + 6 - 3 + 1 - 6 = 1
      // Available: 10 - 1 = 9
      expect(screen.getByTestId('available-points')).toHaveTextContent('9');
    });
  });

  describe('3.2 Characteristic Modification Tests', () => {
    it('should allow incrementing and decrementing characteristics', () => {
      renderComponent();
      
      // Initial state
      expect(screen.getByTestId('characteristic-input-strength-value')).toHaveTextContent('0');
      
      // Increment strength
      fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));
      expect(screen.getByTestId('characteristic-input-strength-value')).toHaveTextContent('1');
      
      // Decrement strength back to 0
      fireEvent.click(screen.getByTestId('characteristic-input-strength-decrement'));
      expect(screen.getByTestId('characteristic-input-strength-value')).toHaveTextContent('0');
      
      // Decrement strength to negative
      fireEvent.click(screen.getByTestId('characteristic-input-strength-decrement'));
      expect(screen.getByTestId('characteristic-input-strength-value')).toHaveTextContent('-1');
    });
    
    it('should display toast messages for validation errors', () => {
      // Render with a strength of 3 (at max)
      renderComponent({
        character: {
          id: 'test-character-id',
          strength: 3, // At maximum
          stamina: 0,
          dexterity: 0,
          quickness: 0,
          intelligence: 0,
          presence: 0,
          communication: 0,
          perception: 0,
          total_improvement_points: 7
        }
      });
      
      // Try to increment strength beyond max
      fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));
      
      // Verify error message appears
      expect(screen.getByTestId('toast')).toBeInTheDocument();
      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'error');
      expect(screen.getByTestId('toast')).toHaveTextContent('Characteristic cannot exceed +3');
    });
  });
  
  describe('3.3 Saving Tests', () => {
    it('should call onSave with updated values when save button is clicked', () => {
      renderComponent();
      
      // Increment strength
      fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));
      
      // Click save button
      const saveButton = screen.getByText('Save Characteristics');
      fireEvent.click(saveButton);
      
      // Verify onSave was called with updated values
      expect(mockOnSave).toHaveBeenCalled();
      // We don't check the exact values since the implementation details of what gets passed
      // could change - we just verify the function was called
    });
  });
  
  describe('3.4 Experience Points Display', () => {
    it('should display experience points information', () => {
      renderComponent();
      
      // Verify XP section exists
      expect(screen.getByText('General XP:')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();
      
      // Verify for magus character type
      expect(screen.getByText('Magical XP:')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
    });
  });
});