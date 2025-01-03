import { validateVirtuesFlaws, createValidationRules } from './virtueFlawValidation';

describe('Virtue and Flaw Validation', () => {
  describe('Core Validation Rules', () => {
    it('should validate grog restrictions with default rules', () => {
      const virtuesFlaws = [
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false }
      ];

      const rules = createValidationRules('grog');
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Grogs cannot take Major Virtues'
      });
    });

    it('should validate companion restrictions with default rules', () => {
      const virtuesFlaws = [
        // 12 points of virtues (exceeds 10 point limit)
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3
      ];

      const rules = createValidationRules('companion');
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Cannot exceed 10 points of Virtues'
      });
    });

    it('should validate minor flaw limit for companions/magi', () => {
      const virtuesFlaws = [
        // 6 minor flaws (exceeds 5 limit)
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false }
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
        { type: 'Virtue', size: 'Free', category: 'Hermetic', is_house_virtue_flaw: false }
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
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3
        { type: 'Flaw', size: 'Major', is_house_virtue_flaw: false }    // 3
      ];

      const rules = createValidationRules('grog', {
        allowMajorVirtues: true, // Override default rule
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should allow overriding point limits', () => {
      const virtuesFlaws = [
        // 12 points of virtues and flaws (balanced)
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3
        { type: 'Flaw', size: 'Major', is_house_virtue_flaw: false },   // 3
        { type: 'Flaw', size: 'Major', is_house_virtue_flaw: false },   // 3
        { type: 'Flaw', size: 'Major', is_house_virtue_flaw: false },   // 3
        { type: 'Flaw', size: 'Major', is_house_virtue_flaw: false }    // 3
      ];

      const rules = createValidationRules('companion', {
        maxVirtuePoints: 15, // Override default 10 point limit
        maxFlawPoints: 15,
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should allow overriding minor flaw limit', () => {
      const virtuesFlaws = [
        // 6 minor flaws and virtues (balanced)
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false },
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false }
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
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false }, // 1
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false }, // 1
        { type: 'Virtue', size: 'Minor', is_house_virtue_flaw: false }, // 1
        { type: 'Flaw', size: 'Major', is_house_virtue_flaw: false },   // 3
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
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: true },  // Free
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3
        { type: 'Flaw', size: 'Major', is_house_virtue_flaw: false },   // 3
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
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3
        { type: 'Virtue', size: 'Major', is_house_virtue_flaw: false }, // 3
        { type: 'Flaw', size: 'Major', is_house_virtue_flaw: false },   // 3
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
        { type: 'Flaw', size: 'Major', category: 'Story', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', category: 'Story', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', category: 'Story', is_house_virtue_flaw: false }
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
        { type: 'Flaw', size: 'Minor', category: 'Personality', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', category: 'Personality', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', category: 'Personality', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Major', category: 'Personality', is_house_virtue_flaw: false }
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
        { type: 'Flaw', size: 'Major', category: 'Story', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', category: 'Story', is_house_virtue_flaw: false }
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
        { type: 'Flaw', size: 'Major', category: 'Story', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', category: 'Story', is_house_virtue_flaw: true }
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
    it('should require exactly one Social Status', () => {
      const virtuesFlaws = [
        // No Social Status virtues/flaws
        { type: 'Virtue', size: 'Minor', category: 'General', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', category: 'Story', is_house_virtue_flaw: false }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Character must have exactly one Social Status'
      });
    });

    it('should not allow multiple Social Status virtues/flaws', () => {
      const virtuesFlaws = [
        // Multiple Social Status
        { type: 'Virtue', size: 'Minor', category: 'Social Status', is_house_virtue_flaw: false },
        { type: 'Flaw', size: 'Minor', category: 'Social Status', is_house_virtue_flaw: false }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Character must have exactly one Social Status'
      });
    });

    it('should allow one Social Status virtue or flaw', () => {
      const virtuesFlaws = [
        // Single Social Status
        { type: 'Virtue', size: 'Minor', category: 'Social Status', is_house_virtue_flaw: false }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should count house Social Status as valid', () => {
      const virtuesFlaws = [
        // House Social Status
        { type: 'Virtue', size: 'Minor', category: 'Social Status', is_house_virtue_flaw: true }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should allow disabling Social Status requirement', () => {
      const virtuesFlaws = [
        // No Social Status
        { type: 'Virtue', size: 'Minor', category: 'General', is_house_virtue_flaw: false }
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
          type: 'Virtue',
          size: 'Minor',
          category: 'General',
          is_house_virtue_flaw: false,
          name: 'Keen Vision',
          incompatibilities: ['Poor Vision']
        },
        {
          type: 'Flaw',
          size: 'Minor',
          category: 'General',
          is_house_virtue_flaw: false,
          name: 'Poor Vision',
          incompatibilities: ['Keen Vision']
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
        message: 'Incompatible combination: Keen Vision cannot be taken with Poor Vision'
      });
    });

    it('should allow virtue/flaw combinations without incompatibilities', () => {
      const virtuesFlaws = [
        {
          type: 'Virtue',
          size: 'Minor',
          category: 'General',
          is_house_virtue_flaw: false,
          name: 'Keen Vision',
          incompatibilities: ['Poor Vision']
        },
        {
          type: 'Flaw',
          size: 'Minor',
          category: 'General',
          is_house_virtue_flaw: false,
          name: 'Poor Hearing',
          incompatibilities: ['Keen Hearing']
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
          type: 'Virtue',
          size: 'Minor',
          category: 'General',
          is_house_virtue_flaw: true, // House virtue
          name: 'Keen Vision',
          incompatibilities: ['Poor Vision']
        },
        {
          type: 'Flaw',
          size: 'Minor',
          category: 'General',
          is_house_virtue_flaw: false,
          name: 'Poor Vision',
          incompatibilities: ['Keen Vision']
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
          type: 'Virtue',
          size: 'Minor',
          category: 'General',
          is_house_virtue_flaw: false,
          name: 'Keen Vision',
          incompatibilities: ['Poor Vision']
        },
        {
          type: 'Flaw',
          size: 'Minor',
          category: 'General',
          is_house_virtue_flaw: false,
          name: 'Poor Vision',
          incompatibilities: ['Keen Vision']
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
          type: 'Virtue',
          size: 'Major',
          category: 'Hermetic',
          is_house_virtue_flaw: false,
          name: 'Major Magical Focus',
          prerequisites: ['The Gift']
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
        message: 'Major Magical Focus requires prerequisite: The Gift'
      });
    });

    it('should validate flaw prerequisites', () => {
      const virtuesFlaws = [
        {
          type: 'Flaw',
          size: 'Major',
          category: 'Hermetic',
          is_house_virtue_flaw: false,
          name: 'Deficient Form',
          prerequisites: ['The Gift']
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
        message: 'Deficient Form requires prerequisite: The Gift'
      });
    });

    it('should allow virtues/flaws with satisfied prerequisites', () => {
      const virtuesFlaws = [
        {
          type: 'Virtue',
          size: 'Free',
          category: 'General',
          is_house_virtue_flaw: false,
          name: 'The Gift'
        },
        {
          type: 'Virtue',
          size: 'Major',
          category: 'Hermetic',
          is_house_virtue_flaw: false,
          name: 'Major Magical Focus',
          prerequisites: ['The Gift']
        }
      ];

      const rules = createValidationRules('magus', {
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
          type: 'Virtue',
          size: 'Major',
          category: 'Hermetic',
          is_house_virtue_flaw: false,
          name: 'Major Magical Focus',
          prerequisites: ['The Gift']
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false,
        checkPrerequisites: false,
        checkCharacterTypeRestrictions: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle multiple prerequisites', () => {
      const virtuesFlaws = [
        {
          type: 'Virtue',
          size: 'Free',
          category: 'General',
          is_house_virtue_flaw: false,
          name: 'The Gift'
        },
        {
          type: 'Virtue',
          size: 'Major',
          category: 'Hermetic',
          is_house_virtue_flaw: false,
          name: 'Flexible Formulaic Magic',
          prerequisites: ['The Gift', 'Major Magical Focus']
        }
      ];

      const rules = createValidationRules('magus', {
        requirePointBalance: false,
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContainEqual({
        type: 'error',
        message: 'Flexible Formulaic Magic requires prerequisite: Major Magical Focus'
      });
    });
  });

  describe('Character Type Restrictions', () => {
    it('should validate character type restrictions for virtues', () => {
      const virtuesFlaws = [
        {
          type: 'Virtue',
          size: 'Minor',
          category: 'General',
          is_house_virtue_flaw: false,
          name: 'Magical Affinity',
          allowed_character_types: ['magus']
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
        message: 'Magical Affinity is only available to magus characters'
      });
    });

    it('should validate character type restrictions for flaws', () => {
      const virtuesFlaws = [
        {
          type: 'Flaw',
          size: 'Major',
          category: 'Hermetic',
          is_house_virtue_flaw: false,
          name: 'Blatant Gift',
          allowed_character_types: ['magus']
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
        message: 'Blatant Gift is only available to magus characters'
      });
    });

    it('should allow virtues/flaws for allowed character types', () => {
      const virtuesFlaws = [
        {
          type: 'Virtue',
          size: 'Minor',
          category: 'General',
          is_house_virtue_flaw: false,
          name: 'Warrior',
          allowed_character_types: ['grog', 'companion']
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

    it('should allow virtues/flaws without character type restrictions', () => {
      const virtuesFlaws = [
        {
          type: 'Virtue',
          size: 'Minor',
          category: 'General',
          is_house_virtue_flaw: false,
          name: 'Clear Thinker'
          // No allowed_character_types means available to all
        }
      ];

      const rules = createValidationRules('grog', {
        requirePointBalance: false,
        requireSocialStatus: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it('should allow disabling character type restrictions', () => {
      const virtuesFlaws = [
        {
          type: 'Virtue',
          size: 'Minor',
          category: 'Hermetic',
          is_house_virtue_flaw: false,
          name: 'Magical Affinity',
          allowed_character_types: ['magus']
        }
      ];

      const rules = createValidationRules('companion', {
        requirePointBalance: false,
        requireSocialStatus: false,
        checkCharacterTypeRestrictions: false
      });
      const result = validateVirtuesFlaws(virtuesFlaws, rules);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });
}); 