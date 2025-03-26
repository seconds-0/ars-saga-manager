const {
  calculateXPForLevel,
  calculateLevelFromXP,
  xpForNextLevel,
  initializeAbilitiesForCharacterType,
  isAbilityAppropriateForCharacterType,
  applyVirtueEffects
} = require('../utils/abilityUtils');

describe('Ability Utilities', () => {
  describe('XP Calculations', () => {
    test('calculateXPForLevel calculates correct XP for levels 0-5', () => {
      expect(calculateXPForLevel(0)).toBe(0);
      expect(calculateXPForLevel(1)).toBe(5);
      expect(calculateXPForLevel(2)).toBe(15);
      expect(calculateXPForLevel(3)).toBe(30);
      expect(calculateXPForLevel(4)).toBe(50);
      expect(calculateXPForLevel(5)).toBe(75);
    });

    test('calculateXPForLevel handles higher levels correctly', () => {
      expect(calculateXPForLevel(6)).toBe(105);
      expect(calculateXPForLevel(7)).toBe(140);
      expect(calculateXPForLevel(8)).toBe(180);
    });

    test('calculateLevelFromXP determines correct level for XP values', () => {
      expect(calculateLevelFromXP(0)).toBe(0);
      expect(calculateLevelFromXP(5)).toBe(1);
      expect(calculateLevelFromXP(14)).toBe(1);
      expect(calculateLevelFromXP(15)).toBe(2);
      expect(calculateLevelFromXP(29)).toBe(2);
      expect(calculateLevelFromXP(30)).toBe(3);
      expect(calculateLevelFromXP(75)).toBe(5);
    });

    test('xpForNextLevel returns correct XP increment', () => {
      expect(xpForNextLevel(0)).toBe(5);
      expect(xpForNextLevel(1)).toBe(10);
      expect(xpForNextLevel(2)).toBe(15);
      expect(xpForNextLevel(3)).toBe(20);
      expect(xpForNextLevel(4)).toBe(25);
      expect(xpForNextLevel(5)).toBe(30);
    });
  });

  describe('Character Type Abilities', () => {
    test('initializeAbilitiesForCharacterType creates correct abilities for Magus', () => {
      const magusAbilities = initializeAbilitiesForCharacterType('magus');
      
      expect(magusAbilities).toHaveLength(4);
      
      // Check for Latin 4
      const latin = magusAbilities.find(a => a.ability_name === 'Latin');
      expect(latin).toBeTruthy();
      expect(latin.score).toBe(4);
      expect(latin.category).toBe('ACADEMIC');
      
      // Check for Magic Theory 3
      const magicTheory = magusAbilities.find(a => a.ability_name === 'Magic Theory');
      expect(magicTheory).toBeTruthy();
      expect(magicTheory.score).toBe(3);
      expect(magicTheory.category).toBe('ARCANE');
      
      // Check for Parma Magica 1
      const parma = magusAbilities.find(a => a.ability_name === 'Parma Magica');
      expect(parma).toBeTruthy();
      expect(parma.score).toBe(1);
      expect(parma.category).toBe('ARCANE');
      
      // Check for Artes Liberales 1
      const artes = magusAbilities.find(a => a.ability_name === 'Artes Liberales');
      expect(artes).toBeTruthy();
      expect(artes.score).toBe(1);
      expect(artes.category).toBe('ACADEMIC');
    });

    test('initializeAbilitiesForCharacterType creates empty array for Companion', () => {
      const companionAbilities = initializeAbilitiesForCharacterType('companion');
      expect(companionAbilities).toEqual([]);
    });

    test('initializeAbilitiesForCharacterType creates empty array for Grog', () => {
      const grogAbilities = initializeAbilitiesForCharacterType('grog');
      expect(grogAbilities).toEqual([]);
    });

    test('initializeAbilitiesForCharacterType throws error for invalid character type', () => {
      expect(() => {
        initializeAbilitiesForCharacterType('invalid');
      }).toThrow(/Invalid character type/);
    });
  });

  describe('Ability Appropriateness', () => {
    test('Parma Magica is only appropriate for Magi', () => {
      expect(isAbilityAppropriateForCharacterType('Parma Magica', 'ARCANE', 'magus')).toBe(true);
      expect(isAbilityAppropriateForCharacterType('Parma Magica', 'ARCANE', 'companion')).toBe(false);
      expect(isAbilityAppropriateForCharacterType('Parma Magica', 'ARCANE', 'grog')).toBe(false);
    });

    test('Arcane abilities are mostly restricted for Grogs', () => {
      expect(isAbilityAppropriateForCharacterType('Magic Theory', 'ARCANE', 'grog')).toBe(false);
      expect(isAbilityAppropriateForCharacterType('Magic Sensitivity', 'ARCANE', 'grog')).toBe(true);
      expect(isAbilityAppropriateForCharacterType('Second Sight', 'ARCANE', 'grog')).toBe(true);
    });

    test('Supernatural abilities are restricted for Grogs', () => {
      expect(isAbilityAppropriateForCharacterType('Dowsing', 'SUPERNATURAL', 'grog')).toBe(false);
      expect(isAbilityAppropriateForCharacterType('Dowsing', 'SUPERNATURAL', 'companion')).toBe(true);
      expect(isAbilityAppropriateForCharacterType('Dowsing', 'SUPERNATURAL', 'magus')).toBe(true);
    });

    test('Advanced academic abilities are restricted for Grogs', () => {
      expect(isAbilityAppropriateForCharacterType('Artes Liberales', 'ACADEMIC', 'grog')).toBe(false);
      expect(isAbilityAppropriateForCharacterType('English', 'ACADEMIC', 'grog')).toBe(true);
    });
  });

  describe('Virtue Effects', () => {
    test('Puissant virtue adds +2 to effective ability score', () => {
      const virtues = [
        { virtue_name: 'Puissant (Ability)', specification: 'Awareness' }
      ];
      
      const result = applyVirtueEffects(3, 30, virtues, 'Awareness');
      expect(result.score).toBe(5);
      expect(result.xp).toBe(30);
    });

    test('Affinity virtue does not modify XP in display calculations', () => {
      const virtues = [
        { virtue_name: 'Affinity with (Ability)', specification: 'Athletics' }
      ];
      
      const result = applyVirtueEffects(3, 30, virtues, 'Athletics');
      expect(result.score).toBe(3);
      expect(result.xp).toBe(30);
    });

    test('No effect when ability does not match virtue specification', () => {
      const virtues = [
        { virtue_name: 'Puissant (Ability)', specification: 'Awareness' }
      ];
      
      const result = applyVirtueEffects(3, 30, virtues, 'Athletics');
      expect(result.score).toBe(3);
      expect(result.xp).toBe(30);
    });

    test('Multiple virtues work correctly together', () => {
      const virtues = [
        { virtue_name: 'Puissant (Ability)', specification: 'Awareness' },
        { virtue_name: 'Affinity with (Ability)', specification: 'Awareness' }
      ];
      
      const result = applyVirtueEffects(3, 30, virtues, 'Awareness');
      expect(result.score).toBe(5);
      expect(result.xp).toBe(30);
    });

    test('Handles empty or null virtues array', () => {
      expect(applyVirtueEffects(3, 30, [], 'Athletics')).toEqual({ score: 3, xp: 30 });
      expect(applyVirtueEffects(3, 30, null, 'Athletics')).toEqual({ score: 3, xp: 30 });
    });
  });
});