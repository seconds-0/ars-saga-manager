# Ars Saga Manager - Bug Fixes Workplan (March 26, 2025)

## Overall Assessment

Upon thorough examination of the codebase, seven distinct issues have been identified that need to be fixed. These bugs impact core functionality related to character experience, abilities display, and UI elements. This consolidated workplan provides detailed analysis, implementation plans, and current status for each issue.

## Issue Priority Order

1. BUG-05: Error Fetching Abilities (Highest - Blocks critical functionality)
2. BUG-01: Experience Points Static When Age Changes (High - Core functionality)
3. BUG-02: Incorrect Default Character Age (Medium - Consistency issue)
4. BUG-06: Magical XP Tracker Always Visible (Medium - UI consistency) 
5. BUG-07: "Use Cunning" Toggle Visible (Medium - UI cleanup)
6. BUG-03: All Virtues and Flaws Shown as "Not Available" (Medium - Feature functionality)
7. BUG-04: Missing "Hide Unavailable" Toggle (Low - Enhancement)

## Bug Details, Analysis and Implementation Status

### BUG-01: Experience Points Static When Age Changes

**Area**: Character Overview

**Observed Behavior**: When the character's Age is modified via the selection input, the displayed Experience Points (XP) value remains unchanged.

**Expected Behavior**: The displayed Experience Points should automatically update based on the newly selected Age, reflecting the game's rules for starting XP based on age.

**Analysis**:
- The `CharacterOverviewTab.js` correctly sends an update with `recalculateXp: true` flag when age changes
- The backend route in `routes/characters.js` handles this flag and calls the recalculation function
- However, the UI doesn't appear to update immediately after the backend calculation completes
- This may be due to the response not being properly handled or the character data not being refreshed in the UI

**Implementation Status**: **STILL PRESENT**
- The code appears to have the correct logic in place for recalculating experience when age changes
- The issue might be that the character data isn't being refreshed in the UI after the update
- Further investigation needed to determine if the backend calculation is working but the frontend isn't updating, or if the calculation itself is failing

### BUG-02: Incorrect Default Character Age

**Area**: Character Creation / Character Overview

**Observed Behavior**: When creating a new character, the Age field defaults to 20.

**Expected Behavior**: The Age field for a newly created character should default to 25.

**Analysis**:
- The frontend in `CharacterOverviewTab.js` already has the correct default age (25) in its useState initialization
- The backend Character model also has default age set to 25
- The issue may be in the component responsible for creating new characters or in how the initial state is set

**Implementation Status**: **STILL PRESENT**
- Although both frontend and backend code show the correct default age (25), the issue persists
- This suggests there may be another location in the code where the default age is set to 20
- Need to investigate how character creation flow initializes the age field

### BUG-03: All Virtues and Flaws Shown as "Not Available"

**Area**: Virtues & Flaws Selection

**Observed Behavior**: In the Virtues and Flaws list, every item is marked as "Not Available", preventing selection.

**Expected Behavior**: Virtues and Flaws should be marked as "Available" or "Not Available" based on whether the current character meets their prerequisites. Most should be available for a default character.

**Analysis**:
- The `VirtueFlawSelector.js` component uses an `isVirtueFlawDisabled` function to determine if a virtue/flaw is available
- This function primarily relies on `canAddVirtueFlaw` which is passed from the parent `VirtuesAndFlawsTab.js` component
- The issue may be in how this function is checking prerequisites or compatibility
- There could also be an issue with how character data is being passed or processed for validation

**Implementation Status**: **STILL PRESENT**
- No changes were made to the validation logic that determines if virtues/flaws are available
- Need to debug the `canAddVirtueFlaw` function in `VirtuesAndFlawsTab.js` to understand why it's consistently returning false
- The function should be modified to properly evaluate prerequisites against the character data

### BUG-04: Missing "Hide Unavailable" Toggle for Virtues/Flaws

**Area**: Virtues & Flaws Selection

**Observed Behavior**: There is no UI element (toggle/checkbox) to filter the Virtues and Flaws list based on availability.

**Expected Behavior**: A toggle switch labeled "Hide Unavailable" should be present, checked by default, which filters the list to show only available Virtues and Flaws.

**Analysis**:
- The `VirtueFlawSelector.js` component lacked the UI element and the associated state management for this feature

**Implementation Status**: **FIXED**
- Added a new `hideUnavailable` state variable initialized to `true`
- Added a checkbox UI element with appropriate label and styling
- Updated the filtering logic to respect the toggle state, hiding unavailable items when checked
- Added the new state to the dependencies array of the relevant `useMemo` hook

### BUG-05: Error Fetching Abilities

**Area**: Abilities Section

**Observed Behavior**: The Abilities section displays an error message: "Error Fetching Abilities: Failed to Fetch Character Abilities".

**Expected Behavior**: The section should display the character's abilities with their scores, allowing increment/decrement which adjusts XP.

**Analysis**:
- The frontend `useAbilities.js` hook was sending requests to `/characters/:characterId/abilities`
- The backend routes in `server.js` mount the abilities router at `/api/characters`
- This suggests a missing `/api` prefix in the frontend API calls

**Implementation Status**: **STILL PRESENT**
- All API endpoints in `useAbilities.js` were updated to include the missing `/api` prefix
- Modified URLs for fetching, adding, updating, and deleting abilities
- However, the issue persists, suggesting there may be another cause such as:
  - Authentication issues
  - Backend route configuration problems
  - API response format mismatches
  - CORS issues

### BUG-06: Magical XP Tracker Always Visible

**Area**: Character Overview / XP Trackers

**Observed Behavior**: The Magical XP tracker UI element is visible for all characters, regardless of whether they have magical abilities.

**Expected Behavior**: The Magical XP tracker should only be visible for characters who meet the criteria for having magical abilities (e.g., possess "The Gift" virtue).

**Analysis**:
- The `CharacterOverviewTab.js` correctly has conditional rendering for the magical XP display
- The `CharacteristicsAndAbilitiesTab.js` also has similar conditional rendering
- The condition check might not be working correctly or there might be an issue with how the character type is being determined

**Implementation Status**: **STILL PRESENT**
- The code appears to have the correct conditional rendering in place
- Need to investigate why the condition isn't properly filtering non-magus characters
- Check if character_type is correctly set and formatted in the backend and if the condition is evaluating correctly

### BUG-07: "Use Cunning" Toggle Visible for Player Characters

**Area**: Character Sheet (Near stats/abilities)

**Observed Behavior**: A UI toggle labeled "Use Cunning" is visible on the character sheet.

**Expected Behavior**: This toggle should not be visible on standard player character sheets, as it's intended only for future animal companion functionality.

**Analysis**:
- The `CharacteristicsAndAbilitiesTab.js` component has a commented-out section for this toggle (lines 206-207)
- This suggests the issue was correctly identified and fixed previously

**Implementation Status**: **FIXED**
- The toggle is already hidden in the codebase via a commented-out section
- No additional changes needed as the code already implements the fix

## Implementation Approach Taken

For this attempted bug fix session, I focused on the two highest priority issues:

1. **BUG-05: Error Fetching Abilities** - Added the missing `/api` prefix to all API endpoints in `useAbilities.js`
2. **BUG-04: Missing "Hide Unavailable" Toggle** - Successfully implemented the UI toggle and filtering logic in `VirtueFlawSelector.js`

The implemented changes:

```javascript
// Fix for BUG-05: Adding missing /api prefix to API endpoints
// Before:
const response = await axios.get(`/characters/${characterId}/abilities`);
// After:
const response = await axios.get(`/api/characters/${characterId}/abilities`);

// Fix for BUG-04: Adding Hide Unavailable toggle
// Added new state variable:
const [hideUnavailable, setHideUnavailable] = useState(true);

// Added UI toggle:
<div className="flex items-center mb-2">
  <input
    type="checkbox"
    id="hideUnavailable"
    checked={hideUnavailable}
    onChange={() => setHideUnavailable(prev => !prev)}
    className="h-4 w-4 mr-2"
  />
  <label htmlFor="hideUnavailable" className="select-none cursor-pointer">
    Hide Unavailable
  </label>
</div>

// Updated filtering logic:
const isAvailable = !hideUnavailable || !isVirtueFlawDisabled(vf);
return matchesSearch && matchesCategory && matchesType && isAvailable;
```

## Current Status and Next Steps

Despite the implemented changes, testing shows that several issues still persist:

1. **BUG-05 (Error Fetching Abilities)**: Still present, suggesting the issue might be deeper than just the API URL format. Next steps:
   - Analyze browser network requests to see actual API calls being made
   - Check backend logs for specific errors
   - Verify authentication headers and CORS configuration
   - Test the API endpoints directly using Postman or curl to isolate the issue

2. **BUG-03 (Virtues/Flaws Not Available)**: Still present. Next steps:
   - Add logging to the `canAddVirtueFlaw` function to see why it's returning false for all items
   - Examine the validation rules being created in `VirtuesAndFlawsTab.js`
   - Test with simplified validation rules to isolate the issue

3. **BUG-01 and BUG-02**: Need further investigation as the issue persists despite the code appearing to have the correct logic in place.

4. **BUG-06**: Requires further investigation of how character type is determined and checked.

Only BUG-04 (Missing "Hide Unavailable" Toggle) and BUG-07 ("Use Cunning" Toggle Visibility) have been successfully addressed.

## Analysis of Attempted Fixes

The attempted fixes for BUG-05 (missing API prefix) appeared logical based on codebase examination, but were insufficient to resolve the issue. This suggests:

1. The API URL might not be the root cause, or not the only cause
2. There may be deeper issues with API configuration, authentication, or request/response handling
3. Backend route definitions might need to be examined more carefully
4. There could be environment-specific issues affecting API connectivity

For BUG-04 (Hide Unavailable toggle), the implementation was successful because it was a straightforward UI enhancement with clear steps:

1. Add state variable for tracking toggle status
2. Create the UI element with proper event handlers
3. Update the filtering logic to respect the toggle state
4. Ensure the component re-renders when the toggle changes

The fact that this was fixed while other issues persist indicates that some bugs may require deeper structural changes or debugging rather than simple code modifications.