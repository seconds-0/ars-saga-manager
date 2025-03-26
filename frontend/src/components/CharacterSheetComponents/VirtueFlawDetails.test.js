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
      customizable: true,
      customization_fields: ['Animal Type'],
      multiple_allowed: false,
      allowed_character_types: ['magus', 'companion']
    },
    selections: {
      'Animal Type': 'Wolves'
    },
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
  });
});