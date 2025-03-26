'use strict';

const { sequelize, Character, CharacterVirtueFlaw, ReferenceVirtueFlaw } = require('../models');
const { hasAffinityWithAbility } = require('../utils/abilityUtils');

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
    const transaction = await sequelize.transaction();
    
    try {
      // Fetch character with its Virtues/Flaws
      const character = await Character.findByPk(characterId, {
        include: [{
          model: CharacterVirtueFlaw,
          as: 'CharacterVirtueFlaws',
          include: [{
            model: ReferenceVirtueFlaw,
            as: 'referenceVirtueFlaw'
          }]
        }],
        transaction
      });
      
      if (!character) {
        await transaction.rollback();
        return { success: false, reason: 'Character not found' };
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
      return { success: false, reason: 'Database error', error: error.message };
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
}

module.exports = new ExperienceService();