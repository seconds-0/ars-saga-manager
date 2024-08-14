import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from './LoadingSpinner';

// Render helper function
const renderLoadingSpinner = () => {
  return render(<LoadingSpinner />);
};

describe('LoadingSpinner', () => {
  test('renders without crashing', () => {
    renderLoadingSpinner();
    const spinnerElement = screen.getByTestId('loading-spinner');
    expect(spinnerElement).toBeInTheDocument();
  });

  test('has correct CSS classes for styling and animation', () => {
    renderLoadingSpinner();
    const spinnerElement = screen.getByTestId('loading-spinner');
    expect(spinnerElement).toHaveClass('animate-spin', 'rounded-full', 'h-12', 'w-12', 'border-t-2', 'border-b-2', 'border-blue-500');
  });

  test('is wrapped in a flex container for centering', () => {
    renderLoadingSpinner();
    const wrapperDiv = screen.getByTestId('loading-spinner-wrapper');
    expect(wrapperDiv).toHaveClass('flex', 'justify-center', 'items-center', 'h-full');
  });
});