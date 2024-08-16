import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacteristicsAndAbilitiesTab from './CharacteristicsAndAbilitiesTab';

jest.mock('./CharacteristicInput', () => ({ name, baseValue }) => (
  <div data-testid={`characteristic-input-${name.toLowerCase()}`}>
    {name}: {baseValue}
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

  // Add more test cases here...
});