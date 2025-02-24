import { validateVirtuesFlaws, createValidationRules } from './virtueFlawValidation';

// Helper functions for creating test data
const createVirtue = (name, category, points = 1, isHouse = false) => ({
  is_house_virtue_flaw: isHouse,
  referenceVirtueFlaw: {
    type: 'Virtue',
    name,
    category,
    size: points === 3 ? 'Major' : 'Minor',
    points
  }
});

const createFlaw = (name, category, points = -1, isHouse = false) => ({
  is_house_virtue_flaw: isHouse,
  referenceVirtueFlaw: {
    type: 'Flaw',
    name,
    category,
    size: points === -3 ? 'Major' : 'Minor',
    points
  }
});

describe('Virtue and Flaw Validation', () => {
  describe('Core Validation Rules', () => {
    it('should validate grog restrictions with default rules', () => {
      const virtuesFlaws = [
        createVirtue('Major Test Virtue', 'General', 3)
      ];
      const rules = createValidationRules('grog');

      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Grogs cannot take Major Virtues or Flaws'
      });
    });

    it('should validate companion restrictions with default rules', () => {
      const virtuesFlaws = [
        createVirtue('Major Test Virtue 1', 'General', 3),
        createVirtue('Major Test Virtue 2', 'General', 3),
        createVirtue('Major Test Virtue 3', 'General', 3),
        createVirtue('Major Test Virtue 4', 'General', 3)
      ];
      const rules = createValidationRules('companion');

      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Virtue points (12) must be balanced by equal Flaw points (0)'
      });
    });

    it('should validate minor flaw limit for companions/magi', () => {
      const virtuesFlaws = [
        createFlaw('Minor Flaw 1', 'General', -1),
        createFlaw('Minor Flaw 2', 'General', -1),
        createFlaw('Minor Flaw 3', 'General', -1),
        createFlaw('Minor Flaw 4', 'General', -1),
        createFlaw('Minor Flaw 5', 'General', -1),
        createFlaw('Minor Flaw 6', 'General', -1)
      ];
      const rules = createValidationRules('companion');

      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Cannot exceed 5 Minor Flaws'
      });
    });

    it('should validate The Gift restrictions', () => {
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Free',
            category: 'Hermetic',
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion');
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Cannot take Hermetic Virtues without The Gift'
      });
    });
  });

  describe('Rule Configuration', () => {
    it('should allow overriding grog major virtue restriction', () => {
      const virtuesFlaws = [
        createVirtue('Major Test Virtue', 'General', 3),
        createFlaw('Major Test Flaw', 'General', -3),
        createVirtue('Noble', 'Social Status', 1)
      ];
      const rules = createValidationRules('grog', {
        allowMajorVirtuesFlaws: true,
        requirePointBalance: false,
        maxVirtuePoints: 10,  // Override the default 3-point limit for grogs
        requireEqualMinorVirtuesFlaws: false  // Allow unequal Minor Virtues/Flaws
      });

      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should allow overriding point limits', () => {
      const virtuesFlaws = [
        createVirtue('Major Test Virtue', 'General', 3),
        createFlaw('Major Test Flaw', 'General', -3),
        createVirtue('Noble', 'Social Status', 1)
      ];
      const rules = createValidationRules('companion', {
        maxVirtuePoints: 15,
        requirePointBalance: false
      });

      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should allow overriding minor flaw limit', () => {
      const virtuesFlaws = [
        // 6 minor flaws and virtues (balanced)
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'General',
            name: 'Test Flaw 1'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'General',
            name: 'Test Flaw 2'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'General',
            name: 'Test Flaw 3'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'General',
            name: 'Test Flaw 4'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'General',
            name: 'Test Flaw 5'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'General',
            name: 'Test Flaw 6'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Test Virtue 1'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Test Virtue 2'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Test Virtue 3'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Test Virtue 4'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Test Virtue 5'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Test Virtue 6'
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        maxMinorFlaws: 10, // Override default 5 limit
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Falsification Tests', () => {
    it('should detect attempts to bypass character type validation', () => {
      expect(() => createValidationRules('invalid_type'))
        .toThrow('Invalid character type');
    });

    it('should detect invalid rule configurations', () => {
      expect(() => createValidationRules('companion', {
        maxVirtuePoints: -1 // Invalid negative limit
      })).toThrow('Invalid rule configuration');
    });

    it('should detect missing required rule properties', () => {
      const incompleteRules = { /* missing required properties */ };
      expect(() => validateVirtuesFlaws([], incompleteRules))
        .toThrow('Invalid validation rules');
    });
  });

  describe('Point Balance Rules', () => {
    it('should validate virtue/flaw point balance', () => {
      const virtuesFlaws = [
        // 6 points of virtues, 3 points of flaws (imbalanced)
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Major',
            category: 'General',
            name: 'Test Major Virtue'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Test Minor Virtue 1'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Test Minor Virtue 2'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Test Minor Virtue 3'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Major',
            category: 'General',
            name: 'Test Major Flaw'
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Virtue points (6) must be balanced by equal Flaw points (3)'
      });
    });

    it('should ignore house virtues/flaws in point balance', () => {
      const virtuesFlaws = [
        // 3 points of virtues, 3 points of flaws (balanced)
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Major',
            category: 'General',
            name: 'Test House Virtue'
          },
          is_house_virtue_flaw: true
        },
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Major',
            category: 'General',
            name: 'Test Major Virtue'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Major',
            category: 'General',
            name: 'Test Major Flaw'
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should allow point balance override for special cases', () => {
      const virtuesFlaws = [
        // 6 points of virtues, 3 points of flaws
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Major',
            category: 'General',
            name: 'Test Major Virtue 1'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Major',
            category: 'General',
            name: 'Test Major Virtue 2'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Major',
            category: 'General',
            name: 'Test Major Flaw'
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Category-specific Rules', () => {
    it('should validate Story Flaw limit', () => {
      const virtuesFlaws = [
        // Multiple Story Flaws
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Major',
            category: 'Story',
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'Story',
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'Story',
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Cannot have more than one Story Flaw'
      });
    });

    it('should validate Personality Flaw limit', () => {
      const virtuesFlaws = [
        // Excessive Personality Flaws
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'Personality',
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'Personality',
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'Personality',
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Major',
            category: 'Personality',
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Cannot have more than three Personality Flaws'
      });
    });

    it('should allow overriding category limits', () => {
      const virtuesFlaws = [
        // Multiple Story Flaws with override
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Major',
            category: 'Story',
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'Story',
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        maxStoryFlaws: 2,
        requirePointBalance: false,
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should ignore house flaws in category limits', () => {
      const virtuesFlaws = [
        // One regular Story Flaw and one house Story Flaw
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Major',
            category: 'Story',
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'Story',
          },
          is_house_virtue_flaw: true
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Social Status Rules', () => {
    it('should require exactly one social status indicator', () => {
      const virtuesFlaws = [
        // No Social Status
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion');
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Character must have exactly one Social Status (either as a Virtue, Free Status, or Flaw)'
      });
    });

    it('should not allow multiple social status indicators', () => {
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'Social Status',
            name: 'Noble'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'Social Status',
            name: 'Outcast'
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion');
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Character must have exactly one Social Status (either as a Virtue, Free Status, or Flaw)'
      });
    });

    it('should allow one social status virtue', () => {
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'Social Status',
            name: 'Noble'
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should allow one social status flaw', () => {
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'Social Status',
            name: 'Outcast'
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should allow one free social status', () => {
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Free',
            category: 'Social Status',
            name: 'Merchant'
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should count house social status as valid', () => {
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'Social Status',
            name: 'House Social Status'
          },
          is_house_virtue_flaw: true
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should allow disabling social status requirement', () => {
      const virtuesFlaws = [
        // No Social Status
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requireSocialStatus: false,
        requirePointBalance: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Incompatibility Rules', () => {
    it('should detect incompatible virtue/flaw combinations', () => {
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Virtue A',
            incompatibilities: ['Flaw B']
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'General',
            name: 'Flaw B'
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Incompatible combination: Virtue A cannot be taken with Flaw B'
      });
    });

    it('should allow virtue/flaw combinations without incompatibilities', () => {
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Virtue A'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'General',
            name: 'Flaw B'
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should ignore house virtues/flaws in incompatibility checks', () => {
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Virtue A',
            incompatibilities: ['Flaw B']
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'General',
            name: 'Flaw B'
          },
          is_house_virtue_flaw: true
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should allow disabling incompatibility checks', () => {
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Virtue A',
            incompatibilities: ['Flaw B']
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Minor',
            category: 'General',
            name: 'Flaw B'
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false,
        checkIncompatibilities: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Prerequisite Rules', () => {
    it('should validate virtue prerequisites', () => {
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Advanced Virtue',
            prerequisites: ['Basic Virtue']
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Advanced Virtue requires prerequisite: Basic Virtue'
      });
    });

    it('should validate flaw prerequisites', () => {
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            type: 'Flaw',
            size: 'Major',
            category: 'General',
            name: 'Advanced Flaw',
            prerequisites: ['Basic Flaw']
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Advanced Flaw requires prerequisite: Basic Flaw'
      });
    });

    it('should allow virtues/flaws with satisfied prerequisites', () => {
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Basic Virtue'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Advanced Virtue',
            prerequisites: ['Basic Virtue']
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should allow disabling prerequisite checks', () => {
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Advanced Virtue',
            prerequisites: ['Basic Virtue']
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false,
        checkPrerequisites: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle multiple prerequisites', () => {
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Basic Virtue 1'
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            type: 'Virtue',
            size: 'Minor',
            category: 'General',
            name: 'Advanced Virtue',
            prerequisites: ['Basic Virtue 1', 'Basic Virtue 2']
          },
          is_house_virtue_flaw: false
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Advanced Virtue requires prerequisite: Basic Virtue 2'
      });
    });
  });

  describe('Character Type Validation Edge Cases', () => {
    test('should handle mixed case character types', () => {
      expect(() => createValidationRules('MaGuS')).not.toThrow();
      const rules = createValidationRules('MaGuS');
      expect(rules.characterType).toBe('magus');
    });

    test('should reject empty character type', () => {
      expect(() => createValidationRules('')).toThrow('Character type is required');
    });

    test('should reject null character type', () => {
      expect(() => createValidationRules(null)).toThrow('Character type is required');
    });

    test('should reject undefined character type', () => {
      expect(() => createValidationRules(undefined)).toThrow('Character type is required');
    });

    test('should reject invalid character types', () => {
      expect(() => createValidationRules('wizard')).toThrow('Invalid character type');
      expect(() => createValidationRules('mage')).toThrow('Invalid character type');
    });
  });

  describe('Complex Validation Scenarios', () => {
    it('should validate multiple incompatibilities correctly', () => {
      const virtuesFlaws = [
        {
          is_house_virtue_flaw: false,
          referenceVirtueFlaw: {
            type: 'Virtue',
            name: 'Virtue A',
            category: 'General',
            size: 'Minor',
            incompatibilities: ['Virtue B', 'Virtue C']
          }
        },
        {
          is_house_virtue_flaw: false,
          referenceVirtueFlaw: {
            type: 'Virtue',
            name: 'Virtue B',
            category: 'General',
            size: 'Minor'
          }
        },
        {
          is_house_virtue_flaw: false,
          referenceVirtueFlaw: {
            type: 'Virtue',
            name: 'Virtue C',
            category: 'General',
            size: 'Minor'
          }
        },
        {
          is_house_virtue_flaw: false,
          referenceVirtueFlaw: {
            type: 'Flaw',
            name: 'Balancing Flaw',
            category: 'General',
            size: 'Major',
            points: -3
          }
        }
      ];
      const rules = createValidationRules('companion');

      const result = validateVirtuesFlaws(virtuesFlaws, rules);
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Incompatible combination: Virtue A cannot be taken with Virtue B'
      });
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Incompatible combination: Virtue A cannot be taken with Virtue C'
      });
    });

    it('should handle house virtues correctly in point calculations', () => {
      const virtuesFlaws = [
        createVirtue('House Virtue', 'General', 3, true),
        createVirtue('Normal Virtue', 'General', 3),
        createFlaw('Normal Flaw', 'General', -3),
        createVirtue('Noble', 'Social Status', 1)
      ];
      const rules = createValidationRules('companion', {
        requirePointBalance: false
      });

      const result = validateVirtuesFlaws(virtuesFlaws, rules);
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should validate nested prerequisites correctly', () => {
      const rules = createValidationRules('magus');
      const virtuesFlaws = [
        {
          is_house_virtue_flaw: false,
          referenceVirtueFlaw: {
            name: 'Advanced Virtue',
            type: 'Virtue',
            prerequisites: ['Basic Virtue A', 'Basic Virtue B']
          }
        },
        {
          is_house_virtue_flaw: false,
          referenceVirtueFlaw: {
            name: 'Basic Virtue A',
            type: 'Virtue',
            prerequisites: ['Foundation Virtue']
          }
        },
        {
          is_house_virtue_flaw: false,
          referenceVirtueFlaw: {
            name: 'Noble Social Status',
            type: 'Virtue',
            category: 'Social Status',
            size: 'Minor'
          }
        },
        {
          is_house_virtue_flaw: false,
          referenceVirtueFlaw: {
            name: 'Poor',
            type: 'Flaw',
            size: 'Minor'
          }
        },
        {
          is_house_virtue_flaw: false,
          referenceVirtueFlaw: {
            name: 'Weak Characteristics',
            type: 'Flaw',
            size: 'Minor'
          }
        }
      ];

      const result = validateVirtuesFlaws(virtuesFlaws, rules);
      expect(result.isValid).toBe(false);
      const prerequisiteWarnings = result.warnings
        .filter(w => w.message.includes('requires prerequisite'))
        .sort((a, b) => a.message.localeCompare(b.message));
      expect(prerequisiteWarnings).toHaveLength(2);
      expect(prerequisiteWarnings[0].message).toContain('Advanced Virtue requires prerequisite: Basic Virtue B');
      expect(prerequisiteWarnings[1].message).toContain('Basic Virtue A requires prerequisite: Foundation Virtue');
    });
  });

  describe('Character Type-Specific Restrictions', () => {
    describe('Grog Restrictions', () => {
      it('should enforce grog virtue/flaw limits', () => {
        const virtuesFlaws = [
          // 4 Minor Flaws (exceeds 3 limit)
          {
            referenceVirtueFlaw: {
              type: 'Flaw',
              size: 'Minor',
              category: 'General',
            },
            is_house_virtue_flaw: false
          },
          {
            referenceVirtueFlaw: {
              type: 'Flaw',
              size: 'Minor',
              category: 'General',
            },
            is_house_virtue_flaw: false
          },
          {
            referenceVirtueFlaw: {
              type: 'Flaw',
              size: 'Minor',
              category: 'General',
            },
            is_house_virtue_flaw: false
          },
          {
            referenceVirtueFlaw: {
              type: 'Flaw',
              size: 'Minor',
              category: 'General',
            },
            is_house_virtue_flaw: false
          }
        ];

        const rules = createValidationRules('grog');
        const result = validateVirtuesFlaws(virtuesFlaws, rules);

        expect(result.isValid).toBe(false);
        expect(result.warnings).toContainEqual({
          type: 'error',
          message: 'Grogs cannot exceed 3 Minor Flaws'
        });
      });

      it('should prevent grogs from taking major virtues/flaws', () => {
        const virtuesFlaws = [
          {
            referenceVirtueFlaw: {
              type: 'Virtue',
              size: 'Major',
              category: 'General',
            },
            is_house_virtue_flaw: false
          }
        ];

        const rules = createValidationRules('grog');
        const result = validateVirtuesFlaws(virtuesFlaws, rules);

        expect(result.isValid).toBe(false);
        expect(result.warnings).toContainEqual({
          type: 'error',
          message: 'Grogs cannot take Major Virtues or Flaws'
        });
      });

      it('should prevent grogs from taking The Gift', () => {
        const virtuesFlaws = [
          {
            referenceVirtueFlaw: {
              type: 'Virtue',
              size: 'Free',
              category: 'The Gift',
              name: 'The Gift'
            },
            is_house_virtue_flaw: false
          }
        ];

        const rules = createValidationRules('grog');
        const result = validateVirtuesFlaws(virtuesFlaws, rules);

        expect(result.isValid).toBe(false);
        expect(result.warnings).toContainEqual({
          type: 'error',
          message: 'Grogs cannot take The Gift'
        });
      });

      it('should enforce equal number of Minor Virtues and Flaws', () => {
        const virtuesFlaws = [
          {
            referenceVirtueFlaw: {
              type: 'Virtue',
              size: 'Minor',
              category: 'General',
            },
            is_house_virtue_flaw: false
          },
          {
            referenceVirtueFlaw: {
              type: 'Virtue',
              size: 'Minor',
              category: 'General',
            },
            is_house_virtue_flaw: false
          },
          {
            referenceVirtueFlaw: {
              type: 'Flaw',
              size: 'Minor',
              category: 'General',
            },
            is_house_virtue_flaw: false
          }
        ];

        const rules = createValidationRules('grog');
        const result = validateVirtuesFlaws(virtuesFlaws, rules);

        expect(result.isValid).toBe(false);
        expect(result.warnings).toContainEqual({
          type: 'error',
          message: 'Grogs must have equal number of Minor Virtues and Minor Flaws'
        });
      });
    });
  });

  describe('Grog-specific restrictions', () => {
    it('should enforce maximum of 3 Minor Flaws', () => {
      const virtuesFlaws = [
        createFlaw('Minor Flaw 1', 'General', -1),
        createFlaw('Minor Flaw 2', 'General', -1),
        createFlaw('Minor Flaw 3', 'General', -1),
        createFlaw('Minor Flaw 4', 'General', -1)
      ];
      const rules = createValidationRules('grog');

      const result = validateVirtuesFlaws(virtuesFlaws, rules);
      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Grogs cannot exceed 3 Minor Flaws'
      });
    });
  });

  describe('Multiple Instances Validation', () => {
    it('should allow multiple instances when multiple_allowed is true', () => {
      const virtuesFlaws = [
        {
          is_house_virtue_flaw: false,
          referenceVirtueFlaw: {
            type: 'Virtue',
            name: 'Repeatable Virtue',
            category: 'General',
            size: 'Minor',
            multiple_allowed: true
          }
        },
        {
          is_house_virtue_flaw: false,
          referenceVirtueFlaw: {
            type: 'Virtue',
            name: 'Repeatable Virtue',
            category: 'General',
            size: 'Minor',
            multiple_allowed: true
          }
        }
      ];
      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false
      });

      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should prevent multiple instances when multiple_allowed is false', () => {
      const virtuesFlaws = [
        {
          is_house_virtue_flaw: false,
          referenceVirtueFlaw: {
            type: 'Virtue',
            name: 'Non-Repeatable Virtue',
            category: 'General',
            size: 'Minor',
            multiple_allowed: false
          }
        },
        {
          is_house_virtue_flaw: false,
          referenceVirtueFlaw: {
            type: 'Virtue',
            name: 'Non-Repeatable Virtue',
            category: 'General',
            size: 'Minor',
            multiple_allowed: false
          }
        }
      ];
      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false
      });

      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Cannot take multiple instances of Non-Repeatable Virtue'
      });
    });

    it('should allow single instance when multiple_allowed is false', () => {
      const virtuesFlaws = [
        {
          is_house_virtue_flaw: false,
          referenceVirtueFlaw: {
            type: 'Virtue',
            name: 'Non-Repeatable Virtue',
            category: 'General',
            size: 'Minor',
            multiple_allowed: false
          }
        }
      ];
      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false
      });

      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should not count house virtues/flaws towards multiple instances', () => {
      const virtuesFlaws = [
        {
          is_house_virtue_flaw: true,
          referenceVirtueFlaw: {
            type: 'Virtue',
            name: 'Non-Repeatable Virtue',
            category: 'General',
            size: 'Minor',
            multiple_allowed: false
          }
        },
        {
          is_house_virtue_flaw: false,
          referenceVirtueFlaw: {
            type: 'Virtue',
            name: 'Non-Repeatable Virtue',
            category: 'General',
            size: 'Minor',
            multiple_allowed: false
          }
        }
      ];
      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false
      });

      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });
}); 