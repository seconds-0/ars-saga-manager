# Workplan: Enhance Virtue & Flaws for Exp/Ability Integration

## Task ID

FEAT-VirtueFlaws-Integration

## Problem Statement

The current Virtue & Flaws (V/F) implementation lacks the necessary data fields, backend logic, UI components, and validation rules to correctly handle V/Fs that modify Experience (Exp) pools, affect Ability costs/scores, or require specific user selections (e.g., specifying an Ability for "Puissant"). This plan details the required enhancements to the V/F system itself to enable seamless integration with the planned Exp (`FEAT-ExperienceAge-V1`) and Ability (`FEAT-Abilities-V1`) features.

## Components Involved

- **Backend:**
  - `ReferenceVirtueFlaw` model (`backend/models/ReferenceVirtueFlaw.js`)
  - `CharacterVirtueFlaw` model (`backend/models/CharacterVirtueFlaw.js`)
  - Database Migrations (`backend/migrations/`)
  - Seeders (`backend/seeders/`) - For updating existing V/F data.
  - Virtue/Flaw API Endpoints (`backend/routes/characters.js` or potentially a new route for `CharacterVirtueFlaw` updates).
  - Exp Calculation Utility (`backend/utils/experienceUtils.js`) - Needs to _read_ new V/F fields.
  - Ability Utilities (`backend/utils/abilityUtils.js`) - Needs to _read_ V/F selections.
- **Frontend:**
  - `VirtueFlawDetails.js` - Needs significant enhancement for selections.
  - `VirtueFlawSelector.js` - Minor adjustments for displaying disable reasons.
  - `virtueFlawValidation.js` - Needs new validation checks related to Exp/Abilities.
  - `VirtuesAndFlawsTab.js` - Minor context passing.
  - Testing utilities (`frontend/src/__test-utils__/`)

## Dependencies

- **Completion of `FEAT-ExperienceAge-V1`:** Provides the Exp pool structure on the `Character` model and the `calculateCharacterExperience` utility.
- **Completion of `FEAT-Abilities-V1`:** Provides the Ability structure (`CharacterAbility`, `ReferenceAbility`), API endpoints, and the `useAbilities` hook.

## Implementation Checklist

### 1. Database Schema Enhancements (V/F Models)

    - [ ] **Update `ReferenceVirtueFlaw` Model/Table:**
        - Add fields defined in `FEAT-ExperienceAge-V1`: `magical_exp_modifier`, `general_exp_modifier`, `general_exp_modifier_category`, `exp_rate_modifier`.
        - **New:** Add `requires_specification` (Boolean, default false) - Flag to indicate if this V/F needs user input (e.g., choosing an Ability).
        - **New:** Add `specification_type` (String, nullable) - e.g., 'Ability', 'Art', 'Characteristic', 'Custom'. Defines what kind of selection is needed.
        - **New:** Add `specification_options_query` (String, nullable) - Optional hint for the frontend on how to get options (e.g., '/api/reference-abilities?category=Martial').
        - **New:** Add `affects_ability_cost` (Boolean, default false) - Flag for Affinity-like V/Fs.
        - **New:** Add `ability_score_bonus` (Integer, default 0) - For Puissant-like V/Fs.
    - [ ] **Update `CharacterVirtueFlaw` Model/Table:**
        - **New:** Add `selections` (JSONB, nullable, default null) - Stores user selections (e.g., `{ "Ability": "Brawl", "Specialty": "Grappling" }`).
    - [ ] **Create Database Migration:**
        - Generate a new migration file (e.g., `YYYYMMDDHHMMSS-enhance-vf-models.js`).
        - Implement `up` to add new columns to `reference_virtues_flaws` and `character_virtues_flaws`.
        - Implement `down` to remove these columns.
    - [ ] **Run Migration:** Apply the migration (`npx sequelize-cli db:migrate`).

### 2. Backend Logic Updates

    - [ ] **Update Seeders/Reference Data:**
        - Modify existing V/F seeders (`backend/seeders/*.js`).
        - Populate the new fields (`magical_exp_modifier`, `general_exp_modifier`, `general_exp_modifier_category`, `exp_rate_modifier`, `requires_specification`, `specification_type`, etc.) for *all* relevant canonical Virtues and Flaws based on ArM5 rules.
        - *Crucial Step:* Ensure V/Fs like "Puissant (Ability)", "Affinity with (Ability)", "Educated", "Warrior", "Wealthy", "Poor", "Mastered Spells" (if handled now), etc., have the correct flags and modifier values set.
    - [ ] **Update `calculateCharacterExperience`:** (`backend/utils/experienceUtils.js`)
        - Ensure it correctly reads and utilizes the new `ReferenceVirtueFlaw` fields (`exp_rate_modifier`, `general_exp_modifier`, `general_exp_modifier_category`, `magical_exp_modifier`) as defined in `FEAT-ExperienceAge-V1`.
    - [ ] **Update Ability/Exp Utilities:**
        - Modify `abilityUtils.js` -> `getAbilityCost`: Needs to accept `characterId` or `characterVirtuesFlaws` to check for relevant "Affinity" V/Fs (reading `CharacterVirtueFlaw.selections`) before applying discount.
        - Modify `GET /characters/:characterId/abilities`: Needs to check for "Puissant" V/Fs (reading `CharacterVirtueFlaw.selections`) and include the `effective_score` in the response.
    - [ ] **Implement `CharacterVirtueFlaw` Update Endpoint:**
        - Create `PUT /api/characters/:characterId/character-virtues-flaws/:cvfId` endpoint.
        - Accepts `{ selections: {...} }` in the request body.
        - Validates the selections against the `specification_type` defined in `ReferenceVirtueFlaw`.
        - Updates the `selections` field on the specified `CharacterVirtueFlaw` record.
        - **Important:** This update *might* need to trigger Exp/Ability recalculations if the selection affects costs or prerequisites for other things (Consider if needed for V1). *Decision for V1: Assume changing selection doesn't affect *other* V/Fs or Exp pools directly, only the display/cost of the related Ability.*
    - [ ] **Enhance V/F Add Endpoint (`POST /characters/:id/virtues-flaws`):**
        - If the added `ReferenceVirtueFlaw` has `requires_specification = true`, the response should indicate that further selection is needed (or potentially allow initial selection in the POST request itself - TBD).

### 3. Frontend Enhancements

    - [ ] **Enhance `VirtueFlawDetails.js`:**
        - Check `virtueFlaw.referenceVirtueFlaw.requires_specification`.
        - If true, display appropriate input controls based on `specification_type` in 'editing' state:
            - `Ability`: Fetch relevant abilities (using `specification_options_query` hint or all abilities) and show a dropdown.
            - `Art`: Show Art selection dropdown.
            - `Characteristic`: Show Characteristic selection dropdown.
            - `Custom`: Show a text input based on `specification_label`.
        - Update `editedSelections` state based on user input.
        - Modify `handleSave` to call the new `PUT /api/.../character-virtues-flaws/:cvfId` endpoint.
    - [ ] **Enhance `VirtueFlawSelector.js`:**
        - Modify `isVirtueFlawDisabled` or add logic to display *why* a V/F is disabled (e.g., read specific warnings from `validationResult` related to the item). Tooltip on the disabled 'Add' button could show the first relevant warning.
    - [ ] **Update `AbilityInput.js`:**
        - Receive and display `effectiveScore`.
        - Visually indicate when `effectiveScore` differs from the score derived from `currentXP` (i.e., Puissant bonus).
        - Modify cost calculation display/logic to potentially fetch/check for Affinity based on character's V/Fs and selections. *(May need context or hook update)*.
    - [ ] **Update `useAbilities` Hook:**
        - Ensure the data fetched includes `effective_score` from the backend.
        - Modify `updateAbilityXP` to potentially pass context needed for backend cost calculation (like checking Affinity).

### 4. Validation Enhancements (`virtueFlawValidation.js`)

    - [ ] **Integrate Exp Checks:**
        - Modify `validateVirtuesFlaws` to accept `availableExpPools` (containing `general_exp_available`, `magical_exp_available`, `restricted_exp_pools`) as part of its context/rules.
        - Calculate the *total Exp cost* of all selected Abilities (needs access to ability list/XP - this implies validation might need to run *after* ability changes too, or receive ability cost summary).
        - Compare total costs against available pools (following spending priority). Add 'error' warnings if any pool is overspent (e.g., "Insufficient General Experience Points").
    - [ ] **Integrate Ability Prerequisites:**
        - Add a check within `validateVirtuesFlaws`. If a V/F has an Ability prerequisite (defined in `ReferenceVirtueFlaw.prerequisites`), check if the character has the required Ability at the required score (needs access to character's abilities). Add 'error' warnings if missing.
    - [ ] **Validate Selections:**
        - Add a check for V/Fs where `requires_specification` is true but `CharacterVirtueFlaw.selections` is null or incomplete. Add 'warning' or 'error' (TBD - maybe warning initially).

### 5. Testing

    - [ ] **Backend Unit Tests:**
        - Test population of new `ReferenceVirtueFlaw` fields in seeders/updates.
        - Test `PUT /api/.../character-virtues-flaws/:cvfId` endpoint for saving selections.
        - Test backend calculation of `effective_score` (Puissant) based on saved selections.
        - Test backend calculation of ability cost (Affinity) based on saved selections.
    - [ ] **Validation Tests (`virtueFlawValidation.test.js`):**
        - Add tests for Exp pool limit validation.
        - Add tests for Ability prerequisite validation.
        - Add tests for `selections` completion validation.
    - [ ] **Frontend Component Tests:**
        - `VirtueFlawDetails.test.js`: Test rendering of selection inputs (dropdowns, text fields) based on `specification_type`. Test state updates and save mutation call.
        - `AbilityInput.test.js`: Test display of Puissant bonus indicator.
        - `VirtueFlawSelector.test.js`: Test display of disable reasons (tooltips).
    - [ ] **Integration Tests:**
        - Test full flow: Add "Puissant (Ability)" -> Select "Brawl" in Details -> Verify Brawl's effective score increases in AbilityList.
        - Test full flow: Add "Affinity with (Ability)" -> Select "Awareness" -> Verify cost calculation for increasing Awareness XP is reduced.
        - Test adding a V/F that pushes Exp spending over the limit -> Verify validation warning appears.

## Verification Steps

1.  Load character sheet for a Magus. Add "Puissant (Art)". Verify UI prompts for Art selection (likely in `VirtueFlawDetails`). Select "Creo". Save. Navigate to Arts tab (when implemented) or Ability tab (if relevant) and verify effect is applied.
2.  Add "Affinity with (Ability)". Select "Awareness". Navigate to Abilities tab. Try to increase Awareness XP. Verify the displayed cost is reduced. Verify the correct (reduced) amount is deducted from Exp pools upon saving.
3.  Add Virtues until `general_exp_available` is low (e.g., 2 points left). Attempt to add a Major Virtue (cost 3). Verify the "Add" button in `VirtueFlawSelector` is disabled or the action fails with an "Insufficient Exp" warning.
4.  Verify V/Fs requiring Ability prerequisites show as disabled/warn if the prerequisite is not met. Add the prerequisite Ability, verify the V/F becomes available.
5.  Check a V/F requiring specification (e.g., Puissant). Verify the `VirtueFlawDetails` shows the correct input (e.g., Ability dropdown) and saving updates the `CharacterVirtueFlaw.selections`.

## Decision Authority

- **Claude:** Implementation of schema, backend logic, UI components, validation rules, tests. How to fetch options for specification dropdowns (e.g., querying `/api/reference-abilities`).
- **User:** Final confirmation on which V/Fs require specification and what the options should be. Exact UI design for the selection inputs within `VirtueFlawDetails`. Decide if changing a selection should trigger broader recalculations in V1.

## Questions/Uncertainties

### Blocking

- None identified.

### Non-blocking

- **Specification Data Source:** How does the frontend get the _list_ of valid options for a specification (e.g., list of all Abilities)? Use `specification_options_query` hint, hardcode common lists (Arts, Characteristics), or fetch all possible options? _Initial Plan: Use hint if available, otherwise fetch broadly (e.g., all abilities) and filter._
- **Recalculation on Selection Change:** If a user changes the Ability selected for Puissant, should this trigger a full character Exp/Ability recalculation, or just update the display? _Initial Plan (V1): Assume it only affects display and future cost calculations, not past Exp spending or other V/F prerequisites._
- **UI for Selections:** Modal (`VirtueFlawDetails`) vs. inline editing? _Initial Plan: Enhance existing `VirtueFlawDetails` modal._

## Acceptable Tradeoffs

- Initial implementation might fetch broader option lists than strictly necessary for specification dropdowns (e.g., all abilities instead of just Martial ones).
- Validation for _completeness_ of selections might initially be a 'warning' rather than a hard 'error'.

## Status

[ ] Not Started

## Notes

- Updating the seeder data with the new flags and modifiers is a critical but potentially tedious task. Ensure accuracy based on ArM5 rules.
- The interaction between `VirtueFlawDetails` (setting selections), `useAbilities` (fetching effective scores), and `experienceService` (calculating costs based on selections) is the core integration point requiring careful implementation and testing.
- This plan assumes the V/F system already handles basic adding/removing and point balance display. It focuses on adding the _integration logic_.
