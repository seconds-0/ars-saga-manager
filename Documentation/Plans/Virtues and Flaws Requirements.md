# Virtues and Flaws Requirements

## Overview

This document outlines the requirements for implementing the Virtues and Flaws system in the Ars Saga Manager. The system allows characters to take various advantages (Virtues) and disadvantages (Flaws) that define their capabilities and limitations.

## Core Concepts

### Point System

- Minor Virtues cost 1 point
- Major Virtues cost 3 points
- Minor Flaws grant 1 point
- Major Flaws grant 3 points
- Free Virtues/Flaws cost/grant 0 points
- Points from Virtues and Flaws should eventually balance (temporary imbalance allowed during creation)

### Character Type Restrictions

#### Grogs

- Maximum 3 Minor Flaws
- Can take equal number of Minor Virtues as Flaws
- Cannot take Major Virtues or Flaws
- Cannot take Hermetic Virtues/Flaws
- Cannot take The Gift

#### Companions

- Maximum 10 points of Flaws
- Can take equal number of Virtue points as Flaw points
- Maximum 5 Minor Flaws
- Cannot take Hermetic Virtues/Flaws unless they have The Gift

#### Magi

- Maximum 10 points of Flaws
- Can take equal number of Virtue points as Flaw points
- Maximum 5 Minor Flaws
- Maximum 1 Major Hermetic Virtue
- Must take The Gift and Hermetic Magus Social Status
- Receive one free Minor Virtue from their House
- Should take at least one Hermetic Flaw

### House Virtues

- Some Houses provide automatic Virtues (e.g., House Tytalus gives Self-Confident)
- Some Houses provide choice of Virtues (e.g., House Flambeau can choose from multiple options)
- House Virtues are free (do not cost points)
- For Houses with choices, user must select their House Virtue
- House Virtues cannot be changed once selected

### House Ex Miscellanea Special Case

- Receives a free Minor Hermetic Virtue
- Receives a free Major non-Hermetic Virtue
- Must take a compulsory Major Hermetic Flaw
- These do not count towards normal limits
- Should be marked as House Virtue/Flaw in the UI

### Categories

1. The Gift (special Virtue)
2. Hermetic (requires The Gift)
3. Social Status (mandatory)
4. Supernatural
5. Personality (Flaws only)

### General Rules

- Cannot take multiple instances unless explicitly allowed
- Must take exactly one Social Status
- Should not have more than one Story Flaw
- Cannot have more than one Major Personality Flaw
- Should not have more than two Personality Flaws total

## UI Requirements

### Virtue/Flaw Selection

- Display available Virtues/Flaws with clear categorization
- Show point cost/gain for each
- Indicate if Virtue/Flaw is free
- Show remaining points available
- Allow searching/filtering
- Prevent selection of incompatible or restricted options based on character type
- Show warnings for rule violations but allow selection

### Virtue/Flaw Display

- Group by category
- Show point values
- Indicate if Virtue/Flaw is from House selection
- Show total points from Virtues and Flaws
- Highlight point imbalances

### Validation and Warnings

- Display warning banner at top of page when rules are violated
- Warnings should include:
  - Point imbalance
  - Exceeding Minor Flaw limit
  - Multiple Story Flaws
  - Multiple/Excessive Personality Flaws
  - Missing Social Status
  - Invalid combinations
  - Character type restrictions
- All warnings should be informative but not blocking

### House Virtue Selection

- For Houses with fixed Virtues, automatically add the Virtue
- For Houses with choices, provide selection interface
- Clearly indicate the House Virtue is free
- Prevent removal of House Virtues once selected

## Data Model Requirements

### ReferenceVirtueFlaw

- Name
- Type (Virtue/Flaw)
- Size (Minor/Major/Free)
- Category
- Description
- Prerequisites
- Incompatibilities
- Allowed character types
- Multiple allowed (boolean)
- House associations
- Effects/Mechanics

### CharacterVirtueFlaw

- Reference to ReferenceVirtueFlaw
- Character association
- Is house virtue/flaw (boolean)
- Notes/Customizations
- Selections (for Virtues/Flaws requiring choices)

## Technical Requirements

### Validation System

- Implement flexible validation system that can be disabled/modified
- Store validation rules separately from core logic
- Allow saga-specific rule modifications (future feature)
- Provide clear validation messages

### State Management

- Track temporary point imbalances
- Maintain house virtue selections
- Track validation warnings
- Handle character type restrictions

### Performance

- Efficient filtering and searching of available Virtues/Flaws
- Quick validation checks
- Responsive UI updates

## Future Considerations

- Saga-specific rule modifications
- Custom Virtues/Flaws
- Advanced filtering options
- Integration with other character aspects (abilities, arts, etc.)
