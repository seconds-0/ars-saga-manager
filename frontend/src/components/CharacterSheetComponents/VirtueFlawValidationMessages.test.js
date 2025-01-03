import React from 'react';
import { render, screen, within } from '@testing-library/react';
import VirtueFlawValidationMessages from './VirtueFlawValidationMessages';

describe('VirtueFlawValidationMessages', () => {
  it('should not render anything when there are no warnings', () => {
    render(
      <VirtueFlawValidationMessages 
        validationResult={{ 
          isValid: true, 
          warnings: [] 
        }} 
      />
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should render error messages with correct styling', () => {
    render(
      <VirtueFlawValidationMessages 
        validationResult={{ 
          isValid: false, 
          warnings: [
            { type: 'error', message: 'Test error message' }
          ] 
        }} 
      />
    );
    
    const errorContainer = screen.getByTestId('validation-message');
    const message = within(errorContainer).getByText('Test error message');
    expect(message).toBeInTheDocument();
    expect(errorContainer).toHaveClass('bg-red-100', 'text-red-700', 'border-red-200');
  });

  it('should render warning messages with correct styling', () => {
    render(
      <VirtueFlawValidationMessages 
        validationResult={{ 
          isValid: true, 
          warnings: [
            { type: 'warning', message: 'Test warning message' }
          ] 
        }} 
      />
    );
    
    const warningContainer = screen.getByTestId('validation-message');
    const message = within(warningContainer).getByText('Test warning message');
    expect(message).toBeInTheDocument();
    expect(warningContainer).toHaveClass('bg-yellow-100', 'text-yellow-700', 'border-yellow-200');
  });

  it('should render multiple messages', () => {
    render(
      <VirtueFlawValidationMessages 
        validationResult={{ 
          isValid: false, 
          warnings: [
            { type: 'error', message: 'Error 1' },
            { type: 'warning', message: 'Warning 1' },
            { type: 'error', message: 'Error 2' }
          ] 
        }} 
      />
    );
    
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Warning 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
  });

  it('should handle undefined validationResult', () => {
    render(
      <VirtueFlawValidationMessages validationResult={undefined} />
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should handle null warnings array', () => {
    render(
      <VirtueFlawValidationMessages 
        validationResult={{ 
          isValid: true, 
          warnings: null 
        }} 
      />
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
}); 