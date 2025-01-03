import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '../useAuth';
import api from '../api/axios';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClientProvider } from 'react-query';
import { queryClient } from '../queryClient';

jest.mock('flowbite-react', () => ({
  Card: ({ children }) => <div data-testid="mock-card">{children}</div>,
  TextInput: ({ id, name, type, placeholder, required, value, onChange }) => (
    <input
      data-testid={`mock-input-${name}`}
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      value={value}
      onChange={onChange}
    />
  ),
  Button: ({ children, onClick, type, 'data-testid': dataTestId }) => (
    <button data-testid={dataTestId} onClick={onClick} type={type}>
      {children}
    </button>
  ),
  Alert: ({ children, color, onDismiss }) => (
    <div data-testid="mock-alert" role="alert">
      {children}
    </div>
  ),
  Label: ({ children, htmlFor }) => (
    <label data-testid="mock-label" htmlFor={htmlFor}>
      {children}
    </label>
  ),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn().mockReturnValue(undefined),
}));

jest.mock('../api/axios', () => ({
  post: jest.fn().mockResolvedValue({ data: { token: 'fake-token' } }),
}));

jest.mock('../useAuth', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    login: jest.fn().mockResolvedValue(undefined),
    isAuthenticated: false,
    user: null,
    logout: jest.fn(),
  }),
}));

jest.mock('../hooks/useForm', () => ({
  __esModule: true,
  default: () => ({
    values: { email: 'test@example.com', password: 'password123' },
    handleChange: jest.fn(),
    handleSubmit: jest.fn(cb => (e) => {
      e.preventDefault();
      cb();
    }),
  }),
}));

const ErrorFallback = ({error}) => (
  <div role="alert">
    <p>Something went wrong:</p>
    <pre>{error.message}</pre>
  </div>
);

const renderLoginPage = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <LoginPage />
          </ErrorBoundary>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('LoginPage renders without crashing', () => {
    render(<LoginPage />);
  });

  test('renders login form', () => {
    renderLoginPage();
    
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByTestId('mock-input-email')).toBeInTheDocument();
    expect(screen.getByTestId('mock-input-password')).toBeInTheDocument();
    expect(screen.getByTestId('sign-in-button')).toHaveTextContent('Sign in');
  });

  test('handles form submission and stores token', async () => {
    console.log('Starting test');
    const fakeToken = 'fake-token';
    api.post.mockResolvedValueOnce({ data: { token: fakeToken } });
    const mockLogin = jest.fn();
    const mockNavigate = jest.fn();
    
    jest.spyOn(require('../useAuth'), 'useAuth').mockImplementation(() => ({
      login: mockLogin,
      isAuthenticated: false,
      user: null,
      logout: jest.fn(),
    }));
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);

    console.log('Rendering component');
    renderLoginPage();
    
    console.log('Submitting form');
    fireEvent.submit(screen.getByTestId('login-form'));
    
    console.log('Checking expectations');
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'test@example.com', password: 'password123' });
    });
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(fakeToken);
    });
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe(fakeToken);
    });
    
    console.log('Test completed');
  });

  test('displays error message on login failure', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { message: 'Invalid credentials' } } });
    const mockLogin = jest.fn();
    
    jest.spyOn(require('../useAuth'), 'useAuth').mockImplementation(() => ({
      login: mockLogin,
      isAuthenticated: false,
      user: null,
      logout: jest.fn(),
    }));

    renderLoginPage();

    fireEvent.change(screen.getByTestId('mock-input-email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('mock-input-password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByTestId('sign-in-button'));

    await waitFor(() => {
      expect(screen.getByText('Login failed: Invalid credentials')).toBeInTheDocument();
    });
  });
});