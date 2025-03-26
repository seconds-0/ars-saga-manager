import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import VirtueFlawDetails from './VirtueFlawDetails';
import { 
  setupWithQueryClient, 
  setupConsoleSuppress
} from '../../__test-utils__';

// Create a mock for xstate that returns fixed values
jest.mock('@xstate/react', () => ({
  useMachine: () => [{ matches: () => false }, jest.fn()],
  createMachine: jest.fn()
}));

// Setup console error suppression
setupConsoleSuppress();

describe('VirtueFlawDetails Component', () => {
  // Test data
  const mockVirtueFlaw = {
    id: 1,
    referenceVirtueFlaw: {
      id: 101,
      name: 'Animal Ken',
      size: 'Minor',
      type: 'Virtue',
      category: 'General',
      description: 'You have a supernatural affinity with one type of animal.',
      prerequisites: ['The Gift'],
      incompatibilities: ['Animal Companion', 'Blatant Gift'],
      multiple_allowed: false,
      allowed_character_types: ['magus', 'companion'],
      requires_specification: true,
      specification_type: 'Animal',
      specification_options_query: null
    },
    selections: {
      'Animal': 'Wolves'
    },
    is_house_virtue_flaw: false
  };
  
  const mockVirtueFlawPuissant = {
    id: 2,
    referenceVirtueFlaw: {
      id: 102,
      name: 'Puissant (Ability)',
      size: 'Minor',
      type: 'Virtue',
      category: 'General',
      description: 'You have a natural talent with a particular Ability.',
      multiple_allowed: false,
      requires_specification: true,
      specification_type: 'Ability',
      specification_options_query: '/api/reference-abilities',
      ability_score_bonus: 2
    },
    selections: null,
    is_house_virtue_flaw: false
  };

  const mockHouseVirtueFlaw = {
    ...mockVirtueFlaw,
    is_house_virtue_flaw: true
  };

  const mockCharacterId = '123';
  const mockOnClose = jest.fn();

  function setup(customProps = {}) {
    const defaultProps = {
      virtueFlaw: mockVirtueFlaw,
      onClose: mockOnClose,
      characterId: mockCharacterId
    };
    
    return setupWithQueryClient(VirtueFlawDetails, defaultProps, customProps);
  }

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('User Interactions', () => {
    it('calls onClose when close button is clicked', () => {
      setup();
  
      // Find and click the close button
      const closeButton = screen.getByTestId('close-button');
      fireEvent.click(closeButton);
      
      // Verify onClose was called
      expect(mockOnClose).toHaveBeenCalled();
    });
    
    it('displays existing selections correctly', () => {
      setup();
      
      // Look for the display of the selection
      expect(screen.getByText('Animal:')).toBeInTheDocument();
      expect(screen.getByText('Wolves')).toBeInTheDocument();
    });
    
    it('shows warning for virtues requiring specification without selections', () => {
      setup({ virtueFlaw: mockVirtueFlawPuissant });
      
      // Look for the warning message
      expect(screen.getByText(/This Virtue requires you to select/)).toBeInTheDocument();
      expect(screen.getByText(/Ability/)).toBeInTheDocument();
    });
  });
});