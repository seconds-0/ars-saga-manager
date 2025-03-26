import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider } from '../useAuth';
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

const mockNavigate = jest.fn();
const mockLogin = jest.fn();
const mockPost = jest.fn();

jest.mock('../api/axios', () => ({
  __esModule: true,
  default: {
    post: (...args) => mockPost(...args)
  }
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../useAuth', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    login: mockLogin,
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
    mockPost.mockReset();
  });

  describe('Initial Render', () => {
    test('renders login form with all required fields', () => {
      renderLoginPage();
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('mock-input-email')).toBeInTheDocument();
      expect(screen.getByTestId('mock-input-password')).toBeInTheDocument();
    });

    test('renders register button with correct initial text', () => {
      renderLoginPage();
      const registerButton = screen.getByTestId('register-button');
      expect(registerButton).toHaveTextContent('Need an account? Register');
    });
  });

  describe('Login Functionality', () => {
    test('calls login API with correct credentials and calls login function', async () => {
      mockPost.mockResolvedValueOnce({ data: { userId: '123', message: 'Login successful' } });
      
      renderLoginPage();
      fireEvent.submit(screen.getByTestId('login-form'));
      
      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/auth/login', { 
          email: 'test@example.com', 
          password: 'password123' 
        });
        expect(mockLogin).toHaveBeenCalledWith('123');
      });
    });

    test('navigates to home page after successful login', async () => {
      mockPost.mockResolvedValueOnce({ data: { userId: '123', message: 'Login successful' } });
      
      renderLoginPage();
      fireEvent.submit(screen.getByTestId('login-form'));
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/home');
      });
    });

    test('displays error message on login failure', async () => {
      const errorMessage = 'Invalid credentials';
      mockPost.mockRejectedValueOnce({ 
        response: { data: { message: errorMessage } } 
      });
      
      renderLoginPage();
      fireEvent.submit(screen.getByTestId('login-form'));
      
      await waitFor(() => {
        expect(screen.getByText(`Login failed: ${errorMessage}`))
          .toBeInTheDocument();
      });
    });
  });

  describe('Registration Toggle', () => {
    test('switches to registration form when register button is clicked', () => {
      renderLoginPage();
      fireEvent.click(screen.getByTestId('register-button'));
      
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
      expect(screen.getByText('Create an account')).toBeInTheDocument();
    });

    test('switches back to login form when toggle button is clicked again', () => {
      renderLoginPage();
      const toggleButton = screen.getByTestId('register-button');
      
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    });
  });

  describe('Registration Success', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('shows success message when registration succeeds', async () => {
      mockPost.mockResolvedValueOnce({ data: { message: 'Registration successful' } });
      
      renderLoginPage();
      fireEvent.click(screen.getByTestId('register-button'));
      
      const registerForm = screen.getByTestId('register-form');
      fireEvent.submit(registerForm);
      
      await waitFor(() => {
        expect(screen.getByText('Registration successful!')).toBeInTheDocument();
      });

      await act(async () => {
        jest.runAllTimers();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText('Registration successful! Please sign in.')).toBeInTheDocument();
      });
    });

    test('returns to login form after successful registration', async () => {
      mockPost.mockResolvedValueOnce({ data: { message: 'Registration successful' } });
      
      renderLoginPage();
      fireEvent.click(screen.getByTestId('register-button'));
      
      const registerForm = screen.getByTestId('register-form');
      fireEvent.submit(registerForm);
      
      await act(async () => {
        jest.runAllTimers();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      });
    });
  });
});