'use strict';

/**
 * Calculate a character's experience points based on age and virtues/flaws
 * 
 * @param {Object} character - Character model instance
 * @param {Array} allVirtuesFlaws - Array of Character's virtues and flaws with their reference data
 * @returns {Object} Experience calculation result
 */
const calculateCharacterExperience = (character, allVirtuesFlaws) => {
  // Default yearly rate is 15
  let yearlyRate = 15;
  
  // Variables to track various experience modifiers
  let flatGeneralBonus = 0;
  let magicalExpTotal = 0;
  const restrictedPoolsArray = [];
  
  // Calculate modifiers from virtues and flaws
  allVirtuesFlaws.forEach(vf => {
    const refVF = vf.ReferenceVirtueFlaw || vf.referenceVirtueFlaw;
    
    // Skip if reference data is missing
    if (!refVF) return;
    
    // Adjust yearly rate
    if (refVF.exp_rate_modifier) {
      yearlyRate += refVF.exp_rate_modifier;
    }
    
    // Add magical experience (only relevant for magi)
    if (refVF.magical_exp_modifier) {
      magicalExpTotal += refVF.magical_exp_modifier;
    }
    
    // Handle general experience modifiers
    if (refVF.general_exp_modifier) {
      // If no category, this is an unrestricted bonus
      if (!refVF.general_exp_modifier_category) {
        flatGeneralBonus += refVF.general_exp_modifier;
      } else {
        // This is restricted experience - parse the category
        let restrictionType, restrictionValue;
        
        // Parse the category string to determine restriction type and value
        if (refVF.general_exp_modifier_category.startsWith('[') && 
            refVF.general_exp_modifier_category.endsWith(']')) {
          // This is a list of specific abilities
          restrictionType = 'ability_list';
          try {
            restrictionValue = JSON.parse(refVF.general_exp_modifier_category);
          } catch (e) {
            // If parsing fails, treat as string
            restrictionType = 'ability_name';
            restrictionValue = refVF.general_exp_modifier_category;
          }
        } else {
          // This is either a category or single ability name
          // For simplicity in V1, we'll distinguish based on common categories
          const commonCategories = ['Academic', 'Arcane', 'Martial', 'Social', 'General'];
          if (commonCategories.includes(refVF.general_exp_modifier_category)) {
            restrictionType = 'category';
            restrictionValue = refVF.general_exp_modifier_category;
          } else {
            restrictionType = 'ability_name';
            restrictionValue = refVF.general_exp_modifier_category;
          }
        }
        
        // Add to restricted pools
        restrictedPoolsArray.push({
          source_virtue_flaw: refVF.name,
          amount: refVF.general_exp_modifier,
          restrictions: { type: restrictionType, value: restrictionValue },
          spent: 0
        });
      }
    }
  });
  
  // Calculate base general experience (45 + yearly rate for each year after 5)
  const baseGeneralExp = 45 + Math.max(0, character.age - 5) * yearlyRate;
  
  // Calculate magical experience for magi (240 base)
  const isMagus = character.character_type && character.character_type.toLowerCase() === 'magus';
  if (isMagus) {
    magicalExpTotal += 240; // Base magical XP for magi
  }
  
  return {
    general_exp_available: baseGeneralExp + flatGeneralBonus,
    magical_exp_available: magicalExpTotal,
    restricted_exp_pools: restrictedPoolsArray
  };
};

/**
 * Recalculate and update a character's experience pools
 * 
 * @param {number} characterId - Character ID
 * @param {Object} models - Sequelize models
 * @returns {Promise<Object>} Updated character with experience fields
 */
const recalculateAndUpdateExp = async (characterId, models) => {
  const { Character, CharacterVirtueFlaw, ReferenceVirtueFlaw } = models;
  
  // Fetch character and all their virtues/flaws
  const character = await Character.findByPk(characterId);
  if (!character) {
    throw new Error(`Character with ID ${characterId} not found`);
  }
  
  const characterVFs = await CharacterVirtueFlaw.findAll({
    where: { character_id: characterId },
    include: [{
      model: ReferenceVirtueFlaw,
      as: 'ReferenceVirtueFlaw'
    }]
  });
  
  // Calculate experience
  const expValues = calculateCharacterExperience(character, characterVFs);
  
  // Update character
  await character.update(expValues);
  
  return character;
};

module.exports = {
  calculateCharacterExperience,
  recalculateAndUpdateExp
};