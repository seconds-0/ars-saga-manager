# Virtues and Flaws Testing Strategy

## Overview

This document outlines the testing strategy for the Virtues and Flaws system. The tests will cover all components involved in managing virtues and flaws for characters, ensuring proper validation, point calculation, and rule enforcement.

## Components to Test

### 1. VirtuesAndFlawsTab

Main container component managing the overall state and coordination.

#### 1.1 Rendering Tests

- Should render with default values when no character is provided
- Should render with pre-existing character data
- Should display warning banner when validation rules are violated
- Should display point totals correctly
- Should group virtues and flaws by category

#### 1.2 State Management Tests

- Should track virtue/flaw points correctly
- Should maintain separate counts for house virtues/flaws
- Should track validation warnings
- Should handle character type restrictions

#### 1.3 Integration Tests

- Should coordinate between selection and display components
- Should handle house virtue selection
- Should manage validation state
- Should persist changes correctly

### 2. VirtueFlawSelector

#### 2.1 Filtering and Display

- Should display available virtues/flaws with correct categorization
- Should filter based on character type restrictions
- Should handle search functionality
- Should show correct point costs
- Should indicate free virtues/flaws
- Should show remaining points available

#### 2.2 Selection Logic

- Should prevent selection of incompatible combinations
- Should show warnings for rule violations
- Should handle house virtue selection correctly
- Should manage Ex Miscellanea special cases
- Should prevent selection when points insufficient (for virtues)

#### 2.3 Validation Tests

- Should validate against character type restrictions
- Should check prerequisite requirements
- Should verify incompatibility rules
- Should validate multiple instance rules
- Should handle Social Status requirements

### 3. VirtueFlawList

#### 3.1 Display Tests

- Should group items by category
- Should show point values correctly
- Should indicate house virtues/flaws
- Should handle empty states
- Should display warnings for rule violations

#### 3.2 Interaction Tests

- Should allow removal of non-house virtues/flaws
- Should prevent removal of house virtues
- Should update point totals on removal
- Should handle multiple instances correctly

### 4. VirtueFlawDetails

#### 4.1 Display Tests

- Should show complete virtue/flaw information
- Should display customization options
- Should indicate if it's a house virtue/flaw
- Should show prerequisites and incompatibilities

#### 4.2 Editing Tests

- Should allow editing of customizable fields
- Should validate custom selections
- Should persist changes correctly
- Should prevent editing of certain house virtue/flaw fields

### 5. Validation System

#### 5.1 Rule Validation

- Should validate maximum points (10 for companions/magi, 3 for grogs)
- Should validate minor flaw limit (5 for companions/magi)
- Should validate character type restrictions
- Should check Social Status requirement
- Should validate Personality Flaw limits
- Should validate Story Flaw limit
- Should check Major Hermetic Virtue limit for magi

#### 5.2 Warning Display

- Should show appropriate warnings for each violation
- Should allow actions despite warnings
- Should update warnings in real-time
- Should handle multiple simultaneous warnings

#### 5.3 House-Specific Validation

- Should enforce house virtue selection rules
- Should handle Ex Miscellanea special cases
- Should validate house virtue/flaw combinations
- Should prevent removal of house virtues

### 6. Point Calculation System

#### 6.1 Basic Calculations

- Should calculate virtue points correctly (1 for minor, 3 for major)
- Should calculate flaw points correctly (1 for minor, 3 for major)
- Should handle free virtues/flaws correctly
- Should track running point totals

#### 6.2 Special Cases

- Should exclude house virtues/flaws from point totals
- Should handle Ex Miscellanea additional virtues/flaws
- Should manage temporary point imbalances
- Should validate final point balance requirements

## Test Data Requirements

### Mock Characters

- Grog character with various restrictions
- Companion character with and without The Gift
- Magus character with different house combinations
- Ex Miscellanea magus with special cases

### Mock Virtues/Flaws

- Various combinations of minor/major
- Different categories (Hermetic, Social Status, etc.)
- Virtues/Flaws with prerequisites
- Incompatible combinations
- Multiple-instance allowed cases
- House-specific virtues

## Testing Approach

### Unit Tests

- Individual component testing
- Validation rule testing
- Point calculation testing
- State management testing

### Integration Tests

- Component interaction testing
- Data flow testing
- State synchronization testing
- Persistence testing

### End-to-End Tests

- Complete virtue/flaw selection workflows
- House virtue selection workflows
- Character type specific workflows
- Validation and warning workflows

## Test Implementation Priority

1. Basic component rendering and interaction
2. Point calculation system
3. Validation system
4. House virtue handling
5. Special case handling (Ex Miscellanea)
6. Integration between components
7. End-to-end workflows
