import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../useAuth';
import HomePage from './HomePage';
import api from '../api/axios';

// Mock dependencies
jest.mock('../useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../api/axios', () => ({
  get: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Test data
const mockCharacters = [
  { id: '1', name: 'Character 1', character_type: 'magus' },
  { id: '2', name: 'Character 2', character_type: 'companion' },
  { id: '3', name: 'Character 3', character_type: 'grog' },
];

const mockUser = { name: 'Test User', email: 'test@example.com' };

const renderHomePage = () => {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    api.get.mockResolvedValue({ data: { characters: mockCharacters } });
  });

  it('renders the loading skeleton initially', async () => {
    renderHomePage();
    expect(screen.getByTestId('home-page-loading')).toBeInTheDocument();
  });

  it('renders the dashboard with stats after loading', async () => {
    renderHomePage();
    
    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    // Verify greeting contains user name
    const timeOfDay = new Date().getHours() < 12 ? 'Good morning' : 
                     new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
    expect(screen.getByText(new RegExp(`${timeOfDay}, ${mockUser.name}`))).toBeInTheDocument();
    
    // Verify stats cards
    expect(screen.getByText('Characters')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // 3 characters
  });

  it('displays recent activity based on characters', async () => {
    renderHomePage();
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    expect(screen.getByText('Character 1 updated')).toBeInTheDocument();
  });

  it('renders empty activity state when no characters exist', async () => {
    api.get.mockResolvedValue({ data: { characters: [] } });
    renderHomePage();
    
    await waitFor(() => {
      expect(screen.getByText('No recent activity found.')).toBeInTheDocument();
    });

    expect(screen.getByText('Create your first character')).toBeInTheDocument();
  });

  it('displays error message when API call fails', async () => {
    api.get.mockRejectedValue(new Error('Network error'));
    renderHomePage();
    
    await waitFor(() => {
      expect(screen.getByTestId('home-page-error')).toBeInTheDocument();
    });

    expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Failed to load dashboard data. Please try again.')).toBeInTheDocument();
  });

  it('navigates when clicking on stats cards', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
    renderHomePage();
    
    await waitFor(() => {
      expect(screen.getByText('Characters')).toBeInTheDocument();
    });

    // Click on the Characters card
    fireEvent.click(screen.getByText('Characters').closest('div'));
    expect(mockNavigate).toHaveBeenCalledWith('/characters');
  });
});
