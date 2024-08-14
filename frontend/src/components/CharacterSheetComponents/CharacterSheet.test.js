import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '../../useAuth';
import CharacterSheet from './CharacterSheet';
import { CharacterSheetTestErrors } from './CharacterSheetTestErrors';
import api from '../../api/axios';

jest.mock('../../useAuth');
jest.mock('../LoadingSpinner', () => () => <div data-testid="loading-spinner">Loading...</div>);
jest.mock('./CharacterSheetTabs', () => ({ character }) => <div data-testid="character-sheet-tabs">Mocked Tabs for {character.characterName}</div>);
jest.mock('../../api/axios', () => ({
  get: jest.fn().mockResolvedValue({ data: {} }),
}));
jest.mock('../ErrorBoundary', () => {
  return {
    __esModule: true,
    default: class MockErrorBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { hasError: false };
      }

      static getDerivedStateFromError(error) {
        return { hasError: true };
      }

      componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
      }

      render() {
        if (this.state.hasError) {
          return <div data-testid="mock-error-boundary">Something went wrong. Please try refreshing the page.</div>;
        }

        return this.props.children;
      }
    },
  };
});

let testQueryClient;

beforeEach(() => {
  testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
  jest.clearAllMocks();
});

const renderCharacterSheet = async (id = '1', isAuthenticated = true) => {
  console.log('Setting up auth mock');
  const { useAuth } = jest.requireMock('../../useAuth');
  useAuth.mockReturnValue({ isAuthenticated, user: { id: '1', username: 'testuser' } });

  console.log('Rendering component');
  await act(async () => {
    render(
      <QueryClientProvider client={testQueryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={[`/character/${id}`]}>
            <CharacterSheet />
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );
  });
  console.log('Render complete');
};

describe('CharacterSheet Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display "Please log in" message when user is not authenticated', async () => {
    const { useAuth } = jest.requireMock('../../useAuth');
    useAuth.mockReturnValueOnce({ isAuthenticated: false, user: null });
    await renderCharacterSheet('1', false);

    expect(screen.getByText(CharacterSheetTestErrors.pleaseLogIn)).toBeInTheDocument();
  });

  it('should display loading spinner while fetching character data', async () => {
    api.get.mockReturnValue(new Promise(() => {}));
    await renderCharacterSheet();
    
    console.log(screen.debug());
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display character data when fetch is successful', async () => {
    const mockCharacter = { id: '1', characterName: 'Test Character', characterType: 'Magus' };
    api.get.mockResolvedValueOnce({ data: mockCharacter });
    await renderCharacterSheet();

    await waitFor(() => {
      expect(screen.getByText('Test Character - Magus')).toBeInTheDocument();
      expect(screen.getByTestId('character-sheet-tabs')).toBeInTheDocument();
    });
  });

  it('should display error message when fetch fails', async () => {
    api.get.mockRejectedValueOnce(new Error(CharacterSheetTestErrors.fetchFailed));
    await renderCharacterSheet();

    await waitFor(() => {
      expect(screen.getByText(`Error: ${CharacterSheetTestErrors.fetchFailed}`)).toBeInTheDocument();
    });
  });

  it('should display "Character not found" when no character data is returned', async () => {
    api.get.mockResolvedValueOnce({ data: null });
    await renderCharacterSheet();

    await waitFor(() => {
      expect(screen.getByText('Character not found')).toBeInTheDocument();
    });
  });

  jest.setTimeout(2000); // Increase timeout to 2 seconds for this test
  it('should catch errors and display fallback UI', async () => {
    console.error = jest.fn();
    api.get.mockImplementationOnce(() => {
      throw new Error(CharacterSheetTestErrors.invalidElementType);
    });

    await act(async () => {
      await renderCharacterSheet();
    });

    await waitFor(() => {
      expect(screen.getByTestId('mock-error-boundary')).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByText('Something went wrong. Please try refreshing the page.')).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
  });
});