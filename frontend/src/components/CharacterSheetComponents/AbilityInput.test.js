import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AbilityInput from './AbilityInput';
import { setupComponent, setupConsoleSuppress } from '../../__test-utils__';

// Setup console error suppression
setupConsoleSuppress();

// Standardized setup function
function setup(customProps = {}) {
  const defaultProps = {
    name: 'Awareness',
    baseValue: 2,
    category: 'GENERAL',
    onIncrement: jest.fn(),
    onDecrement: jest.fn(),
    onSpecialtyChange: jest.fn()
  };
  
  const utils = setupComponent(AbilityInput, defaultProps, customProps);
  
  return {
    ...utils,
    // Common elements for easier access in tests
    incrementButton: screen.getByLabelText(`Increase ${utils.props.name}`),
    decrementButton: screen.getByLabelText(`Decrease ${utils.props.name}`),
    specialtyInput: screen.getByPlaceholderText('Specialty'),
    nameElement: screen.getByText(utils.props.name),
    valueElement: screen.getByText(utils.props.effectiveValue || utils.props.baseValue)
  };
}

describe('AbilityInput', () => {
  describe('Rendering', () => {
    test('renders ability name and value correctly', () => {
      const { nameElement, valueElement } = setup();
      
      expect(nameElement).toBeInTheDocument();
      expect(valueElement).toBeInTheDocument();
      expect(valueElement).toHaveTextContent('2');
    });
    
    test('renders specialty when provided', () => {
      const specialtyValue = 'Notice Sounds';
      const { specialtyInput } = setup({ specialty: specialtyValue });
      
      expect(specialtyInput).toHaveValue(specialtyValue);
    });
    
    test('renders effective value with bonus indicator when provided', () => {
      const baseValue = 2;
      const effectiveValue = 4;
      const { container } = setup({ baseValue, effectiveValue });
      
      expect(screen.getByText(effectiveValue.toString())).toBeInTheDocument();
      expect(screen.getByText('+2')).toBeInTheDocument();
      expect(screen.getByTitle('Bonus from virtue or other effect')).toBeInTheDocument();
    });
    
    test('applies different styling based on category', () => {
      // Test GENERAL category
      const { container: generalContainer } = setupComponent(AbilityInput, {
        name: "Awareness", 
        baseValue: 2, 
        category: "GENERAL", 
        onIncrement: jest.fn(), 
        onDecrement: jest.fn(), 
        onSpecialtyChange: jest.fn()
      });
      expect(generalContainer.firstChild).toHaveClass('bg-gray-100');
      expect(generalContainer.firstChild).toHaveClass('border-gray-200');
      
      // Test ACADEMIC category
      const { container: academicContainer } = setupComponent(AbilityInput, {
        name: "Awareness", 
        baseValue: 2, 
        category: "ACADEMIC", 
        onIncrement: jest.fn(), 
        onDecrement: jest.fn(), 
        onSpecialtyChange: jest.fn()
      });
      expect(academicContainer.firstChild).toHaveClass('bg-blue-50');
      expect(academicContainer.firstChild).toHaveClass('border-blue-100');
      
      // Test MARTIAL category
      const { container: martialContainer } = setupComponent(AbilityInput, {
        name: "Awareness", 
        baseValue: 2, 
        category: "MARTIAL", 
        onIncrement: jest.fn(), 
        onDecrement: jest.fn(), 
        onSpecialtyChange: jest.fn()
      });
      expect(martialContainer.firstChild).toHaveClass('bg-red-50');
      expect(martialContainer.firstChild).toHaveClass('border-red-100');
      
      // Test SUPERNATURAL category
      const { container: supernaturalContainer } = setupComponent(AbilityInput, {
        name: "Awareness", 
        baseValue: 2, 
        category: "SUPERNATURAL", 
        onIncrement: jest.fn(), 
        onDecrement: jest.fn(), 
        onSpecialtyChange: jest.fn()
      });
      expect(supernaturalContainer.firstChild).toHaveClass('bg-purple-50');
      expect(supernaturalContainer.firstChild).toHaveClass('border-purple-100');
      
      // Test ARCANE category
      const { container: arcaneContainer } = setupComponent(AbilityInput, {
        name: "Awareness", 
        baseValue: 2, 
        category: "ARCANE", 
        onIncrement: jest.fn(), 
        onDecrement: jest.fn(), 
        onSpecialtyChange: jest.fn()
      });
      expect(arcaneContainer.firstChild).toHaveClass('bg-green-50');
      expect(arcaneContainer.firstChild).toHaveClass('border-green-100');
    });
  });
  
  describe('User Interactions', () => {
    test('calls onIncrement when increment button is clicked', () => {
      const { incrementButton, props } = setup();
      
      fireEvent.click(incrementButton);
      expect(props.onIncrement).toHaveBeenCalledTimes(1);
    });
    
    test('calls onDecrement when decrement button is clicked', () => {
      const { decrementButton, props } = setup();
      
      fireEvent.click(decrementButton);
      expect(props.onDecrement).toHaveBeenCalledTimes(1);
    });
    
    test('calls onSpecialtyChange with new value when specialty input changes', () => {
      const { specialtyInput, props } = setup();
      const newSpecialty = 'New Specialty';
      
      fireEvent.change(specialtyInput, { target: { value: newSpecialty } });
      expect(props.onSpecialtyChange).toHaveBeenCalledWith(newSpecialty);
    });
  });
  
  describe('Edge Cases', () => {
    test('handles empty specialty value', () => {
      const { specialtyInput } = setup({ specialty: null });
      expect(specialtyInput).toHaveValue('');
    });
    
    test('handles missing callback props gracefully', () => {
      // Just verify we can render the component without crashing
      const { container } = setupComponent(
        AbilityInput,
        { name: "Test", baseValue: 1, category: "GENERAL" }
      );
      
      // If we can render the component without crashing, the test passes
      expect(container).toBeInTheDocument();
    });
  });
});