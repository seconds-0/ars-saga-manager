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
    
    const options = ['Select character type', 'Magus', 'Companion', 'Grog', 'Animal', 'Demon', 'Spirit', 'Faerie'];
    
    options.forEach(option => {
      expect(screen.getByRole('option', { name: option })).toBeInTheDocument();
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
    fireEvent.change(screen.getByTestId('character-type-select'), { target: { value: 'Magus' } });
    fireEvent.change(screen.getByTestId('character-name-input'), { target: { value: '' } });
    expect(createButton).toBeDisabled();

    // Fill in both inputs
    fireEvent.change(screen.getByTestId('character-name-input'), { target: { value: 'John Doe' } });
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
    await userEvent.selectOptions(screen.getByTestId('character-type-select'), 'Magus');
    
    await userEvent.click(screen.getByTestId('create-button'));

    expect(api.post).toHaveBeenCalledWith('/characters', {
      characterName: 'John Doe',
      characterType: 'Magus',
      useCunning: false
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/character/123');
    });
  }, 10000); // Add this timeout

  test('correct API call is made with input data', async () => {
    const mockResponse = { data: { id: '456' } };
    api.post.mockResolvedValueOnce(mockResponse);

    renderComponent();

    await userEvent.type(screen.getByTestId('character-name-input'), 'Jane Smith');
    await userEvent.selectOptions(screen.getByTestId('character-type-select'), 'Companion');
    
    await userEvent.click(screen.getByTestId('create-button'));

    expect(api.post).toHaveBeenCalledWith('/characters', {
      characterName: 'Jane Smith',
      characterType: 'Companion',
      useCunning: false
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/character/456');
    });
  }, 10000); // Add this timeout

  test('error handling for API call failures', async () => {
    const mockError = new Error('API Error');
    api.post.mockRejectedValueOnce(mockError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderComponent();

    await userEvent.type(screen.getByTestId('character-name-input'), 'Error Test');
    await userEvent.selectOptions(screen.getByTestId('character-type-select'), 'Grog');
    
    await userEvent.click(screen.getByTestId('create-button'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/characters', {
        characterName: 'Error Test',
        characterType: 'Grog',
        useCunning: false
      });
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error creating character:', mockError);
    expect(mockNavigate).not.toHaveBeenCalled();

    expect(screen.getByText('An error occurred while creating the character. Please try again.')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  test('navigates to the correct page after successful character creation', async () => {
    const mockResponse = { data: { id: '789' } };
    api.post.mockResolvedValueOnce(mockResponse);

    renderComponent();

    await userEvent.type(screen.getByTestId('character-name-input'), 'Merlin');
    await userEvent.selectOptions(screen.getByTestId('character-type-select'), 'Magus');
    
    await userEvent.click(screen.getByTestId('create-button'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/characters', {
        characterName: 'Merlin',
        characterType: 'Magus',
        useCunning: false
      });
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/character/789');
  });
});