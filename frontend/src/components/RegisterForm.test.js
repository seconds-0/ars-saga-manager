import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterForm from './RegisterForm';
import { 
  setupComponent, 
  setupConsoleSuppress,
  createAxiosMock 
} from '../__test-utils__';

// Setup console error suppression
setupConsoleSuppress();

// Mock dependencies
jest.mock('../api/axios', () => createAxiosMock());
jest.mock('./Toast', () => {
  return function MockToast({ message, type, onClose }) {
    return (
      <div data-testid="mock-toast" onClick={onClose} className={type}>
        {message}
      </div>
    );
  };
});

// Standard setup function
function setup(customProps = {}) {
  const defaultProps = {
    onRegisterSuccess: jest.fn(),
  };
  
  const utils = setupComponent(RegisterForm, defaultProps, customProps);
  
  // Helper function for filling out the form
  const fillForm = ({
    email = 'test@example.com',
    password = 'password123',
    confirmPassword = 'password123',
  } = {}) => {
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    
    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.change(passwordInput, { target: { value: password } });
    fireEvent.change(confirmPasswordInput, { target: { value: confirmPassword } });
    
    return { emailInput, passwordInput, confirmPasswordInput };
  };
  
  return {
    ...utils,
    fillForm
  };
}

describe('RegisterForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Rendering', () => {
    test('renders without crashing', () => {
      setup();
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
    });
    
    test('renders all form fields', () => {
      setup();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });
  });
  
  describe('Form validation', () => {
    test('shows error when passwords do not match', async () => {
      const { fillForm } = setup();
      fillForm({ password: 'password123', confirmPassword: 'different123' });
      
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
      
      expect(screen.getByTestId('mock-toast')).toHaveTextContent("Passwords don't match");
      expect(screen.getByTestId('mock-toast')).toHaveClass('error');
    });
    
    test('submits the form when all fields are valid', async () => {
      const { api } = require('../api/axios');
      api.post.mockResolvedValueOnce({ data: { message: 'Registration successful' } });
      
      const { fillForm, props } = setup();
      fillForm();
      
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
      
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Check success toast is displayed
      await waitFor(() => {
        expect(screen.getByTestId('mock-toast')).toHaveTextContent('Registration successful!');
        expect(screen.getByTestId('mock-toast')).toHaveClass('success');
      });
      
      // Check callback is called after timeout
      jest.useFakeTimers();
      jest.advanceTimersByTime(4000);
      expect(props.onRegisterSuccess).toHaveBeenCalled();
      jest.useRealTimers();
    });
  });
  
  describe('Error handling', () => {
    test('displays error message when registration fails', async () => {
      const { api } = require('../api/axios');
      api.post.mockRejectedValueOnce({
        response: {
          data: {
            message: 'Email already in use'
          }
        }
      });
      
      const { fillForm } = setup();
      fillForm();
      
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('mock-toast')).toHaveTextContent('Email already in use');
        expect(screen.getByTestId('mock-toast')).toHaveClass('error');
      });
    });
    
    test('handles generic errors during registration', async () => {
      const { api } = require('../api/axios');
      api.post.mockRejectedValueOnce(new Error('Network error'));
      
      const { fillForm } = setup();
      fillForm();
      
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
      
      await waitFor(() => {
        expect(screen.getByTestId('mock-toast')).toHaveTextContent('An error occurred during registration');
        expect(screen.getByTestId('mock-toast')).toHaveClass('error');
      });
    });
  });
  
  describe('User interactions', () => {
    test('dismisses toast when clicked', () => {
      const { fillForm } = setup();
      fillForm({ password: 'password123', confirmPassword: 'different123' });
      
      // Trigger validation error to show toast
      fireEvent.click(screen.getByRole('button', { name: /register/i }));
      
      // Toast should be visible
      expect(screen.getByTestId('mock-toast')).toBeInTheDocument();
      
      // Click toast to dismiss
      fireEvent.click(screen.getByTestId('mock-toast'));
      
      // Toast should be gone
      expect(screen.queryByTestId('mock-toast')).not.toBeInTheDocument();
    });
  });
});