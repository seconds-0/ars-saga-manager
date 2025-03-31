# Workplan: Fix Character Age and Experience Update Issues

## Task ID

BUG-AgeSaveAndInfiniteLoop

## Problem Statement

Several related issues have been identified that affect user experience and data integrity:

1. **Character age not saving** - When users modify a character's age in the Overview tab, the change doesn't persist when navigating between tabs or refreshing the page.
2. **Experience not updating** - When age changes, the experience points aren't recalculated as expected.
3. **Infinite update loop** - The Characteristics & Abilities tab is triggering constant database updates/API calls, causing performance issues.

## Components Involved

- **Frontend:**

  - `CharacterOverviewTab.js` - Age input handling and saving
  - `CharacterSheet.js` - Parent component managing the API calls
  - `CharacterSheetTabs.js` - Tab navigation
  - `CharacteristicsAndAbilitiesTab.js` - Auto-save functionality causing infinite loops

- **Backend:**
  - `backend/routes/characters.js` - PUT route for character updates
  - `backend/middleware/validation.js` - Request validation middleware
  - `experienceUtils.js` - Experience calculation based on age

## Root Causes Identified

1. **Age not saving:**

   - `CharacterOverviewTab.js` was sending the entire character object including the `id` in the request body
   - Backend validation in `validateCharacter` middleware was rejecting this as `"id" is not allowed`
   - API call was failing with 400 Bad Request but UI wasn't showing errors

2. **Experience not updating:**

   - Backend was correctly recalculating experience values when age changes
   - Frontend wasn't properly refreshing the UI to display these updated values
   - React Query cache invalidation wasn't forcing a refresh
   - No visual indication that recalculation was happening

3. **Infinite update loop:**
   - `handleSave` function in `CharacterSheet.js` was recreated on every render despite using `useCallback`
   - Dependency array for `handleSave` is incomplete and doesn't properly stabilize function references
   - `useEffect` in `CharacteristicsAndAbilitiesTab.js` includes `onSave` in dependency array
   - Each successful save triggers a re-render, creating a new `handleSave` function
   - This causes the `useEffect` to run again, creating an infinite loop

## Implementation Checklist

### 1. Fix Character Age Saving:
- [x] Modify `CharacterOverviewTab.js` to send minimal payload
- [x] Add separate backend validation schema for character updates
- [x] Update character routes to use the new validation

### 2. Fix Infinite Loop Issue:
- [x] Properly implement `useCallback` in `CharacterSheet.js`
- [x] Add missing dependencies or implement ref-based solution
- [x] Add debouncing to the characteristics auto-save effect
- [x] Add explicit change detection before triggering saves

### 3. Fix Experience Update Issue:
- [x] Add explicit cache invalidation and forced requery after age updates
- [x] Add visual feedback for experience values during recalculation
- [x] Improve detection of age-related updates in save function

## Implementation Changes

### 1. Character Age Saving Fix

- **Updated `CharacterOverviewTab.js`:**

  - Modified `handleAgeChange` to only update local state and not call `onSave`
  - Updated `handleBlur` to validate age and call `onSave` with minimal payload
  - Removed `...character` spread from the save payload to avoid sending the entire object
  - Now only sends `{ age: finalAge, recalculateXp: true }` to the backend

- **Created New Backend Validation:**

  - Added `updateCharacterSchema` in `backend/middleware/validation.js`
  - Created new middleware `validateCharacterUpdate` for PUT requests
  - Allows optional fields like `age` and `recalculateXp`
  - Properly validates characteristic values (-3 to +3)

- **Updated Character Routes:**
  - Modified `PUT /characters/:id` route to use `validateCharacterUpdate` middleware
  - Improved request body handling with explicit update payload construction
  - Added better error logging

### 2. Infinite Loop Fix (Updated Implementation)

- **Improved `CharacterSheet.js`:**

  - Implemented a hybrid ref + useCallback approach for stable function references
  - Added `useRef` to maintain stable function identity across renders
  - Created a stable wrapper function that never changes its identity
  - Properly tracks all necessary dependencies in `handleSave`
  - Passes a consistent function reference to child components

- **Improved `CharacteristicsAndAbilitiesTab.js`:**
  - Implemented proper value change detection with useRef
  - Added comparison before saving to avoid unnecessary updates
  - Enhanced debouncing (increased timeout to 2 seconds)
  - Removed `onSave` from dependency array to break the cycle
  - Added appropriate ESLint comment to explain the intentional dependency omission

## Verification Steps

1. **Age Saving:**

   - Navigate to a character's Overview tab
   - Change the age value and click away from the input
   - Verify in console that the save request succeeds (no 400 error)
   - Navigate to another tab and back
   - Confirm the age value persists

2. **Experience Update:**

   - Change a character's age to trigger experience recalculation
   - Verify that general experience points update appropriately
   - Check console logs for "Experience recalculated successfully" message

3. **Infinite Loop Prevention:**
   - Navigate to the Characteristics & Abilities tab
   - Monitor network requests in browser dev tools
   - Confirm that updates only occur when values change, not continuously
   - Check browser performance to ensure CPU usage remains reasonable

## Implemented Solutions

### 1. Infinite Loop Fix

1. **Fixed `CharacterSheet.js`:**
   - Stabilized the `handleSave` function using a hybrid ref + useCallback approach
   - Used useRef to maintain function identity across renders
   - Created a wrapper function `stableSave` with an empty dependency array
   - Added proper dependencies to the actual implementation function
   - Passed the stable function reference to children

2. **Fixed `CharacteristicsAndAbilitiesTab.js`:**
   - Implemented value comparison using useRef to track previous values
   - Added explicit change detection with JSON.stringify comparison
   - Increased debounce timeout from 1 second to 2 seconds
   - Removed `onSave` from the dependency array to break dependency cycle
   - Added early return when no changes are detected

### 2. Experience Update Fix

1. **Enhanced `CharacterSheet.js`:**
   - Modified the `stableSave` function to detect age updates
   - Added special handling for age updates with `recalculateXp: true`
   - Added explicit forced query invalidation after age updates
   - Implemented a small delay to ensure backend processing completes
   - Used React Query's refetch options to ensure fresh data

2. **Enhanced `CharacterOverviewTab.js`:**
   - Added `experience-value` CSS class to all experience values
   - Implemented visual feedback (pulsing animation) during recalculation
   - Added timeout to reset visual feedback after recalculation completes

## Status

Completed

## Notes

- The infinite loop issue is particularly subtle because it stems from an interaction between React's render cycle, function references, and useEffect dependencies
- For future components that use auto-save functionality, consider:
  1. Always using useCallback with ALL dependencies properly listed
  2. Implementing debouncing for auto-save effects
  3. Including explicit change detection before triggering saves
  4. Using more granular state management to prevent cascading updates
  5. Consider using refs for function stability when necessary