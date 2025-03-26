import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import SideBar from './SideBar';
import { useAuth } from '../useAuth';

// Mock dependencies
jest.mock('../useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('SideBar', () => {
  const mockLogout = jest.fn();
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue({
      user: { name: 'John Doe', email: 'john@example.com' },
      logout: mockLogout
    });
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
  });

  it('renders with user information', () => {
    render(
      <MemoryRouter>
        <SideBar activePage="home" />
      </MemoryRouter>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders user initials when no avatar is provided', () => {
    render(
      <MemoryRouter>
        <SideBar activePage="home" />
      </MemoryRouter>
    );

    // Check for initials (JD from John Doe)
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
  
  it('highlights the active navigation item', () => {
    const { rerender } = render(
      <MemoryRouter>
        <SideBar activePage="home" />
      </MemoryRouter>
    );
    
    // Dashboard should be active
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('bg-blue-600');
    expect(dashboardLink).toHaveClass('text-white');
    
    // Change active page to Characters
    rerender(
      <MemoryRouter>
        <SideBar activePage="characters" />
      </MemoryRouter>
    );
    
    // Characters should now be active
    const charactersLink = screen.getByText('Characters').closest('a');
    expect(charactersLink).toHaveClass('bg-blue-600');
    expect(charactersLink).toHaveClass('text-white');
  });
  
  it('disables and marks future features as coming soon', () => {
    render(
      <MemoryRouter>
        <SideBar activePage="home" />
      </MemoryRouter>
    );
    
    // Check for disabled items
    const spellsLink = screen.getByText('Spells').closest('a');
    expect(spellsLink).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getAllByText('Soon').length).toBeGreaterThan(0);
  });
  
  it('calls logout and navigates when logout button is clicked', () => {
    render(
      <MemoryRouter>
        <SideBar activePage="home" />
      </MemoryRouter>
    );
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
  
  it('handles missing user data gracefully', () => {
    useAuth.mockReturnValue({
      user: null,
      logout: mockLogout
    });
    
    render(
      <MemoryRouter>
        <SideBar activePage="home" />
      </MemoryRouter>
    );
    
    // Should show default values
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('No email')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument(); // Default initials
  });
});