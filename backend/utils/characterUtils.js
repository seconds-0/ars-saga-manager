const calculateDerivedCharacteristics = (character) => {
    // For now, we'll just return the base characteristics
    // In the future, this function will incorporate modifiers and other factors
    return {
      strength: character.strength,
      stamina: character.stamina,
      dexterity: character.dexterity,
      quickness: character.quickness,
      intelligence: character.intelligence,
      presence: character.presence,
      communication: character.communication,
      perception: character.perception,
      useCunning: character.useCunning
    };
  };
  
  const validateCharacteristics = (characteristics) => {
    const validCharacteristics = ['strength', 'stamina', 'dexterity', 'quickness', 'intelligence', 'presence', 'communication', 'perception'];
    
    for (const char of validCharacteristics) {
      if (characteristics[char] === undefined) {
        return `Missing ${char} characteristic`;
      }
      if (characteristics[char] < -3 || characteristics[char] > 3) {
        return `${char} must be between -3 and +3`;
      }
    }
    
    return null;
  };
  
  module.exports = {
    calculateDerivedCharacteristics,
    validateCharacteristics
  };