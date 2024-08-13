import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '../../useAuth';
import CharacterSheet from './CharacterSheet';
import { CharacterSheetTestErrors } from './CharacterSheetTestErrors';
import api from '../../api/axios';

jest.mock('../../useAuth');
jest.mock('../LoadingSpinner');
jest.mock('./CharacterSheetTabs');
jest.mock('../../api/axios');
jest.mock('../ErrorBoundary', () => {
  return {
    __esModule: true,
    default: ({ children }) => {
      console.log('MockErrorBoundary rendered');
      return <div data-testid="mock-error-boundary">{children}</div>;
    },
  };
});

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderCharacterSheet = async (id = '1', isAuthenticated = true) => {
  const testQueryClient = createTestQueryClient();
  const { useAuth } = jest.requireMock('../../useAuth');
  useAuth.mockReturnValue({ isAuthenticated, user: { id: '1', username: 'testuser' } });

  render(
    <QueryClientProvider client={testQueryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[`/character/${id}`]}>
            <CharacterSheet />
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    );
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
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should display character data when fetch is successful', async () => {
    const mockCharacter = { id: '1', characterName: 'Test Character', characterType: 'Magus' };
    api.get.mockResolvedValueOnce({ data: mockCharacter });
    await renderCharacterSheet();

    expect(screen.getByText('Test Character - Magus')).toBeInTheDocument();
    expect(screen.getByTestId('character-sheet-tabs')).toBeInTheDocument();
  });

  it('should display error message when fetch fails', async () => {
    api.get.mockRejectedValueOnce(new Error(CharacterSheetTestErrors.fetchFailed));
    await renderCharacterSheet();

    expect(screen.getByText(`Error: ${CharacterSheetTestErrors.fetchFailed}`)).toBeInTheDocument();
  });

  it('should display "Character not found" when no character data is returned', async () => {
    api.get.mockResolvedValueOnce({ data: null });
    await renderCharacterSheet();

    expect(screen.getByText(CharacterSheetTestErrors.characterNotFound)).toBeInTheDocument();
  });

  it('should catch errors and display fallback UI', async () => {
    console.error = jest.fn();
    api.get.mockImplementationOnce(() => {
      throw new Error(CharacterSheetTestErrors.invalidElementType);
    });

    await renderCharacterSheet();

    // Check if the error boundary component is rendered
    expect(screen.getByTestId('mock-error-boundary')).toBeInTheDocument();
    
    // Verify that console.error was called due to the thrown error
    expect(console.error).toHaveBeenCalled();
  });
});