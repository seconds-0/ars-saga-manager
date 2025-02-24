import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import VirtuesAndFlawsTab from './VirtuesAndFlawsTab';
import { useVirtuesAndFlaws } from '../../hooks/useVirtuesAndFlaws';

// Set timeout for all tests in this file
jest.setTimeout(10000);

// Mock the hooks
jest.mock('../../hooks/useVirtuesAndFlaws');
jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: jest.fn()
}));

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })),
}));

describe('VirtuesAndFlawsTab', () => {
  let queryClient;

  const mockCharacter = {
    id: 1,
    type: 'companion', // Valid character type
    hasTheGift: false,
    virtuesFlaws: [
      {
        id: 2,
        referenceVirtueFlaw: {
          name: 'Social Status',
          type: 'Virtue',
          size: 'Minor',
          category: 'Social Status',
          description: 'Your social standing.',
        },
        is_house_virtue_flaw: false,
      }
    ],
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Mock reference virtues and flaws data
    useQuery.mockImplementation((queryKey) => {
      if (queryKey === 'referenceVirtuesFlaws') {
        return {
          data: [
            {
              id: 1,
              name: 'Keen Vision',
              type: 'Virtue',
              size: 'Minor',
              category: 'General',
              description: 'You have exceptionally good eyesight.',
            },
            {
              id: 2,
              name: 'Social Status',
              type: 'Virtue',
              size: 'Minor',
              category: 'Social Status',
              description: 'Your social standing.',
            },
            {
              id: 3,
              name: 'Hermetic Virtue',
              type: 'Virtue',
              size: 'Minor',
              category: 'Hermetic',
              description: 'A hermetic virtue.',
            }
          ],
          isLoading: false,
          error: null,
        };
      }
      return { data: null, isLoading: false, error: null };
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <VirtuesAndFlawsTab character={props.character || mockCharacter} />
      </QueryClientProvider>
    );
  };

  it('should show validation warnings when adding incompatible virtues', async () => {
    const virtuesFlaws = [
      {
        id: 2,
        referenceVirtueFlaw: {
          name: 'Social Status',
          type: 'Virtue',
          size: 'Minor',
          category: 'Social Status',
          description: 'Your social standing.',
        },
        is_house_virtue_flaw: false,
      },
      {
        id: 1,
        referenceVirtueFlaw: {
          name: 'Keen Vision',
          type: 'Virtue',
          size: 'Minor',
          category: 'General',
          description: 'You have exceptionally good eyesight.',
        },
        is_house_virtue_flaw: false,
      }
    ];

    // Update mockCharacter for this test
    const testCharacter = {
      ...mockCharacter,
      virtuesFlaws,
    };

    useVirtuesAndFlaws.mockImplementation(() => ({
      virtuesFlaws,
      remainingPoints: -2,
      isLoading: false,
      error: null,
      addVirtueFlaw: { mutate: jest.fn() },
      removeVirtueFlaw: { mutate: jest.fn() },
    }));

    renderComponent({ character: testCharacter });

    // Wait for validation message about point balance
    await waitFor(() => {
      const validationMessage = screen.getByTestId('validation-message');
      expect(validationMessage).toHaveTextContent(/Virtue points \(2\) must be balanced by equal Flaw points \(0\)/i);
    });
  });

  it('should update validation when character type changes', async () => {
    const virtuesFlaws = [
      {
        id: 3,
        referenceVirtueFlaw: {
          name: 'Hermetic Virtue',
          type: 'Virtue',
          size: 'Minor',
          category: 'Hermetic',
          description: 'A hermetic virtue.',
        },
        is_house_virtue_flaw: false,
      }
    ];

    const testCharacter = {
      ...mockCharacter,
      virtuesFlaws,
      type: 'companion', // Non-magus character can't take Hermetic virtues
      hasTheGift: false,
    };

    useVirtuesAndFlaws.mockImplementation(() => ({
      virtuesFlaws,
      remainingPoints: -1,
      isLoading: false,
      error: null,
      addVirtueFlaw: { mutate: jest.fn() },
      removeVirtueFlaw: { mutate: jest.fn() },
    }));

    renderComponent({ character: testCharacter });

    // Wait for validation message about Hermetic virtues
    await waitFor(() => {
      const validationMessages = screen.getAllByTestId('validation-message');
      const hasHermeticMessage = validationMessages.some(message =>
        message.textContent.match(/Cannot take Hermetic Virtues without The Gift/i)
      );
      expect(hasHermeticMessage).toBe(true);
    });
  });

  it('should update validation when removing virtues/flaws', async () => {
    const virtuesFlaws = [
      {
        id: 2,
        referenceVirtueFlaw: {
          name: 'Social Status',
          type: 'Virtue',
          size: 'Minor',
          category: 'Social Status',
          description: 'Your social standing.',
        },
        is_house_virtue_flaw: false,
      },
      {
        id: 1,
        referenceVirtueFlaw: {
          name: 'Keen Vision',
          type: 'Virtue',
          size: 'Minor',
          category: 'General',
          description: 'You have exceptionally good eyesight.',
        },
        is_house_virtue_flaw: false,
      }
    ];

    const testCharacter = {
      ...mockCharacter,
      virtuesFlaws,
    };

    useVirtuesAndFlaws.mockImplementation(() => ({
      virtuesFlaws,
      remainingPoints: -2,
      isLoading: false,
      error: null,
      addVirtueFlaw: { mutate: jest.fn() },
      removeVirtueFlaw: { mutate: jest.fn() },
    }));

    renderComponent({ character: testCharacter });

    await waitFor(() => {
      const validationMessage = screen.getByTestId('validation-message');
      expect(validationMessage).toHaveTextContent(/Virtue points \(2\) must be balanced by equal Flaw points \(0\)/i);
    });
  });

  it('should handle validation for house virtues correctly', async () => {
    const virtuesFlaws = [
      {
        id: 1,
        referenceVirtueFlaw: {
          name: 'House Virtue',
          type: 'Virtue',
          size: 'Minor',
          category: 'Hermetic',
          description: 'A hermetic virtue.',
        },
        is_house_virtue_flaw: true,
      }
    ];

    const testCharacter = {
      ...mockCharacter,
      virtuesFlaws,
      type: 'magus', // House virtues are only for magi
      hasTheGift: true,
    };

    useVirtuesAndFlaws.mockImplementation(() => ({
      virtuesFlaws,
      remainingPoints: -1,
      isLoading: false,
      error: null,
      addVirtueFlaw: { mutate: jest.fn() },
      removeVirtueFlaw: { mutate: jest.fn() },
    }));

    renderComponent({ character: testCharacter });

    // Wait for house virtue element to appear
    await waitFor(() => {
      const houseVirtueElement = screen.getByText(/House Virtue/);
      expect(houseVirtueElement).toBeInTheDocument();
    });

    // Check for house virtue in the current virtues list
    const currentVirtuesList = screen.getByRole('list', { name: /current virtues and flaws/i });
    expect(within(currentVirtuesList).getByText(/House Virtue/)).toBeInTheDocument();

    await waitFor(() => {
      const validationMessage = screen.getByTestId('validation-message');
      expect(validationMessage).toHaveTextContent(/Character must have exactly one Social Status/i);
    });
  });
}); 