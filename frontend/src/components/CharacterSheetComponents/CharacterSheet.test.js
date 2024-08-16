import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import CharacterSheet from './CharacterSheet';
import { CharacterSheetTestErrors } from './CharacterSheetTestErrors';
import api from '../../api/axios';
import { useAuth, setMockAuthState } from '../../useAuth';
import { useParams } from 'react-router-dom';


jest.mock('../../useAuth', () => {
  const originalModule = jest.requireActual('../../useAuth');
  return {
    ...originalModule,
    useAuth: jest.fn(),
    setMockAuthState: jest.fn(),
  };
});

jest.mock('../LoadingSpinner', () => () => <div data-testid="loading-spinner">Loading...</div>);
jest.mock('./CharacterSheetTabs', () => ({ character }) => <div data-testid="character-sheet-tabs">Mocked Tabs for {character.characterName}</div>);
jest.mock('../../api/axios', () => ({
  get: jest.fn().mockResolvedValue({ data: {} }),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

let testQueryClient;

let mockErrorBoundaryHasError = false;

jest.mock('../ErrorBoundary', () => {
  return ({ children }) => (
    <div data-testid="mock-error-boundary">
      {mockErrorBoundaryHasError ? (
        <div>Something went wrong. Please try refreshing the page.</div>
      ) : (
        children
      )}
    </div>
  );
});

beforeEach(() => {
  mockErrorBoundaryHasError = false;
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
  useAuth.mockReturnValue({ isAuthenticated: false, user: null });
  useParams.mockReturnValue({ id: '1' });
});

const renderCharacterSheet = (id = '1') => {
  useParams.mockReturnValue({ id });
  return render(
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter initialEntries={[`/character/${id}`]}>
        <CharacterSheet />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CharacterSheet Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockAuthState(false);
  });

  it('should display "Please log in" message when user is not authenticated', async () => {
    setMockAuthState(false);
    console.log('Before rendering');
    renderCharacterSheet('1');
    console.log('After rendering');

    await waitFor(() => {
      console.log('In waitFor');
      expect(screen.getByTestId('login-message')).toBeInTheDocument();
    });
    console.log('After waitFor');
    expect(screen.getByTestId('login-message')).toHaveTextContent('Please log in to view this character.');
  });

  it('should not make API call when user is not authenticated', async () => {
    setMockAuthState(false);
    renderCharacterSheet();
    await waitFor(() => {
      expect(api.get).not.toHaveBeenCalled();
    });
  });

  it('should display loading spinner while fetching character data', async () => {
    // Set the authentication state to true
    useAuth.mockReturnValue({ isAuthenticated: true, user: { id: '1', name: 'Test User' } });

    // Mock the API call to never resolve, simulating an ongoing fetch
    api.get.mockReturnValue(new Promise(() => {}));

    // Render the component
    renderCharacterSheet();
    
    // Wait for and check the loading spinner
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveTextContent(CharacterSheetTestErrors.loadingSpinner);
  });

  it('should display character data when fetch is successful', async () => {
    // Set the authentication state to true
    useAuth.mockReturnValue({ isAuthenticated: true, user: { id: '1', name: 'Test User' } });

    const mockCharacter = { id: '1', characterName: 'Test Character', characterType: 'Magus' };
    api.get.mockResolvedValueOnce({ data: mockCharacter });

    renderCharacterSheet();

    await waitFor(() => {
      expect(screen.getByText('Test Character - Magus')).toBeInTheDocument();
    });
    expect(screen.getByTestId('character-sheet-tabs')).toBeInTheDocument();
  });

  it('should handle errors and display error message', async () => {
    // Set up an authenticated user
    useAuth.mockReturnValue({ isAuthenticated: true, user: { id: '1', name: 'Test User' } });

    // Mock the API call to reject with an error
    api.get.mockRejectedValueOnce(new Error(CharacterSheetTestErrors.invalidElementType));

    renderCharacterSheet();

    // Wait for and check the error message
    await waitFor(() => {
      expect(screen.getByText(`Error: ${CharacterSheetTestErrors.invalidElementType}`)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Check that the error boundary is present
    expect(screen.getByTestId('mock-error-boundary')).toBeInTheDocument();
  });

  it('should display "Character not found" when no character data is returned', async () => {
    // Set the authentication state to true
    useAuth.mockReturnValue({ isAuthenticated: true, user: { id: '1', name: 'Test User' } });

    // Mock the API call to return null data
    api.get.mockResolvedValueOnce({ data: null });

    renderCharacterSheet();

    await waitFor(() => {
      expect(screen.getByText('Character not found')).toBeInTheDocument();
    });
  });

  jest.setTimeout(10000); // Increase timeout to 10 seconds for this test
});