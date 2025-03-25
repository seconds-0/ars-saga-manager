const VALID_CHARACTER_TYPES = ['grog', 'companion', 'magus'];
const { calculateExperience } = require('./experienceUtils');

/**
 * Checks if a character type is valid
 * @param {string} characterType - The character type to validate
 * @returns {boolean} - Whether the character type is valid
 */
function isValidCharacterType(characterType) {
  if (!characterType) return false;
  return VALID_CHARACTER_TYPES.includes(characterType.toLowerCase());
}

/**
 * Validates age value
 * @param {number} age - The age to validate
 * @returns {boolean} - Whether the age is valid
 */
function isValidAge(age) {
  if (typeof age !== 'number') return false;
  return age >= 5 && age <= 1000;
}

/**
 * Checks if a character is eligible for a virtue or flaw
 * @param {Object} character - The character model instance
 * @param {Object} virtueFlaw - The virtue or flaw reference model instance
 * @returns {boolean} - Whether the character is eligible for the virtue/flaw
 */
function isVirtueFlawEligible(character, virtueFlaw) {
  // Currently allow all virtues and flaws
  // This function will be expanded in the future to handle prerequisites,
  // incompatibilities, character type restrictions, etc.
  console.log('Checking eligibility for virtue/flaw:', virtueFlaw.name);
  console.log('Character type:', character.character_type);
  
  // Check prerequisites if they exist
  if (virtueFlaw.prerequisites) {
    try {
      const prereqs = JSON.parse(virtueFlaw.prerequisites);
      if (prereqs.characterType && prereqs.characterType.length > 0) {
        if (!prereqs.characterType.includes(character.character_type.toLowerCase())) {
          return false;
        }
      }
    } catch (err) {
      console.error('Error parsing prerequisites:', err);
      // If we can't parse the prerequisites, assume the character is eligible
    }
  }
  
  return true;
}

/**
 * Recalculates all experience pools for a character based on age and virtues/flaws
 * @param {Object} character - The character model instance
 * @param {Array} virtuesFlaws - Array of character virtues and flaws
 * @returns {Object} - Character with updated experience pools
 */
async function recalculateCharacterExperience(character, virtuesFlaws) {
  if (!character) {
    throw new Error('Character is required');
  }
  
  // If virtuesFlaws not provided, fetch them
  if (!virtuesFlaws) {
    // You would normally fetch virtuesFlaws here, but we'll skip that for now
    // as it requires database access and we're just defining the function
    virtuesFlaws = [];
  }

  // Calculate experience
  const experiencePools = calculateExperience(character, virtuesFlaws);
  
  // Apply to character
  for (const [key, value] of Object.entries(experiencePools)) {
    character[key] = value;
  }
  
  return character;
}

module.exports = {
  isValidCharacterType,
  isValidAge,
  isVirtueFlawEligible,
  recalculateCharacterExperience,
  VALID_CHARACTER_TYPES
};
