# Abilities Integration Feature

## Task ID
FEAT-Abilities-V1

## Problem Statement
Implement abilities functionality for Ars Magica characters, allowing players to assign and manage abilities according to the Ars Magica 5th Edition rules.

## Components Involved
- Database Models (ReferenceAbility, CharacterAbility)
- Backend routes for abilities management
- Ability-related utilities (XP calculations, validations)
- Frontend components for displaying and editing abilities

## Dependencies
- Experience system for spending experience points on abilities
- Character model and authentication system
- Virtues/Flaws system for abilities that are affected by special abilities (Puissant, Affinity)

## Implementation Checklist

### Phase 1: Database Setup ✅
- [x] Create ReferenceAbility model to store all standard abilities
- [x] Create CharacterAbility model to store character-specific abilities
- [x] Implement database migrations for abilities tables
- [x] Create seeders for populating standard Ars Magica abilities
- [x] Add additional abilities from the core rulebook that were missing

### Phase 2: Backend Implementation ✅
- [x] Implement routes for retrieving reference abilities
- [x] Implement routes for managing character abilities (add/update/delete)
- [x] Create utility functions for ability calculations (XP to score, score to XP)
- [x] Implement validation logic for ability restrictions (character type, prerequisites)
- [x] Integrate with experience system for spending XP on abilities
- [x] Add support for abilities modified by virtues (Puissant, Affinity)

### Phase 3: Frontend Implementation ✅
- [x] Create ability selection component for adding new abilities
- [x] Implement ability display and editing components
- [x] Add specialty field support for abilities that allow specialties
- [x] Implement ability category filtering and search
- [x] Add XP calculations and display
- [x] Implement visual indicators for ability bonuses from virtues
- [x] Create ability list component for character sheets

### Phase 4: Integration and Testing ✅
- [x] Update character creation process to include default abilities
- [x] Ensure abilities are properly validated in all interfaces
- [x] Test ability XP calculations with various virtues and character types
- [x] Verify ability restrictions by character type work correctly
- [x] Test integration with experience system

## Verification Steps
1. Verify that all standard Ars Magica abilities are in the database
2. Test adding, updating, and removing abilities from a character
3. Verify that abilities with specialties work correctly
4. Check that XP calculations are accurate, including with virtue bonuses
5. Confirm that character type restrictions prevent inappropriate abilities
6. Test integration with the experience system for allocating XP

## Decision Authority
- Independent decisions:
  - UI styling and layout of ability components
  - Error message wording for ability validation
  - Implementation details of utility functions
  
- User input required:
  - Adding non-standard abilities not in the core rulebook
  - Changes to ability restrictions by character type
  - Modifications to XP calculation formulas

## Questions/Uncertainties

### Blocking
- None

### Non-blocking
- How should we handle abilities from supplemental books beyond the core rulebook?
  - **Working assumption**: We will focus on core rulebook abilities initially and add supplemental content later.
  
- Should we implement separate specialty types or allow free-form entry?
  - **Working assumption**: We will use free-form text entry but provide validation and suggestions.

## Acceptable Tradeoffs
- Initially, we will focus on individual abilities rather than ability groups/trees
- We'll implement basic XP allocation rather than complex advancement scenarios at first
- Character creation will offer standard abilities rather than custom packages
- We'll assume basic Puissant and Affinity virtues before implementing more complex interactions

## Status
[x] Completed

## Notes

- **Atomicity:** The `spendExperience` service interacting with both `Character` and `CharacterAbility` tables uses database transactions for data integrity.
- **Score Derivation:** The `score` displayed is always calculated from `experience_points`, which is the value stored in the database.
- **Frontend Validation:** Added frontend checks for available Exp before enabling '+' buttons to improve UX.
- **Implementation Complete:** All abilities from the core rulebook are now in the database and available through the API.
- **Added Missing Abilities:** We added the following abilities that were missing from the original implementation:
  - General: Area Lore, Teaching
  - Academic: Dead Language
  - Martial: Shield (and fixed Brawl to appear in both General and Martial)
  - Supernatural: Animal Ken, Entrancement, Shapeshifter, Wilderness Sense
  - Arcane: Magic Realm Lore, Organization Lore
- **❗ IMPORTANT: Timestamp Attributes:** When including `ReferenceVirtueFlaw` in queries with the Character-Ability relationship, always exclude timestamp attributes to prevent errors. Use this pattern:
  ```javascript
  include: [{
    model: ReferenceVirtueFlaw,
    as: 'referenceVirtueFlaw',
    attributes: {
      exclude: ['createdAt', 'updatedAt', 'created_at', 'updated_at']
    }
  }]
  ```
  This is necessary because the `ReferenceVirtueFlaw` model's timestamps don't match the expected format in some contexts.

### Setup Instructions
To set up abilities in the database:
1. Run the `scripts/setup-abilities.js` script from the project root: `node scripts/setup-abilities.js`
2. This will run both the migration and seeder for abilities

### Manual Setup
If the script doesn't work, run these commands manually:
```
cd backend
npx sequelize-cli db:migrate --to 20250313000000-create-abilities-tables.js
npx sequelize-cli db:seed --seed 20250313000000-seed-reference-abilities.js
```