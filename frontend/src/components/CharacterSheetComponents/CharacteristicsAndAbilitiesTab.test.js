import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import CharacteristicsAndAbilitiesTab from './CharacteristicsAndAbilitiesTab';

jest.mock('./CharacteristicInput', () => ({ name, baseValue, onIncrement, onDecrement }) => (
  <div data-testid={`characteristic-input-${name.toLowerCase()}`}>
    {name}: {baseValue}
    <button onClick={onIncrement} aria-label={`increment ${name}`}>+</button>
    <button onClick={onDecrement} aria-label={`decrement ${name}`}>-</button>
  </div>
));

jest.mock('../../components/Toast', () => ({ message, type }) => (
  <div data-testid="toast" data-type={type}>
    {message}
  </div>
));

const mockOnSave = jest.fn().mockResolvedValue(undefined);

const renderComponent = (props = {}) => {
  return render(
    <CharacteristicsAndAbilitiesTab
      character={null}
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
    it('should render with default values when no character is provided', () => {
      renderComponent();

      expect(screen.getByText('Characteristics')).toBeInTheDocument();
      expect(screen.getByText('Use Cunning instead of Intelligence')).toBeInTheDocument();
      expect(screen.getByText('Physical')).toBeInTheDocument();
      expect(screen.getByText('Mental')).toBeInTheDocument();
      expect(screen.getByText('Available Improvement Points: 7')).toBeInTheDocument();
      expect(screen.getByText('Save Characteristics')).toBeInTheDocument();

      const characteristics = ['strength', 'stamina', 'dexterity', 'quickness', 'intelligence', 'presence', 'communication', 'perception'];
      characteristics.forEach(char => {
        expect(screen.getByTestId(`characteristic-input-${char}`)).toHaveTextContent(`${char.charAt(0).toUpperCase() + char.slice(1)}: 0`);
      });
    });

    it('should render with pre-existing character data', () => {
      const mockCharacter = {
        strength: 2,
        stamina: 1,
        dexterity: -1,
        quickness: 0,
        intelligence: 3,
        presence: -2,
        communication: 1,
        perception: -3,
        useCunning: true,
        totalImprovementPoints: 10
      };

      renderComponent({ character: mockCharacter });

      expect(screen.getByText('Characteristics')).toBeInTheDocument();
      expect(screen.getByText('Use Cunning instead of Intelligence')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /use cunning instead of intelligence/i })).toBeChecked();
      expect(screen.getByText('Physical')).toBeInTheDocument();
      expect(screen.getByText('Mental')).toBeInTheDocument();
      
      // New expectation for Available Improvement Points
      expect(screen.getByText(/Available Improvement Points: \d+/)).toBeInTheDocument();
      
      expect(screen.getByText('Save Characteristics')).toBeInTheDocument();

      const characteristicEntries = Object.entries(mockCharacter).filter(
        ([char]) => char !== 'useCunning' && char !== 'totalImprovementPoints'
      );

      characteristicEntries.forEach(([char, value]) => {
        expect(screen.getByTestId(`characteristic-input-${char}`)).toHaveTextContent(
          `${char.charAt(0).toUpperCase() + char.slice(1)}: ${value}`
        );
      });
    });
  });

  describe('3.2.1 Incrementing Tests', () => {
    it('should increment a characteristic up to +3 and correctly spend points', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockCharacter = {
        strength: 0,
        totalImprovementPoints: 12 // Need 6 points total: 1 + 2 + 3 = 6 points to go from 0 to +3
      };
      renderComponent({ character: mockCharacter });

      // Act & Assert
      // Initial value should be 0, with all 12 points available
      expect(screen.getByTestId('characteristic-input-strength')).toHaveTextContent('Strength: 0');
      expect(screen.getByText('Available Improvement Points: 12')).toBeInTheDocument();

      // Click increment button 3 times to reach +3
      const incrementButtons = screen.getAllByRole('button', { name: /increment/i });
      const strengthIncrement = incrementButtons[0];

      // First increment (0 to +1) - costs 1 point
      await user.click(strengthIncrement);
      expect(screen.getByTestId('characteristic-input-strength')).toHaveTextContent('Strength: 1');
      const pointsAfterFirst = screen.getByText(/Available Improvement Points: \d+/);
      expect(pointsAfterFirst).toHaveTextContent('Available Improvement Points: 11'); // 12 - 1 = 11
      expect(Number(pointsAfterFirst.textContent.match(/\d+/)[0])).toBe(11);

      // Second increment (+1 to +2) - costs 2 points
      await user.click(strengthIncrement);
      expect(screen.getByTestId('characteristic-input-strength')).toHaveTextContent('Strength: 2');
      const pointsAfterSecond = screen.getByText(/Available Improvement Points: \d+/);
      expect(pointsAfterSecond).toHaveTextContent('Available Improvement Points: 9'); // 11 - 2 = 9
      expect(Number(pointsAfterSecond.textContent.match(/\d+/)[0])).toBe(9);

      // Third increment (+2 to +3) - costs 3 points
      await user.click(strengthIncrement);
      expect(screen.getByTestId('characteristic-input-strength')).toHaveTextContent('Strength: 3');
      const pointsAfterThird = screen.getByText(/Available Improvement Points: \d+/);
      expect(pointsAfterThird).toHaveTextContent('Available Improvement Points: 6'); // 9 - 3 = 6
      expect(Number(pointsAfterThird.textContent.match(/\d+/)[0])).toBe(6);
    });
  });
});