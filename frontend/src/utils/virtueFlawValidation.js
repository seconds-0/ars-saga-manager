/**
 * Normalizes character type case and validates it
 * @param {string} characterType - The character type to normalize
 * @returns {string} The normalized character type
 * @throws {Error} If the character type is invalid
 */
const normalizeCharacterType = (characterType) => {
  if (!characterType) {
    throw new Error('Character type is required');
  }

  const normalized = characterType.toLowerCase();
  const validTypes = ['grog', 'companion', 'magus'];
  
  if (!validTypes.includes(normalized)) {
    throw new Error('Invalid character type. Only Grog, Companion, and Magus are currently supported.');
  }

  return normalized;
};

/**
 * Creates validation rules for virtues and flaws based on character type
 * @param {string} characterType - 'grog', 'companion', or 'magus'
 * @param {Object} overrides - Optional rule overrides
 * @returns {Object} Validation rules
 */
export const createValidationRules = (characterType, overrides = {}) => {
  try {
    // Validate input parameters
    if (!characterType) {
      throw new Error('Character type is required');
    }

    const normalizedType = characterType.toLowerCase();
    const validTypes = ['magus', 'companion', 'grog'];
    if (!validTypes.includes(normalizedType)) {
      throw new Error('Invalid character type');
    }

    // Validate overrides
    if (overrides.maxVirtuePoints !== undefined && overrides.maxVirtuePoints < 0) {
      throw new Error('maxVirtuePoints cannot be negative');
    }

    // Base rules that apply to all character types
    const baseRules = {
      maxVirtuePoints: 10,
      maxMinorFlaws: 5,
      maxMajorHermeticVirtues: 1,
      maxStoryFlaws: 1,
      maxPersonalityFlaws: 3,
      allowHermeticVirtues: true,
      requireSocialStatus: true,
      requirePointBalance: true,
      checkIncompatibilities: true,
      checkPrerequisites: true,
      checkCharacterTypeRestrictions: true
    };

    // Character type specific overrides
    const typeSpecificRules = {
      grog: {
        maxVirtuePoints: 3,
        maxMinorFlaws: 3,
        allowHermeticVirtues: false,
        allowMajorVirtuesFlaws: false,
        requireEqualMinorVirtuesFlaws: true,
        allowTheGift: false
      },
      companion: {
        maxVirtuePoints: 10,
        maxMinorFlaws: 5,
        allowHermeticVirtues: false,
        allowMajorVirtuesFlaws: true
      },
      magus: {
        maxVirtuePoints: 10,
        maxMinorFlaws: 5,
        allowHermeticVirtues: true,
        allowMajorVirtuesFlaws: true,
        requireTheGift: true
      }
    };

    // Merge base rules with character type specific rules and any overrides
    const rules = {
      ...baseRules,
      ...typeSpecificRules[normalizedType],
      ...overrides,
      characterType: normalizedType
    };

    return rules;
  } catch (error) {
    throw new Error(`Invalid rule configuration: ${error.message}`);
  }
};

/**
 * Validates a list of virtues and flaws against the given rules
 * @param {Array} virtuesFlaws - List of virtues and flaws to validate
 * @param {Object} rules - Validation rules created by createValidationRules
 * @returns {Object} Validation result with isValid and warnings
 */
export const validateVirtuesFlaws = (virtuesFlaws, rules) => {
  if (!Array.isArray(virtuesFlaws)) {
    throw new Error('virtuesFlaws must be an array');
  }

  if (!rules || typeof rules !== 'object' || !rules.characterType) {
    throw new Error('Invalid validation rules');
  }

  const warnings = [];

  // Validate character type restrictions
  if (rules.checkCharacterTypeRestrictions) {
    const characterTypeResult = validateCharacterTypeRestrictions(virtuesFlaws, rules);
    warnings.push(...characterTypeResult.warnings);
  }

  // Validate multiple instances
  const multipleInstancesResult = validateMultipleInstances(virtuesFlaws, rules);
  warnings.push(...multipleInstancesResult.warnings);

  // Validate Hermetic Virtues
  const hermeticResult = validateHermeticVirtues(virtuesFlaws, rules);
  warnings.push(...hermeticResult.warnings);

  // Validate Minor Flaws limit
  const minorFlaws = virtuesFlaws.filter(vf =>
    !vf.is_house_virtue_flaw &&
    vf.referenceVirtueFlaw.type === 'Flaw' &&
    vf.referenceVirtueFlaw.size === 'Minor'
  );

  if (minorFlaws.length > rules.maxMinorFlaws) {
    warnings.push({
      type: 'error',
      message: rules.characterType === 'grog'
        ? `Grogs cannot exceed ${rules.maxMinorFlaws} Minor Flaws`
        : `Cannot exceed ${rules.maxMinorFlaws} Minor Flaws`
    });
  }

  // Validate Grog-specific restrictions
  if (rules.characterType === 'grog') {
    // Check for Major Virtues/Flaws if not allowed
    if (!rules.allowMajorVirtuesFlaws) {
      const majorVirtuesFlaws = virtuesFlaws.filter(vf =>
        !vf.is_house_virtue_flaw &&
        vf.referenceVirtueFlaw.size === 'Major'
      );

      if (majorVirtuesFlaws.length > 0) {
        warnings.push({
          type: 'error',
          message: 'Grogs cannot take Major Virtues or Flaws'
        });
      }
    }

    // Check for The Gift (this restriction cannot be overridden)
    const hasGift = virtuesFlaws.some(vf =>
      !vf.is_house_virtue_flaw &&
      vf.referenceVirtueFlaw.category === 'The Gift' &&
      vf.referenceVirtueFlaw.name === 'The Gift'
    );

    if (hasGift && !rules.allowTheGift) {
      warnings.push({
        type: 'error',
        message: 'Grogs cannot take The Gift'
      });
    }

    // Check for equal number of Minor Virtues and Flaws if required
    if (rules.requireEqualMinorVirtuesFlaws) {
      const minorVirtues = virtuesFlaws.filter(vf =>
        !vf.is_house_virtue_flaw &&
        vf.referenceVirtueFlaw.type === 'Virtue' &&
        vf.referenceVirtueFlaw.size === 'Minor'
      ).length;

      if (minorVirtues !== minorFlaws.length) {
        warnings.push({
          type: 'error',
          message: 'Grogs must have equal number of Minor Virtues and Minor Flaws'
        });
      }
    }
  }

  // Validate point balance
  if (rules.requirePointBalance) {
    const nonHouseVirtuesFlaws = virtuesFlaws.filter(vf => !vf.is_house_virtue_flaw);
    
    const virtuePoints = nonHouseVirtuesFlaws
      .filter(vf => vf.referenceVirtueFlaw.type === 'Virtue')
      .reduce((sum, vf) => sum + (vf.referenceVirtueFlaw.size === 'Major' ? 3 : 1), 0);

    const flawPoints = nonHouseVirtuesFlaws
      .filter(vf => vf.referenceVirtueFlaw.type === 'Flaw')
      .reduce((sum, vf) => sum + (vf.referenceVirtueFlaw.size === 'Major' ? 3 : 1), 0);

    if (virtuePoints !== flawPoints) {
      warnings.push({
        type: 'error',
        message: `Virtue points (${virtuePoints}) must be balanced by equal Flaw points (${flawPoints})`
      });
    }

    // Check for maximum virtue points
    if (virtuePoints > rules.maxVirtuePoints) {
      warnings.push({
        type: 'error',
        message: `Cannot exceed ${rules.maxVirtuePoints} points of Virtues`
      });
    }
  }

  // Validate social status
  if (rules.requireSocialStatus) {
    const socialStatusIndicators = virtuesFlaws.filter(vf =>
      vf.referenceVirtueFlaw.category === 'Social Status'
    );

    if (socialStatusIndicators.length !== 1) {
      warnings.push({
        type: 'error',
        message: 'Character must have exactly one Social Status (either as a Virtue, Free Status, or Flaw)'
      });
    }
  }

  // Validate incompatibilities
  if (rules.checkIncompatibilities) {
    virtuesFlaws.forEach((item, index) => {
      const virtueFlaw = item.referenceVirtueFlaw;
      if (!item.is_house_virtue_flaw && virtueFlaw.incompatibilities) {
        virtuesFlaws.forEach((otherItem, otherIndex) => {
          const otherVirtueFlaw = otherItem.referenceVirtueFlaw;
          if (index !== otherIndex && !otherItem.is_house_virtue_flaw) {
            if (virtueFlaw.incompatibilities.includes(otherVirtueFlaw.name)) {
              warnings.push({
                type: 'error',
                message: `Incompatible combination: ${virtueFlaw.name} cannot be taken with ${otherVirtueFlaw.name}`
              });
            }
          }
        });
      }
    });
  }

  // Validate prerequisites
  if (rules.checkPrerequisites) {
    virtuesFlaws.forEach(item => {
      const virtueFlaw = item.referenceVirtueFlaw;
      if (!item.is_house_virtue_flaw && virtueFlaw.prerequisites) {
        const missingPrerequisites = virtueFlaw.prerequisites.filter(prereq => 
          !virtuesFlaws.some(otherItem => 
            !otherItem.is_house_virtue_flaw &&
            otherItem.referenceVirtueFlaw.name === prereq
          )
        );

        if (missingPrerequisites.length > 0) {
          warnings.push({
            type: 'error',
            message: `${virtueFlaw.name} requires prerequisite: ${missingPrerequisites.join(', ')}`
          });
        }
      }
    });
  }

  // Validate Story Flaws
  const storyFlaws = virtuesFlaws.filter(vf => 
    !vf.is_house_virtue_flaw &&
    vf.referenceVirtueFlaw.type === 'Flaw' &&
    vf.referenceVirtueFlaw.category === 'Story'
  );

  if (storyFlaws.length > rules.maxStoryFlaws) {
    warnings.push({
      type: 'error',
      message: 'Cannot have more than one Story Flaw'
    });
  }

  // Validate Personality Flaws
  const personalityFlaws = virtuesFlaws.filter(vf => 
    !vf.is_house_virtue_flaw &&
    vf.referenceVirtueFlaw.type === 'Flaw' &&
    vf.referenceVirtueFlaw.category === 'Personality'
  );

  if (personalityFlaws.length > rules.maxPersonalityFlaws) {
    warnings.push({
      type: 'error',
      message: 'Cannot have more than three Personality Flaws'
    });
  }

  // Validate Major Hermetic Virtues
  const majorHermeticVirtues = virtuesFlaws.filter(vf => 
    !vf.is_house_virtue_flaw &&
    vf.referenceVirtueFlaw.type === 'Virtue' &&
    vf.referenceVirtueFlaw.size === 'Major' &&
    vf.referenceVirtueFlaw.category === 'Hermetic'
  );

  if (majorHermeticVirtues.length > rules.maxMajorHermeticVirtues) {
    warnings.push({
      type: 'error',
      message: 'Cannot exceed 1 Major Hermetic Virtue'
    });
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

const validateGrogRestrictions = (virtuesFlaws, rules) => {
  const warnings = [];

  // Check for Major Virtues/Flaws
  const majorVirtuesFlaws = virtuesFlaws.filter(vf =>
    !vf.is_house_virtue_flaw &&
    vf.referenceVirtueFlaw.size === 'Major'
  );

  if (majorVirtuesFlaws.length > 0) {
    warnings.push({
      type: 'error',
      message: 'Grogs cannot take Major Virtues or Flaws'
    });
  }

  // Check for The Gift
  const hasGift = virtuesFlaws.some(vf =>
    !vf.is_house_virtue_flaw &&
    vf.referenceVirtueFlaw.category === 'The Gift' &&
    vf.referenceVirtueFlaw.name === 'The Gift'
  );

  if (hasGift) {
    warnings.push({
      type: 'error',
      message: 'Grogs cannot take The Gift'
    });
  }

  // Check for maximum number of Minor Flaws
  const minorFlaws = virtuesFlaws.filter(vf =>
    !vf.is_house_virtue_flaw &&
    vf.referenceVirtueFlaw.type === 'Flaw' &&
    vf.referenceVirtueFlaw.size === 'Minor'
  );

  if (minorFlaws.length > rules.maxMinorFlaws) {
    warnings.push({
      type: 'error',
      message: `Grogs cannot exceed ${rules.maxMinorFlaws} Minor Flaws`
    });
  }

  // Check for equal number of Minor Virtues and Flaws
  const minorVirtues = virtuesFlaws.filter(vf =>
    !vf.is_house_virtue_flaw &&
    vf.referenceVirtueFlaw.type === 'Virtue' &&
    vf.referenceVirtueFlaw.size === 'Minor'
  ).length;

  if (minorVirtues !== minorFlaws.length) {
    warnings.push({
      type: 'error',
      message: 'Grogs must have equal number of Minor Virtues and Minor Flaws'
    });
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

const validatePointBalance = (virtuesFlaws, rules) => {
  if (!rules.requirePointBalance) {
    return { isValid: true, warnings: [] };
  }

  const nonHouseVirtuesFlaws = virtuesFlaws.filter(vf => !vf.is_house_virtue_flaw);
  
  const virtuePoints = nonHouseVirtuesFlaws
    .filter(vf => vf.referenceVirtueFlaw.type === 'Virtue')
    .reduce((sum, vf) => sum + (vf.referenceVirtueFlaw.size === 'Major' ? 3 : 1), 0);

  const flawPoints = nonHouseVirtuesFlaws
    .filter(vf => vf.referenceVirtueFlaw.type === 'Flaw')
    .reduce((sum, vf) => sum + (vf.referenceVirtueFlaw.size === 'Major' ? 3 : 1), 0);

  const warnings = [];

  if (virtuePoints !== flawPoints) {
    warnings.push({
      type: 'error',
      message: `Virtue points (${virtuePoints}) must be balanced by equal Flaw points (${flawPoints})`
    });
  }

  if (virtuePoints > rules.maxVirtuePoints) {
    warnings.push({
      type: 'error',
      message: `Cannot exceed ${rules.maxVirtuePoints} points of Virtues`
    });
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

const validateCharacterTypeRestrictions = (virtuesFlaws, rules) => {
  const warnings = [];

  virtuesFlaws.forEach(vf => {
    if (vf.is_house_virtue_flaw) {
      return;
    }

    const { allowed_character_types } = vf.referenceVirtueFlaw;
    if (allowed_character_types && !allowed_character_types.includes(rules.characterType)) {
      warnings.push({
        type: 'error',
        message: `${vf.referenceVirtueFlaw.name} is only available to ${allowed_character_types.join(', ')} characters`
      });
    }
  });

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

const validateSocialStatus = (virtuesFlaws, rules) => {
  if (!rules.requireSocialStatus) {
    return { isValid: true, warnings: [] };
  }

  const socialStatusIndicators = virtuesFlaws.filter(vf =>
    vf.referenceVirtueFlaw.category === 'Social Status'
  );

  if (socialStatusIndicators.length !== 1) {
    return {
      isValid: false,
      warnings: [{
        type: 'error',
        message: 'Character must have exactly one Social Status (either as a Virtue, Free Status, or Flaw)'
      }]
    };
  }

  return { isValid: true, warnings: [] };
};

const validateIncompatibilities = (virtuesFlaws, rules) => {
  const warnings = [];

  virtuesFlaws.forEach(vf => {
    if (vf.is_house_virtue_flaw) {
      return;
    }

    const { incompatibilities } = vf.referenceVirtueFlaw;
    if (!incompatibilities) {
      return;
    }

    incompatibilities.forEach(incompatibleName => {
      const hasIncompatible = virtuesFlaws.some(other =>
        !other.is_house_virtue_flaw &&
        other !== vf &&
        other.referenceVirtueFlaw.name === incompatibleName
      );

      if (hasIncompatible) {
        warnings.push({
          type: 'error',
          message: `Incompatible combination: ${vf.referenceVirtueFlaw.name} cannot be taken with ${incompatibleName}`
        });
      }
    });
  });

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

const validatePrerequisites = (virtuesFlaws, rules) => {
  const warnings = [];

  virtuesFlaws.forEach(vf => {
    if (vf.is_house_virtue_flaw) {
      return;
    }

    const { prerequisites } = vf.referenceVirtueFlaw;
    if (!prerequisites) {
      return;
    }

    const missingPrerequisites = prerequisites.filter(prereq =>
      !virtuesFlaws.some(other =>
        !other.is_house_virtue_flaw &&
        other !== vf &&
        other.referenceVirtueFlaw.name === prereq
      )
    );

    if (missingPrerequisites.length > 0) {
      missingPrerequisites.forEach(prereq => {
        warnings.push({
          type: 'error',
          message: `${vf.referenceVirtueFlaw.name} requires prerequisite: ${prereq}`
        });
      });
    }
  });

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

const validateMajorHermeticVirtues = (virtuesFlaws, rules) => {
  const warnings = [];

  const majorHermeticVirtues = virtuesFlaws.filter(vf =>
    !vf.is_house_virtue_flaw &&
    vf.referenceVirtueFlaw.type === 'Virtue' &&
    vf.referenceVirtueFlaw.size === 'Major' &&
    vf.referenceVirtueFlaw.category === 'Hermetic'
  );

  if (majorHermeticVirtues.length > rules.maxMajorHermeticVirtues) {
    warnings.push({
      type: 'error',
      message: 'Cannot exceed 1 Major Hermetic Virtue'
    });
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

const validateStoryFlaws = (virtuesFlaws, rules) => {
  const warnings = [];

  const storyFlaws = virtuesFlaws.filter(vf =>
    !vf.is_house_virtue_flaw &&
    vf.referenceVirtueFlaw.type === 'Flaw' &&
    vf.referenceVirtueFlaw.category === 'Story'
  );

  if (storyFlaws.length > rules.maxStoryFlaws) {
    warnings.push({
      type: 'error',
      message: 'Cannot have more than one Story Flaw'
    });
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

const validatePersonalityFlaws = (virtuesFlaws, rules) => {
  const warnings = [];

  const personalityFlaws = virtuesFlaws.filter(vf =>
    !vf.is_house_virtue_flaw &&
    vf.referenceVirtueFlaw.type === 'Flaw' &&
    vf.referenceVirtueFlaw.category === 'Personality'
  );

  if (personalityFlaws.length > rules.maxPersonalityFlaws) {
    warnings.push({
      type: 'error',
      message: 'Cannot have more than three Personality Flaws'
    });
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

const validateHermeticVirtues = (virtuesFlaws, rules) => {
  const warnings = [];

  const hasGift = virtuesFlaws.some(vf =>
    !vf.is_house_virtue_flaw &&
    vf.referenceVirtueFlaw.category === 'The Gift' &&
    vf.referenceVirtueFlaw.name === 'The Gift'
  );

  const hasHermeticVirtues = virtuesFlaws.some(vf =>
    !vf.is_house_virtue_flaw &&
    vf.referenceVirtueFlaw.category === 'Hermetic'
  );

  if (hasHermeticVirtues && !hasGift) {
    warnings.push({
      type: 'error',
      message: 'Cannot take Hermetic Virtues without The Gift'
    });
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

const validateMultipleInstances = (virtuesFlaws, rules) => {
  const warnings = [];
  const nonHouseVirtuesFlaws = virtuesFlaws.filter(vf => !vf.is_house_virtue_flaw);

  // Group non-house virtues/flaws by name
  const groupedByName = nonHouseVirtuesFlaws.reduce((acc, vf) => {
    const name = vf.referenceVirtueFlaw.name;
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(vf);
    return acc;
  }, {});

  // Check each group for multiple instances
  Object.entries(groupedByName).forEach(([name, instances]) => {
    // Skip validation for Story Flaws if maxStoryFlaws is overridden
    if (instances[0].referenceVirtueFlaw.category === 'Story' && rules.maxStoryFlaws > 1) {
      return;
    }
    // Skip validation for Personality Flaws if maxPersonalityFlaws is overridden
    if (instances[0].referenceVirtueFlaw.category === 'Personality' && rules.maxPersonalityFlaws > 3) {
      return;
    }

    if (instances.length > 1 && !instances[0].referenceVirtueFlaw.multiple_allowed) {
      warnings.push({
        type: 'error',
        message: `Cannot take multiple instances of ${name}`
      });
    }
  });

  return {
    isValid: warnings.length === 0,
    warnings
  };
}; 