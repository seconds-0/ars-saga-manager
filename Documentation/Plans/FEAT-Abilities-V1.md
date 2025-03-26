# Workplan: Implement Abilities & Exp Spending (V1 - Character Creation)

## Task ID

FEAT-Abilities-V1

## Problem Statement

Characters need a system to represent their skills and knowledge (Abilities). This involves storing character abilities, referencing standard abilities, displaying them in the UI, and implementing the core mechanic of spending available Experience Points (Exp) – calculated in `FEAT-ExperienceAge-V1` – to acquire and improve these abilities during character creation, respecting ArM5 rules and V/F modifiers like Puissant and Affinity.

## Components Involved

- **Backend:**
  - `Character` model (`backend/models/Character.js`)
  - `CharacterAbility` model (`backend/models/CharacterAbility.js` - new)
  - `ReferenceAbility` model (`backend/models/ReferenceAbility.js` - new)
  - `ReferenceVirtueFlaw` model (for Puissant/Affinity checks)
  - Database Migrations (`backend/migrations/`)
  - Ability API Endpoints (`backend/routes/abilities.js` - new file/route)
  - Character routes (`backend/routes/characters.js` - for initial ability setup)
  - Exp Calculation Utility (`backend/utils/experienceUtils.js` - needs updates/integration)
  - **New:** Ability Utility (`backend/utils/abilityUtils.js` - new file: XP cost calcs, score derivation)
  - **New:** Exp Spending Service (`backend/services/experienceService.js` - new file: logic for deducting Exp from pools)
- **Frontend:**
  - Characteristics & Abilities Tab (`frontend/src/components/CharacterSheetComponents/CharacteristicsAndAbilitiesTab.js`)
  - AbilityList component (`frontend/src/components/CharacterSheetComponents/AbilityList.js` - new)
  - AbilityInput component (`frontend/src/components/CharacterSheetComponents/AbilityInput.js` - new)
  - AbilitySelector component (`frontend/src/components/CharacterSheetComponents/AbilitySelector.js` - new)
  - **New:** `useAbilities` hook (`frontend/src/hooks/useAbilities.js` - new)
  - Testing utilities (`frontend/src/__test-utils__/`)

## Dependencies

- **Completion of `FEAT-ExperienceAge-V1`:** Requires `age`, `general_exp_available`, `magical_exp_available`, `restricted_exp_pools` fields on the `Character` model and the `calculateCharacterExperience` utility.
- Existing `Character`, `ReferenceVirtueFlaw` models.
- Virtue/Flaw selection system.

## Implementation Checklist

### 1. Database Schema (Ability Models & Migrations)

    - [ ] **Define `ReferenceAbility` Model:** (`backend/models/ReferenceAbility.js`)
        - Fields: `id` (PK), `name` (String, unique), `category` (Enum), `description` (Text), `puissant_allowed` (Boolean), `affinity_allowed` (Boolean), timestamps.
    - [ ] **Define `CharacterAbility` Model:** (`backend/models/CharacterAbility.js`)
        - Fields: `id` (PK), `character_id` (FK to Character), `ability_name` (String), `experience_points` (Integer, default 0, not nullable), `specialty` (String, nullable), timestamps.
        - *Note: `score` is derived, not stored directly. `category` can be derived from `ReferenceAbility`.*
    - [ ] **Create Database Migration:**
        - Generate a new migration file (e.g., `YYYYMMDDHHMMSS-create-abilities-tables.js`).
        - Implement `up` function: Create `reference_abilities` table, create `character_abilities` table with foreign key to `characters`. Add indexes on `character_id`, `ability_name`.
        - Implement `down` function: Drop `character_abilities`, drop `reference_abilities`.
    - [ ] **Seed `ReferenceAbility` Data:**
        - Create a seeder file (e.g., `YYYYMMDDHHMMSS-seed-reference-abilities.js`).
        - Populate `reference_abilities` with standard ArM5 abilities from `Product Requirements`.
    - [ ] **Run Migration & Seeder:** Apply migration (`db:migrate`), run seeder (`db:seed`).

### 2. Backend Logic

    - [ ] **Create Ability Utilities:** (`backend/utils/abilityUtils.js`)
        - `calculateScoreFromXP(xp)`: Returns Ability score based on cumulative XP table.
        - `calculateCumulativeXPForScore(score)`: Returns total XP needed for a given score.
        - `calculateXPForNextLevel(currentXP)`: Returns XP needed to reach the *next* score level.
        - `getAbilityCost(targetXP, currentXP, hasAffinity)`: Calculates Exp cost for an increase, applying Affinity discount (cost = difference * 0.75 rounded up, or similar - verify rule).
        - `isAbilityAppropriateForCharacterType(abilityName, category, characterType)`: Checks rules (e.g., Grogs & Arcane).
    - [ ] **Create Exp Spending Service:** (`backend/services/experienceService.js`)
        - `spendExperience(characterId, abilityCategory, abilityName, expCost)`:
            - Fetches character's Exp pools (`general`, `magical`, `restricted`).
            - Determines spending priority (Restricted pool matching category/ability -> Magical (if applicable) -> General).
            - Attempts to deduct `expCost` from pools according to priority.
            - Validates sufficient funds.
            - If valid: Updates `spent` in relevant `restricted_exp_pools` entry(s) OR decrements `magical_exp_available` / `general_exp_available`.
            - Saves updated `Character` Exp pools to DB.
            - Returns `{ success: true }` or `{ success: false, reason: 'Insufficient Exp' }`.
            - *Must handle transactions to ensure Character and CharacterAbility updates are atomic.*
    - [ ] **Implement Ability API Endpoints:** (`backend/routes/abilities.js` - new route file)
        - **`GET /api/reference-abilities`:** Fetch all reference abilities.
        - **`GET /api/characters/:characterId/abilities`:**
            - Fetch all `CharacterAbility` for the character.
            - Fetch relevant V/Fs (Puissant).
            - For each ability, derive `score` from `experience_points`.
            - Calculate and add `effective_score` (base score + Puissant bonus).
            - Add `category` from `ReferenceAbility`.
            - Return enriched list.
        - **`POST /api/characters/:characterId/abilities`:**
            - Receive `{ ability_name, category, experience_points (optional, default 0), specialty (optional) }`.
            - Validate `isAbilityAppropriateForCharacterType`.
            - Check if ability already exists for character.
            - Calculate initial `expCost` (to reach `experience_points` from 0, considering Affinity).
            - Call `spendExperience()` service.
            - If successful, create `CharacterAbility` record with `ability_name`, `experience_points`, `specialty`.
            - Return new `CharacterAbility` or error.
        - **`PUT /api/characters/:characterId/abilities/:abilityId`:**
            - Receive `{ experience_points (to increase), specialty (to update) }`.
            - Fetch current `CharacterAbility`.
            - If `experience_points` update:
                - Calculate `targetXP`. Calculate `expCost` using `getAbilityCost` (considering Affinity).
                - Call `spendExperience()` service.
                - If successful, update `CharacterAbility.experience_points`.
            - If `specialty` update: Update `CharacterAbility.specialty`.
            - Return updated `CharacterAbility` or error.
        - **`DELETE /api/characters/:characterId/abilities/:abilityId`:**
            - Fetch `CharacterAbility` to get its `experience_points`.
            - Calculate *refunded* Exp (potentially complex if Affinity was used - maybe disallow refunds in V1?). *Decision: For V1, simply delete; no Exp refund logic.*
            - Delete `CharacterAbility` record.
            - *Optional V2: Call an `refundExperience()` service.*
            - Return success or error.
    - [ ] **Integrate Initial Abilities:**
        - Modify `POST /characters` route.
        - After creating the character and calculating initial Exp pools (from `FEAT-ExperienceAge-V1`).
        - If character is Magus, call the logic (potentially refactored into `experienceService` or `abilityUtils`) to add Latin 4, Magic Theory 3, Parma 1, Artes 1, ensuring the correct Exp cost is calculated and *spent* from the initial pools.

### 3. Frontend Implementation

    - [ ] **Create `useAbilities` Hook:** (`frontend/src/hooks/useAbilities.js`)
        - Use `react-query` to fetch abilities via `GET /api/characters/:characterId/abilities`.
        - Provide state: `abilities`, `isLoading`, `error`.
        - Implement mutation functions using `useMutation`:
            - `addAbility(abilityData)` -> `POST /api/.../abilities`
            - `updateAbilityXP(abilityId, newTotalXP)` -> `PUT /api/.../abilities/:abilityId` { experience_points: newTotalXP }
            - `updateSpecialty(abilityId, specialty)` -> `PUT /api/.../abilities/:abilityId` { specialty }
            - `deleteAbility(abilityId)` -> `DELETE /api/.../abilities/:abilityId`
        - Ensure mutations invalidate the `['abilities', characterId]` query cache on success.
    - [ ] **Enhance `CharacteristicsAndAbilitiesTab`:**
        - Integrate `useAbilities` hook.
        - Pass `abilities`, `loading`, `error` to `AbilityList`.
        - Pass mutation functions (`updateAbilityXP`, `updateSpecialty`) to `AbilityList` / `AbilityInput`.
        - Pass `addAbility` mutation function to `AbilitySelector`.
        - Display loading/error states for abilities section.
    - [ ] **Create `AbilityList` Component:** (`frontend/src/components/CharacterSheetComponents/AbilityList.js`)
        - Input: `abilities` array, callback props (`onIncreaseXP`, `onDecreaseXP`, `onUpdateSpecialty`).
        - Group abilities by `category`.
        - Render category sections.
        - For each ability, render `AbilityInput`.
    - [ ] **Create `AbilityInput` Component:** (`frontend/src/components/CharacterSheetComponents/AbilityInput.js`)
        - Input: `name`, `category`, `currentXP`, `effectiveScore`, `specialty`, `onIncreaseXP`, `onDecreaseXP`, `onUpdateSpecialty`.
        - Display `name`, `effectiveScore` (with Puissant indication if different from derived base score).
        - Display `specialty` input field, call `onUpdateSpecialty` onChange.
        - **New:** Add +/- buttons next to the score/XP display.
        - Calculate `xpForNextLevel` using utility function.
        - Calculate `costForNextPoint` (considering Affinity).
        - On '+' click: Calculate `targetXP` (XP for current score + 1 point), call `onIncreaseXP(abilityId, targetXP)`. Display cost in tooltip.
        - On '-' click: Calculate `targetXP` (XP for current score - 1 level), call `onDecreaseXP(abilityId, targetXP)`. *Decision: V1 might only support increasing XP, not decreasing.*
        - Display current `experience_points` and potentially XP needed for next level.
    - [ ] **Create `AbilitySelector` Component:** (`frontend/src/components/CharacterSheetComponents/AbilitySelector.js`)
        - Fetch reference abilities from `GET /api/reference-abilities`.
        - Filter out abilities already present in the character's `abilities` list.
        - Filter based on search term and selected category.
        - Disable/indicate abilities inappropriate for character type.
        - On selecting an ability, call `onAddAbility(abilityData)` prop (passing name, category).

### 4. Testing

    - [ ] **Backend Unit Tests:**
        - Test `abilityUtils` functions (`calculateScoreFromXP`, `calculateCumulativeXPForScore`, `getAbilityCost` with/without Affinity).
        - Test `experienceService.spendExperience` logic:
            - Correct pool prioritization (Restricted -> Magical -> General).
            - Correct deduction from pools.
            - Handling insufficient funds in specific or general pools.
            - Transactional integrity (if implemented).
        - Test `isAbilityAppropriateForCharacterType`.
    - [ ] **Backend Integration Tests:** (API Endpoints in `abilities.test.js`)
        - Test `GET /reference-abilities`.
        - Test `GET /characters/:characterId/abilities` returns correct derived scores and Puissant bonuses.
        - Test `POST /characters/:characterId/abilities`:
            - Adding valid ability, check Exp pool deduction.
            - Adding inappropriate ability (fails).
            - Adding ability with insufficient Exp (fails).
            - Adding ability with Affinity (correct cost deducted).
        - Test `PUT /characters/:characterId/abilities/:abilityId`:
            - Increasing XP, check Exp pool deduction (with/without Affinity).
            - Updating specialty.
            - Attempting increase with insufficient Exp (fails).
        - Test `DELETE /characters/:characterId/abilities/:abilityId`.
    - [ ] **Frontend Hook Tests:** (`useAbilities.test.js`)
        - Test initial fetch state (loading, success, error).
        - Test `addAbility` mutation calls API and invalidates query.
        - Test `updateAbilityXP` mutation calls API and invalidates query.
        - Test `updateSpecialty` mutation calls API and invalidates query.
        - Test `deleteAbility` mutation calls API and invalidates query.
    - [ ] **Frontend Component Tests:**
        - `AbilityInput`: Test display (name, score, effective score, specialty), +/- button clicks call correct props with correct target XP, specialty input calls prop.
        - `AbilityList`: Test rendering of grouped abilities, passing props correctly to `AbilityInput`.
        - `AbilitySelector`: Test fetching/displaying reference abilities, filtering, disabling inappropriate/existing abilities, calling `onAddAbility`.
        - `CharacteristicsAndAbilitiesTab`: Test integration of `useAbilities` hook, passing data/functions down, displaying loading/error states.

## Verification Steps

1.  Create a new Magus character. Verify initial abilities (Latin 4, MT 3, Parma 1, Artes 1) are present and the initial Exp pools (`general`, `magical`) have been correctly reduced.
2.  Navigate to the Abilities tab for the character. Verify the abilities are displayed correctly, grouped by category, showing correct scores derived from XP.
3.  Use the `AbilitySelector` to add a new General ability (e.g., Awareness). Verify it appears in the `AbilityList`. Verify `general_exp_available` (displayed on Overview tab) decreased by the cost of reaching score 0 (which is 0 cost, so no change yet).
4.  In `AbilityInput` for Awareness, click the '+' button. Verify the score updates (if XP reaches next threshold), the XP cost is shown, and `general_exp_available` decreases correctly.
5.  Add a Virtue granting Martial Exp (e.g., Warrior). Verify the "From Warrior: 50 Exp (Martial only)" appears on Overview tab.
6.  Add a Martial ability (e.g., Brawl). Increase its XP using '+'. Verify the cost is deducted first from the "Martial" restricted pool, and then from `general_exp_available` if the restricted pool is exhausted.
7.  Add the "Affinity with Brawl" Virtue. Increase Brawl XP again. Verify the cost deducted is less than before (e.g., 75% rounded up).
8.  Add the "Puissant Brawl" Virtue. Verify the _displayed_ score for Brawl in `AbilityInput` is +2 higher than the score derived from its XP, and an indicator shows the bonus.
9.  Attempt to increase an ability beyond available Exp (in any relevant pool). Verify the action fails and an error/toast is shown.
10. Add a specialty to an ability. Verify it displays correctly and the change is saved (via `updateSpecialty`).
11. Delete an ability. Verify it is removed from the list. (_V1: No Exp refund check needed_).

## Decision Authority

- **Claude:** Implementation details of utilities, services, API logic, hook structure, component rendering. Specific Affinity cost calculation rule (e.g., round up/down). Decision on V1 decrease XP support.
- **User:** Confirmation on specific ArM5 rule interpretations (Affinity cost, spending priority if unclear), final UI presentation of costs/pools.

## Questions/Uncertainties

### Blocking

- None currently identified.

### Non-blocking

- **Affinity Cost Rule:** Exact calculation? (e.g., `ceil(cost_difference * 0.75)` or `floor(cost_difference * 0.75)`). _Assumption: Use `ceil`._
- **Spending Priority (Magical Exp):** Can Magical Exp be spent on Arcane/Supernatural abilities, or _only_ Arts? _Assumption: For V1, assume it can be spent on Arcane/Supernatural if restricted pool is empty, before General. Arts spending is out of scope._
- **Decreasing XP/Score:** Support in V1? _Assumption: No, only increasing XP for simplicity. Deletion is the only way to "remove" points._
- **Error Feedback:** How detailed should frontend validation/error feedback be regarding _which_ Exp pool is insufficient? _Initial Plan: Simple "Insufficient Exp" message first, can enhance later._

## Acceptable Tradeoffs

- No Exp refund on ability deletion in V1.
- UI might not perfectly reflect complex spending priority in real-time, relying more on backend validation for accuracy initially.
- Potential minor performance overhead from fetching V/Fs (Puissant/Affinity) when calculating effective scores or costs.

## Status

[ ] Not Started

## Notes

- **Atomicity:** The `spendExperience` service interacting with both `Character` and `CharacterAbility` tables should ideally use database transactions.
- **Score Derivation:** Emphasize that `score` displayed is always calculated from `experience_points`. The database only stores `experience_points`.
- **Frontend Validation:** While backend validation is the authority, adding frontend checks for available Exp before enabling '+' buttons will improve UX.
- This plan assumes the `FEAT-ExperienceAge-V1` is completed, providing the necessary Exp pool fields on the `Character` model.
