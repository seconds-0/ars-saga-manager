# Task ID: BUG-AbilityDecrementNotSupported

## Problem Statement
Users were unable to decrease ability scores in the character sheet. When attempting to decrement an ability, they received an error message stating "Decreasing ability scores is not currently supported. The ability will maintain its current score."

## Components Involved
- Frontend:
  - `useAbilities.js` hook
  - `AbilityList.js` component
- Backend:
  - `abilities.js` routes
  - `abilityUtils.js` utility functions
  - `experienceService.js` service

## Dependencies
- Ability score and experience point calculations
- Character data management
- Experience refund mechanics

## Implementation Checklist
- [x] Update backend `abilities.js` route to allow decreasing ability scores
- [x] Update backend to allow decreasing experience points
- [x] Add new `getAbilityRefund` utility function to calculate refund amounts
- [x] Implement `refundExperience` method in the ExperienceService
- [x] Integrate XP refund functionality when decreasing ability scores
- [x] Modify frontend `decrementAbility` function to make API calls
- [x] Test decrementing abilities with various ability types and scores

## Verification Steps
1. Test decrementing an ability score from different starting values
2. Verify that the ability score and XP values update correctly
3. Confirm that experience points are refunded to the character's general XP pool
4. Test decreasing an ability to 0
5. Verify that you cannot decrement below 0
6. Check that the UI updates correctly after decrements, including the updated XP display

## Decision Authority
- I can implement all necessary changes to enable decreasing ability scores

## Questions/Uncertainties
### Blocking
- None

### Non-blocking
- For simplicity, refunds always go to the general XP pool, regardless of which pool was originally used to spend the XP. This could be enhanced in the future to refund to the original pools if needed.

## Acceptable Tradeoffs
- XP refunds are calculated at the base rate without applying discounts from virtues like Affinity. This prevents gaming the system by buying abilities with discounts and then refunding at full value.
- Refunds always go to the general XP pool for simplicity in the current implementation.
- No confirmation dialog is shown before decreasing ability scores (could be added later if users request it).

## Status
Completed

## Notes
- The implementation allows for decreasing both ability scores and experience points
- For decreasing scores, we update the experience points to match the new score level
- XP refunds are calculated and applied whenever an ability is decreased
- Refunds are processed through the new `refundExperience` method in `experienceService.js`
- XP is refunded to the character's general experience pool for simplicity
- The backend supports decreasing scores via both the score and experience_points parameters
- Removed the alert that was blocking users from decreasing abilities
- Added comprehensive error handling to ensure decrements still work even if refunding fails
- Implemented debouncing using a ref-based operation tracking system to prevent race conditions from rapid clicks
- Added a 500ms cooldown between operations on the same ability to prevent overwhelming the API with requests
- Applied the debouncing to all ability operations (increment/decrement scores and XP) for consistent behavior