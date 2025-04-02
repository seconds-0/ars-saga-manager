'use strict';

const { sequelize, Character } = require('../models');
const { hasAffinityWithAbility } = require('../utils/abilityUtils');
const { safeCharacterVirtueFlawsInclude } = require('../utils/modelIncludeUtils');

/**
 * Service for handling experience point spending
 */
class ExperienceService {
  /**
   * Spends experience points on an ability
   * @param {number} characterId - Character ID
   * @param {string} abilityCategory - Category of the ability
   * @param {string} abilityName - Name of the ability
   * @param {number} expCost - Experience cost to deduct
   * @returns {Object} - Result of the spending operation
   */
  async spendExperience(characterId, abilityCategory, abilityName, expCost) {
    console.log(`Spending ${expCost} exp on ${abilityName} (${abilityCategory}) for character ${characterId}`);
    
    const transaction = await sequelize.transaction();
    
    try {
      console.log('Starting experience spending transaction');
      
      // Fetch character with its Virtues/Flaws, using the safe include helper
      const character = await Character.findByPk(characterId, {
        include: [safeCharacterVirtueFlawsInclude()],
        transaction
      });
      
      if (!character) {
        console.error(`Character not found with ID: ${characterId}`);
        await transaction.rollback();
        return { success: false, reason: 'Character not found' };
      }
      
      console.log(`Character found: ${character.name}, general_exp_available: ${character.general_exp_available}`);
      
      // Log virtues/flaws for debugging
      if (character.CharacterVirtueFlaws && character.CharacterVirtueFlaws.length > 0) {
        console.log(`Character has ${character.CharacterVirtueFlaws.length} virtues/flaws`);
      } else {
        console.log('Character has no virtues/flaws');
      }
      
      // Convert Exp pools to local variables for easier manipulation
      const { general_exp_available, magical_exp_available, restricted_exp_pools } = character;
      const updatedRestrictedPools = JSON.parse(JSON.stringify(restricted_exp_pools || []));
      
      // Determine the actual cost (account for affinity)
      // This should normally be handled before calling this service
      
      // Determine spending priority: Restricted -> Magical -> General
      let remainingCost = expCost;
      let updatedGeneralExp = general_exp_available;
      let updatedMagicalExp = magical_exp_available;
      
      // 1. First, try to spend from restricted pools that match this ability/category
      for (let i = 0; i < updatedRestrictedPools.length && remainingCost > 0; i++) {
        const pool = updatedRestrictedPools[i];
        
        // Check if this pool can be used for this ability
        const canUsePool = this._canUsePoolForAbility(pool, abilityName, abilityCategory);
        
        if (canUsePool) {
          const availableInPool = pool.amount - (pool.spent || 0);
          const amountToSpend = Math.min(availableInPool, remainingCost);
          
          if (amountToSpend > 0) {
            // Update the spent amount in this pool
            pool.spent = (pool.spent || 0) + amountToSpend;
            remainingCost -= amountToSpend;
          }
        }
      }
      
      // 2. Then, try to spend from magical exp if appropriate (for Arcane)
      if (remainingCost > 0 && character.character_type.toLowerCase() === 'magus' && 
          (abilityCategory === 'ARCANE' || abilityCategory === 'SUPERNATURAL')) {
        const amountToSpend = Math.min(updatedMagicalExp, remainingCost);
        
        if (amountToSpend > 0) {
          updatedMagicalExp -= amountToSpend;
          remainingCost -= amountToSpend;
        }
      }
      
      // 3. Finally, spend from general exp
      if (remainingCost > 0) {
        if (updatedGeneralExp >= remainingCost) {
          updatedGeneralExp -= remainingCost;
          remainingCost = 0;
        } else {
          // Not enough exp available
          await transaction.rollback();
          return { 
            success: false, 
            reason: 'Insufficient Experience',
            details: {
              required: expCost,
              available: general_exp_available + magical_exp_available + 
                         updatedRestrictedPools.reduce((sum, pool) => 
                           sum + (pool.amount - (pool.spent || 0)), 0)
            }
          };
        }
      }
      
      // If we've reached here, we have sufficient exp and have allocated it correctly
      // Update the character model
      await character.update({
        general_exp_available: updatedGeneralExp,
        magical_exp_available: updatedMagicalExp,
        restricted_exp_pools: updatedRestrictedPools
      }, { transaction });
      
      await transaction.commit();
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      console.error('Error spending experience:', error);
      console.error('Error stack:', error.stack);
      return { 
        success: false, 
        reason: 'Database error', 
        error: error.message,
        details: {
          stack: error.stack,
          name: error.name,
          code: error.code
        }
      };
    }
  }
  
  /**
   * Checks if a restricted exp pool can be used for a specific ability
   * @param {Object} pool - The restricted exp pool
   * @param {string} abilityName - The name of the ability
   * @param {string} abilityCategory - The category of the ability
   * @returns {boolean} - Whether the pool can be used
   */
  _canUsePoolForAbility(pool, abilityName, abilityCategory) {
    if (!pool.restrictions) {
      return false;
    }
    
    const { type, value } = pool.restrictions;
    
    switch (type) {
      case 'ability_name':
        return value === abilityName;
        
      case 'ability_list':
        return Array.isArray(value) && value.includes(abilityName);
        
      case 'category':
        return value === abilityCategory;
        
      default:
        return false;
    }
  }

  /**
   * Refunds experience points when an ability score is decreased
   * @param {number} characterId - Character ID
   * @param {string} abilityCategory - Category of the ability
   * @param {string} abilityName - Name of the ability
   * @param {number} expAmount - Experience amount to refund
   * @returns {Object} - Result of the refund operation
   */
  async refundExperience(characterId, abilityCategory, abilityName, expAmount) {
    console.log(`Refunding ${expAmount} exp for ${abilityName} (${abilityCategory}) to character ${characterId}`);
    
    const transaction = await sequelize.transaction();
    
    try {
      console.log('Starting experience refund transaction');
      
      // Fetch character with its Virtues/Flaws, using the safe include helper
      const character = await Character.findByPk(characterId, {
        include: [safeCharacterVirtueFlawsInclude()],
        transaction
      });
      
      if (!character) {
        console.error(`Character not found with ID: ${characterId}`);
        await transaction.rollback();
        return { success: false, reason: 'Character not found' };
      }
      
      console.log(`Character found: ${character.name}, general_exp_available: ${character.general_exp_available}`);
      
      // Convert Exp pools to local variables for easier manipulation
      const { general_exp_available, magical_exp_available } = character;
      
      // For simplicity, we always refund to general experience
      // In a more complex implementation, we could try to refund to the original pools
      const updatedGeneralExp = general_exp_available + expAmount;
      
      // Update the character model
      await character.update({
        general_exp_available: updatedGeneralExp
      }, { transaction });
      
      await transaction.commit();
      return { 
        success: true,
        details: {
          refunded: expAmount,
          new_general_exp: updatedGeneralExp
        }
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error refunding experience:', error);
      console.error('Error stack:', error.stack);
      return { 
        success: false, 
        reason: 'Database error', 
        error: error.message,
        details: {
          stack: error.stack,
          name: error.name,
          code: error.code
        }
      };
    }
  }
}

module.exports = new ExperienceService();