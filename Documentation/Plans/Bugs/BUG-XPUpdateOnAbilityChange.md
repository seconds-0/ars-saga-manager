# Task ID: BUG-XPUpdateOnAbilityChange

## Problem Statement
When a user changes an ability's level or adds/removes an ability, the available XP display on the page doesn't update immediately. This creates confusion as the user doesn't see their XP values update until they manually refresh the page.

## Components Involved
- Frontend:
  - `useAbilities.js` hook (main focus of fix)
  - `CharacteristicsAndAbilitiesTab.js` component
  - `CharacterSheet.js` component
  - React Query state management

- Backend:
  - `abilities.js` route handlers
  - `experienceService.js` service

## Dependencies
- React Query for state management
- Experience point calculation system

## Implementation Checklist
- [x] Inspect existing code to identify the issue
- [x] Enhance `updateAbility` function in `useAbilities.js` to force an immediate refetch after invalidating the query
- [x] Add similar cache invalidation and refetch logic to `addAbility` function
- [x] Add similar cache invalidation and refetch logic to `deleteAbility` function 
- [x] Improve client-side validation in `incrementAbility` to check all relevant XP pools
- [x] Test the fix by adding/updating abilities and observing XP updates

## Verification Steps
1. Add a new ability to a character and verify the XP display updates immediately
2. Increment an existing ability and verify the XP display updates immediately
3. Test with characters that have different types of XP pools (general, magical, restricted)
4. Verify that client-side validation for insufficient XP works correctly
5. Ensure all the React Query cache management methods are consistent across all CRUD operations

## Decision Authority
- I can implement all the necessary changes to fix this issue
- No backend changes are needed, as the issue is solely related to frontend state management

## Questions/Uncertainties
### Blocking
- None

### Non-blocking
- The client-side validation in `incrementAbility` might not exactly match the backend logic, but it's a reasonable approximation

## Acceptable Tradeoffs
- Adding additional API requests (the refetchQueries calls) to ensure data consistency is acceptable
- There might be a slight performance impact from the additional refetches, but this is outweighed by the improved user experience

## Status
Completed

## Notes
- The root cause was that while `queryClient.invalidateQueries()` was being called properly, this only marks the query as stale and doesn't trigger an immediate refetch
- Added `queryClient.refetchQueries()` after invalidation to force an immediate refetch for up-to-date data
- Improved client-side validation to better check available XP across different pool types
- This approach maintains consistency across all ability operations (add, update, delete)
- The frontend now effectively shows real-time XP updates after ability changes