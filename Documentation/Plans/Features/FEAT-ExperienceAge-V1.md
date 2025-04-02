# Workplan: Implement Experience and Age System (V1 - Character Creation)

## Task ID

FEAT-ExperienceAge-V1

## Problem Statement

The character creation process currently lacks the core Ars Magica mechanics for Experience (Exp) points derived from age and Virtues/Flaws (V/Fs). This prevents accurate representation of starting characters, including specifically restricted Exp pools, and limits the foundation for future character progression features. We need to introduce age as an attribute, accurately calculate _all_ types of available Exp pools (general, magical, and specifically restricted) based on rules, store these pools appropriately in the database, and display them clearly in the UI.

## Components Involved

- **Backend:**
  - `Character` model (`backend/models/Character.js`)
  - `ReferenceVirtueFlaw` model (`backend/models/ReferenceVirtueFlaw.js`)
  - Database Migrations (`backend/migrations/`)
  - Character routes (`backend/routes/characters.js` - specifically POST `/characters`, PUT `/characters/:id`)
  - Virtue/Flaw routes (`backend/routes/characters.js` - specifically POST/DELETE `/characters/:id/virtues-flaws`)
  - New Exp Calculation utility/service (`backend/utils/experienceUtils.js` - new file)
- **Frontend:**
  - Character Overview Tab (`frontend/src/components/CharacterSheetComponents/CharacterOverviewTab.js`)
  - Character Creation Page (`frontend/src/components/CreateCharacterPage.js`) - Potential adjustment for age input.
  - Character Sheet (`frontend/src/components/CharacterSheetComponents/CharacterSheet.js`) - To pass data down.
  - Testing utilities (`frontend/src/__test-utils__/`)

## Dependencies

- Existing `Character` and `ReferenceVirtueFlaw` models and database tables.
- Virtue/Flaw selection system.
- Database connection and Sequelize ORM setup.
- Core ArM5 rules for base Exp (45), yearly rates (10/15/20), "Later Life" start age (assumed 5+), and V/F modifiers (rate, flat general, magical, restricted).
- **Future Dependency:** Ability system implementation (required for _spending_ Exp).

## Implementation Checklist

### 1. Database Schema Changes

    - [ ] **Define New `ReferenceVirtueFlaw` Fields:**
        - Add `magical_exp_modifier` (Integer, default 0, nullable: false). *(For flat magical Exp bonuses)*
        - Add `general_exp_modifier` (Integer, default 0, nullable: false). *(For flat general Exp OR restricted Exp amount)*
        - Add `general_exp_modifier_category` (String, nullable). *(Determines restriction: null=general, 'CategoryName'=category, '["Ability1", "Ability2"]'=list, 'AbilityName'=single)*
        - Add `exp_rate_modifier` (Integer, default 0, nullable: false). *(For Wealthy/Poor; value is added/subtracted from base rate 15)*
    - [ ] **Define New `Character` Fields:**
        - Add `age` (Integer, not nullable, default 20). *(Ensure validation min 5)*
        - Add `general_exp_available` (Integer, default 0, not nullable). *(Truly unrestricted Exp)*
        - Add `magical_exp_available` (Integer, default 0, not nullable). *(Magi base + bonuses)*
        - **Add `restricted_exp_pools` (JSONB, not nullable, default '[]').** *(Array of {source, amount, restrictions: {type, value}, spent})*
    - [ ] **Create Database Migration:**
        - Generate a new migration file (e.g., `YYYYMMDDHHMMSS-add-experience-fields.js`).
        - Implement the `up` function to add all new columns to `ReferenceVirtueFlaw` and `Character` tables using `queryInterface.addColumn`. Set appropriate `allowNull: false` and `defaultValue`.
        - Implement the `down` function to remove these columns using `queryInterface.removeColumn`.
    - [ ] **Run Migration:** Apply the migration to the development database (`npx sequelize-cli db:migrate`).

### 2. Backend Logic Implementation

    - [ ] **Create Exp Calculation Utility:** (`backend/utils/experienceUtils.js`)
        - Implement `calculateCharacterExperience(character, allVirtuesFlaws)` function.
            - Determine `yearly_rate` (base 15 + sum of `exp_rate_modifier` from V/Fs).
            - Calculate `base_general_exp` using age (assuming 5+): `45 + max(0, age - 5) * yearly_rate`.
            - Calculate `flat_general_bonus` from V/Fs where `general_exp_modifier_category` is null AND `exp_rate_modifier` is 0.
            - Calculate `magical_exp_total` (base 240 for magi + sum of `magical_exp_modifier`).
            - **Build `restricted_pools_array`**: Iterate V/Fs where `general_exp_modifier_category` is NOT null. Parse the category string to determine `restrictions.type` ('category', 'ability_list', 'ability_name') and `restrictions.value`. Add objects `{ source_virtue_flaw: V/F name, amount: V/F general_exp_modifier, restrictions: { type, value }, spent: 0 }` to the array.
            - Return an object: `{ general_exp_available: base_general_exp + flat_general_bonus, magical_exp_available: magical_exp_total, restricted_exp_pools: restricted_pools_array }`.
    - [ ] **Integrate Calculation on Character Creation:**
        - Modify `POST /characters` route in `backend/routes/characters.js`.
        - Set initial `age` from request body or default.
        - After character record is created, fetch any initially assigned V/Fs (if applicable), call `calculateCharacterExperience`, and `update` the character record with the calculated Exp values before sending the response.
    - [ ] **Implement Exp Recalculation Logic:**
        - **Refactor:** Create a helper function `recalculateAndUpdateExp(characterId)` that fetches the character, *all* their current V/Fs, calls `calculateCharacterExperience`, and updates the character record in the DB.
        - Modify `PUT /characters/:id` route: If `age` is updated, call `recalculateAndUpdateExp(characterId)`.
        - Modify `POST /characters/:id/virtues-flaws` route: After successfully adding a V/F, call `recalculateAndUpdateExp(characterId)`.
        - Modify `DELETE /characters/:id/virtues-flaws/:virtueFlawId` route: After successfully removing a V/F, call `recalculateAndUpdateExp(characterId)`.
    - [ ] **Update Character Endpoints:**
        - Ensure `GET /characters` and `GET /characters/:id` routes return `age`, `general_exp_available`, `magical_exp_available`, and `restricted_exp_pools`.

### 3. Frontend UI Changes

    - [ ] **Add Age Input/Display:**
        - Modify `CharacterOverviewTab.js`.
        - Add a number input field for `age` (min 5, max 1000).
        - Add validation feedback for the age input.
        - Ensure age changes are included in the data passed to the `onSave` prop (which should trigger `PUT /characters/:id`).
    - [ ] **Display Exp Pools:**
        - Modify `CharacterOverviewTab.js`.
        - Display `General Exp Available: [value]`.
        - Display `Magical Exp Available: [value]` (conditionally, only for Magi).
        - **New:** Iterate through the `restricted_exp_pools` array. For each entry, display: "From [Source V/F]: [Amount] Exp ([Restriction Description])". (e.g., "From Warrior: 50 Exp (Martial Abilities only)", "From Educated: 50 Exp (Latin or Artes Liberales only)").

### 4. Testing

    - [ ] **Backend Unit Tests:** (`backend/utils/experienceUtils.test.js`)
        - Test `calculateCharacterExperience` thoroughly.
        - Test base General Exp calculation for various ages (5, 6, 25, 26, 50).
        - Test impact of V/Fs with `exp_rate_modifier` (Wealthy +5, Poor -5).
        - Test impact of V/Fs with `general_exp_modifier` and `category = null`.
        - Test Magical Exp calculation (Magi vs. non-Magi, with/without `magical_exp_modifier`).
        - **New:** Test correct creation of `restricted_exp_pools` entries for V/Fs with `category = 'Martial'`, `category = '["Latin", "Artes Liberales"]'`, etc.
        - Test that `general_exp_available` calculation correctly excludes restricted Exp.
    - [ ] **Backend Integration Tests:**
        - Test `POST /characters`: Verify `age` is set and all Exp fields (`general_exp_available`, `magical_exp_available`, `restricted_exp_pools`) are calculated and saved correctly.
        - Test `PUT /characters/:id`: Verify Exp fields are recalculated correctly when `age` changes.
        - Test `POST /characters/:id/virtues-flaws`: Verify Exp fields (including `restricted_exp_pools`) are recalculated correctly when a V/F affecting Exp (rate, flat, or restricted) is added.
        - Test `DELETE /characters/:id/virtues-flaws/:virtueFlawId`: Verify Exp fields are recalculated correctly when a V/F affecting Exp is removed.
        - Test `GET /characters/:id`: Verify all new Exp fields are returned.
    - [ ] **Frontend Unit Tests:** (`CharacterOverviewTab.test.js`)
        - Test rendering of the Age input and its validation.
        - Test rendering of `general_exp_available` and `magical_exp_available` (conditional).
        - **New:** Test rendering of the `restricted_exp_pools` list, ensuring source, amount, and restriction details are displayed.
        - Test that changing the Age input updates local state and prepares data for saving.

## Verification Steps

1.  Create a new character (e.g., Magus, age 25). Verify the Age field defaults correctly and calculated Exp pools (`general_exp_available`, `magical_exp_available`) are displayed on the Overview tab.
2.  Edit the character's age to 30. Save. Verify `general_exp_available` updates based on the new age and default rate (15/year).
3.  Add the "Warrior" Virtue (assuming it grants 50 Martial Exp). Save. Verify a new entry appears on the Overview tab: "From Warrior: 50 Exp (Martial Abilities only)". Verify `general_exp_available` _does not_ increase by 50.
4.  Add the "Educated" Virtue (assuming it grants 50 Exp for Latin/Artes Liberales). Save. Verify a new entry appears: "From Educated: 50 Exp (Latin or Artes Liberales only)".
5.  Add the "Wealthy" Virtue (assuming `exp_rate_modifier: 5`). Save. Verify `general_exp_available` recalculates based on the new rate (20/year).
6.  Remove the "Warrior" Virtue. Save. Verify the "From Warrior..." entry disappears from the Overview tab.
7.  Attempt to set age to 4 via UI. Verify input validation prevents this or shows an error.

## Decision Authority

- **Claude:** Can implement database schema, backend logic (including `experienceUtils.js`), API modifications, UI components, and tests as defined. Can determine the specific parsing logic for `general_exp_modifier_category` to create the `restrictions` object.
- **User:** Confirmation on ArM5 rules (start age for "Later Life"), final UI formatting for restricted pools.

## Questions/Uncertainties

### Blocking

- None currently identified.

### Non-blocking

- **Confirm "Later Life" Start Age:** Still assuming 5+. _Action: Verify ArM5 core rules p. 30/31._
- **Magical Exp Usage:** Still assuming `magical_exp_available` is just a pool for now; specific spending rules TBD.
- **Parsing `general_exp_modifier_category`:** Define how to handle different string formats (e.g., 'Martial', '["Latin", "Artes Liberales"]', 'Specific Ability Name') to create the `restrictions` object `{type: 'category'/'ability_list'/'ability_name', value: ...}`. _Initial Plan: Use simple checks for `[` to detect lists, otherwise assume category or single ability._

## Acceptable Tradeoffs

- Full Exp _spending_ validation logic is deferred.
- Recalculation on every relevant save is acceptable for V1.
- Admin Exp adjustment endpoint implementation can be deferred.

## Status

[x] Completed

## Notes

- **Critical:** The `calculateCharacterExperience` utility and the recalculation logic in API routes are the core of this feature. They must be robust and thoroughly tested.
- The `restricted_exp_pools` JSONB structure provides flexibility for future V/Fs with different kinds of restrictions.
- Clear UI presentation of the different Exp pools and their restrictions is important for user understanding.

**Scope Exclusions:**

- This workplan does **not** include the tracking or calculation of highly restricted experience pools like Spell Mastery experience from the "Mastered Spells" Virtue. This will be handled later.
- This workplan does **not** implement the logic for _spending_ any of these experience points. That will be part of the Ability/Art implementation.
