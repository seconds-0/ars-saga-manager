const { calculateExperience, calculateAbilityCost, validateExperienceSpending } = require('../utils/experienceUtils');

describe('Experience Calculation', () => {
  describe('Age-based Experience Calculation', () => {
    it('should calculate general experience correctly for age <= 25', () => {
      const character = { age: 20, character_type: 'companion' };
      const result = calculateExperience(character, []);
      
      // Formula for age <= 25: 15 * (age - 5)
      const expectedExp = 15 * (20 - 5); // 15 * 15 = 225
      expect(result.general_exp_available).toBe(expectedExp);
    });
    
    it('should calculate general experience correctly for age > 25', () => {
      const character = { age: 30, character_type: 'companion' };
      const result = calculateExperience(character, []);
      
      // Formula for age > 25: 15 * 20 + 20 * (age - 25)
      const expectedExp = 15 * 20 + 20 * (30 - 25); // 300 + 100 = 400
      expect(result.general_exp_available).toBe(expectedExp);
    });
    
    it('should initialize magical experience for magi characters', () => {
      const character = { age: 25, character_type: 'magus' };
      const result = calculateExperience(character, []);
      
      expect(result.magical_exp_available).toBe(240);
    });
    
    it('should not initialize magical experience for non-magi characters', () => {
      const character = { age: 25, character_type: 'companion' };
      const result = calculateExperience(character, []);
      
      expect(result.magical_exp_available).toBe(0);
    });
    
    it('should use default age of 25 when age is not provided', () => {
      const character = { character_type: 'companion' };
      const result = calculateExperience(character, []);
      
      // Formula for age 25: 15 * (25 - 5) = 15 * 20 = 300
      expect(result.general_exp_available).toBe(300);
    });
  });
  
  describe('Virtue/Flaw Experience Modifiers', () => {
    it('should apply general experience modifiers from virtues', () => {
      const character = { age: 25, character_type: 'companion' };
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            name: 'Wealthy',
            general_exp_modifier: 20,
            general_exp_modifier_category: null
          },
          is_house_virtue_flaw: false
        }
      ];
      
      const result = calculateExperience(character, virtuesFlaws);
      
      // Base exp: 15 * (25 - 5) = 300, plus 20 from virtue
      expect(result.general_exp_available).toBe(320);
    });
    
    it('should apply magical experience modifiers for magi', () => {
      const character = { age: 25, character_type: 'magus' };
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            name: 'Skilled Parens',
            magical_exp_modifier: 60,
            general_exp_modifier: 0
          },
          is_house_virtue_flaw: false
        }
      ];
      
      const result = calculateExperience(character, virtuesFlaws);
      
      // Base magical exp: 240, plus 60 from virtue
      expect(result.magical_exp_available).toBe(300);
    });
    
    it('should not apply magical experience modifiers for non-magi', () => {
      const character = { age: 25, character_type: 'companion' };
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            name: 'Skilled Parens', // Doesn't make sense for non-magi but testing logic
            magical_exp_modifier: 60,
            general_exp_modifier: 0
          },
          is_house_virtue_flaw: false
        }
      ];
      
      const result = calculateExperience(character, virtuesFlaws);
      
      // Non-magi get 0 magical exp regardless of modifiers
      expect(result.magical_exp_available).toBe(0);
    });
    
    it('should apply category-specific experience modifiers', () => {
      const character = { age: 25, character_type: 'companion' };
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            name: 'Warrior',
            general_exp_modifier: 50,
            general_exp_modifier_category: 'Martial'
          },
          is_house_virtue_flaw: false
        }
      ];
      
      const result = calculateExperience(character, virtuesFlaws);
      
      // Base exp remains unchanged: 15 * (25 - 5) = 300
      expect(result.general_exp_available).toBe(300);
      // Martial exp gets 50 from virtue
      expect(result.martial_exp_available).toBe(50);
    });
    
    it('should ignore house virtues/flaws when calculating experience', () => {
      const character = { age: 25, character_type: 'magus' };
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            name: 'House Virtue',
            general_exp_modifier: 30,
            magical_exp_modifier: 40
          },
          is_house_virtue_flaw: true
        }
      ];
      
      const result = calculateExperience(character, virtuesFlaws);
      
      // Base exp remains unchanged: 15 * (25 - 5) = 300
      expect(result.general_exp_available).toBe(300);
      // Base magical exp remains unchanged: 240
      expect(result.magical_exp_available).toBe(240);
    });
    
    it('should handle multiple virtues/flaws with experience modifiers', () => {
      const character = { age: 25, character_type: 'magus' };
      const virtuesFlaws = [
        {
          referenceVirtueFlaw: {
            name: 'Wealthy',
            general_exp_modifier: 20,
            general_exp_modifier_category: null
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            name: 'Skilled Parens',
            magical_exp_modifier: 60,
            general_exp_modifier: 0
          },
          is_house_virtue_flaw: false
        },
        {
          referenceVirtueFlaw: {
            name: 'Warrior',
            general_exp_modifier: 50,
            general_exp_modifier_category: 'Martial'
          },
          is_house_virtue_flaw: false
        }
      ];
      
      const result = calculateExperience(character, virtuesFlaws);
      
      // Base exp: 300, plus 20 from 'Wealthy'
      expect(result.general_exp_available).toBe(320);
      // Base magical exp: 240, plus 60 from 'Skilled Parens'
      expect(result.magical_exp_available).toBe(300);
      // Martial exp: 50 from 'Warrior'
      expect(result.martial_exp_available).toBe(50);
    });
  });
  
  describe('Ability Cost Calculation', () => {
    it('should calculate cost correctly for level 1', () => {
      const cost = calculateAbilityCost(1);
      expect(cost).toBe(5); // 5 * 1 * (1 + 1) / 2 = 5
    });
    
    it('should calculate cost correctly for level 5', () => {
      const cost = calculateAbilityCost(5);
      expect(cost).toBe(75); // 5 * 5 * (5 + 1) / 2 = 75
    });
    
    it('should calculate cost correctly for level 0', () => {
      const cost = calculateAbilityCost(0);
      expect(cost).toBe(0); // 5 * 0 * (0 + 1) / 2 = 0
    });
    
    it('should throw error for negative levels', () => {
      expect(() => calculateAbilityCost(-1)).toThrow('Level must be a non-negative number');
    });
    
    it('should throw error for non-numeric levels', () => {
      expect(() => calculateAbilityCost('five')).toThrow('Level must be a non-negative number');
    });
  });
  
  describe('Experience Validation', () => {
    it('should validate when all experience requirements are met', () => {
      const character = {
        character_type: 'companion',
        general_exp_available: 300,
        martial_exp_available: 50,
        academic_exp_available: 0
      };
      
      const abilities = [
        { level: 3, category: 'general' },  // Cost: 30
        { level: 4, category: 'martial' }   // Cost: 50
      ];
      
      const result = validateExperienceSpending(character, abilities);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
    
    it('should validate when experience is insufficient', () => {
      const character = {
        character_type: 'companion',
        general_exp_available: 20,
        martial_exp_available: 30,
        academic_exp_available: 0
      };
      
      const abilities = [
        { level: 3, category: 'general' },  // Cost: 30
        { level: 4, category: 'martial' }   // Cost: 50
      ];
      
      const result = validateExperienceSpending(character, abilities);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('Insufficient general experience');
    });
    
    it('should validate category-specific experience spending', () => {
      const character = {
        character_type: 'companion',
        general_exp_available: 100,
        martial_exp_available: 30,
        academic_exp_available: 0
      };
      
      const abilities = [
        { level: 3, category: 'martial' },  // Cost: 30 - exactly matches available
        { level: 2, category: 'academic' }  // Cost: 15 - no academic exp, must use general
      ];
      
      const result = validateExperienceSpending(character, abilities);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
    
    it('should validate magical experience spending for magi', () => {
      const character = {
        character_type: 'magus',
        general_exp_available: 300,
        magical_exp_available: 200,
        martial_exp_available: 0
      };
      
      const abilities = [
        { level: 5, category: 'general' },      // Cost: 75
        { level: 6, is_magical: true }          // Cost: 105
      ];
      
      const result = validateExperienceSpending(character, abilities);
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
    
    it('should validate when magical experience is insufficient', () => {
      const character = {
        character_type: 'magus',
        general_exp_available: 300,
        magical_exp_available: 100,
        martial_exp_available: 0
      };
      
      const abilities = [
        { level: 5, category: 'general' },      // Cost: 75
        { level: 6, is_magical: true }          // Cost: 105 > 100 available
      ];
      
      const result = validateExperienceSpending(character, abilities);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('Insufficient magical experience');
    });
    
    it('should throw error for missing character or abilities', () => {
      expect(() => validateExperienceSpending(null, [])).toThrow('Character and abilities array are required');
      expect(() => validateExperienceSpending({}, null)).toThrow('Character and abilities array are required');
    });
  });
});
