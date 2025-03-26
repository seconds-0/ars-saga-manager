/**
 * Normalizes character type case and validates it
 * @param {string} characterType - The character type to normalize
 * @returns {string} The normalized character type
 * @throws {Error} If the character type is invalid
 */
// Function is not used directly but may be useful in future
export const normalizeCharacterType = (characterType) => {
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

  // Pre-compute filtered lists to avoid repeated filtering operations
  const nonHouseVirtuesFlaws = virtuesFlaws.filter(vf => !vf.is_house_virtue_flaw);
  const minorFlaws = nonHouseVirtuesFlaws.filter(vf => 
    vf.referenceVirtueFlaw.type === 'Flaw' && 
    vf.referenceVirtueFlaw.size === 'Minor'
  );
  const minorVirtues = nonHouseVirtuesFlaws.filter(vf => 
    vf.referenceVirtueFlaw.type === 'Virtue' && 
    vf.referenceVirtueFlaw.size === 'Minor'
  );
  const majorVirtuesFlaws = nonHouseVirtuesFlaws.filter(vf => 
    vf.referenceVirtueFlaw.size === 'Major'
  );
  const storyFlaws = nonHouseVirtuesFlaws.filter(vf => 
    vf.referenceVirtueFlaw.type === 'Flaw' && 
    vf.referenceVirtueFlaw.category === 'Story'
  );
  const personalityFlaws = nonHouseVirtuesFlaws.filter(vf => 
    vf.referenceVirtueFlaw.type === 'Flaw' && 
    vf.referenceVirtueFlaw.category === 'Personality'
  );
  const majorHermeticVirtues = nonHouseVirtuesFlaws.filter(vf => 
    vf.referenceVirtueFlaw.type === 'Virtue' && 
    vf.referenceVirtueFlaw.size === 'Major' && 
    vf.referenceVirtueFlaw.category === 'Hermetic'
  );
  const socialStatusIndicators = virtuesFlaws.filter(vf => 
    vf.referenceVirtueFlaw.category === 'Social Status'
  );
  const hasGift = nonHouseVirtuesFlaws.some(vf => 
    vf.referenceVirtueFlaw.category === 'The Gift' && 
    vf.referenceVirtueFlaw.name === 'The Gift'
  );
  
  // Pre-compute points for virtue/flaw balance
  const virtuePoints = nonHouseVirtuesFlaws
    .filter(vf => vf.referenceVirtueFlaw.type === 'Virtue')
    .reduce((sum, vf) => sum + (vf.referenceVirtueFlaw.size === 'Major' ? 3 : 1), 0);

  const flawPoints = nonHouseVirtuesFlaws
    .filter(vf => vf.referenceVirtueFlaw.type === 'Flaw')
    .reduce((sum, vf) => sum + (vf.referenceVirtueFlaw.size === 'Major' ? 3 : 1), 0);

  // Initialize warnings array with specific sources
  const warnings = [];

  // Run all validation checks and collect warnings
  
  // 1. Character type restrictions
  if (rules.checkCharacterTypeRestrictions) {
    virtuesFlaws.forEach(vf => {
      if (vf.is_house_virtue_flaw) return;

      const { allowed_character_types } = vf.referenceVirtueFlaw;
      if (allowed_character_types && !allowed_character_types.includes(rules.characterType)) {
        warnings.push({
          type: 'error',
          message: `${vf.referenceVirtueFlaw.name} is only available to ${allowed_character_types.join(', ')} characters`,
          source: 'character_type',
          target: vf.referenceVirtueFlaw.name,
          id: vf.id
        });
      }
    });
  }

  // 2. Multiple instances check
  const virtuePluralCounts = {};
  nonHouseVirtuesFlaws.forEach(vf => {
    const name = vf.referenceVirtueFlaw.name;
    virtuePluralCounts[name] = (virtuePluralCounts[name] || 0) + 1;
  });

  Object.entries(virtuePluralCounts).forEach(([name, count]) => {
    if (count > 1) {
      const virtueFlaw = nonHouseVirtuesFlaws.find(vf => vf.referenceVirtueFlaw.name === name);
      // Added check for null/undefined virtueFlaw
      if (virtueFlaw && !virtueFlaw.referenceVirtueFlaw.multiple_allowed) {
        warnings.push({
          type: 'error',
          message: `Cannot take multiple instances of ${name}`,
          source: 'multiple_instances',
          target: name,
          ids: nonHouseVirtuesFlaws
            .filter(vf => vf.referenceVirtueFlaw.name === name)
            .map(vf => vf.id)
        });
      }
    }
  });

  // 3. Hermetic Virtues without The Gift
  const hasHermeticVirtues = nonHouseVirtuesFlaws.some(vf => vf.referenceVirtueFlaw.category === 'Hermetic');
  if (hasHermeticVirtues && !hasGift) {
    warnings.push({
      type: 'error',
      message: 'Cannot take Hermetic Virtues without The Gift',
      source: 'hermetic_requires_gift',
      targets: nonHouseVirtuesFlaws
        .filter(vf => vf.referenceVirtueFlaw.category === 'Hermetic')
        .map(vf => vf.referenceVirtueFlaw.name)
    });
  }

  // 4. Minor Flaws limit
  if (minorFlaws.length > rules.maxMinorFlaws) {
    warnings.push({
      type: 'error',
      message: rules.characterType === 'grog'
        ? `Grogs cannot exceed ${rules.maxMinorFlaws} Minor Flaws`
        : `Cannot exceed ${rules.maxMinorFlaws} Minor Flaws`,
      source: 'minor_flaws_limit',
      count: minorFlaws.length,
      max: rules.maxMinorFlaws
    });
  }

  // 5. Grog-specific restrictions
  if (rules.characterType === 'grog') {
    // Check for Major Virtues/Flaws if not allowed
    if (!rules.allowMajorVirtuesFlaws && majorVirtuesFlaws.length > 0) {
      warnings.push({
        type: 'error',
        message: 'Grogs cannot take Major Virtues or Flaws',
        source: 'grog_major',
        targets: majorVirtuesFlaws.map(vf => vf.referenceVirtueFlaw.name)
      });
    }

    // Check for The Gift (this restriction cannot be overridden)
    if (hasGift && !rules.allowTheGift) {
      warnings.push({
        type: 'error',
        message: 'Grogs cannot take The Gift',
        source: 'grog_gift'
      });
    }

    // Check for equal number of Minor Virtues and Flaws if required
    if (rules.requireEqualMinorVirtuesFlaws && minorVirtues.length !== minorFlaws.length) {
      warnings.push({
        type: 'error',
        message: 'Grogs must have equal number of Minor Virtues and Minor Flaws',
        source: 'grog_equal_minor',
        virtueCount: minorVirtues.length,
        flawCount: minorFlaws.length
      });
    }
  }

  // 6. Point balance
  if (rules.requirePointBalance) {
    if (virtuePoints !== flawPoints) {
      warnings.push({
        type: 'error',
        message: `Virtue points (${virtuePoints}) must be balanced by equal Flaw points (${flawPoints})`,
        source: 'point_balance',
        virtuePoints,
        flawPoints
      });
    }

    // Check for maximum virtue points
    if (virtuePoints > rules.maxVirtuePoints) {
      warnings.push({
        type: 'error',
        message: `Cannot exceed ${rules.maxVirtuePoints} points of Virtues`,
        source: 'max_virtue_points',
        virtuePoints,
        maxPoints: rules.maxVirtuePoints
      });
    }
  }

  // 7. Social status
  if (rules.requireSocialStatus && socialStatusIndicators.length !== 1) {
    warnings.push({
      type: 'error',
      message: 'Character must have exactly one Social Status (either as a Virtue, Free Status, or Flaw)',
      source: 'social_status',
      count: socialStatusIndicators.length
    });
  }

  // 8. Incompatibilities
  if (rules.checkIncompatibilities) {
    const incompatibilityChecked = new Set();
    
    nonHouseVirtuesFlaws.forEach(vf => {
      const incompatibilities = vf.referenceVirtueFlaw.incompatibilities;
      if (!incompatibilities) return;
      
      incompatibilities.forEach(incompName => {
        // Create a unique key for this incompatibility pair to avoid duplicate warnings
        const pairKey = [vf.referenceVirtueFlaw.name, incompName].sort().join('|');
        if (incompatibilityChecked.has(pairKey)) return;
        incompatibilityChecked.add(pairKey);
        
        const hasIncompatible = nonHouseVirtuesFlaws.some(other => 
          other !== vf && other.referenceVirtueFlaw.name === incompName
        );
        
        if (hasIncompatible) {
          warnings.push({
            type: 'error',
            message: `Incompatible combination: ${vf.referenceVirtueFlaw.name} cannot be taken with ${incompName}`,
            source: 'incompatibility',
            items: [vf.referenceVirtueFlaw.name, incompName]
          });
        }
      });
    });
  }

  // 9. Prerequisites
  if (rules.checkPrerequisites) {
    nonHouseVirtuesFlaws.forEach(vf => {
      const { prerequisites } = vf.referenceVirtueFlaw;
      if (!prerequisites) return;
      
      // Handle both array and object formats for prerequisites
      if (Array.isArray(prerequisites)) {
        // If prerequisites is an array, filter as before
        const missingPrerequisites = prerequisites.filter(prereq =>
          !nonHouseVirtuesFlaws.some(other =>
            !other.is_house_virtue_flaw &&
            other !== vf &&
            other.referenceVirtueFlaw.name === prereq
          )
        );
        
        if (missingPrerequisites.length > 0) {
          warnings.push({
            type: 'error',
            message: `${vf.referenceVirtueFlaw.name} requires prerequisite: ${missingPrerequisites.join(', ')}`,
            source: 'prerequisites',
            target: vf.referenceVirtueFlaw.name,
            missing: missingPrerequisites,
            id: vf.id
          });
        }
      } else if (typeof prerequisites === 'object' && prerequisites !== null) {
        // If prerequisites is an object, handle appropriately based on your data structure
        // Example: If prerequisites contains an array of prerequisite names
        if (prerequisites.virtues && Array.isArray(prerequisites.virtues)) {
          const missingPrerequisites = prerequisites.virtues.filter(prereq =>
            !nonHouseVirtuesFlaws.some(other =>
              !other.is_house_virtue_flaw &&
              other !== vf &&
              other.referenceVirtueFlaw.name === prereq
            )
          );
          
          if (missingPrerequisites.length > 0) {
            warnings.push({
              type: 'error',
              message: `${vf.referenceVirtueFlaw.name} requires virtue prerequisite: ${missingPrerequisites.join(', ')}`,
              source: 'prerequisites',
              target: vf.referenceVirtueFlaw.name,
              missing: missingPrerequisites,
              id: vf.id
            });
          }
        }
      }
    });
  }

  // 10. Story Flaws
  if (storyFlaws.length > rules.maxStoryFlaws) {
    warnings.push({
      type: 'error',
      message: 'Cannot have more than one Story Flaw',
      source: 'story_flaws',
      count: storyFlaws.length,
      max: rules.maxStoryFlaws
    });
  }

  // 11. Personality Flaws
  if (personalityFlaws.length > rules.maxPersonalityFlaws) {
    warnings.push({
      type: 'error',
      message: 'Cannot have more than three Personality Flaws',
      source: 'personality_flaws',
      count: personalityFlaws.length,
      max: rules.maxPersonalityFlaws
    });
  }

  // 12. Major Hermetic Virtues
  if (majorHermeticVirtues.length > rules.maxMajorHermeticVirtues) {
    warnings.push({
      type: 'error',
      message: 'Cannot exceed 1 Major Hermetic Virtue',
      source: 'major_hermetic',
      count: majorHermeticVirtues.length,
      max: rules.maxMajorHermeticVirtues
    });
  }
  
  // 13. Missing Specifications
  virtuesFlaws.forEach(vf => {
    // Skip if not a virtue/flaw that requires specification
    if (!vf.referenceVirtueFlaw?.requires_specification) {
      return;
    }
    
    // Check if selections are missing or empty
    if (!vf.selections || 
        Object.keys(vf.selections).length === 0 || 
        !vf.selections[vf.referenceVirtueFlaw.specification_type]) {
      warnings.push({
        type: 'warning', // Make this a warning instead of error initially
        message: `${vf.referenceVirtueFlaw.name} requires a ${vf.referenceVirtueFlaw.specification_type} selection`,
        source: 'missing_specification',
        target: vf.referenceVirtueFlaw.name,
        id: vf.id,
        specification_type: vf.referenceVirtueFlaw.specification_type
      });
    }
  });

  return {
    isValid: warnings.length === 0,
    warnings,
    // Include calculated values for reuse
    stats: {
      virtuePoints,
      flawPoints,
      minorVirtues: minorVirtues.length,
      minorFlaws: minorFlaws.length,
      majorVirtues: majorVirtuesFlaws.filter(vf => vf.referenceVirtueFlaw.type === 'Virtue').length,
      majorFlaws: majorVirtuesFlaws.filter(vf => vf.referenceVirtueFlaw.type === 'Flaw').length,
      storyFlaws: storyFlaws.length,
      personalityFlaws: personalityFlaws.length,
      hasGift
    }
  };
};

// Export these utility functions for potential reuse
export const validateGrogRestrictions = (virtuesFlaws, rules) => {
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

export const validatePointBalance = (virtuesFlaws, rules) => {
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

export const validateCharacterTypeRestrictions = (virtuesFlaws, rules) => {
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

export const validateSocialStatus = (virtuesFlaws, rules) => {
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

export const validateIncompatibilities = (virtuesFlaws, rules) => {
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

export const validatePrerequisites = (virtuesFlaws, rules) => {
  const warnings = [];

  virtuesFlaws.forEach(vf => {
    if (vf.is_house_virtue_flaw) {
      return;
    }

    const { prerequisites } = vf.referenceVirtueFlaw;
    if (!prerequisites) {
      return;
    }

    // Handle both array and object formats for prerequisites
    if (Array.isArray(prerequisites)) {
      // If prerequisites is an array, filter as before
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
    } else if (typeof prerequisites === 'object' && prerequisites !== null) {
      // If prerequisites is an object, handle appropriately based on your data structure
      // Example: If prerequisites contains an array of prerequisite names
      if (prerequisites.virtues && Array.isArray(prerequisites.virtues)) {
        const missingPrerequisites = prerequisites.virtues.filter(prereq =>
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
              message: `${vf.referenceVirtueFlaw.name} requires virtue prerequisite: ${prereq}`
            });
          });
        }
      }
    }
  });

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

export const validateMajorHermeticVirtues = (virtuesFlaws, rules) => {
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

export const validateStoryFlaws = (virtuesFlaws, rules) => {
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

export const validatePersonalityFlaws = (virtuesFlaws, rules) => {
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

export const validateHermeticVirtues = (virtuesFlaws, rules) => {
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

export const validateMultipleInstances = (virtuesFlaws, rules) => {
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