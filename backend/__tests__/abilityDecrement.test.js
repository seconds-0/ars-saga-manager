'use strict';

// Import the necessary modules
const { 
  calculateXPForLevel, 
  calculateLevelFromXP,
  getAbilityCost,
  getAbilityRefund
} = require('../utils/abilityUtils');

const experienceService = require('../services/experienceService');

// Mock the dependencies needed by experienceService
jest.mock('../models', () => {
  const mockCharacter = {
    findByPk: jest.fn(),
    update: jest.fn()
  };
  const mockSequelize = {
    transaction: jest.fn(() => ({
      commit: jest.fn(),
      rollback: jest.fn()
    }))
  };
  return {
    sequelize: mockSequelize,
    Character: mockCharacter
  };
});

jest.mock('../utils/modelIncludeUtils', () => ({
  safeCharacterVirtueFlawsInclude: jest.fn(() => ({ model: 'MockModel' }))
}));

describe('Ability Decrement Functionality', () => {
  describe('getAbilityRefund utility', () => {
    test('returns 0 when target XP is higher than current XP', () => {
      expect(getAbilityRefund(50, 75, 'Awareness', [], 'GENERAL')).toBe(0);
      expect(getAbilityRefund(50, 50, 'Awareness', [], 'GENERAL')).toBe(0);
    });

    test('returns correct base refund amount when decreasing XP', () => {
      expect(getAbilityRefund(50, 30, 'Awareness', [], 'GENERAL')).toBe(20);
      expect(getAbilityRefund(75, 15, 'Awareness', [], 'GENERAL')).toBe(60);
    });

    test('returns full refund regardless of virtues that affect cost (no gaming the system)', () => {
      const virtues = [
        {
          referenceVirtueFlaw: {
            name: 'Affinity with (Ability)',
            affects_ability_cost: true
          },
          selections: { Ability: 'Awareness' }
        }
      ];
      
      // Should still get full refund, not reduced by Affinity
      expect(getAbilityRefund(50, 30, 'Awareness', virtues, 'GENERAL')).toBe(20);
    });
  });

  describe('experienceService.refundExperience', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      
      // Setup default mock implementation
      const { Character, sequelize } = require('../models');
      
      sequelize.transaction.mockImplementation(() => ({
        commit: jest.fn(),
        rollback: jest.fn()
      }));
      
      Character.findByPk.mockReset();
      Character.update.mockReset();
    });

    test('adds the refunded XP to character general XP pool', async () => {
      // Mock dependencies
      const { Character } = require('../models');
      
      // Setup mock data
      const mockCharacter = {
        id: 123,
        name: 'Test Character',
        general_exp_available: 100,
        magical_exp_available: 50,
        CharacterVirtueFlaws: [],
        update: jest.fn().mockResolvedValue(true)
      };
      
      Character.findByPk.mockResolvedValue(mockCharacter);
      
      // Call the service
      const result = await experienceService.refundExperience(
        123,              // characterId
        'ACADEMIC',       // abilityCategory
        'Latin',          // abilityName
        25                // expAmount
      );
      
      // Verify the results
      expect(result.success).toBe(true);
      expect(result.details.refunded).toBe(25);
      expect(result.details.new_general_exp).toBe(125);
      
      // Verify character was updated with new XP value
      expect(mockCharacter.update).toHaveBeenCalledWith(
        expect.objectContaining({
          general_exp_available: 125
        }),
        expect.anything()
      );
    });

    test('handles character not found error', async () => {
      // Setup mock to return null (character not found)
      const { Character } = require('../models');
      Character.findByPk.mockResolvedValue(null);
      
      // Call the service
      const result = await experienceService.refundExperience(
        999,              // non-existent characterId
        'ACADEMIC',       // abilityCategory
        'Latin',          // abilityName
        25                // expAmount
      );
      
      // Verify error result
      expect(result.success).toBe(false);
      expect(result.reason).toBe('Character not found');
    });

    test('handles database errors during refund', async () => {
      // Mock dependencies
      const { Character } = require('../models');
      
      // Setup mock to throw an error
      const mockCharacter = {
        id: 123,
        name: 'Test Character',
        general_exp_available: 100,
        CharacterVirtueFlaws: [],
        update: jest.fn().mockRejectedValue(new Error('Database error'))
      };
      
      Character.findByPk.mockResolvedValue(mockCharacter);
      
      // Call the service
      const result = await experienceService.refundExperience(
        123,              // characterId
        'ACADEMIC',       // abilityCategory
        'Latin',          // abilityName
        25                // expAmount
      );
      
      // Verify error result
      expect(result.success).toBe(false);
      expect(result.reason).toBe('Database error');
    });
  });

  describe('XP and Level Calculations for Decrements', () => {
    test('level correctly decreases with XP reduction', () => {
      // Start with level 5 (75 XP)
      const initialXP = calculateXPForLevel(5);
      expect(initialXP).toBe(75);
      
      // Decrease to level 4 (50 XP)
      const level4XP = calculateXPForLevel(4);
      expect(level4XP).toBe(50);
      
      // Calculate refund amount
      const refundAmount = getAbilityRefund(initialXP, level4XP, 'Any', [], 'GENERAL');
      expect(refundAmount).toBe(25);
      
      // Verify level calculation
      expect(calculateLevelFromXP(level4XP)).toBe(4);
    });

    test('multiple increments and decrements work as expected', () => {
      // Start with level 0 (0 XP)
      let currentXP = 0;
      let currentLevel = calculateLevelFromXP(currentXP);
      expect(currentLevel).toBe(0);
      
      // Increment to level 1
      currentXP = calculateXPForLevel(1);
      currentLevel = calculateLevelFromXP(currentXP);
      expect(currentXP).toBe(5);
      expect(currentLevel).toBe(1);
      
      // Increment to level 3
      currentXP = calculateXPForLevel(3);
      currentLevel = calculateLevelFromXP(currentXP);
      expect(currentXP).toBe(30);
      expect(currentLevel).toBe(3);
      
      // Decrement to level 2
      currentXP = calculateXPForLevel(2);
      currentLevel = calculateLevelFromXP(currentXP);
      expect(currentXP).toBe(15);
      expect(currentLevel).toBe(2);
      
      // Verify refund amount for this last decrement
      const refundAmount = getAbilityRefund(30, 15, 'Any', [], 'GENERAL');
      expect(refundAmount).toBe(15);
    });
    
    test('XP cannot go below 0', () => {
      // Edge case: trying to go below level 0
      const refundAmount = getAbilityRefund(0, -10, 'Any', [], 'GENERAL');
      expect(refundAmount).toBe(0); // Cannot refund below 0
    });
  });
});