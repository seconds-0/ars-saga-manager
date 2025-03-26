# Abilities Implementation Plan

## Overview
This document outlines the plan for implementing Abilities in the Ars Saga Manager application, which is a core feature of character creation and development in Ars Magica. Abilities represent the skills, knowledge, and expertise that characters possess.

## Requirements

### Data Structure
1. Abilities should be categorized into the following groups:
   - General Abilities
   - Academic Abilities
   - Martial Abilities
   - Supernatural Abilities
   - Arcane Abilities

2. Each Ability should contain:
   - Name (string)
   - Score (number, 0-20)
   - Specialty (string, optional)
   - Category (enum: GENERAL, ACADEMIC, MARTIAL, SUPERNATURAL, ARCANE)
   - Description (string)
   - Experience points (number)

3. Experience Point Tracking:
   - Track experience points separately from ability score
   - Ability scores should be calculated based on experience points
   - Experience point thresholds follow this pattern: 
     - Score 1: 5 XP
     - Score 2: 15 XP (additional 10 XP)
     - Score 3: 30 XP (additional 15 XP)
     - Score 4: 50 XP (additional 20 XP)
     - Score 5: 75 XP (additional 25 XP)
     - Score 6: 105 XP (additional 30 XP)
     - Score 7: 140 XP (additional 35 XP)
     - And so on, with each level requiring 5 more XP than the previous level increment

### Character Type Considerations
1. **Magi**:
   - Start with Latin 4
   - Start with Magic Theory 3
   - Start with Parma Magica 1
   - Start with Artes Liberales 1
   - Academic and Arcane abilities should be emphasized

2. **Companions**:
   - No specific starting abilities
   - More flexibility in ability distribution
   - May focus on Martial and General abilities

3. **Grogs**:
   - Simplified ability selection
   - Focus on practical abilities
   - Limited access to Academic and Arcane abilities

### User Interface Requirements
1. Display abilities grouped by category
2. Allow increasing/decreasing ability scores
3. Allow adding specialties to abilities
4. Track available points for character creation
5. Validate against character type restrictions
6. Show descriptions and relevant information on hover/selection
7. Allow searching and filtering abilities

### Integration with Virtues/Flaws
- Puissant: +2 to effective ability score for a specific ability
- Affinity: Reduced XP costs for a specific ability

## Implementation Phases

### Phase 1: Database Schema Updates
1. Create a new `CharacterAbility` model with the following fields:
   - `id` (PK)
   - `character_id` (FK to Character)
   - `ability_name` (string)
   - `score` (integer)
   - `specialty` (string, nullable)
   - `category` (enum string)
   - `experience_points` (integer)
   - timestamps

2. Create a new `ReferenceAbility` model with the following fields:
   - `id` (PK)
   - `name` (string)
   - `category` (enum string)
   - `description` (text)
   - `puissant_allowed` (boolean)
   - `affinity_allowed` (boolean)
   - timestamps

3. Create migration scripts to:
   - Create the necessary tables
   - Seed the reference data for standard abilities
   - Add any needed columns to the Character table

### Phase 2: Backend Implementation
1. Create API endpoints:
   - GET `/api/reference-abilities` - Get all reference abilities
   - GET `/api/characters/:id/abilities` - Get abilities for a character
   - POST `/api/characters/:id/abilities` - Add an ability to a character
   - PUT `/api/characters/:id/abilities/:abilityId` - Update a character's ability
   - DELETE `/api/characters/:id/abilities/:abilityId` - Remove an ability from a character

2. Update the character creation endpoint to:
   - Initialize required abilities based on character type
   - Validate ability point allocation

3. Implement validation rules in the backend:
   - Handle specialty restrictions
   - Integrate with virtues/flaws that affect abilities
   - Calculate experience points correctly

4. Update existing character routes to include ability data

### Phase 3: Frontend Implementation
1. Enhance the CharacteristicsAndAbilitiesTab component:
   - Add Abilities section below Characteristics
   - Create AbilityInput component (similar to CharacteristicInput)
   - Implement category-based grouping

2. Create UI components:
   - AbilityList component for displaying abilities by category
   - AbilitySelector for adding new abilities
   - AbilityDetails for viewing/editing an ability
   - SpecialtyInput for adding specialties

3. Implement state management:
   - Add ability state to the CharacteristicsAndAbilitiesTab
   - Create/update hooks for ability management
   - Handle experience point calculation

4. Add automatic saving of ability changes (similar to characteristics)

5. Add integration with Virtues and Flaws:
   - Apply Puissant bonuses to relevant abilities
   - Apply Affinity discounts to XP costs

### Phase 4: Testing

#### Unit Testing Plan

##### Backend Tests
1. **Model Tests**:
   - Test `ReferenceAbility` model methods and validations
   - Test `CharacterAbility` model methods and validations
   - Test the relationship between Character and CharacterAbility models
   - Test XP to ability score calculations

2. **API Endpoint Tests**:
   - Test GET `/api/reference-abilities` - Verify it returns all reference abilities correctly
   - Test GET `/api/characters/:id/abilities` - Verify it returns correct abilities for a specific character
   - Test POST `/api/characters/:id/abilities` - Verify it adds abilities to a character properly
   - Test PUT `/api/characters/:id/abilities/:abilityId` - Verify it updates abilities correctly
   - Test DELETE `/api/characters/:id/abilities/:abilityId` - Verify it removes abilities properly
   - Test error handling for each endpoint (invalid IDs, unauthorized access, etc.)

3. **Utility/Service Tests**:
   - Test XP calculation functions
   - Test ability score calculation functions
   - Test specialty validation
   - Test integration with virtue/flaw effects

##### Frontend Tests
1. **Component Tests**:
   - Test `AbilityInput` component for proper rendering and user interactions
   - Test `AbilityList` component for proper rendering of grouped abilities
   - Test `AbilitySelector` component for adding new abilities
   - Test `AbilityDetails` component for viewing/editing ability details
   - Test `SpecialtyInput` component for adding specialties
   - Test enhanced `CharacteristicsAndAbilitiesTab` with abilities section

2. **Hook Tests**:
   - Test ability management hooks (if created)
   - Test integration with existing hooks like `useVirtuesAndFlaws`

3. **Integration Tests**:
   - Test ability selection during character creation
   - Test ability score adjustment and XP calculation
   - Test specialty addition/removal
   - Test auto-saving functionality for abilities
   - Test proper application of Puissant and Affinity virtues to abilities

4. **State Management Tests**:
   - Test ability state initialization in the CharacteristicsAndAbilitiesTab
   - Test state updates when abilities are added/changed/removed
   - Test proper synchronization with backend data

#### Test Environment Setup
1. Create appropriate test fixtures for abilities data
2. Set up mock API responses for ability-related endpoints
3. Create helper functions for common testing scenarios

#### Testing Approach
1. Use Jest for both frontend and backend testing
2. Use React Testing Library for component testing
3. Use mock API calls to isolate frontend tests from backend
4. Use database transactions for backend tests to ensure test isolation

## Dependencies
- Existing Character model
- Existing Virtues and Flaws system
- Character creation workflow
- Experience point tracking system (may need to be implemented)

## Future Considerations
1. Ability advancement through story events
2. Teaching and learning mechanics
3. Integration with covenant activities
4. Enhanced specialties system
5. Book integration (abilities from additional sourcebooks)