import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VirtueFlawList from './VirtueFlawList';
import { 
  setupComponent, 
  setupConsoleSuppress,
  VIRTUE_FLAW_FIXTURES 
} from '../../__test-utils__';

// Setup console error suppression
setupConsoleSuppress();

// Mock data for all tests
const mockVirtuesFlaws = [
  {
    id: 1,
    referenceVirtueFlaw: {
      id: 101,
      name: 'Animal Ken',
      size: 'Minor',
      type: 'Virtue',
      category: 'General'
    },
    is_house_virtue_flaw: false
  },
  {
    id: 2,
    referenceVirtueFlaw: {
      id: 102,
      name: 'The Gift',
      size: 'Free',
      type: 'Virtue',
      category: 'The Gift'
    },
    is_house_virtue_flaw: false
  },
  {
    id: 3,
    referenceVirtueFlaw: {
      id: 103,
      name: 'Poor',
      size: 'Minor',
      type: 'Flaw',
      category: 'General'
    },
    is_house_virtue_flaw: false
  },
  {
    id: 4,
    referenceVirtueFlaw: {
      id: 104,
      name: 'Strong Faerie Blood',
      size: 'Major',
      type: 'Virtue',
      category: 'Supernatural'
    },
    is_house_virtue_flaw: true
  }
];

/**
 * Standard setup function for VirtueFlawList component tests
 * @param {Object} customProps - Custom props to override defaults
 * @returns {Object} - Rendered component utils and mock functions
 */
function setup(customProps = {}) {
  const defaultProps = {
    items: mockVirtuesFlaws,
    onSelect: jest.fn(),
    onRemove: jest.fn(),
  };
  
  return setupComponent(VirtueFlawList, defaultProps, customProps);
}

describe('VirtueFlawList Component', () => {
  describe('Rendering', () => {
    test('renders correctly with populated list', () => {
      setup();
      
      // Verify list container is rendered
      expect(screen.getByTestId('virtue-flaw-list')).toBeInTheDocument();
      
      // Verify all items are rendered
      expect(screen.getAllByRole('listitem')).toHaveLength(4);
      
      // Check for specific virtue/flaw names with their size
      expect(screen.getByTestId('virtue-flaw-name-1')).toHaveTextContent('Animal Ken (Minor)');
      expect(screen.getByTestId('virtue-flaw-name-2')).toHaveTextContent('The Gift (Free)');
      expect(screen.getByTestId('virtue-flaw-name-3')).toHaveTextContent('Poor (Minor)');
      expect(screen.getByTestId('virtue-flaw-name-4')).toHaveTextContent('Strong Faerie Blood (Major)');
    });
    
    test('renders size indicators correctly', () => {
      setup();
      
      // Check that size indicators are present
      const items = screen.getAllByRole('listitem');
      
      // Check specific size indicators - testing the content in a more precise way
      expect(screen.getByTestId('virtue-flaw-name-1')).toHaveTextContent('(Minor)');
      expect(screen.getByTestId('virtue-flaw-name-2')).toHaveTextContent('(Free)');
      expect(screen.getByTestId('virtue-flaw-name-3')).toHaveTextContent('(Minor)');
      expect(screen.getByTestId('virtue-flaw-name-4')).toHaveTextContent('(Major)');
    });
    
    test('renders house badge for house virtues/flaws', () => {
      setup();
      
      // Find the house badge only on the item that should have it
      const strongFaerieBloodItem = screen.getByTestId('virtue-flaw-item-4');
      expect(strongFaerieBloodItem).toHaveTextContent('House');
      
      // Verify house badge doesn't appear elsewhere
      const regularItem = screen.getByTestId('virtue-flaw-item-1');
      expect(regularItem).not.toHaveTextContent('House');
    });
    
    test('displays message when list is empty', () => {
      setup({ items: [] });
      
      expect(screen.getByText('No virtues or flaws selected.')).toBeInTheDocument();
    });
    
    test('displays custom empty message when provided', () => {
      setup({ 
        items: [], 
        emptyMessage: 'Custom empty message' 
      });
      
      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
    });
    
    test('renders category headers', () => {
      setup();
      
      // Check that category headers are rendered
      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('The Gift')).toBeInTheDocument();
      expect(screen.getByText('Supernatural')).toBeInTheDocument();
    });
  });
  
  describe('User interactions', () => {
    test('calls onSelect when clicking a virtue/flaw name', () => {
      const { props } = setup();
      
      // Click on a virtue name
      fireEvent.click(screen.getByTestId('virtue-flaw-name-1'));
      
      // Verify callback is called with the correct virtue/flaw
      expect(props.onSelect).toHaveBeenCalledTimes(1);
      expect(props.onSelect).toHaveBeenCalledWith(expect.objectContaining({
        id: 1,
        name: 'Animal Ken'
      }));
    });
    
    test('calls onRemove when clicking the remove button', () => {
      const { props } = setup();
      
      // Click on the remove button
      fireEvent.click(screen.getByTestId('remove-button-1'));
      
      // Verify callback is called with the correct virtue/flaw ID
      expect(props.onRemove).toHaveBeenCalledTimes(1);
      expect(props.onRemove).toHaveBeenCalledWith(1);
    });
    
    test('handles missing callback functions gracefully', () => {
      // Render without the callbacks
      setup({ onSelect: undefined, onRemove: undefined });
      
      // These clicks should not cause errors
      fireEvent.click(screen.getByTestId('virtue-flaw-name-1'));
      // The remove button shouldn't be rendered if onRemove is not provided
      expect(screen.queryByTestId('remove-button-1')).not.toBeInTheDocument();
    });
  });
  
  describe('Edge cases', () => {
    test('handles null items prop', () => {
      setup({ items: null });
      
      expect(screen.getByText('No virtues or flaws selected.')).toBeInTheDocument();
    });
    
    test('renders items with direct format (no referenceVirtueFlaw)', () => {
      const directFormatItems = [
        {
          id: 5,
          name: 'Direct Format Item',
          size: 'Minor',
          type: 'Virtue',
          category: 'Test',
          isHouse: true
        }
      ];
      
      setup({ items: directFormatItems });
      
      expect(screen.getByTestId('virtue-flaw-name-5')).toHaveTextContent('Direct Format Item');
      expect(screen.getByTestId('virtue-flaw-item-5')).toHaveTextContent('House');
    });
  });
});