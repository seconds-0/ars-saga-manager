/**
 * This is a focused test for the characteristics cost calculation logic
 * Extracted from CharacteristicsAndAbilitiesTab for simplicity
 */
import { describe, it, expect } from '@jest/globals';

/**
 * Get the cost to increment or decrement a characteristic
 * @param {number} currentValue Current value of the characteristic
 * @param {boolean} increment Whether to calculate cost for incrementing (true) or decrementing (false)
 * @returns {number} The cost to increment/decrement
 */
function getCost(currentValue, increment) {
  if (increment) {
    switch (currentValue) {
      case -3: return 3;
      case -2: return 2;
      case -1: return 1;
      case 0: return 1;
      case 1: return 2;
      case 2: return 3;
      default: return 0;
    }
  } else {
    switch (currentValue) {
      case 3: return 3;
      case 2: return 2;
      case 1: return 1;
      case 0: return 1;
      case -1: return 2;
      case -2: return 3;
      default: return 0;
    }
  }
}

/**
 * Calculate points spent on a set of characteristic values
 * @param {Object} characteristics Object with characteristic values
 * @returns {number} Total points spent
 */
function calculateSpentPoints(characteristics) {
  return Object.values(characteristics).reduce((total, value) => {
    if (value > 0) return total + (value * (value + 1)) / 2;
    if (value < 0) return total - (Math.abs(value) * (Math.abs(value) + 1)) / 2;
    return total;
  }, 0);
}

describe('Characteristic Cost Calculation', () => {
  describe('getCost', () => {
    it('calculates increment costs correctly', () => {
      // Incrementing from negative values
      expect(getCost(-3, true)).toBe(3);
      expect(getCost(-2, true)).toBe(2);
      expect(getCost(-1, true)).toBe(1);
      
      // Incrementing from 0 and positive values
      expect(getCost(0, true)).toBe(1);
      expect(getCost(1, true)).toBe(2);
      expect(getCost(2, true)).toBe(3);
      
      // No cost for values outside the normal range
      expect(getCost(3, true)).toBe(0);
      expect(getCost(4, true)).toBe(0);
    });
    
    it('calculates decrement costs correctly', () => {
      // Decrementing from positive values
      expect(getCost(3, false)).toBe(3);
      expect(getCost(2, false)).toBe(2);
      expect(getCost(1, false)).toBe(1);
      
      // Decrementing from 0 and negative values
      expect(getCost(0, false)).toBe(1);
      expect(getCost(-1, false)).toBe(2);
      expect(getCost(-2, false)).toBe(3);
      
      // No cost for values outside the normal range
      expect(getCost(-3, false)).toBe(0);
      expect(getCost(-4, false)).toBe(0);
    });
  });
  
  describe('calculateSpentPoints', () => {
    it('calculates spent points correctly for positive values', () => {
      const characteristics = {
        strength: 1,
        stamina: 2,
        dexterity: 3,
        quickness: 0
      };
      
      // Formula for spent points: sum of (n * (n + 1)) / 2 for each positive value
      // For characteristics above:
      // strength(1): (1 * 2) / 2 = 1
      // stamina(2): (2 * 3) / 2 = 3
      // dexterity(3): (3 * 4) / 2 = 6
      // quickness(0): 0
      // Total: 1 + 3 + 6 + 0 = 10
      expect(calculateSpentPoints(characteristics)).toBe(10);
    });
    
    it('calculates spent points correctly for negative values', () => {
      const characteristics = {
        strength: -1,
        stamina: -2,
        dexterity: -3,
        quickness: 0
      };
      
      // Formula for spent points: -sum of (n * (n + 1)) / 2 for each negative value
      // For characteristics above:
      // strength(-1): -(1 * 2) / 2 = -1
      // stamina(-2): -(2 * 3) / 2 = -3
      // dexterity(-3): -(3 * 4) / 2 = -6
      // quickness(0): 0
      // Total: -1 + -3 + -6 + 0 = -10
      expect(calculateSpentPoints(characteristics)).toBe(-10);
    });
    
    it('calculates spent points correctly for mixed values', () => {
      const characteristics = {
        strength: 2,
        stamina: -1,
        dexterity: 0,
        quickness: -3
      };
      
      // strength(2): (2 * 3) / 2 = 3
      // stamina(-1): -(1 * 2) / 2 = -1
      // dexterity(0): 0
      // quickness(-3): -(3 * 4) / 2 = -6
      // Total: 3 + -1 + 0 + -6 = -4
      expect(calculateSpentPoints(characteristics)).toBe(-4);
    });
  });
  
  describe('Complete characteristic point calculations', () => {
    it('calculates available points correctly', () => {
      const characteristics = {
        strength: 2,
        stamina: 1,
        dexterity: -1,
        quickness: -2,
        intelligence: 3,
        presence: 0,
        communication: 1,
        perception: -3
      };
      
      const totalPoints = 7;
      const spentPoints = calculateSpentPoints(characteristics);
      const availablePoints = totalPoints - spentPoints;
      
      // This is a complex calculation of spent points:
      // strength(2): 3
      // stamina(1): 1
      // dexterity(-1): -1
      // quickness(-2): -3
      // intelligence(3): 6
      // presence(0): 0
      // communication(1): 1
      // perception(-3): -6
      
      // Total spent: 3 + 1 + (-1) + (-3) + 6 + 0 + 1 + (-6) = 1
      // Available: 7 - 1 = 6
      expect(availablePoints).toBe(6);
    });
  });
});