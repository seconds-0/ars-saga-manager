import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import VirtuesAndFlawsTab from './VirtuesAndFlawsTab';
import { useVirtuesAndFlaws } from '../../hooks/useVirtuesAndFlaws';

// Mock the hooks
jest.mock('../../hooks/useVirtuesAndFlaws');

jest.mock('axios', () => ({
  default: {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    })),
  },
}));

describe('VirtuesAndFlawsTab', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    // Default mock implementation
    useVirtuesAndFlaws.mockImplementation(() => ({
      virtuesFlaws: [],
      remainingPoints: 10,
      isLoading: false,
      error: null,
      addVirtueFlaw: { mutate: jest.fn() },
      removeVirtueFlaw: { mutate: jest.fn() },
    }));
  });

  const renderComponent = (character = { id: '1', type: 'companion', hasTheGift: false }) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <VirtuesAndFlawsTab character={character} />
      </QueryClientProvider>
    );
  };

  it('should show validation warnings when adding incompatible virtues', async () => {
    const virtuesFlaws = [
      {
        id: 1,
        referenceVirtueFlaw: {
          name: 'Keen Vision',
          size: 'Minor',
          type: 'Virtue',
          incompatibilities: ['Poor Vision'],
        },
      },
      {
        id: 2,
        referenceVirtueFlaw: {
          name: 'Poor Vision',
          size: 'Minor',
          type: 'Flaw',
          incompatibilities: ['Keen Vision'],
        },
      },
    ];

    useVirtuesAndFlaws.mockImplementation(() => ({
      virtuesFlaws,
      remainingPoints: 10,
      isLoading: false,
      error: null,
      addVirtueFlaw: { mutate: jest.fn() },
      removeVirtueFlaw: { mutate: jest.fn() },
    }));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Incompatible combination/)).toBeInTheDocument();
    });
  });

  it('should update validation when character type changes', async () => {
    const virtuesFlaws = [
      {
        id: 1,
        referenceVirtueFlaw: {
          name: 'Major Magical Focus',
          size: 'Major',
          type: 'Virtue',
          category: 'Hermetic',
        },
      },
    ];

    useVirtuesAndFlaws.mockImplementation(() => ({
      virtuesFlaws,
      remainingPoints: 10,
      isLoading: false,
      error: null,
      addVirtueFlaw: { mutate: jest.fn() },
      removeVirtueFlaw: { mutate: jest.fn() },
    }));

    // First render with a magus character
    const { rerender } = renderComponent({ id: '1', type: 'magus', hasTheGift: true });
    expect(screen.queryByText(/Cannot take Hermetic Virtues/)).not.toBeInTheDocument();

    // Re-render with a companion character
    rerender(
      <QueryClientProvider client={queryClient}>
        <VirtuesAndFlawsTab character={{ id: '1', type: 'companion', hasTheGift: false }} />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Cannot take Hermetic Virtues/)).toBeInTheDocument();
    });
  });

  it('should update validation when removing virtues/flaws', async () => {
    const virtuesFlaws = [
      {
        id: 1,
        referenceVirtueFlaw: {
          name: 'Major Virtue 1',
          size: 'Major',
          type: 'Virtue',
        },
      },
      {
        id: 2,
        referenceVirtueFlaw: {
          name: 'Major Virtue 2',
          size: 'Major',
          type: 'Virtue',
        },
      },
    ];

    const removeVirtueFlaw = { mutate: jest.fn() };
    useVirtuesAndFlaws.mockImplementation(() => ({
      virtuesFlaws,
      remainingPoints: 4,
      isLoading: false,
      error: null,
      addVirtueFlaw: { mutate: jest.fn() },
      removeVirtueFlaw,
    }));

    renderComponent();

    // Initially should show point balance warning
    expect(screen.getByText(/must be balanced by equal Flaw points/)).toBeInTheDocument();

    // Mock removing a virtue
    useVirtuesAndFlaws.mockImplementation(() => ({
      virtuesFlaws: [virtuesFlaws[0]],
      remainingPoints: 7,
      isLoading: false,
      error: null,
      addVirtueFlaw: { mutate: jest.fn() },
      removeVirtueFlaw,
    }));

    // Click remove button on second virtue
    const user = userEvent.setup();
    const removeButtons = screen.getAllByText('Remove');
    await user.click(removeButtons[1]);

    // Warning should be updated
    await waitFor(() => {
      expect(screen.getByText(/must be balanced by equal Flaw points/)).toBeInTheDocument();
    });

    expect(screen.queryByText(/Cannot exceed 10 points of Virtues/)).not.toBeInTheDocument();
  });

  it('should handle validation for house virtues correctly', async () => {
    const virtuesFlaws = [
      {
        id: 1,
        referenceVirtueFlaw: {
          name: 'House Virtue',
          size: 'Major',
          type: 'Virtue',
          category: 'Hermetic',
        },
        is_house_virtue_flaw: true,
      },
      {
        id: 2,
        referenceVirtueFlaw: {
          name: 'Regular Virtue',
          size: 'Major',
          type: 'Virtue',
        },
        is_house_virtue_flaw: false,
      },
    ];

    useVirtuesAndFlaws.mockImplementation(() => ({
      virtuesFlaws,
      remainingPoints: 7,
      isLoading: false,
      error: null,
      addVirtueFlaw: { mutate: jest.fn() },
      removeVirtueFlaw: { mutate: jest.fn() },
    }));

    renderComponent({ id: '1', type: 'companion', hasTheGift: false });

    // Should not show Hermetic restriction warning for house virtue
    expect(screen.queryByText(/Cannot take Hermetic Virtues/)).not.toBeInTheDocument();

    // Should still count points for regular virtue
    expect(screen.getByText(/must be balanced by equal Flaw points/)).toBeInTheDocument();
  });
}); 