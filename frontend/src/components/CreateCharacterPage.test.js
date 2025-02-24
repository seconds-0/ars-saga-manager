import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from 'react-query';
import { AuthProvider } from '../useAuth';
import { queryClient } from '../queryClient';
import CreateCharacterPage from './CreateCharacterPage';
import api from '../api/axios';

jest.setTimeout(10000); // Increase timeout to 10 seconds

// Mock the api module
jest.mock('../api/axios', () => ({
  post: jest.fn(),
}));

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Render helper function
const renderComponent = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <CreateCharacterPage />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CreateCharacterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Create New Character')).toBeInTheDocument();
  });

  test('all form elements are present', () => {
    renderComponent();
    
    // Check for character name input
    expect(screen.getByPlaceholderText('Enter character name')).toBeInTheDocument();
    
    // Check for character type dropdown
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    
    // Check for create button
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    
    // Check for cancel button
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  test('character type dropdown contains all expected options', () => {
    renderComponent();
    
    const options = ['Select character type', 'Grog', 'Companion', 'Magus'];
    
    options.forEach(option => {
      expect(screen.getByRole('option', { name: option })).toBeInTheDocument();
    });

    // Verify removed options are not present
    const removedOptions = ['animal', 'demon', 'spirit', 'faerie'];
    removedOptions.forEach(option => {
      expect(screen.queryByRole('option', { name: option })).not.toBeInTheDocument();
    });
  });

  test('character name input accepts valid input', async () => {
    renderComponent();
    const nameInput = screen.getByTestId('character-name-input');
    await userEvent.type(nameInput, 'John Doe');
    expect(nameInput).toHaveValue('John Doe');
  });

  test('create button is disabled when inputs are invalid', () => {
    renderComponent();
    const createButton = screen.getByTestId('create-button');
    
    // Initially both inputs are empty, button should be disabled
    expect(createButton).toBeDisabled();

    // Fill in name, but not character type
    fireEvent.change(screen.getByTestId('character-name-input'), { target: { value: 'John Doe' } });
    expect(createButton).toBeDisabled();

    // Select character type, but clear name
    fireEvent.change(screen.getByTestId('character-type-select'), { target: { value: 'magus' } });
    fireEvent.change(screen.getByTestId('character-name-input'), { target: { value: '' } });
    expect(createButton).toBeDisabled();

    // Fill in both inputs
    fireEvent.change(screen.getByTestId('character-name-input'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByTestId('character-type-select'), { target: { value: 'magus' } });
    expect(createButton).not.toBeDisabled();
  });

  test('character name input accepts special characters', async () => {
    renderComponent();
    const nameInput = screen.getByTestId('character-name-input');
    await userEvent.type(nameInput, 'John O\'Malley-Smith');
    expect(nameInput).toHaveValue('John O\'Malley-Smith');
  });

  test('successful form submission with valid data', async () => {
    const mockResponse = { data: { id: '123' } };
    api.post.mockResolvedValueOnce(mockResponse);

    renderComponent();

    await userEvent.type(screen.getByTestId('character-name-input'), 'John Doe');
    await userEvent.selectOptions(screen.getByTestId('character-type-select'), 'magus');
    
    await userEvent.click(screen.getByTestId('create-button'));

    expect(api.post).toHaveBeenCalledWith('/characters', {
      name: 'John Doe',
      character_type: 'magus',
      use_cunning: false
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/character/123');
    });
  }, 10000);

  test('correct API call is made with input data', async () => {
    const mockResponse = { data: { id: '456' } };
    api.post.mockResolvedValueOnce(mockResponse);

    renderComponent();

    await userEvent.type(screen.getByTestId('character-name-input'), 'Jane Smith');
    await userEvent.selectOptions(screen.getByTestId('character-type-select'), 'companion');
    
    await userEvent.click(screen.getByTestId('create-button'));

    expect(api.post).toHaveBeenCalledWith('/characters', {
      name: 'Jane Smith',
      character_type: 'companion',
      use_cunning: false
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/character/456');
    });
  }, 10000);

  test('error handling for API call failures', async () => {
    const mockError = new Error('API Error');
    api.post.mockRejectedValueOnce(mockError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderComponent();

    await userEvent.type(screen.getByTestId('character-name-input'), 'Error Test');
    await userEvent.selectOptions(screen.getByTestId('character-type-select'), 'grog');
    
    await userEvent.click(screen.getByTestId('create-button'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/characters', {
        name: 'Error Test',
        character_type: 'grog',
        use_cunning: false
      });
    });

    await waitFor(() => {
      expect(screen.getByText('An error occurred while creating the character. Please try again.')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  }, 10000);

  test('navigates to the correct page after successful character creation', async () => {
    const mockResponse = { data: { id: '789' } };
    api.post.mockResolvedValueOnce(mockResponse);

    renderComponent();

    await userEvent.type(screen.getByTestId('character-name-input'), 'Merlin');
    await userEvent.selectOptions(screen.getByTestId('character-type-select'), 'magus');
    
    await userEvent.click(screen.getByTestId('create-button'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/characters', {
        name: 'Merlin',
        character_type: 'magus',
        use_cunning: false
      });
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/character/789');
  });

  test('character types are stored in lowercase regardless of display case', async () => {
    const mockResponse = { data: { id: '789' } };

    renderComponent();
    const nameInput = screen.getByTestId('character-name-input');

    // Test with each character type
    const types = [
      { display: 'magus', stored: 'magus' },
      { display: 'companion', stored: 'companion' },
      { display: 'grog', stored: 'grog' }
    ];

    for (const { display, stored } of types) {
      api.post.mockReset();
      api.post.mockResolvedValueOnce(mockResponse);
      
      // Clear and set the input directly
      fireEvent.change(nameInput, { target: { value: `Test ${display}` } });
      await userEvent.selectOptions(screen.getByTestId('character-type-select'), display);
      await userEvent.click(screen.getByTestId('create-button'));

      expect(api.post).toHaveBeenLastCalledWith('/characters', {
        name: `Test ${display}`,
        character_type: stored,
        use_cunning: false
      });
    }
  });

  test('form validation - character type is required', async () => {
    renderComponent();
    
    await userEvent.type(screen.getByTestId('character-name-input'), 'Test Character');
    await userEvent.selectOptions(screen.getByTestId('character-type-select'), 'magus');
    
    expect(screen.getByTestId('create-button')).not.toBeDisabled();
  });

  test('character type options are correctly mapped', () => {
    renderComponent();
    
    const characterTypes = [
      { display: 'Magus', stored: 'magus' },
      { display: 'Companion', stored: 'companion' },
      { display: 'Grog', stored: 'grog' }
    ];

    characterTypes.forEach(({ display, stored }) => {
      const option = screen.getByRole('option', { name: display });
      expect(option).toBeInTheDocument();
      expect(option.value).toBe(stored);
    });
  });
});