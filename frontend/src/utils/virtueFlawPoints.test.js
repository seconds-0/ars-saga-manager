import { calculateVirtueFlawPoints } from './virtueFlawPoints';

describe('Virtue and Flaw Point Calculation', () => {
  describe('6.1 Basic Calculations', () => {
    it('should calculate virtue points correctly', () => {
      const virtuesFlaws = [
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false },
      ];

      const points = calculateVirtueFlawPoints(virtuesFlaws);
      expect(points.virtuePoints).toBe(4); // 1 for minor + 3 for major
    });

    it('should calculate flaw points correctly', () => {
      const virtuesFlaws = [
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Major', is_house_virtue_flaw: false },
      ];

      const points = calculateVirtueFlawPoints(virtuesFlaws);
      expect(points.flawPoints).toBe(4); // 1 for minor + 3 for major
    });

    it('should handle free virtues/flaws correctly', () => {
      const virtuesFlaws = [
        { type: 'Virtue', size: 'Free', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Free', is_house_virtue_flaw: false },
      ];

      const points = calculateVirtueFlawPoints(virtuesFlaws);
      expect(points.virtuePoints).toBe(0);
      expect(points.flawPoints).toBe(0);
    });

    it('should track running point totals', () => {
      const virtuesFlaws = [
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Major', is_house_virtue_flaw: false },
      ];

      const points = calculateVirtueFlawPoints(virtuesFlaws);
      expect(points.virtuePoints).toBe(4); // 1 + 3
      expect(points.flawPoints).toBe(4);   // 1 + 3
      expect(points.balance).toBe(0);      // 4 - 4
    });
  });

  describe('6.2 Special Cases', () => {
    it('should exclude house virtues/flaws from point totals', () => {
      const virtuesFlaws = [
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: true },
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Major', is_house_virtue_flaw: true },
      ];

      const points = calculateVirtueFlawPoints(virtuesFlaws);
      expect(points.virtuePoints).toBe(3); // Only count the non-house major virtue
      expect(points.flawPoints).toBe(0);   // House flaw doesn't count
    });

    it('should handle Ex Miscellanea additional virtues/flaws', () => {
      const virtuesFlaws = [
        // Ex Miscellanea special virtues/flaws
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: true, category: 'Hermetic' },
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: true },
        { type: 'Flaw', size: 'Major', is_house_virtue_flaw: true, category: 'Hermetic' },
        // Regular virtues/flaws
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
      ];

      const points = calculateVirtueFlawPoints(virtuesFlaws);
      expect(points.virtuePoints).toBe(1); // Only count the regular minor virtue
      expect(points.flawPoints).toBe(1);   // Only count the regular minor flaw
    });

    it('should handle temporary point imbalances', () => {
      const virtuesFlaws = [
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
      ];

      const points = calculateVirtueFlawPoints(virtuesFlaws);
      expect(points.virtuePoints).toBe(4);    // 3 + 1
      expect(points.flawPoints).toBe(0);
      expect(points.balance).toBe(-4);        // Negative balance indicates more virtues than flaws
      expect(points.isBalanced).toBe(false);
    });

    it('should validate final point balance requirements', () => {
      const virtuesFlaws = [
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Major', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
      ];

      const points = calculateVirtueFlawPoints(virtuesFlaws);
      expect(points.virtuePoints).toBe(4);   // 3 + 1
      expect(points.flawPoints).toBe(4);     // 3 + 1
      expect(points.balance).toBe(0);
      expect(points.isBalanced).toBe(true);
    });
  });

  describe('Character Type Specific Calculations', () => {
    it('should validate grog point limits', () => {
      const virtuesFlaws = [
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
      ];

      const points = calculateVirtueFlawPoints(virtuesFlaws, 'grog');
      expect(points.virtuePoints).toBe(3);
      expect(points.flawPoints).toBe(3);
      expect(points.exceedsGrogLimit).toBe(false);
    });

    it('should validate companion/magi point limits', () => {
      const virtuesFlaws = [
        // 7 points of virtues
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3 points
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3 points
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false }, // 1 point
        // 7 points of flaws
        { type: 'Flaw', size: 'Major', is_house_virtue_flaw: false },   // 3 points
        { type: 'Flaw', size: 'Major', is_house_virtue_flaw: false },   // 3 points
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },   // 1 point
      ];

      const points = calculateVirtueFlawPoints(virtuesFlaws, 'companion');
      expect(points.virtuePoints).toBe(7);  // 3 + 3 + 1
      expect(points.flawPoints).toBe(7);    // 3 + 3 + 1
      expect(points.exceedsCompanionMagiLimit).toBe(false);
    });
  });

  describe('Falsification Tests', () => {
    it('should detect invalid virtue/flaw size', () => {
      const virtuesFlaws = [
        { type: 'Virtue', size: 'Invalid', is_house_virtue_flaw: false }
      ];

      expect(() => calculateVirtueFlawPoints(virtuesFlaws))
        .toThrow('Invalid virtue/flaw size: Invalid');
    });

    it('should detect incorrect point calculations', () => {
      const virtuesFlaws = [
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false }
      ];

      const points = calculateVirtueFlawPoints(virtuesFlaws);
      // Test that it doesn't give wrong point values
      expect(points.virtuePoints).not.toBe(3); // Should be 4 (3 + 1), not 3
      expect(points.virtuePoints).toBe(4);
    });

    it('should detect incorrect house virtue/flaw handling', () => {
      const virtuesFlaws = [
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: true },
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false }
      ];

      const points = calculateVirtueFlawPoints(virtuesFlaws);
      // Test that it doesn't count house virtues
      expect(points.virtuePoints).not.toBe(4); // Should be 1, not 4
      expect(points.virtuePoints).toBe(1);
    });

    it('should detect incorrect balance calculations', () => {
      const virtuesFlaws = [
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3 points
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false }    // 1 point
      ];

      const points = calculateVirtueFlawPoints(virtuesFlaws);
      // Test that balance is correctly negative when virtues > flaws
      expect(points.balance).not.toBe(0);    // Should be -2, not 0
      expect(points.balance).toBe(-2);       // 1 - 3 = -2
      expect(points.isBalanced).toBe(false); // Should definitely not be balanced
    });

    it('should detect incorrect character type limit handling', () => {
      const virtuesFlaws = [
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false } // Exceeds grog limit
      ];

      const points = calculateVirtueFlawPoints(virtuesFlaws, 'grog');
      // Test that it correctly detects when grog limit is exceeded
      expect(points.exceedsGrogLimit).not.toBe(false); // Should be true, not false
      expect(points.exceedsGrogLimit).toBe(true);
      expect(points.virtuePoints).toBe(4);
    });

    it('should detect incorrect handling of undefined values', () => {
      const virtuesFlaws = [
        { type: 'Virtue', is_house_virtue_flaw: false }, // Missing size
        { size: 'Minor', is_house_virtue_flaw: false }   // Missing type
      ];

      expect(() => calculateVirtueFlawPoints(virtuesFlaws))
        .toThrow('Invalid virtue/flaw size: undefined');
    });
  });
}); 