import React from 'react';
import { screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import CurrentVirtueFlawList from './CurrentVirtueFlawList';
import { 
  setupComponent, 
  setupConsoleSuppress,
  VIRTUE_FLAW_FIXTURES 
} from '../../__test-utils__';

// Setup console error suppression
setupConsoleSuppress();

// Shared mock data that will be reused across tests
const mockVirtuesFlaws = [
  {
    id: 1,
    referenceVirtueFlaw: {
      id: 101,
      name: 'Animal Ken',
      size: 'Minor',
      type: 'Virtue',
      category: 'General',
      description: 'You have a supernatural affinity with one type of animal.',
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
      category: 'The Gift',
      description: 'You have the Gift.',
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
      category: 'General',
      description: 'You are poor.',
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
      category: 'Supernatural',
      description: 'You have strong faerie blood.',
    },
    is_house_virtue_flaw: true
  },
  {
    id: 5,
    referenceVirtueFlaw: {
      id: 105,
      name: 'Free Gentleman Status',
      size: 'Free',
      type: 'Virtue',
      category: 'Social Status',
      description: 'You are a gentleman.',
    },
    is_house_virtue_flaw: false
  }
];

// Mock validation result with warnings
const mockValidationResult = {
  isValid: false,
  warnings: [
    {
      type: 'error',
      message: 'Virtue points (4) must be balanced by equal Flaw points (1)'
    },
    {
      type: 'error',
      message: 'Cannot exceed 10 points of Virtues'
    },
    {
      type: 'error', 
      message: 'Animal Ken requires prerequisite: The Gift'
    }
  ]
};

/**
 * Standard setup function for CurrentVirtueFlawList component tests
 * @param {Object} customProps - Custom props to override defaults
 * @returns {Object} - Rendered component utils and mock functions
 */
function setup(customProps = {}) {
  const defaultProps = {
    virtuesFlaws: mockVirtuesFlaws,
    onSelect: jest.fn(),
    onRemove: jest.fn(),
    validationResult: {}
  };
  
  return setupComponent(CurrentVirtueFlawList, defaultProps, customProps);
}

describe('CurrentVirtueFlawList Component', () => {
  describe('Rendering', () => {
    test('renders correctly with virtues and flaws grouped by category', () => {
      setup();
      
      // Check for proper category grouping using testids
      expect(screen.getByTestId('category-The Gift')).toBeInTheDocument();
      expect(screen.getByTestId('category-General')).toBeInTheDocument();
      expect(screen.getByTestId('category-Supernatural')).toBeInTheDocument();
      expect(screen.getByTestId('category-Social Status')).toBeInTheDocument();
      
      // Check for virtue/flaw names using testids
      expect(screen.getByTestId('virtue-flaw-name-1')).toHaveTextContent('Animal Ken');
      expect(screen.getByTestId('virtue-flaw-name-2')).toHaveTextContent('The Gift');
      expect(screen.getByTestId('virtue-flaw-name-3')).toHaveTextContent('Poor');
      expect(screen.getByTestId('virtue-flaw-name-4')).toHaveTextContent('Strong Faerie Blood');
      expect(screen.getByTestId('virtue-flaw-name-5')).toHaveTextContent('Free Gentleman Status');
    });
    
    test('displays correct size and point information for each virtue/flaw', () => {
      setup();
      
      // Check for sizes displayed with testids
      expect(screen.getByTestId('virtue-flaw-name-1')).toHaveTextContent('(Minor)');
      expect(screen.getByTestId('virtue-flaw-name-2')).toHaveTextContent('(Free)');
      expect(screen.getByTestId('virtue-flaw-name-3')).toHaveTextContent('(Minor)');
      expect(screen.getByTestId('virtue-flaw-name-4')).toHaveTextContent('(Major)');
      expect(screen.getByTestId('virtue-flaw-name-5')).toHaveTextContent('(Free)');
      
      // Check for point values
      expect(screen.getByTestId('virtue-flaw-points-1')).toHaveTextContent('(1 point)');
      expect(screen.getByTestId('virtue-flaw-points-3')).toHaveTextContent('(1 point)');
      expect(screen.getByTestId('virtue-flaw-points-4')).toHaveTextContent('(3 points)');
    });
    
    test('marks house virtues/flaws with a badge', () => {
      setup();
      
      // Strong Faerie Blood is a house virtue, should have House badge
      expect(screen.getByTestId('house-badge-4')).toBeInTheDocument();
      expect(screen.getByTestId('house-badge-4')).toHaveTextContent('House');
      
      // Check that only Strong Faerie Blood has a house badge
      expect(screen.queryByTestId('house-badge-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('house-badge-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('house-badge-3')).not.toBeInTheDocument();
      expect(screen.queryByTestId('house-badge-5')).not.toBeInTheDocument();
    });
    
    test('displays empty state when no virtues/flaws are selected', () => {
      setup({ virtuesFlaws: [] });
      
      expect(screen.getByText('No virtues or flaws selected yet.')).toBeInTheDocument();
    });

    test('filters virtue and flaw display correctly', () => {
      // Only virtues
      const onlyVirtues = mockVirtuesFlaws.filter(vf => 
        vf.referenceVirtueFlaw.type === 'Virtue'
      );
      
      const { unmount } = setup({ virtuesFlaws: onlyVirtues });
      
      // Poor should not be in the document, others should be
      expect(screen.queryByTestId('virtue-flaw-name-3')).not.toBeInTheDocument();
      expect(screen.getByTestId('virtue-flaw-name-1')).toBeInTheDocument();
      
      unmount();
      
      // Only flaws
      const onlyFlaws = mockVirtuesFlaws.filter(vf => 
        vf.referenceVirtueFlaw.type === 'Flaw'
      );
      
      setup({ virtuesFlaws: onlyFlaws });
      
      // Only Poor should be in the document
      expect(screen.getByTestId('virtue-flaw-name-3')).toBeInTheDocument();
      expect(screen.queryByTestId('virtue-flaw-name-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('virtue-flaw-name-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('virtue-flaw-name-4')).not.toBeInTheDocument();
      expect(screen.queryByTestId('virtue-flaw-name-5')).not.toBeInTheDocument();
    });
  });
  
  describe('Validation warnings', () => {
    test('displays validation warnings for virtues/flaws', () => {
      setup({ validationResult: mockValidationResult });
      
      // Find the warning for Animal Ken
      expect(screen.getByTestId('warning-1-0')).toBeInTheDocument();
      expect(screen.getByTestId('warning-1-0')).toHaveTextContent('Animal Ken requires prerequisite: The Gift');
    });
    
    test('calculates and displays correct point totals in summary', () => {
      const { rerender } = setup();
      
      // Get the point summary section
      const pointSummary = screen.getByTestId('point-summary');
      
      // Check virtue points display (1 point for Animal Ken, Strong Faerie Blood is house virtue so 0 points)
      expect(within(pointSummary).getByText(/Virtue Points/)).toHaveTextContent('Virtue Points: 1');
      
      // Check flaw points display (1 point for Poor)
      expect(within(pointSummary).getByText(/Flaw Points/)).toHaveTextContent('Flaw Points: 1');
      
      // Check balance display (should be 0 since virtue and flaw points are equal)
      expect(within(pointSummary).getByText(/Balance/)).toHaveTextContent('Balance: 0');
    });
    
    test('calculates points correctly for only house virtues', () => {
      // Test with only house virtues/flaws (should show 0 points)
      const onlyHouseVirtuesFlaws = mockVirtuesFlaws.filter(vf => vf.is_house_virtue_flaw);
      setup({ virtuesFlaws: onlyHouseVirtuesFlaws });
      
      const pointSummary = screen.getByTestId('point-summary');
      expect(within(pointSummary).getByText(/Virtue Points/)).toHaveTextContent('Virtue Points: 0');
      expect(within(pointSummary).getByText(/Flaw Points/)).toHaveTextContent('Flaw Points: 0');
      expect(within(pointSummary).getByText(/Balance/)).toHaveTextContent('Balance: 0');
    });
    
    test('calculates points correctly for only free virtues', () => {
      // Test with only free virtues/flaws (should show 0 points)
      const onlyFreeVirtuesFlaws = mockVirtuesFlaws.filter(vf => 
        vf.referenceVirtueFlaw.size === 'Free'
      );
      
      setup({ virtuesFlaws: onlyFreeVirtuesFlaws });
      
      const pointSummary = screen.getByTestId('point-summary');
      expect(within(pointSummary).getByText(/Virtue Points/)).toHaveTextContent('Virtue Points: 0');
      expect(within(pointSummary).getByText(/Flaw Points/)).toHaveTextContent('Flaw Points: 0');
      expect(within(pointSummary).getByText(/Balance/)).toHaveTextContent('Balance: 0');
    });
  });
  
  describe('Interaction', () => {
    test('calls onRemove when remove button is clicked', () => {
      const { props } = setup();
      
      // Find a remove button (Animal Ken's)
      const removeButton = screen.getByTestId('remove-button-1');
      fireEvent.click(removeButton);
      
      // Check if onRemove was called with correct ID
      expect(props.onRemove).toHaveBeenCalledWith(1);
    });
    
    test('calls onSelect when virtue/flaw name is clicked', () => {
      const { props } = setup();
      
      // Find a virtue name (Animal Ken)
      const virtueName = screen.getByTestId('virtue-flaw-name-1');
      fireEvent.click(virtueName);
      
      // Check if onSelect was called with correct virtue/flaw object
      expect(props.onSelect).toHaveBeenCalledWith(mockVirtuesFlaws[0]);
    });
    
    test('renders remove buttons for all virtues/flaws', () => {
      setup();
      
      // There should be 5 remove buttons (one for each virtue/flaw)
      expect(screen.getByTestId('remove-button-1')).toBeInTheDocument();
      expect(screen.getByTestId('remove-button-2')).toBeInTheDocument();
      expect(screen.getByTestId('remove-button-3')).toBeInTheDocument();
      expect(screen.getByTestId('remove-button-4')).toBeInTheDocument();
      expect(screen.getByTestId('remove-button-5')).toBeInTheDocument();
    });
    
    test('handles missing callback functions gracefully', () => {
      setup({ onSelect: undefined, onRemove: undefined });
      
      // Clicking should not cause errors
      fireEvent.click(screen.getByTestId('virtue-flaw-name-1'));
      fireEvent.click(screen.getByTestId('remove-button-1'));
      
      // No assertions needed - test would fail if errors were thrown
    });
  });
});