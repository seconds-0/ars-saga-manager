import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacteristicsAndAbilitiesTab from './CharacteristicsAndAbilitiesTab';

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
      expect(screen.getByTestId('available-points')).toHaveTextContent('Available Improvement Points: 7');
      expect(screen.getByText('Save Characteristics')).toBeInTheDocument();

      const characteristics = ['strength', 'stamina', 'dexterity', 'quickness', 'intelligence', 'presence', 'communication', 'perception'];
      characteristics.forEach(char => {
        const name = char.charAt(0).toUpperCase() + char.slice(1);
        expect(screen.getByText(name)).toBeInTheDocument();
        expect(screen.getByTestId(`characteristic-input-${char}-value`)).toHaveTextContent('0');
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
        use_cunning: true,
        total_improvement_points: 10
      };

      renderComponent({ character: mockCharacter });

      expect(screen.getByText('Characteristics')).toBeInTheDocument();
      expect(screen.getByText('Use Cunning instead of Intelligence')).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /use cunning instead of intelligence/i })).toBeChecked();
      expect(screen.getByText('Physical')).toBeInTheDocument();
      expect(screen.getByText('Mental')).toBeInTheDocument();
      
      expect(screen.getByTestId('available-points')).toHaveTextContent(/Available Improvement Points: \d+/);
      
      expect(screen.getByText('Save Characteristics')).toBeInTheDocument();

      const characteristicEntries = Object.entries(mockCharacter).filter(
        ([char]) => char !== 'use_cunning' && char !== 'total_improvement_points'
      );

      characteristicEntries.forEach(([char, value]) => {
        const name = char.charAt(0).toUpperCase() + char.slice(1);
        expect(screen.getByText(name)).toBeInTheDocument();
        expect(screen.getByTestId(`characteristic-input-${char}-value`)).toHaveTextContent(value.toString());
      });
    });
  });

  describe('3.2 Characteristic Modification Tests', () => {
    describe('increment characteristic', () => {
      it('should increment a characteristic and update points correctly', () => {
        // This test should:
        // 1. Start with a fresh character (all stats 0, 7 points)
        // 2. Increment strength once
        // 3. Verify strength is now 1
        // 4. Verify available points reduced by 1 (to 6)
        
        const mockCharacter = {
          strength: 0,
          stamina: 0,
          dexterity: 0,
          quickness: 0,
          intelligence: 0,
          presence: 0,
          communication: 0,
          perception: 0,
          total_improvement_points: 7
        };

        renderComponent({ character: mockCharacter });

        // Verify initial state
        const strengthName = screen.getByText('Strength');
        const strengthValue = screen.getByTestId('characteristic-input-strength-value');
        expect(strengthName).toBeInTheDocument();
        expect(strengthValue).toHaveTextContent('0');
        expect(getAvailablePoints()).toBe(7);

        // Increment strength
        fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));

        // Verify new state
        expect(strengthValue).toHaveTextContent('1');
        expect(getAvailablePoints()).toBe(6);
      });

      // Falsification tests
      it('should detect incorrect initial points', () => {
        const mockCharacter = {
          strength: 0,
          stamina: 0,
          dexterity: 0,
          quickness: 0,
          intelligence: 0,
          presence: 0,
          communication: 0,
          perception: 0,
          total_improvement_points: 6  // Providing 6 points
        };

        renderComponent({ character: mockCharacter });
        
        // Test passes if the component correctly uses the provided points
        const points = getAvailablePoints();
        expect(points).toBe(6);  // Should match the provided total_improvement_points
        expect(points).not.toBe(7);  // Should not use the default value
      });

      it('should detect incorrect increment behavior', () => {
        const mockCharacter = {
          strength: 0,
          stamina: 0,
          dexterity: 0,
          quickness: 0,
          intelligence: 0,
          presence: 0,
          communication: 0,
          perception: 0,
          total_improvement_points: 7
        };

        renderComponent({ character: mockCharacter });
        const strengthValue = screen.getByTestId('characteristic-input-strength-value');
        
        // Increment strength
        fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));

        // Test passes if strength is correctly incremented to 1, not 2
        expect(strengthValue).not.toHaveTextContent('2');
        expect(strengthValue).toHaveTextContent('1');
      });

      it('should detect incorrect point deduction', () => {
        const mockCharacter = {
          strength: 0,
          stamina: 0,
          dexterity: 0,
          quickness: 0,
          intelligence: 0,
          presence: 0,
          communication: 0,
          perception: 0,
          total_improvement_points: 7
        };

        renderComponent({ character: mockCharacter });
        
        // Increment strength
        fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));

        // Test passes if points are correctly deducted (should be 6, not 7)
        expect(getAvailablePoints()).not.toBe(7);
        expect(getAvailablePoints()).toBe(6);
      });
    });

    describe('decrement characteristic', () => {
      it('should decrement a characteristic and update points correctly', () => {
        // This test should:
        // 1. Start with a character with strength 1
        // 2. Decrement strength once
        // 3. Verify strength is now 0
        // 4. Verify available points increased by 1 (back to 7)
        
        const mockCharacter = {
          strength: 1,
          stamina: 0,
          dexterity: 0,
          quickness: 0,
          intelligence: 0,
          presence: 0,
          communication: 0,
          perception: 0,
          total_improvement_points: 7  // Total points available
        };

        renderComponent({ character: mockCharacter });

        // Verify initial state
        const strengthValue = screen.getByTestId('characteristic-input-strength-value');
        expect(strengthValue).toHaveTextContent('1');
        // With strength at 1, we've spent 1 point, so 6 remaining
        expect(getAvailablePoints()).toBe(6);

        // Decrement strength
        fireEvent.click(screen.getByTestId('characteristic-input-strength-decrement'));

        // Verify new state
        expect(strengthValue).toHaveTextContent('0');
        // After decrementing, we get the 1 point back
        expect(getAvailablePoints()).toBe(7);
      });

      // Falsification tests
      it('should detect incorrect decrement behavior', () => {
        const mockCharacter = {
          strength: 1,
          stamina: 0,
          dexterity: 0,
          quickness: 0,
          intelligence: 0,
          presence: 0,
          communication: 0,
          perception: 0,
          total_improvement_points: 7
        };

        renderComponent({ character: mockCharacter });
        const strengthValue = screen.getByTestId('characteristic-input-strength-value');
        
        // Decrement strength
        fireEvent.click(screen.getByTestId('characteristic-input-strength-decrement'));

        // Test passes if strength correctly decrements to 0, not -1
        expect(strengthValue).not.toHaveTextContent('-1');
        expect(strengthValue).toHaveTextContent('0');
      });

      it('should detect incorrect point restoration', () => {
        const mockCharacter = {
          strength: 1,
          stamina: 0,
          dexterity: 0,
          quickness: 0,
          intelligence: 0,
          presence: 0,
          communication: 0,
          perception: 0,
          total_improvement_points: 7
        };

        renderComponent({ character: mockCharacter });
        
        // Decrement strength
        fireEvent.click(screen.getByTestId('characteristic-input-strength-decrement'));

        // Test passes if points are correctly restored (should be 7, not 6)
        expect(getAvailablePoints()).not.toBe(6);
        expect(getAvailablePoints()).toBe(7);
      });
    });

    it('should prevent incrementing when not enough points available', () => {
      const mockCharacter = {
        strength: 2,  // Starting at 2 means next increment costs 3 points
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 3  // Only 3 points total
      };

      renderComponent({ character: mockCharacter });

      // Verify initial state
      const strengthValue = screen.getByTestId('characteristic-input-strength-value');
      expect(strengthValue).toHaveTextContent('2');
      expect(getAvailablePoints()).toBe(0);  // 3 - (1 + 2) for strength = 2

      // Try to increment strength (would cost 3 points)
      fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));

      // Verify strength didn't change and points remain the same
      expect(strengthValue).toHaveTextContent('2');
      expect(getAvailablePoints()).toBe(0);

      // Verify error message
      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'error');
      expect(screen.getByTestId('toast')).toHaveTextContent('Not enough improvement points available');
    });

    it('should prevent incrementing beyond maximum value (+3)', () => {
      const mockCharacter = {
        strength: 3,  // Already at max
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 15
      };

      renderComponent({ character: mockCharacter });

      // Verify initial state
      const strengthValue = screen.getByTestId('characteristic-input-strength-value');
      expect(strengthValue).toHaveTextContent('3');

      // Try to increment strength beyond max
      fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));

      // Verify strength didn't change
      expect(strengthValue).toHaveTextContent('3');

      // Verify error message
      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'error');
      expect(screen.getByTestId('toast')).toHaveTextContent('Characteristic cannot exceed +3');
    });

    it('should prevent decrementing below minimum value (-3)', () => {
      const mockCharacter = {
        strength: -3,  // Already at min
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 15
      };

      renderComponent({ character: mockCharacter });

      // Verify initial state
      const strengthValue = screen.getByTestId('characteristic-input-strength-value');
      expect(strengthValue).toHaveTextContent('-3');

      // Try to decrement strength below min
      fireEvent.click(screen.getByTestId('characteristic-input-strength-decrement'));

      // Verify strength didn't change
      expect(strengthValue).toHaveTextContent('-3');

      // Verify error message
      expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'error');
      expect(screen.getByTestId('toast')).toHaveTextContent('Characteristic cannot be less than -3');
    });

    it('should calculate points correctly for negative values', () => {
      const mockCharacter = {
        strength: 0,
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 7
      };

      renderComponent({ character: mockCharacter });

      // Verify initial state
      const strengthValue = screen.getByTestId('characteristic-input-strength-value');
      expect(strengthValue).toHaveTextContent('0');
      expect(getAvailablePoints()).toBe(7);

      // Decrement to -1 (gain 1 point)
      fireEvent.click(screen.getByTestId('characteristic-input-strength-decrement'));
      expect(strengthValue).toHaveTextContent('-1');
      expect(getAvailablePoints()).toBe(8);  // 7 + 1

      // Decrement to -2 (gain 2 more points)
      fireEvent.click(screen.getByTestId('characteristic-input-strength-decrement'));
      expect(strengthValue).toHaveTextContent('-2');
      expect(getAvailablePoints()).toBe(10);  // 8 + 2

      // Verify final state
      expect(screen.getByTestId('characteristic-input-strength-value')).toHaveTextContent('-2');
      expect(getAvailablePoints()).toBe(10);
    });

    it('should calculate points correctly for positive values', () => {
      // This test should:
      // 1. Start with a fresh character
      // 2. Increment characteristic to 1 (costs 1)
      // 3. Verify points
      // 4. Increment to 2 (costs 2 more)
      // 5. Verify points
    });

    it('should handle multiple characteristic modifications', () => {
      // This test should:
      // 1. Start with a fresh character
      // 2. Modify 2-3 different characteristics
      // 3. Verify each characteristic value
      // 4. Verify total points remaining is correct
    });
  });

  describe('3.3 Point Calculation Tests', () => {
    it('should calculate costs correctly for each characteristic level', () => {
      const mockCharacter = {
        strength: 0,
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 15
      };

      renderComponent({ character: mockCharacter });
      const strengthValue = screen.getByTestId('characteristic-input-strength-value');
      
      // Test point costs for increasing values
      // 0 -> 1 costs 1 point
      fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));
      expect(strengthValue).toHaveTextContent('1');
      expect(getAvailablePoints()).toBe(14);  // 15 - 1

      // 1 -> 2 costs 2 points
      fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));
      expect(strengthValue).toHaveTextContent('2');
      expect(getAvailablePoints()).toBe(12);  // 14 - 2

      // 2 -> 3 costs 3 points
      fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));
      expect(strengthValue).toHaveTextContent('3');
      expect(getAvailablePoints()).toBe(9);   // 12 - 3
    });

    it('should calculate costs correctly for negative values', () => {
      const mockCharacter = {
        strength: 0,
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 7
      };

      renderComponent({ character: mockCharacter });
      const strengthValue = screen.getByTestId('characteristic-input-strength-value');
      
      // Test point gains for decreasing values
      // 0 -> -1 gains 1 point
      fireEvent.click(screen.getByTestId('characteristic-input-strength-decrement'));
      expect(strengthValue).toHaveTextContent('-1');
      expect(getAvailablePoints()).toBe(8);  // 7 + 1

      // -1 -> -2 gains 2 points
      fireEvent.click(screen.getByTestId('characteristic-input-strength-decrement'));
      expect(strengthValue).toHaveTextContent('-2');
      expect(getAvailablePoints()).toBe(10); // 8 + 2

      // -2 -> -3 gains 3 points
      fireEvent.click(screen.getByTestId('characteristic-input-strength-decrement'));
      expect(strengthValue).toHaveTextContent('-3');
      expect(getAvailablePoints()).toBe(13); // 10 + 3
    });

    it('should handle complex point calculations with multiple characteristics', () => {
      const mockCharacter = {
        strength: 0,
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 20
      };

      renderComponent({ character: mockCharacter });
      
      // Increment strength to 2 (costs 1 + 2 = 3 points)
      fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));
      fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));
      expect(getAvailablePoints()).toBe(17);  // 20 - 3

      // Decrement dexterity to -2 (gains 1 + 2 = 3 points)
      fireEvent.click(screen.getByTestId('characteristic-input-dexterity-decrement'));
      fireEvent.click(screen.getByTestId('characteristic-input-dexterity-decrement'));
      expect(getAvailablePoints()).toBe(20);  // 17 + 3

      // Increment intelligence to 3 (costs 1 + 2 + 3 = 6 points)
      fireEvent.click(screen.getByTestId('characteristic-input-intelligence-increment'));
      fireEvent.click(screen.getByTestId('characteristic-input-intelligence-increment'));
      fireEvent.click(screen.getByTestId('characteristic-input-intelligence-increment'));
      expect(getAvailablePoints()).toBe(14);  // 20 - 6

      // Final state verification
      expect(screen.getByTestId('characteristic-input-strength-value')).toHaveTextContent('2');
      expect(screen.getByTestId('characteristic-input-dexterity-value')).toHaveTextContent('-2');
      expect(screen.getByTestId('characteristic-input-intelligence-value')).toHaveTextContent('3');
    });

    // Falsification test
    it('should detect incorrect point calculations', () => {
      const mockCharacter = {
        strength: 0,
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 10
      };

      renderComponent({ character: mockCharacter });
      
      // Increment strength to 2
      fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));
      fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));

      // Test passes if points are correctly calculated (should be 7, not 8)
      expect(getAvailablePoints()).not.toBe(8);
      expect(getAvailablePoints()).toBe(7);
    });
  });

  describe('3.4 Saving Tests', () => {
    // Increase timeout for all saving tests
    jest.setTimeout(10000);

    it('should save characteristics successfully', async () => {
      const mockCharacter = {
        strength: 0,
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 10,
        use_cunning: false
      };

      renderComponent({ character: mockCharacter });

      // Increment strength and intelligence
      fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));
      fireEvent.click(screen.getByTestId('characteristic-input-intelligence-increment'));

      // Click save button
      const saveButton = screen.getByText('Save Characteristics');
      fireEvent.click(saveButton);

      // Verify onSave was called with correct data
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockCharacter,
        strength: 1,
        intelligence: 1,
        total_improvement_points: 10  // The component doesn't update total_improvement_points
      });

      // Verify success message appears
      await waitFor(() => {
        expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'success');
      }, { timeout: 6000 });

      // Verify success message content
      await waitFor(() => {
        expect(screen.getByTestId('toast')).toHaveTextContent('Characteristics saved successfully');
      }, { timeout: 6000 });
    });

    it('should handle save failures gracefully', async () => {
      mockOnSave.mockRejectedValueOnce(new Error('Save failed'));
      renderComponent();

      // Click save button
      const saveButton = screen.getByText('Save Characteristics');
      fireEvent.click(saveButton);

      // Verify error message type
      await waitFor(() => {
        expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'error');
      }, { timeout: 6000 });

      // Verify error message content
      await waitFor(() => {
        expect(screen.getByTestId('toast')).toHaveTextContent('Failed to save characteristics. Please try again.');
      }, { timeout: 6000 });
    });

    it('should fail if save succeeds but returns incorrect data', async () => {
      const mockCharacter = {
        strength: 0,
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 10,
        use_cunning: false
      };

      renderComponent({ character: mockCharacter });

      // Increment strength once
      fireEvent.click(screen.getByTestId('characteristic-input-strength-increment'));

      // Click save button
      const saveButton = screen.getByText('Save Characteristics');
      fireEvent.click(saveButton);

      // This should fail because the saved data doesn't match what we expect
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          ...mockCharacter,
          strength: 1,  // We only incremented once
          total_improvement_points: 10  // The component doesn't update total_improvement_points
        });
      }, { timeout: 6000 });

      // Verify success message appears
      await waitFor(() => {
        expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'success');
      }, { timeout: 6000 });
    });
  });

  describe('3.5 Use Cunning Functionality', () => {
    it('should toggle the Use Cunning checkbox', () => {
      const mockCharacter = {
        strength: 0,
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 10,
        use_cunning: false
      };

      renderComponent({ character: mockCharacter });

      // Get the checkbox
      const checkbox = screen.getByRole('checkbox', { name: /use cunning instead of intelligence/i });
      
      // Verify initial state
      expect(checkbox).not.toBeChecked();

      // Toggle checkbox
      fireEvent.click(checkbox);

      // Verify checkbox is now checked
      expect(checkbox).toBeChecked();

      // Toggle back
      fireEvent.click(checkbox);

      // Verify checkbox is unchecked again
      expect(checkbox).not.toBeChecked();
    });

    it('should preserve Use Cunning state when saving', async () => {
      const mockCharacter = {
        strength: 0,
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 10,
        use_cunning: false
      };

      renderComponent({ character: mockCharacter });

      // Toggle Use Cunning on
      const checkbox = screen.getByRole('checkbox', { name: /use cunning instead of intelligence/i });
      fireEvent.click(checkbox);

      // Save the character
      const saveButton = screen.getByText('Save Characteristics');
      fireEvent.click(saveButton);

      // Verify onSave was called with use_cunning: true
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
          use_cunning: true
        }));
      });

      // Verify success message
      await waitFor(() => {
        expect(screen.getByTestId('toast')).toHaveAttribute('data-type', 'success');
      });
    });

    it('should load with Use Cunning enabled if character has it enabled', () => {
      const mockCharacter = {
        strength: 0,
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 10,
        use_cunning: true  // Pre-enabled
      };

      renderComponent({ character: mockCharacter });

      // Verify checkbox is checked
      const checkbox = screen.getByRole('checkbox', { name: /use cunning instead of intelligence/i });
      expect(checkbox).toBeChecked();
    });

    // Falsification tests
    it('should detect incorrect initial Use Cunning state', () => {
      const mockCharacter = {
        strength: 0,
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 10,
        use_cunning: true
      };

      renderComponent({ character: mockCharacter });

      // Verify the checkbox correctly reflects the initial state
      const checkbox = screen.getByRole('checkbox', { name: /use cunning instead of intelligence/i });
      expect(checkbox).toBeChecked();  // Should be checked because use_cunning is true
      expect(checkbox).not.toHaveAttribute('checked', false);  // Should not be unchecked
    });

    it('should detect incorrect toggle behavior', () => {
      const mockCharacter = {
        strength: 0,
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 10,
        use_cunning: false
      };

      renderComponent({ character: mockCharacter });

      const checkbox = screen.getByRole('checkbox', { name: /use cunning instead of intelligence/i });
      
      // Initial state verification
      expect(checkbox).not.toBeChecked();
      expect(checkbox).not.toHaveAttribute('checked', true);

      // Toggle on
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      expect(checkbox).not.toHaveAttribute('checked', false);

      // Toggle off
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
      expect(checkbox).not.toHaveAttribute('checked', true);
    });

    it('should detect incorrect Use Cunning state preservation', async () => {
      const mockCharacter = {
        strength: 0,
        stamina: 0,
        dexterity: 0,
        quickness: 0,
        intelligence: 0,
        presence: 0,
        communication: 0,
        perception: 0,
        total_improvement_points: 10,
        use_cunning: false
      };

      renderComponent({ character: mockCharacter });

      // Toggle Use Cunning on
      const checkbox = screen.getByRole('checkbox', { name: /use cunning instead of intelligence/i });
      fireEvent.click(checkbox);

      // Save the character
      const saveButton = screen.getByText('Save Characteristics');
      fireEvent.click(saveButton);

      // Verify the saved state is correct
      await waitFor(() => {
        const savedData = mockOnSave.mock.calls[0][0];
        expect(savedData.use_cunning).toBe(true);  // Should be true because we toggled it on
      });

      // Verify the saved state is not incorrect
      await waitFor(() => {
        const savedData = mockOnSave.mock.calls[0][0];
        expect(savedData.use_cunning).not.toBe(false);  // Should not be false
      });
        
      // Verify UI state is correct
      await waitFor(() => {
        expect(checkbox).toBeChecked();
      });

      // Verify UI state is not incorrect
      await waitFor(() => {
        expect(checkbox).not.toHaveAttribute('checked', false);
      });
    });
  });
});