import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacterOverviewTab from './CharacterOverviewTab';

// Set up console suppression for tests to avoid unnecessary warnings
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn((message) => {
    if (message && message.includes('Warning:')) {
      return;
    }
    originalError.call(console, message);
  });
});

afterAll(() => {
  console.error = originalError;
});

describe('CharacterOverviewTab', () => {
  const mockCharacter = {
    id: 1,
    name: 'Test Character',
    character_type: 'companion',
    age: 25,
    general_exp_available: 345,
    magical_exp_available: 0,
    restricted_exp_pools: [
      {
        source_virtue_flaw: 'Warrior',
        amount: 50,
        spent: 0,
        restrictions: { type: 'category', value: 'Martial' }
      }
    ]
  };

  const mockMagus = {
    ...mockCharacter,
    character_type: 'magus',
    magical_exp_available: 240
  };

  const mockSave = jest.fn();

  beforeEach(() => {
    mockSave.mockClear();
  });

  describe('Rendering', () => {
    test('renders basic character information', () => {
      render(<CharacterOverviewTab character={mockCharacter} onSave={mockSave} />);
      
      expect(screen.getByText(/Test Character/)).toBeInTheDocument();
      expect(screen.getByText(/companion/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('25')).toBeInTheDocument(); // Age input
    });

    test('renders general experience', () => {
      render(<CharacterOverviewTab character={mockCharacter} onSave={mockSave} />);
      
      expect(screen.getByText(/General Exp Available:/i)).toBeInTheDocument();
      expect(screen.getByText(/345/)).toBeInTheDocument();
    });

    test('renders magical experience for magi', () => {
      render(<CharacterOverviewTab character={mockMagus} onSave={mockSave} />);
      
      expect(screen.getByText(/Magical Exp Available:/i)).toBeInTheDocument();
      expect(screen.getByText(/240/)).toBeInTheDocument();
    });

    test('does not render magical experience for non-magi', () => {
      render(<CharacterOverviewTab character={mockCharacter} onSave={mockSave} />);
      
      expect(screen.queryByText(/Magical Exp Available:/i)).not.toBeInTheDocument();
    });

    test('renders restricted experience pools', () => {
      render(<CharacterOverviewTab character={mockCharacter} onSave={mockSave} />);
      
      expect(screen.getByText(/Restricted Experience:/i)).toBeInTheDocument();
      expect(screen.getByText(/From Warrior: 50 Exp/i)).toBeInTheDocument();
      expect(screen.getByText(/Martial Abilities only/i)).toBeInTheDocument();
    });
  });

  describe('User interactions', () => {
    test('allows changing age and calls onSave', () => {
      render(<CharacterOverviewTab character={mockCharacter} onSave={mockSave} />);
      
      const ageInput = screen.getByLabelText(/Age/i);
      fireEvent.change(ageInput, { target: { value: '30' } });
      fireEvent.blur(ageInput);
      
      expect(mockSave).toHaveBeenCalledWith({ ...mockCharacter, age: 30 });
    });

    test('enforces minimum age of 5', () => {
      render(<CharacterOverviewTab character={mockCharacter} onSave={mockSave} />);
      
      const ageInput = screen.getByLabelText(/Age/i);
      fireEvent.change(ageInput, { target: { value: '3' } });
      fireEvent.blur(ageInput);
      
      expect(ageInput.value).toBe('5');
      expect(mockSave).toHaveBeenCalledWith({ ...mockCharacter, age: 5 });
    });

    test('does not call onSave if age is unchanged', () => {
      render(<CharacterOverviewTab character={mockCharacter} onSave={mockSave} />);
      
      const ageInput = screen.getByLabelText(/Age/i);
      fireEvent.change(ageInput, { target: { value: '25' } }); // Same as initial
      fireEvent.blur(ageInput);
      
      expect(mockSave).not.toHaveBeenCalled();
    });
  });
});