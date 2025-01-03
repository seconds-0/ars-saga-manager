/**
 * Creates validation rules for virtues and flaws based on character type
 * @param {string} characterType - 'grog', 'companion', or 'magus'
 * @param {Object} overrides - Optional rule overrides
 * @returns {Object} Validation rules
 */
export const createValidationRules = (characterType, overrides = {}) => {
  // Validate character type
  if (!characterType || !['grog', 'companion', 'magus'].includes(characterType)) {
    throw new Error('Invalid character type');
  }

  // Validate overrides
  if (overrides.maxVirtuePoints !== undefined && overrides.maxVirtuePoints < 0) {
    throw new Error('Invalid rule configuration');
  }

  // Default rules by character type
  const defaultRules = {
    grog: {
      allowMajorVirtues: false,
      allowMajorFlaws: false,
      maxVirtuePoints: 3,
      maxFlawPoints: 3,
      maxMinorFlaws: 3,
      requireGift: false,
      allowHermeticVirtues: false,
      requirePointBalance: true,
      maxStoryFlaws: 1,
      maxPersonalityFlaws: 3,
      requireSocialStatus: true,
      checkIncompatibilities: true,
      checkPrerequisites: true,
      checkCharacterTypeRestrictions: true
    },
    companion: {
      allowMajorVirtues: true,
      allowMajorFlaws: true,
      maxVirtuePoints: 10,
      maxFlawPoints: 10,
      maxMinorFlaws: 5,
      requireGift: false,
      allowHermeticVirtues: false,
      requirePointBalance: true,
      maxStoryFlaws: 1,
      maxPersonalityFlaws: 3,
      requireSocialStatus: true,
      checkIncompatibilities: true,
      checkPrerequisites: true,
      checkCharacterTypeRestrictions: true
    },
    magus: {
      allowMajorVirtues: true,
      allowMajorFlaws: true,
      maxVirtuePoints: 10,
      maxFlawPoints: 10,
      maxMinorFlaws: 5,
      requireGift: true,
      allowHermeticVirtues: true,
      requirePointBalance: true,
      maxStoryFlaws: 1,
      maxPersonalityFlaws: 3,
      requireSocialStatus: true,
      checkIncompatibilities: true,
      checkPrerequisites: true,
      checkCharacterTypeRestrictions: true
    }
  };

  // Combine default rules with overrides and include character type
  return {
    ...defaultRules[characterType],
    ...overrides,
    characterType // Always include character type
  };
};

/**
 * Validates virtues and flaws against the provided rules
 * @param {Array} virtuesFlaws - Array of virtue/flaw objects
 * @param {Object} rules - Validation rules
 * @returns {Object} Validation result with isValid and warnings
 */
export const validateVirtuesFlaws = (virtuesFlaws, rules) => {
  // Validate rules object and required properties
  const requiredProps = [
    'allowMajorVirtues',
    'allowMajorFlaws',
    'maxVirtuePoints',
    'maxFlawPoints',
    'maxMinorFlaws',
    'requireGift',
    'allowHermeticVirtues',
    'requirePointBalance',
    'maxStoryFlaws',
    'maxPersonalityFlaws',
    'requireSocialStatus',
    'checkIncompatibilities',
    'checkPrerequisites',
    'checkCharacterTypeRestrictions'
  ];

  if (!rules || typeof rules !== 'object' || 
      !requiredProps.every(prop => rules.hasOwnProperty(prop))) {
    throw new Error('Invalid validation rules');
  }

  const warnings = [];
  let isValid = true;

  // Calculate points and category counts
  let virtuePoints = 0;
  let flawPoints = 0;
  let minorFlawCount = 0;
  let storyFlawCount = 0;
  let personalityFlawCount = 0;
  let socialStatusCount = 0;

  // First pass: Calculate points and check non-category restrictions
  virtuesFlaws.forEach(item => {
    if (!item.is_house_virtue_flaw) {
      // Check character type restrictions
      if (rules.checkCharacterTypeRestrictions) {
        // Check explicit character type restrictions
        if (item.allowed_character_types) {
          if (!item.allowed_character_types.includes(rules.characterType)) {
            warnings.push({
              type: 'error',
              message: `${item.name} is only available to ${item.allowed_character_types.join('/')} characters`
            });
            isValid = false;
          }
        }

        // Check Hermetic virtue restrictions
        if (item.category === 'Hermetic' && !rules.allowHermeticVirtues) {
          warnings.push({
            type: 'error',
            message: 'Cannot take Hermetic Virtues without The Gift'
          });
          isValid = false;
        }
      }

      if (item.type === 'Virtue') {
        // Check major virtue restriction
        if (item.size === 'Major' && !rules.allowMajorVirtues) {
          warnings.push({
            type: 'error',
            message: `${rules.characterType === 'grog' ? 'Grogs' : 'Characters'} cannot take Major Virtues`
          });
          isValid = false;
        }

        // Add up virtue points
        virtuePoints += item.size === 'Major' ? 3 : item.size === 'Minor' ? 1 : 0;
      } else if (item.type === 'Flaw') {
        if (item.size === 'Minor') {
          minorFlawCount++;
        }
        // Add up flaw points
        flawPoints += item.size === 'Major' ? 3 : item.size === 'Minor' ? 1 : 0;
      }
    }
  });

  // Second pass: Check category-specific counts
  virtuesFlaws.forEach(item => {
    if (item.category === 'Social Status') {
      socialStatusCount++;
    } else if (!item.is_house_virtue_flaw && item.type === 'Flaw') {
      if (item.category === 'Story') {
        storyFlawCount++;
      } else if (item.category === 'Personality') {
        personalityFlawCount++;
      }
    }
  });

  // Third pass: Check incompatibilities
  if (rules.checkIncompatibilities) {
    virtuesFlaws.forEach((item, index) => {
      if (!item.is_house_virtue_flaw && item.incompatibilities) {
        virtuesFlaws.forEach((otherItem, otherIndex) => {
          if (index !== otherIndex && !otherItem.is_house_virtue_flaw) {
            if (item.incompatibilities.includes(otherItem.name)) {
              warnings.push({
                type: 'error',
                message: `Incompatible combination: ${item.name} cannot be taken with ${otherItem.name}`
              });
              isValid = false;
            }
          }
        });
      }
    });
  }

  // Fourth pass: Check prerequisites
  if (rules.checkPrerequisites) {
    virtuesFlaws.forEach(item => {
      // Check explicit prerequisites
      if (!item.is_house_virtue_flaw && item.prerequisites) {
        item.prerequisites.forEach(prerequisite => {
          const hasPrerequisite = virtuesFlaws.some(
            other => other.name === prerequisite && !other.is_house_virtue_flaw
          );
          if (!hasPrerequisite) {
            warnings.push({
              type: 'error',
              message: `${item.name} requires prerequisite: ${prerequisite}`
            });
            isValid = false;
          }
        });
      }
    });
  }

  // Check point limits
  if (virtuePoints > rules.maxVirtuePoints) {
    warnings.push({
      type: 'error',
      message: `Cannot exceed ${rules.maxVirtuePoints} points of Virtues`
    });
    isValid = false;
  }

  // Check minor flaw limit
  if (minorFlawCount > rules.maxMinorFlaws) {
    warnings.push({
      type: 'error',
      message: `Cannot exceed ${rules.maxMinorFlaws} Minor Flaws`
    });
    isValid = false;
  }

  // Check Story Flaw limit
  if (storyFlawCount > rules.maxStoryFlaws) {
    warnings.push({
      type: 'error',
      message: 'Cannot have more than one Story Flaw'
    });
    isValid = false;
  }

  // Check Personality Flaw limit
  if (personalityFlawCount > rules.maxPersonalityFlaws) {
    warnings.push({
      type: 'error',
      message: 'Cannot have more than three Personality Flaws'
    });
    isValid = false;
  }

  // Check Social Status requirement
  if (rules.requireSocialStatus && socialStatusCount !== 1) {
    warnings.push({
      type: 'error',
      message: 'Character must have exactly one Social Status'
    });
    isValid = false;
  }

  // Check point balance last
  if (rules.requirePointBalance && virtuePoints !== flawPoints) {
    warnings.push({
      type: 'error',
      message: `Virtue points (${virtuePoints}) must be balanced by equal Flaw points (${flawPoints})`
    });
    isValid = false;
  }

  return {
    isValid,
    warnings
  };
}; 