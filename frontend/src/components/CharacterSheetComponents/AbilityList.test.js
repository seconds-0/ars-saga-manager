import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AbilityList from './AbilityList';
import { setupComponent, setupConsoleSuppress, CHARACTER_ABILITIES } from '../../__test-utils__';

// Setup console error suppression
setupConsoleSuppress();

// Mock AbilityInput component
jest.mock('./AbilityInput', () => {
  return function MockAbilityInput(props) {
    return (
      <div data-testid={`ability-input-${props.name}`}>
        <div>Name: {props.name}</div>
        <div>Base Value: {props.baseValue}</div>
        <div>Category: {props.category}</div>
        <button 
          onClick={props.onIncrement}
          data-testid={`increment-${props.name}`}
        >
          Increment
        </button>
        <button 
          onClick={props.onDecrement}
          data-testid={`decrement-${props.name}`}
        >
          Decrement
        </button>
        <input 
          type="text" 
          value={props.specialty || ''} 
          onChange={(e) => props.onSpecialtyChange(e.target.value)} 
          placeholder="Specialty"
          data-testid={`specialty-${props.name}`}
        />
      </div>
    );
  };
});

// Standardized setup function
function setup(customProps = {}) {
  // Create test abilities simulating our fixture format
  const mockAbilities = [
    { id: 1, ability_name: 'Athletics', score: 2, category: 'GENERAL', specialty: 'Running', effective_score: 2 },
    { id: 2, ability_name: 'Awareness', score: 1, category: 'GENERAL', specialty: null, effective_score: 1 },
    { id: 3, ability_name: 'Latin', score: 4, category: 'ACADEMIC', specialty: 'Academic texts', effective_score: 4 },
    { id: 4, ability_name: 'Single Weapon', score: 3, category: 'MARTIAL', specialty: 'Sword', effective_score: 3 }
  ];
  
  const defaultProps = {
    abilities: mockAbilities,
    onIncrementAbility: jest.fn(),
    onDecrementAbility: jest.fn(),
    onUpdateSpecialty: jest.fn()
  };

  return setupComponent(AbilityList, defaultProps, customProps);
}

describe('AbilityList', () => {
  describe('Rendering', () => {
    test('renders abilities grouped by category', () => {
      setup();
      
      // Check category headings
      expect(screen.getByText('General Abilities')).toBeInTheDocument();
      expect(screen.getByText('Academic Abilities')).toBeInTheDocument();
      expect(screen.getByText('Martial Abilities')).toBeInTheDocument();
      
      // Check individual abilities are present
      expect(screen.getByTestId('ability-input-Athletics')).toBeInTheDocument();
      expect(screen.getByTestId('ability-input-Awareness')).toBeInTheDocument();
      expect(screen.getByTestId('ability-input-Latin')).toBeInTheDocument();
      expect(screen.getByTestId('ability-input-Single Weapon')).toBeInTheDocument();
    });

    test('does not render category headings for empty categories', () => {
      setup();
      
      // Supernatural and Arcane categories should not be rendered
      expect(screen.queryByText('Supernatural Abilities')).not.toBeInTheDocument();
      expect(screen.queryByText('Arcane Abilities')).not.toBeInTheDocument();
    });

    test('passes correct props to AbilityInput components', () => {
      setup();
      
      // Check props for Athletics ability
      const athleticsElement = screen.getByTestId('ability-input-Athletics');
      expect(athleticsElement).toHaveTextContent('Name: Athletics');
      expect(athleticsElement).toHaveTextContent('Base Value: 2');
      expect(athleticsElement).toHaveTextContent('Category: GENERAL');
    });
  });

  describe('Empty State', () => {
    test('displays message when no abilities are present', () => {
      setup({ abilities: [] });
      
      expect(screen.getByText(/No abilities added yet/)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('calls onIncrementAbility with correct parameters when increment is clicked', () => {
      const { props } = setup();
      
      fireEvent.click(screen.getByTestId('increment-Athletics'));
      
      expect(props.onIncrementAbility).toHaveBeenCalledWith(1, 2);
    });

    test('calls onDecrementAbility with correct parameters when decrement is clicked', () => {
      const { props } = setup();
      
      fireEvent.click(screen.getByTestId('decrement-Awareness'));
      
      expect(props.onDecrementAbility).toHaveBeenCalledWith(2, 1);
    });

    test('calls onUpdateSpecialty with correct parameters when specialty is changed', () => {
      const { props } = setup();
      const newSpecialty = 'New specialty text';
      
      fireEvent.change(screen.getByTestId('specialty-Latin'), { 
        target: { value: newSpecialty } 
      });
      
      expect(props.onUpdateSpecialty).toHaveBeenCalledWith(3, newSpecialty);
    });
  });
});