import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import CharacterListPage from './CharacterListPage';
import api from '../api/axios';

// Mock dependencies
jest.mock('../api/axios', () => ({
  get: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Test data
const mockCharacters = [
  { id: '1', name: 'Alpha Character', character_type: 'magus', intelligence: 3, strength: 2 },
  { id: '2', name: 'Beta Character', character_type: 'companion', intelligence: 1, strength: 3 },
  { id: '3', name: 'Charlie Character', character_type: 'grog', intelligence: 0, strength: 4 },
];

const renderCharacterListPage = () => {
  return render(
    <MemoryRouter>
      <CharacterListPage />
    </MemoryRouter>
  );
};

describe('CharacterListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockResolvedValue({ data: { characters: mockCharacters } });
    api.delete.mockResolvedValue({ data: { message: 'Character deleted' } });
  });

  it('renders loading skeleton initially', () => {
    renderCharacterListPage();
    // No need to query for loading state specifically since we're just checking if elements exist
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders character list after loading', async () => {
    renderCharacterListPage();
    
    await waitFor(() => {
      expect(screen.getByText('Alpha Character')).toBeInTheDocument();
    });

    expect(screen.getByText('Beta Character')).toBeInTheDocument();
    expect(screen.getByText('Charlie Character')).toBeInTheDocument();
  });

  it('displays character stats correctly', async () => {
    renderCharacterListPage();
    
    await waitFor(() => {
      expect(screen.getByText('Total Characters')).toBeInTheDocument();
    });

    // Check for total characters (3)
    expect(screen.getByText('Total Characters').nextSibling).toHaveTextContent('3');
    
    // Check type counts by finding their header elements first
    const magiHeader = screen.getByText('Magi');
    expect(magiHeader.nextSibling).toHaveTextContent('1');
    
    const companionsHeader = screen.getByText('Companions');
    expect(companionsHeader.nextSibling).toHaveTextContent('1');
    
    const grogsHeader = screen.getByText('Grogs');
    expect(grogsHeader.nextSibling).toHaveTextContent('1');
  });

  it('filters characters by search term', async () => {
    renderCharacterListPage();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by name...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name...');
    fireEvent.change(searchInput, { target: { value: 'Alpha' } });
    fireEvent.submit(searchInput.closest('form'));

    // Should only show Alpha Character
    expect(screen.getByText('Alpha Character')).toBeInTheDocument();
    expect(screen.queryByText('Beta Character')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie Character')).not.toBeInTheDocument();
  });

  it('filters characters by type', async () => {
    renderCharacterListPage();
    
    await waitFor(() => {
      expect(screen.getByText('All Types')).toBeInTheDocument();
    });

    // Get the select element
    const typeSelect = screen.getByRole('combobox');
    fireEvent.change(typeSelect, { target: { value: 'magus' } });

    // Should only show magus characters
    expect(screen.getByText('Alpha Character')).toBeInTheDocument();
    expect(screen.queryByText('Beta Character')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie Character')).not.toBeInTheDocument();
  });

  it('changes sort order when sort button is clicked', async () => {
    renderCharacterListPage();
    
    await waitFor(() => {
      expect(screen.getByText('Sort:')).toBeInTheDocument();
    });

    // Characters should be in alphabetical order initially (Alpha, Beta, Charlie)
    const sortButton = screen.getByTitle('Sort Ascending');
    fireEvent.click(sortButton);

    // Characters should now be in reverse order (Charlie, Beta, Alpha)
    // We can check that the sort icon has changed
    expect(screen.getByTitle('Sort Descending')).toBeInTheDocument();
  });

  it('opens delete modal when delete button is clicked', async () => {
    renderCharacterListPage();
    
    await waitFor(() => {
      expect(screen.getByText('Alpha Character')).toBeInTheDocument();
    });

    // Find the delete button within the first character tile
    const deleteButtons = document.querySelectorAll('[aria-label="Delete character"]');
    fireEvent.click(deleteButtons[0]);

    // Check if modal opened
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete Alpha Character/)).toBeInTheDocument();
  });

  it('deletes character when confirmed in modal', async () => {
    renderCharacterListPage();
    
    await waitFor(() => {
      expect(screen.getByText('Alpha Character')).toBeInTheDocument();
    });

    // Find and click delete button
    const deleteButtons = document.querySelectorAll('[aria-label="Delete character"]');
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion
    const confirmButton = screen.getByText('Delete');
    fireEvent.click(confirmButton);

    // Check if API was called
    expect(api.delete).toHaveBeenCalledWith('/characters/1');

    // After delete, we should see a success message, but we'd need to mock toast functionality
  });

  it('shows empty state when no characters exist', async () => {
    api.get.mockResolvedValue({ data: { characters: [] } });
    renderCharacterListPage();
    
    await waitFor(() => {
      expect(screen.getByText('No characters found')).toBeInTheDocument();
    });

    expect(screen.getByText('Create your first character to get started')).toBeInTheDocument();
  });

  it('shows error state when API call fails', async () => {
    api.get.mockRejectedValue(new Error('Network error'));
    renderCharacterListPage();
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    // The exact error message can vary based on the error condition, so we just check for a paragraph in the error element
    expect(screen.getByText('Unable to connect to the server. Please check your internet connection.')).toBeInTheDocument();
  });
});