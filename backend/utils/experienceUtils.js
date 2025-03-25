/**
 * Utility functions for calculating experience based on age, character type, and virtues/flaws
 */

/**
 * Calculate available experience points based on age, character type, and selected virtues/flaws
 * @param {Object} character - The character model instance
 * @param {Array} virtuesFlaws - Array of character virtues and flaws (with referenceVirtueFlaw data)
 * @returns {Object} - Object containing all experience pools
 */
const calculateExperience = (character, virtuesFlaws) => {
  if (!character) {
    throw new Error('Character is required');
  }

  const age = character.age || 25; // Default to 25 if age not provided
  const characterType = character.character_type.toLowerCase();
  const isMagus = characterType === 'magus';

  // Calculate general experience
  let generalExp = 0;
  if (age <= 25) {
    generalExp = 15 * (age - 5);
  } else {
    generalExp = 15 * 20 + 20 * (age - 25); // 15*20=300 + 20 for each year over 25
  }

  // Initialize category-specific experience pools
  const experiencePools = {
    general_exp_available: generalExp,
    magical_exp_available: isMagus ? 240 : 0, // Only magi get magical experience
    martial_exp_available: 0,
    academic_exp_available: 0,
    arcane_exp_available: 0,
    supernatural_exp_available: 0,
    social_exp_available: 0
  };

  // Apply virtues/flaws modifiers
  if (Array.isArray(virtuesFlaws)) {
    virtuesFlaws.forEach(vf => {
      const refVirtueFlaw = vf.referenceVirtueFlaw;
      
      // Skip house virtues/flaws
      if (vf.is_house_virtue_flaw) {
        return;
      }

      // Apply magical experience modifier (for magi only)
      if (isMagus && refVirtueFlaw.magical_exp_modifier) {
        experiencePools.magical_exp_available += refVirtueFlaw.magical_exp_modifier;
      }

      // Apply general experience modifier
      if (refVirtueFlaw.general_exp_modifier) {
        if (refVirtueFlaw.general_exp_modifier_category) {
          // Apply to category-specific pool
          const categoryField = `${refVirtueFlaw.general_exp_modifier_category.toLowerCase()}_exp_available`;
          if (experiencePools[categoryField] !== undefined) {
            experiencePools[categoryField] += refVirtueFlaw.general_exp_modifier;
          }
        } else {
          // Apply to general pool
          experiencePools.general_exp_available += refVirtueFlaw.general_exp_modifier;
        }
      }
    });
  }

  return experiencePools;
};

/**
 * Calculates the experience cost of an ability at a given level
 * @param {number} level - The level of the ability
 * @returns {number} - The experience cost
 */
const calculateAbilityCost = (level) => {
  if (typeof level !== 'number' || level < 0) {
    throw new Error('Level must be a non-negative number');
  }
  
  return 5 * level * (level + 1) / 2;
};

/**
 * Validates if a character has enough experience to spend on abilities
 * @param {Object} character - The character with experience pools
 * @param {Array} abilities - Array of character abilities with their categories and levels
 * @returns {Object} - Validation result with isValid flag and any error messages
 */
const validateExperienceSpending = (character, abilities) => {
  if (!character || !Array.isArray(abilities)) {
    throw new Error('Character and abilities array are required');
  }

  const result = {
    isValid: true,
    errors: []
  };

  // Calculate experience spent in each category
  const spentByCategory = {
    martial: 0,
    academic: 0,
    arcane: 0,
    supernatural: 0,
    social: 0,
    general: 0, // For abilities that don't fit into specific categories
    magical: 0  // For magical abilities (magi only)
  };

  // Calculate experience spent
  abilities.forEach(ability => {
    const cost = calculateAbilityCost(ability.level || 0);
    const category = ability.category?.toLowerCase() || 'general';
    
    if (spentByCategory[category] !== undefined) {
      spentByCategory[category] += cost;
    } else {
      spentByCategory.general += cost;
    }

    // Track magical abilities separately for magi
    if (ability.is_magical) {
      spentByCategory.magical += cost;
    }
  });

  // Check if any category exceeds its available experience pool
  // First try to use category-specific experience, then fall back to general pool
  let totalGeneralExpNeeded = 0;

  Object.keys(spentByCategory).forEach(category => {
    if (category === 'magical') {
      // Magical experience is handled separately
      return;
    }

    const categoryField = `${category}_exp_available`;
    const availableCategoryExp = character[categoryField] || 0;
    
    if (spentByCategory[category] > availableCategoryExp) {
      // Experience in this category exceeds category-specific pool,
      // so the excess must come from the general pool
      totalGeneralExpNeeded += spentByCategory[category] - availableCategoryExp;
    }
  });

  // Check if general experience is sufficient
  if (totalGeneralExpNeeded > character.general_exp_available) {
    result.isValid = false;
    result.errors.push(`Insufficient general experience. Need ${totalGeneralExpNeeded} but only have ${character.general_exp_available}.`);
  }

  // For magi, check magical experience separately
  if (character.character_type.toLowerCase() === 'magus' && 
      spentByCategory.magical > character.magical_exp_available) {
    result.isValid = false;
    result.errors.push(`Insufficient magical experience. Need ${spentByCategory.magical} but only have ${character.magical_exp_available}.`);
  }

  return result;
};

module.exports = {
  calculateExperience,
  calculateAbilityCost,
  validateExperienceSpending
};
