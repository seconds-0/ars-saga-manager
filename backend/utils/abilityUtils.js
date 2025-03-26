'use strict';

/**
 * Calculates the experience points needed to reach a specific ability level
 * @param {number} level - The target ability level
 * @returns {number} - The experience points required
 */
const calculateXPForLevel = (level) => {
  if (level <= 0) return 0;
  
  let xp = 0;
  let increment = 5;
  
  for (let i = 1; i <= level; i++) {
    xp += increment;
    increment += 5;
  }
  
  return xp;
};

/**
 * Calculates the ability level for a given amount of experience points
 * @param {number} xp - The experience points
 * @returns {number} - The ability level
 */
const calculateLevelFromXP = (xp) => {
  if (xp < 5) return 0;
  
  let totalXP = 0;
  let level = 0;
  let increment = 5;
  
  while (totalXP <= xp) {
    level++;
    totalXP += increment;
    increment += 5;
    
    // If we've exceeded the XP, we need to go back one level
    if (totalXP > xp) {
      level--;
      break;
    }
  }
  
  return level;
};

/**
 * Calculates the experience points needed for the next level
 * @param {number} currentLevel - The current ability level
 * @returns {number} - The experience points needed for the next level
 */
const xpForNextLevel = (currentLevel) => {
  return 5 + (currentLevel * 5);
};

/**
 * Initializes abilities for a new character based on character type
 * @param {string} characterType - The type of character (magus, companion, grog)
 * @returns {Array} - Array of ability objects to be created
 */
const initializeAbilitiesForCharacterType = (characterType) => {
  const now = new Date();
  const abilities = [];
  
  // Common abilities for all character types can be added here
  
  switch (characterType.toLowerCase()) {
    case 'magus':
      // Magi start with specific abilities
      abilities.push({
        ability_name: 'Latin',
        score: 4,
        category: 'ACADEMIC',
        experience_points: calculateXPForLevel(4),
        created_at: now,
        updated_at: now
      });
      
      abilities.push({
        ability_name: 'Magic Theory',
        score: 3,
        category: 'ARCANE',
        experience_points: calculateXPForLevel(3),
        created_at: now,
        updated_at: now
      });
      
      abilities.push({
        ability_name: 'Parma Magica',
        score: 1,
        category: 'ARCANE',
        experience_points: calculateXPForLevel(1),
        created_at: now,
        updated_at: now
      });
      
      abilities.push({
        ability_name: 'Artes Liberales',
        score: 1,
        category: 'ACADEMIC',
        experience_points: calculateXPForLevel(1),
        created_at: now,
        updated_at: now
      });
      break;
      
    case 'companion':
      // Companions don't have any required starting abilities
      break;
      
    case 'grog':
      // Grogs don't have any required starting abilities
      break;
      
    default:
      throw new Error(`Invalid character type: ${characterType}`);
  }
  
  return abilities;
};

/**
 * Checks if an ability is appropriate for a character type
 * @param {string} abilityName - The name of the ability
 * @param {string} abilityCategory - The category of the ability
 * @param {string} characterType - The type of character (magus, companion, grog)
 * @returns {boolean} - Whether the ability is appropriate for the character type
 */
const isAbilityAppropriateForCharacterType = (abilityName, abilityCategory, characterType) => {
  const lowercaseType = characterType.toLowerCase();
  
  // Arcane abilities are restricted
  if (abilityCategory === 'ARCANE') {
    // Only magi can have Parma Magica
    if (abilityName === 'Parma Magica' && lowercaseType !== 'magus') {
      return false;
    }
    
    // Grogs can't have most arcane abilities
    if (lowercaseType === 'grog' && !['Magic Sensitivity', 'Second Sight'].includes(abilityName)) {
      return false;
    }
  }
  
  // Supernatural abilities are restricted for grogs
  if (abilityCategory === 'SUPERNATURAL' && lowercaseType === 'grog') {
    return false;
  }
  
  // Some academic abilities might be restricted for grogs
  if (abilityCategory === 'ACADEMIC' && lowercaseType === 'grog') {
    // Grogs can still have basic languages but not advanced academic abilities
    if (['Artes Liberales', 'Philosophiae', 'Theology'].includes(abilityName)) {
      return false;
    }
  }
  
  return true;
};

/**
 * Applies virtue effects to ability calculations
 * @param {number} score - The base ability score
 * @param {number} xp - The experience points
 * @param {Array} virtues - The character's virtues
 * @param {string} abilityName - The name of the ability
 * @returns {Object} - The modified score and xp
 */
const applyVirtueEffects = (score, xp, virtues, abilityName) => {
  let modifiedScore = score;
  let modifiedXP = xp;
  
  if (!virtues || !Array.isArray(virtues)) {
    return { score: modifiedScore, xp: modifiedXP };
  }
  
  // Check for Puissant virtue
  const puissantVirtue = virtues.find(v => 
    v.virtue_name === 'Puissant (Ability)' && 
    v.specification === abilityName
  );
  
  if (puissantVirtue) {
    // Puissant adds +2 to the effective ability score
    modifiedScore += 2;
  }
  
  // Check for Affinity virtue
  const affinityVirtue = virtues.find(v => 
    v.virtue_name === 'Affinity with (Ability)' && 
    v.specification === abilityName
  );
  
  if (affinityVirtue) {
    // Affinity reduces XP costs (this is handled differently in character advancement)
    // For display purposes, we don't modify the XP here
  }
  
  return { score: modifiedScore, xp: modifiedXP };
};

module.exports = {
  calculateXPForLevel,
  calculateLevelFromXP,
  xpForNextLevel,
  initializeAbilitiesForCharacterType,
  isAbilityAppropriateForCharacterType,
  applyVirtueEffects
};