'use strict';

const { calculateCharacterExperience } = require('../utils/experienceUtils');

describe('Experience Utilities', () => {
  describe('calculateCharacterExperience', () => {
    test('calculates base experience for a character with no virtues/flaws', () => {
      // Arrange
      const character = {
        age: 20,
        character_type: 'companion'
      };
      const virtuesFlaws = [];

      // Act
      const result = calculateCharacterExperience(character, virtuesFlaws);

      // Assert
      // Base Exp: 45 + (20-5)*15 = 45 + 15*15 = 45 + 225 = 270
      expect(result.general_exp_available).toBe(270);
      expect(result.magical_exp_available).toBe(0); // Not a magus
      expect(result.restricted_exp_pools).toEqual([]);
    });

    test('calculates base experience for a young character', () => {
      // Arrange
      const character = {
        age: 5, // Minimum age
        character_type: 'companion'
      };
      const virtuesFlaws = [];

      // Act
      const result = calculateCharacterExperience(character, virtuesFlaws);

      // Assert
      // Base Exp: 45 + (5-5)*15 = 45 + 0 = 45
      expect(result.general_exp_available).toBe(45);
      expect(result.magical_exp_available).toBe(0);
    });

    test('calculates magical experience for a magus', () => {
      // Arrange
      const character = {
        age: 25,
        character_type: 'magus'
      };
      const virtuesFlaws = [];

      // Act
      const result = calculateCharacterExperience(character, virtuesFlaws);

      // Assert
      // Base General Exp: 45 + (25-5)*15 = 45 + 20*15 = 45 + 300 = 345
      // Base Magical Exp: 240 (for magi)
      expect(result.general_exp_available).toBe(345);
      expect(result.magical_exp_available).toBe(240);
    });

    test('applies yearly rate modifier from virtues/flaws', () => {
      // Arrange
      const character = {
        age: 25,
        character_type: 'companion'
      };
      const virtuesFlaws = [
        {
          ReferenceVirtueFlaw: {
            name: 'Wealthy',
            exp_rate_modifier: 5 // +5 to yearly rate
          }
        }
      ];

      // Act
      const result = calculateCharacterExperience(character, virtuesFlaws);

      // Assert
      // Modified Yearly Rate: 15 + 5 = 20
      // Base Exp: 45 + (25-5)*20 = 45 + 20*20 = 45 + 400 = 445
      expect(result.general_exp_available).toBe(445);
    });

    test('applies flat general experience bonus', () => {
      // Arrange
      const character = {
        age: 20,
        character_type: 'companion'
      };
      const virtuesFlaws = [
        {
          ReferenceVirtueFlaw: {
            name: 'General Bonus',
            general_exp_modifier: 50,
            general_exp_modifier_category: null // null means unrestricted
          }
        }
      ];

      // Act
      const result = calculateCharacterExperience(character, virtuesFlaws);

      // Assert
      // Base Exp: 45 + (20-5)*15 = 45 + 15*15 = 45 + 225 = 270
      // Plus Bonus: 270 + 50 = 320
      expect(result.general_exp_available).toBe(320);
    });

    test('adds restricted experience pools', () => {
      // Arrange
      const character = {
        age: 20,
        character_type: 'companion'
      };
      const virtuesFlaws = [
        {
          ReferenceVirtueFlaw: {
            name: 'Warrior',
            general_exp_modifier: 50,
            general_exp_modifier_category: 'Martial' // Category restriction
          }
        }
      ];

      // Act
      const result = calculateCharacterExperience(character, virtuesFlaws);

      // Assert
      // Restricted pool added but general exp not increased
      expect(result.general_exp_available).toBe(270); // Base only (45 + 15*15)
      expect(result.restricted_exp_pools).toHaveLength(1);
      expect(result.restricted_exp_pools[0]).toEqual({
        source_virtue_flaw: 'Warrior',
        amount: 50,
        restrictions: { type: 'category', value: 'Martial' },
        spent: 0
      });
    });

    test('handles multiple restricted experience pools', () => {
      // Arrange
      const character = {
        age: 20,
        character_type: 'companion'
      };
      const virtuesFlaws = [
        {
          ReferenceVirtueFlaw: {
            name: 'Warrior',
            general_exp_modifier: 50,
            general_exp_modifier_category: 'Martial'
          }
        },
        {
          ReferenceVirtueFlaw: {
            name: 'Educated',
            general_exp_modifier: 50,
            general_exp_modifier_category: '["Latin", "Artes Liberales"]' // List of abilities
          }
        }
      ];

      // Act
      const result = calculateCharacterExperience(character, virtuesFlaws);

      // Assert
      expect(result.general_exp_available).toBe(270); // Base only
      expect(result.restricted_exp_pools).toHaveLength(2);
      
      // Check for Warrior pool
      const martialPool = result.restricted_exp_pools.find(pool => 
        pool.source_virtue_flaw === 'Warrior');
      expect(martialPool).toBeDefined();
      expect(martialPool.amount).toBe(50);
      expect(martialPool.restrictions.type).toBe('category');
      expect(martialPool.restrictions.value).toBe('Martial');
      
      // Check for Educated pool
      const educatedPool = result.restricted_exp_pools.find(pool => 
        pool.source_virtue_flaw === 'Educated');
      expect(educatedPool).toBeDefined();
      expect(educatedPool.amount).toBe(50);
      expect(educatedPool.restrictions.type).toBe('ability_list');
      expect(educatedPool.restrictions.value).toEqual(["Latin", "Artes Liberales"]);
    });

    test('combines rate modifiers, flat bonuses, and restricted pools', () => {
      // Arrange
      const character = {
        age: 30,
        character_type: 'magus'
      };
      const virtuesFlaws = [
        {
          ReferenceVirtueFlaw: {
            name: 'Wealthy',
            exp_rate_modifier: 5 // +5 to yearly rate
          }
        },
        {
          ReferenceVirtueFlaw: {
            name: 'General Bonus',
            general_exp_modifier: 30,
            general_exp_modifier_category: null // Unrestricted
          }
        },
        {
          ReferenceVirtueFlaw: {
            name: 'Magical Bonus',
            magical_exp_modifier: 60
          }
        },
        {
          ReferenceVirtueFlaw: {
            name: 'Warrior',
            general_exp_modifier: 50,
            general_exp_modifier_category: 'Martial'
          }
        }
      ];

      // Act
      const result = calculateCharacterExperience(character, virtuesFlaws);

      // Assert
      // Modified Yearly Rate: 15 + 5 = 20
      // Base General Exp: 45 + (30-5)*20 = 45 + 25*20 = 45 + 500 = 545
      // Plus Flat Bonus: 545 + 30 = 575
      // Base Magical Exp: 240 (for magi)
      // Plus Magical Bonus: 240 + 60 = 300
      expect(result.general_exp_available).toBe(575);
      expect(result.magical_exp_available).toBe(300);
      expect(result.restricted_exp_pools).toHaveLength(1);
      expect(result.restricted_exp_pools[0].source_virtue_flaw).toBe('Warrior');
    });
  });
});