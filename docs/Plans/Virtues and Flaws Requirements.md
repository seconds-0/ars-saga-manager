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

### Social Status

- Every character must have exactly one Social Status indicator, which can be:
  1. A Social Status Virtue (costing points)
  2. A Free Social Status (0 point Virtue)
  3. A Social Status Flaw
- Multiple Social Status indicators of any type are not allowed
- House Social Status counts as a valid Social Status indicator
- This requirement can be disabled via rules configuration

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

## Implementation Plan: Phase 1 - Core Validation and Logic

This plan outlines the steps to implement and test the core validation logic for the Virtues and Flaws system. The focus is on rigorous testing using a Test-Driven Development (TDD) approach.

**1. Implement Social Status Validation**

- **Task Description:** Implement validation to ensure that exactly one Social Status Virtue is selected. This validation should check for Virtues with the category "Social Status". Modify the `validateVirtuesFlaws` function in `frontend/src/utils/virtueFlawValidation.js` to include this new validation.
- **Code Location:**
  - `frontend/src/utils/virtueFlawValidation.js`: Add a new validation function `validateSocialStatus`.
  - `frontend/src/utils/virtueFlawValidation.test.js`: Add tests for `validateSocialStatus`.
- **Code Expectations (`frontend/src/utils/virtueFlawValidation.js`):**

  ```javascript
  const validateSocialStatus = (virtuesFlaws) => {
    const warnings = [];
    const socialStatuses = virtuesFlaws.filter(
      (vf) =>
        !vf.is_house_virtue_flaw &&
        vf.referenceVirtueFlaw.category === "Social Status" &&
        vf.referenceVirtueFlaw.type === "Virtue"
    );

    if (socialStatuses.length !== 1) {
      warnings.push({
        type: "error",
        message: "Must select exactly one Social Status Virtue.",
      });
    }

    return {
      isValid: warnings.length === 0,
      warnings,
    };
  };
  ```

  - Modify `validateVirtuesFlaws` function to call `validateSocialStatus`.

- **Testing Requirements (`frontend/src/utils/virtueFlawValidation.test.js`):**
  - Create a new `describe` block for `validateSocialStatus`.
  - **Test Case 1: No Social Status:** Arrange: `virtuesFlaws` array without any Social Status Virtue. Act: Call `validateSocialStatus(virtuesFlaws)`. Assert: `isValid` is `false`, `warnings` contains an error message "Must select exactly one Social Status Virtue."
  - **Test Case 2: One Social Status:** Arrange: `virtuesFlaws` array with one Social Status Virtue. Act: Call `validateSocialStatus(virtuesFlaws)`. Assert: `isValid` is `true`, `warnings` is empty.
  - **Test Case 3: Multiple Social Statuses:** Arrange: `virtuesFlaws` array with two Social Status Virtues. Act: Call `validateSocialStatus(virtuesFlaws)`. Assert: `isValid` is `false`, `warnings` contains an error message "Must select exactly one Social Status Virtue."

**2. Implement Multiple Instances Validation**

- **Task Description:** Implement validation to prevent taking multiple instances of Virtues/Flaws unless `referenceVirtueFlaw.multiple_allowed` is true. Modify the `validateVirtuesFlaws` function in `frontend/src/utils/virtueFlawValidation.js` to include this new validation.
- **Code Location:**
  - `frontend/src/utils/virtueFlawValidation.js`: Add a new validation function `validateMultipleInstances`.
  - `frontend/src/utils/virtueFlawValidation.test.js`: Add tests for `validateMultipleInstances`.
- **Code Expectations (`frontend/src/utils/virtueFlawValidation.js`):**

  ```javascript
  const validateMultipleInstances = (virtuesFlaws) => {
    const warnings = [];
    const vfCounts = {};

    virtuesFlaws.forEach((vf) => {
      if (!vf.is_house_virtue_flaw) {
        const vfName = vf.referenceVirtueFlaw.name;
        vfCounts[vfName] = (vfCounts[vfName] || 0) + 1;
      }
    });

    for (const vfName in vfCounts) {
      if (vfCounts[vfName] > 1) {
        const referenceVf = virtuesFlaws.find(
          (vf) => vf.referenceVirtueFlaw.name === vfName
        ).referenceVirtueFlaw;
        if (!referenceVf.multiple_allowed) {
          warnings.push({
            type: "error",
            message: `Cannot take multiple instances of ${vfName}.`,
          });
        }
      }
    }

    return {
      isValid: warnings.length === 0,
      warnings,
    };
  };
  ```

  - Modify `validateVirtuesFlaws` function to call `validateMultipleInstances`.

- **Testing Requirements (`frontend/src/utils/virtueFlawValidation.test.js`):**
  - Create a new `describe` block for `validateMultipleInstances`.
  - **Test Case 1: Single Instance Allowed (multiple_allowed: true):** Arrange: `virtuesFlaws` array with two instances of a Virtue where `multiple_allowed: true`. Act: Call `validateMultipleInstances(virtuesFlaws)`. Assert: `isValid` is `true`, `warnings` is empty.
  - **Test Case 2: Multiple Instances Not Allowed (multiple_allowed: false):** Arrange: `virtuesFlaws` array with two instances of a Virtue where `multiple_allowed: false`. Act: Call `validateMultipleInstances(virtuesFlaws)`. Assert: `isValid` is `false`, `warnings` contains an error message "Cannot take multiple instances of [Virtue Name]."
  - **Test Case 3: Single Instance (multiple_allowed: false):** Arrange: `virtuesFlaws` array with one instance of a Virtue where `multiple_allowed: false`. Act: Call `validateMultipleInstances(virtuesFlaws)`. Assert: `isValid` is `true`, `warnings` is empty.

**3. Refine Existing Validations**

- **Task Description:** Review and refine existing validation functions (`validatePrerequisites`, `validateIncompatibilities`, `validateStoryFlaws`, `validatePersonalityFlaws`, `validateHermeticVirtues`, `validateMajorHermeticVirtues`) to ensure they accurately reflect the requirements and game rules. Focus on ensuring clear and informative error messages and comprehensive coverage of edge cases and scenarios described in this "Virtues and Flaws Requirements.md" document.
- **Code Location:** `frontend/src/utils/virtueFlawValidation.js` and `frontend/src/utils/virtueFlawValidation.test.js`
- **Code Expectations:**
  - Carefully review the logic in each validation function against the requirements document and game rules.
  - Ensure error messages are clear, user-friendly, and accurately describe the validation failure.
  - Refactor code for clarity, efficiency, and maintainability if needed.
- **Testing Requirements:**
  - Review existing tests in `frontend/src/utils/virtueFlawValidation.test.js` for each of these validation functions.
  - Add new test cases to cover edge cases, complex scenarios, and negative tests as needed to increase test coverage and ensure robustness. Pay close attention to the specific rules outlined in the "General Rules" and "Character Type Restrictions" sections of this document.

**4. Enhance Grog Restrictions**

- **Task Description:** Implement and test the remaining Grog restrictions: Hermetic/Gift restrictions and the maximum 3 Minor Flaws limit.
- **Code Location:**
  - `frontend/src/utils/virtueFlawValidation.js`: Modify `validateCharacterTypeRestrictions` or create new functions as needed.
  - `frontend/src/utils/virtueFlawValidation.test.js`: Add tests for Grog restrictions.
- **Code Expectations (`frontend/src/utils/virtueFlawValidation.js`):**
  - Ensure `validateCharacterTypeRestrictions` (or new functions) checks for character type 'grog':
    - Error if Hermetic Virtues/Flaws are selected.
    - Error if "The Gift" Virtue is selected.
    - Error if more than 3 Minor Flaws are selected.
- **Testing Requirements (`frontend/src/utils/virtueFlawValidation.test.js`):**
  - Create a new `describe` block for Grog restrictions or add to existing character type restriction tests.
  - **Test Case 1: Grog with Hermetic Virtue:** Arrange: `virtuesFlaws` array with a Hermetic Virtue, character type 'grog'. Act: Call validation function. Assert: Error message about Hermetic Virtues for Grogs.
  - **Test Case 2: Grog with The Gift:** Arrange: `virtuesFlaws` array with "The Gift" Virtue, character type 'grog'. Act: Call validation function. Assert: Error message about "The Gift" for Grogs.
  - **Test Case 3: Grog with >3 Minor Flaws:** Arrange: `virtuesFlaws` array with 4 Minor Flaws, character type 'grog'. Act: Call validation function. Assert: Error message about exceeding Minor Flaw limit for Grogs.
  - **Test Case 4: Grog with <=3 Minor Flaws:** Arrange: `virtuesFlaws` array with 3 Minor Flaws, character type 'grog'. Act: Call validation function. Assert: No error related to Minor Flaw limit for Grogs.

**5. Companion and Magi Restrictions**

- **Task Description:** Implement and test Companion and Magi specific restrictions: Maximum 5 Minor Flaws, Maximum 1 Major Hermetic Virtue for Magi, and Hermetic Flaw warning for Magi.
- **Code Location:**
  - `frontend/src/utils/virtueFlawValidation.js`: Modify `validateCharacterTypeRestrictions` or create new functions.
  - `frontend/src/utils/virtueFlawValidation.test.js`: Add tests for Companion and Magi restrictions.
- **Code Expectations (`frontend/src/utils/virtueFlawValidation.js`):**
  - Ensure `validateCharacterTypeRestrictions` (or new functions) checks for character types 'companion' and 'magi':
    - Error if more than 5 Minor Flaws are selected for both Companion and Magi.
    - For Magi only: Error if more than 1 Major Hermetic Virtue is selected.
    - For Magi only: Warning if no Hermetic Flaw is selected (implement as a warning, not an error - as per requirements, it's a recommendation, not a hard rule).
- **Testing Requirements (`frontend/src/utils/virtueFlawValidation.test.js`):**
  - Create or extend character type restriction test blocks.
  - **Companion Tests:**
    - **Test Case 1: Companion with >5 Minor Flaws:** Error message about exceeding Minor Flaw limit.
    - **Test Case 2: Companion with <=5 Minor Flaws:** No error related to Minor Flaw limit.
  - **Magi Tests:**
    - **Test Case 3: Magi with >5 Minor Flaws:** Error message about exceeding Minor Flaw limit.
    - **Test Case 4: Magi with <=5 Minor Flaws:** No error related to Minor Flaw limit.
    - **Test Case 5: Magi with >1 Major Hermetic Virtue:** Error message about exceeding Major Hermetic Virtue limit.
    - **Test Case 6: Magi with <=1 Major Hermetic Virtue:** No error related to Major Hermetic Virtue limit.
    - **Test Case 7: Magi with no Hermetic Flaw:** Warning message suggesting a Hermetic Flaw.
    - **Test Case 8: Magi with Hermetic Flaw:** No warning related to Hermetic Flaw.

**6. House Virtue Logic (Basic)**

- **Task Description:** Verify that House Virtues/Flaws are correctly identified and excluded from point calculations.
- **Code Location:**
  - `frontend/src/utils/virtueFlawPoints.js`: Review `calculateVirtueFlawPoints`.
  - `frontend/src/utils/virtueFlawValidation.js`: Ensure validations correctly handle `is_house_virtue_flaw` flag.
  - `frontend/src/utils/virtueFlawPoints.test.js`: Review and add tests.
- **Code Expectations (`frontend/src/utils/virtueFlawPoints.js`):**
  - Confirm `calculateVirtueFlawPoints` function correctly ignores Virtues/Flaws where `is_house_virtue_flaw` is true when calculating points.
- **Testing Requirements (`frontend/src/utils/virtueFlawPoints.test.js`):**
  - Review existing tests to ensure House Virtues/Flaws are excluded from point calculations.
  - Add new test cases specifically for scenarios with House Virtues/Flaws to confirm they do not affect point totals. For example:
    - **Test Case 1: House Virtue - Point Calculation:** Arrange: `virtuesFlaws` array including a House Virtue and a regular Virtue. Act: Call `calculateVirtueFlawPoints`. Assert: Only the regular Virtue points are counted, House Virtue points are ignored.
    - **Test Case 2: House Flaw - Point Calculation:** Arrange: `virtuesFlaws` array including a House Flaw and a regular Flaw. Act: Call `calculateVirtueFlawPoints`. Assert: Only the regular Flaw points are counted, House Flaw points are ignored.

**7. Comprehensive Testing and Code Coverage**

- **Task Description:** Ensure all implemented validation rules and point calculations are thoroughly tested. Aim for high code coverage in `frontend/src/utils/virtueFlawValidation.js` and `frontend/src/utils/virtueFlawPoints.js`.
- **Code Location:** `frontend/src/utils/virtueFlawValidation.test.js` and `frontend/src/utils/virtueFlawPoints.test.js`
- **Testing Requirements:**
  - Run Jest coverage reports (`jest --coverage`) after implementing each step.
  - Review coverage reports to identify untested code paths and branches.
  - Write additional test cases to cover any uncovered code, focusing on:
    - Edge cases and boundary conditions.
    - Invalid or unexpected inputs.
    - Different combinations of Virtues and Flaws.
    - All character types (grog, companion, magus).
  - Ensure all tests follow the Arrange-Act-Assert (AAA) pattern and have descriptive names.
  - Refactor tests for clarity and maintainability as needed.

By completing these steps in Phase 1, you will establish a robust and well-tested foundation for the Virtues and Flaws system, specifically focusing on the core validation logic and point calculations. This will pave the way for implementing the UI and more advanced features in subsequent phases. Remember to commit code frequently and run tests after each step to ensure continuous integration and catch issues early.
