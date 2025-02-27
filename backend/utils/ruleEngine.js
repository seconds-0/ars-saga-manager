const VALID_CHARACTER_TYPES = ['grog', 'companion', 'magus'];

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

module.exports = {
  isValidCharacterType,
  isVirtueFlawEligible,
  VALID_CHARACTER_TYPES
};