'use strict';

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { sequelize, ReferenceAbility, CharacterAbility, Character, CharacterVirtueFlaw } = require('../models');
const { authenticateToken } = require('./auth');
const experienceService = require('../services/experienceService');
const { 
  calculateXPForLevel, 
  calculateLevelFromXP, 
  applyVirtueEffects, 
  isAbilityAppropriateForCharacterType,
  calculateEffectiveScore,
  getAbilityCost,
  getAbilityRefund,
  hasAffinityWithAbility
} = require('../utils/abilityUtils');
const { safeReferenceVirtueFlawInclude, safeCharacterVirtueFlawsInclude } = require('../utils/modelIncludeUtils');

// Get all reference abilities (public endpoint - no auth required)
router.get('/', async (req, res) => {
  try {
    const abilities = await ReferenceAbility.findAll({
      order: [
        ['category', 'ASC'],
        ['name', 'ASC']
      ]
    });
    
    res.json({
      status: 'success',
      data: abilities
    });
  } catch (error) {
    console.error('Error fetching reference abilities:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reference abilities'
    });
  }
});

// Get reference abilities by category (public endpoint - no auth required)
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    
    const abilities = await ReferenceAbility.findAll({
      where: {
        category: category.toUpperCase()
      },
      order: [['name', 'ASC']]
    });
    
    res.json({
      status: 'success',
      data: abilities
    });
  } catch (error) {
    console.error(`Error fetching abilities for category ${req.params.category}:`, error);
    res.status(500).json({
      status: 'error',
      message: `Failed to fetch abilities for category ${req.params.category}`
    });
  }
});

// Get all abilities for a character
router.get('/:characterId/abilities', async (req, res) => {
  try {
    console.log('Fetching abilities for character:', req.params.characterId);
    console.log('User ID from req.user:', req.user?.id);
    
    const { characterId } = req.params;
    
    // Check if character belongs to the authenticated user
    const character = await Character.findOne({
      where: {
        id: characterId,
        user_id: req.user.id
      },
      include: [safeCharacterVirtueFlawsInclude()]
    });
    
    console.log('Character found:', character ? 'Yes' : 'No');
    
    if (!character) {
      return res.status(404).json({
        status: 'error',
        message: 'Character not found or access denied'
      });
    }
    
    // Get all abilities for the character
    const abilities = await CharacterAbility.findAll({
      where: {
        character_id: characterId
      },
      order: [
        ['category', 'ASC'],
        ['ability_name', 'ASC']
      ]
    });
    
    // Get all virtues that affect abilities with safer property access
    const abilityVirtues = character.CharacterVirtueFlaws.filter(vf => {
      // Standardize on referenceVirtueFlaw (lowercase r) since that's the alias in the model
      const ref = vf.referenceVirtueFlaw;
      return ref && ref.type === 'Virtue' && 
        (ref.name.includes('Puissant') || ref.name.includes('Affinity'));
    });
    
    // Apply virtue effects to ability scores with additional error handling
    const enhancedAbilities = abilities.map(ability => {
      try {
        const effectiveScore = calculateEffectiveScore(
          ability.ability_name,
          ability.score,
          character.CharacterVirtueFlaws
        );
        
        // Calculate XP needed for next level
        const nextLevelXP = ability.score >= 0 
          ? (ability.score * 5) + 5
          : 5;

        return {
          ...ability.toJSON(),
          effective_score: effectiveScore,
          xp_for_next_level: nextLevelXP,
          has_affinity: hasAffinityWithAbility(ability.ability_name, character.CharacterVirtueFlaws)
        };
      } catch (err) {
        console.error(`Error enhancing ability ${ability.ability_name}:`, err);
        // Return a basic version of the ability without enhancements
        return {
          ...ability.toJSON(),
          effective_score: ability.score,
          xp_for_next_level: ability.score > 0 ? (ability.score * 5) + 5 : 5,
          has_affinity: false
        };
      }
    });
    
    res.json({
      status: 'success',
      data: enhancedAbilities
    });
  } catch (error) {
    console.error(`Error fetching abilities for character ${req.params.characterId}:`, error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch character abilities',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Add a new ability to a character
router.post('/:characterId/abilities', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { characterId } = req.params;
    const { ability_name, category, specialty, experience_points } = req.body;
    
    if (!ability_name || !category) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Ability name and category are required'
      });
    }
    
    // Check if character belongs to the authenticated user
    const character = await Character.findOne({
      where: {
        id: characterId,
        user_id: req.user.id
      },
      transaction
    });
    
    if (!character) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Character not found or access denied'
      });
    }
    
    // Check if the ability exists in the reference abilities
    const referenceAbility = await ReferenceAbility.findOne({
      where: {
        name: ability_name
      },
      transaction
    });
    
    if (!referenceAbility) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: `Ability "${ability_name}" not found in reference abilities`
      });
    }
    
    // Check if the ability is appropriate for the character type
    if (!isAbilityAppropriateForCharacterType(ability_name, category, character.character_type)) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: `Ability "${ability_name}" is not appropriate for ${character.character_type} characters`
      });
    }
    
    // Check if the character already has this ability
    const existingAbility = await CharacterAbility.findOne({
      where: {
        character_id: characterId,
        ability_name
      },
      transaction
    });
    
    if (existingAbility) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: `Character already has ability "${ability_name}"`
      });
    }
    
    // Extract character virtues/flaws directly from the character object we already fetched
    // This is more efficient than doing another query
    const characterVirtuesFlaws = character.CharacterVirtueFlaws || [];
    
    // Calculate score from XP if provided
    let score = 0;
    let xp = experience_points || 0;
    
    if (xp > 0) {
      score = calculateLevelFromXP(xp);
      
      // Calculate actual cost based on virtues/flaws
      const actualCost = getAbilityCost(
        xp,  // Target XP 
        0,   // Current XP (0 for new ability)
        ability_name,
        characterVirtuesFlaws,
        category
      );
      
      if (actualCost > 0) {
        // Use the imported experienceService
        const spendResult = await experienceService.spendExperience(
          characterId,
          category,
          ability_name,
          actualCost
        );
        
        if (!spendResult.success) {
          await transaction.rollback();
          return res.status(400).json({
            status: 'error',
            message: spendResult.reason,
            details: spendResult.details || {}
          });
        }
      }
    }
    
    // Create the new ability
    const newAbility = await CharacterAbility.create({
      character_id: characterId,
      ability_name,
      score,
      specialty: specialty || null,
      category,
      experience_points: xp
    }, { transaction });
    
    await transaction.commit();
    
    // Calculate effective score using the enhanced function
    const effectiveScore = calculateEffectiveScore(
      ability_name,
      score,
      characterVirtuesFlaws
    );
    
    res.status(201).json({
      status: 'success',
      data: {
        ...newAbility.toJSON(),
        effective_score: effectiveScore
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error adding ability to character:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add ability to character',
      details: error.message
    });
  }
});

// Update an ability for a character
router.put('/:characterId/abilities/:abilityId', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { characterId, abilityId } = req.params;
    const { score, specialty, experience_points } = req.body;
    
    console.log(`Updating ability ${abilityId} for character ${characterId} with:`, { score, specialty, experience_points });
    
    // Check if character belongs to the authenticated user
    const character = await Character.findOne({
      where: {
        id: characterId,
        user_id: req.user.id
      },
      include: [safeCharacterVirtueFlawsInclude()],
      transaction
    });
    
    if (!character) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Character not found or access denied'
      });
    }
    
    // Find the ability to update
    const ability = await CharacterAbility.findOne({
      where: {
        id: abilityId,
        character_id: characterId
      },
      transaction
    });
    
    if (!ability) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Ability not found for this character'
      });
    }
    
    // Extract character virtues/flaws directly from the character object we already fetched
    // This is more efficient than doing another query
    const characterVirtuesFlaws = character.CharacterVirtueFlaws || [];
    
    // Get affinity status using our utility function
    const hasAffinity = hasAffinityWithAbility(ability.ability_name, characterVirtuesFlaws);
    
    // Handle updates
    let updatedXP = ability.experience_points;
    let updatedScore = ability.score;
    let updatesMade = false;
    
    // If specialty is provided and different from current, update it
    if (specialty !== undefined && specialty !== ability.specialty) {
      updatesMade = true;
    }
    
    // If XP is provided, update score accordingly
    if (experience_points !== undefined && experience_points !== ability.experience_points) {
      if (experience_points > ability.experience_points) {
        // For increasing XP, calculate the cost and spend XP
        const actualCost = getAbilityCost(
          experience_points,  // Target XP
          ability.experience_points,  // Current XP
          ability.ability_name,
          characterVirtuesFlaws,
          ability.category
        );
        
        if (actualCost > 0) {
          // Spend the experience points using the imported service
          const spendResult = await experienceService.spendExperience(
            characterId,
            ability.category,
            ability.ability_name,
            actualCost
          );
          
          if (!spendResult.success) {
            await transaction.rollback();
            return res.status(400).json({
              status: 'error',
              message: spendResult.reason,
              details: spendResult.details || {}
            });
          }
        }
      } else {
        // For decreasing XP, calculate and refund the difference
        console.log(`Decreasing XP for ${ability.ability_name} from ${ability.experience_points} to ${experience_points}`);
        
        // Calculate the refund amount
        const refundAmount = getAbilityRefund(
          ability.experience_points, // Current XP
          experience_points,        // Target XP
          ability.ability_name,
          characterVirtuesFlaws,
          ability.category
        );
        
        if (refundAmount > 0) {
          console.log(`Refunding ${refundAmount} XP for decreasing XP of ${ability.ability_name}`);
          
          // Refund the experience points
          const refundResult = await experienceService.refundExperience(
            characterId,
            ability.category,
            ability.ability_name,
            refundAmount
          );
          
          if (!refundResult.success) {
            console.error(`Failed to refund XP: ${refundResult.reason}`);
            // We don't rollback here since we still want to allow the XP to decrease
            // Just log the error but continue with the update
          } else {
            console.log(`Successfully refunded ${refundAmount} XP. New general XP: ${refundResult.details.new_general_exp}`);
          }
        }
      }
      
      updatedXP = experience_points;
      updatedScore = calculateLevelFromXP(experience_points);
      updatesMade = true;
    } 
    // If score is provided, update XP accordingly
    else if (score !== undefined && score !== ability.score) {
      const newXP = calculateXPForLevel(score);
      
      if (score > ability.score) {
        // For increasing scores, we need to calculate the cost and spend XP
        const actualCost = getAbilityCost(
          newXP,  // Target XP
          ability.experience_points,  // Current XP
          ability.ability_name,
          characterVirtuesFlaws,
          ability.category
        );
        
        if (actualCost > 0) {
          // Spend the experience points using the imported service
          const spendResult = await experienceService.spendExperience(
            characterId,
            ability.category,
            ability.ability_name,
            actualCost
          );
          
          if (!spendResult.success) {
            await transaction.rollback();
            return res.status(400).json({
              status: 'error',
              message: spendResult.reason,
              details: spendResult.details || {}
            });
          }
        }
      } else {
        // For decreasing scores, calculate and refund XP to the character
        console.log(`Decreasing ability score for ${ability.ability_name} from ${ability.score} to ${score}`);
        
        // Calculate the refund amount
        const refundAmount = getAbilityRefund(
          ability.experience_points, // Current XP
          newXP,                    // Target XP
          ability.ability_name,
          characterVirtuesFlaws,
          ability.category
        );
        
        if (refundAmount > 0) {
          console.log(`Refunding ${refundAmount} XP for decreasing ${ability.ability_name}`);
          
          // Refund the experience points
          const refundResult = await experienceService.refundExperience(
            characterId,
            ability.category,
            ability.ability_name,
            refundAmount
          );
          
          if (!refundResult.success) {
            console.error(`Failed to refund XP: ${refundResult.reason}`);
            // We don't rollback here since we still want to allow the score to decrease
            // Just log the error but continue with the update
          } else {
            console.log(`Successfully refunded ${refundAmount} XP. New general XP: ${refundResult.details.new_general_exp}`);
          }
        }
      }
      
      updatedScore = score;
      updatedXP = newXP;
      updatesMade = true;
    }
    
    if (!updatesMade) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'No changes were provided for the update'
      });
    }
    
    // Update the ability
    await ability.update({
      score: updatedScore,
      specialty: specialty !== undefined ? specialty : ability.specialty,
      experience_points: updatedXP
    }, { transaction });
    
    await transaction.commit();
    
    // Fetch the updated ability
    const updatedAbility = await CharacterAbility.findByPk(abilityId);
    
    // Calculate effective score using the enhanced function
    const effectiveScore = calculateEffectiveScore(
      updatedAbility.ability_name,
      updatedAbility.score,
      characterVirtuesFlaws
    );
    
    res.json({
      status: 'success',
      data: {
        ...updatedAbility.toJSON(),
        effective_score: effectiveScore
      }
    });
  } catch (error) {
    // Make sure to rollback the transaction
    try {
      if (transaction) await transaction.rollback();
    } catch (rollbackError) {
      console.error('Error during transaction rollback:', rollbackError);
    }
    
    console.error('Error updating character ability:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to update character ability',
      details: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

/**
 * Batch update abilities for a character
 * This endpoint accepts multiple ability operations in a single request
 * to reduce API calls and avoid rate limiting issues
 */
router.post('/:characterId/abilities/batch', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { characterId } = req.params;
    const { operations } = req.body;
    
    // Validate request
    if (!operations || !Array.isArray(operations) || operations.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'Request must include an array of operations'
      });
    }
    
    // Check if character belongs to the authenticated user
    const character = await Character.findOne({
      where: {
        id: characterId,
        user_id: req.user.id
      },
      include: [safeCharacterVirtueFlawsInclude()],
      transaction
    });
    
    if (!character) {
      await transaction.rollback();
      return res.status(404).json({
        status: 'error',
        message: 'Character not found or access denied'
      });
    }
    
    // Extract character virtues/flaws directly from the character object
    const characterVirtuesFlaws = character.CharacterVirtueFlaws || [];
    
    // Process each operation
    const results = [];
    let hasErrors = false;
    
    for (const operation of operations) {
      const { abilityId, action, data } = operation;
      
      try {
        // Validate operation
        if (!abilityId || !action) {
          results.push({
            abilityId,
            action,
            success: false,
            error: 'Missing required operation fields (abilityId, action)',
          });
          hasErrors = true;
          continue;
        }
        
        // Find the ability
        const ability = await CharacterAbility.findOne({
          where: {
            id: abilityId,
            character_id: characterId
          },
          transaction
        });
        
        if (!ability) {
          results.push({
            abilityId,
            action,
            success: false,
            error: `Ability with ID ${abilityId} not found for this character`,
          });
          hasErrors = true;
          continue;
        }
        
        // Set default values based on current ability
        let updatedXP = ability.experience_points;
        let updatedScore = ability.score;
        let updatedSpecialty = ability.specialty;
        let updatesMade = false;
        
        // Process based on action type
        switch (action) {
          case 'increment': {
            // Increment score by 1 level
            const targetScore = ability.score + 1;
            const targetXP = calculateXPForLevel(targetScore);
            const xpNeeded = targetXP - ability.experience_points;
            
            console.log(`Batch: Incrementing ${ability.ability_name} from score ${ability.score} (${ability.experience_points} XP) to score ${targetScore} (${targetXP} XP)`);
            console.log(`XP needed: ${xpNeeded}`);
            
            if (xpNeeded > 0) {
              // Calculate actual cost with virtues/flaws
              const actualCost = getAbilityCost(
                targetXP,  // Target XP
                ability.experience_points,  // Current XP
                ability.ability_name,
                characterVirtuesFlaws,
                ability.category
              );
              
              if (actualCost > 0) {
                // Spend the experience points
                const spendResult = await experienceService.spendExperience(
                  characterId,
                  ability.category,
                  ability.ability_name,
                  actualCost
                );
                
                if (!spendResult.success) {
                  results.push({
                    abilityId,
                    action,
                    success: false,
                    error: spendResult.reason,
                    details: spendResult.details || {}
                  });
                  continue;
                }
              }
            }
            
            updatedScore = targetScore;
            updatedXP = targetXP;
            updatesMade = true;
            break;
          }
          
          case 'decrement': {
            // Don't allow decrementing below 0
            if (ability.score <= 0) {
              results.push({
                abilityId,
                action,
                success: false,
                error: 'Cannot decrement ability score below 0',
              });
              continue;
            }
            
            // Decrement score by 1 level
            const targetScore = ability.score - 1;
            const targetXP = calculateXPForLevel(targetScore);
            const xpRefund = ability.experience_points - targetXP;
            
            console.log(`Batch: Decrementing ${ability.ability_name} from score ${ability.score} (${ability.experience_points} XP) to score ${targetScore} (${targetXP} XP)`);
            console.log(`XP refund: ${xpRefund}`);
            
            if (xpRefund > 0) {
              // Calculate actual refund with virtues/flaws
              const refundAmount = getAbilityRefund(
                ability.experience_points, // Current XP
                targetXP,                 // Target XP
                ability.ability_name,
                characterVirtuesFlaws,
                ability.category
              );
              
              if (refundAmount > 0) {
                // Refund the experience points
                const refundResult = await experienceService.refundExperience(
                  characterId,
                  ability.category,
                  ability.ability_name,
                  refundAmount
                );
                
                if (!refundResult.success) {
                  console.error(`Failed to refund XP: ${refundResult.reason}`);
                  // We still allow the operation to continue - just log the error
                }
              }
            }
            
            updatedScore = targetScore;
            updatedXP = targetXP;
            updatesMade = true;
            break;
          }
          
          case 'update': {
            // Direct update with provided data
            if (!data) {
              results.push({
                abilityId,
                action,
                success: false,
                error: 'Missing data for update operation',
              });
              continue;
            }
            
            // Handle specialty update
            if (data.specialty !== undefined && data.specialty !== ability.specialty) {
              updatedSpecialty = data.specialty;
              updatesMade = true;
            }
            
            // Handle score/xp update - prioritize score if both are provided
            if (data.score !== undefined && data.score !== ability.score) {
              const newXP = calculateXPForLevel(data.score);
              
              if (data.score > ability.score) {
                // For increasing scores, calculate cost and spend XP
                const actualCost = getAbilityCost(
                  newXP,  // Target XP
                  ability.experience_points,  // Current XP
                  ability.ability_name,
                  characterVirtuesFlaws,
                  ability.category
                );
                
                if (actualCost > 0) {
                  // Spend the experience points
                  const spendResult = await experienceService.spendExperience(
                    characterId,
                    ability.category,
                    ability.ability_name,
                    actualCost
                  );
                  
                  if (!spendResult.success) {
                    results.push({
                      abilityId,
                      action,
                      success: false,
                      error: spendResult.reason,
                      details: spendResult.details || {}
                    });
                    continue;
                  }
                }
              } else {
                // For decreasing scores, calculate and refund XP
                const refundAmount = getAbilityRefund(
                  ability.experience_points, // Current XP
                  newXP,                    // Target XP
                  ability.ability_name,
                  characterVirtuesFlaws,
                  ability.category
                );
                
                if (refundAmount > 0) {
                  // Refund the experience points
                  const refundResult = await experienceService.refundExperience(
                    characterId,
                    ability.category,
                    ability.ability_name,
                    refundAmount
                  );
                  
                  if (!refundResult.success) {
                    console.error(`Failed to refund XP: ${refundResult.reason}`);
                    // We still allow the operation to continue - just log the error
                  }
                }
              }
              
              updatedScore = data.score;
              updatedXP = newXP;
              updatesMade = true;
            } 
            // If score is not provided but XP is, update based on XP
            else if (data.experience_points !== undefined && data.experience_points !== ability.experience_points) {
              if (data.experience_points > ability.experience_points) {
                // For increasing XP, calculate cost and spend XP
                const actualCost = getAbilityCost(
                  data.experience_points,  // Target XP
                  ability.experience_points,  // Current XP
                  ability.ability_name,
                  characterVirtuesFlaws,
                  ability.category
                );
                
                if (actualCost > 0) {
                  // Spend the experience points
                  const spendResult = await experienceService.spendExperience(
                    characterId,
                    ability.category,
                    ability.ability_name,
                    actualCost
                  );
                  
                  if (!spendResult.success) {
                    results.push({
                      abilityId,
                      action,
                      success: false,
                      error: spendResult.reason,
                      details: spendResult.details || {}
                    });
                    continue;
                  }
                }
              } else {
                // For decreasing XP, calculate and refund
                const refundAmount = getAbilityRefund(
                  ability.experience_points, // Current XP
                  data.experience_points,    // Target XP
                  ability.ability_name,
                  characterVirtuesFlaws,
                  ability.category
                );
                
                if (refundAmount > 0) {
                  // Refund the experience points
                  const refundResult = await experienceService.refundExperience(
                    characterId,
                    ability.category,
                    ability.ability_name,
                    refundAmount
                  );
                  
                  if (!refundResult.success) {
                    console.error(`Failed to refund XP: ${refundResult.reason}`);
                    // We still allow the operation to continue - just log the error
                  }
                }
              }
              
              updatedXP = data.experience_points;
              updatedScore = calculateLevelFromXP(data.experience_points);
              updatesMade = true;
            }
            
            break;
          }
          
          default:
            results.push({
              abilityId,
              action,
              success: false,
              error: `Unknown action: ${action}`,
            });
            continue;
        }
        
        // If no updates were made, skip this operation
        if (!updatesMade) {
          results.push({
            abilityId,
            action,
            success: true,
            data: ability.toJSON(),
            message: 'No changes required',
          });
          continue;
        }
        
        // Update the ability
        await ability.update({
          score: updatedScore,
          specialty: updatedSpecialty,
          experience_points: updatedXP
        }, { transaction });
        
        // Calculate effective score
        const effectiveScore = calculateEffectiveScore(
          ability.ability_name,
          updatedScore,
          characterVirtuesFlaws
        );
        
        // Add result
        results.push({
          abilityId,
          action,
          success: true,
          data: {
            id: ability.id,
            ability_name: ability.ability_name,
            score: updatedScore,
            effective_score: effectiveScore,
            specialty: updatedSpecialty,
            experience_points: updatedXP,
            category: ability.category
          }
        });
        
      } catch (operationError) {
        console.error(`Error processing operation for ability ${abilityId}:`, operationError);
        
        results.push({
          abilityId,
          action,
          success: false,
          error: operationError.message || 'An error occurred processing this operation',
        });
        
        hasErrors = true;
      }
    }
    
    // If any operations failed and we're not using partial success, rollback
    // Otherwise commit the transaction
    if (hasErrors && req.body.allOrNothing === true) {
      await transaction.rollback();
      return res.status(400).json({
        status: 'error',
        message: 'One or more operations failed and allOrNothing is enabled',
        results
      });
    } else {
      await transaction.commit();
      
      return res.json({
        status: 'success',
        results
      });
    }
    
  } catch (error) {
    // Make sure to rollback the transaction
    try {
      if (transaction) await transaction.rollback();
    } catch (rollbackError) {
      console.error('Error during transaction rollback:', rollbackError);
    }
    
    console.error('Error processing batch ability updates:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to process batch ability updates',
      details: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// Delete an ability from a character
router.delete('/:characterId/abilities/:abilityId', async (req, res) => {
  try {
    const { characterId, abilityId } = req.params;
    
    // Check if character belongs to the authenticated user
    const character = await Character.findOne({
      where: {
        id: characterId,
        user_id: req.user.id
      }
    });
    
    if (!character) {
      return res.status(404).json({
        status: 'error',
        message: 'Character not found or access denied'
      });
    }
    
    // Find the ability to delete
    const ability = await CharacterAbility.findOne({
      where: {
        id: abilityId,
        character_id: characterId
      }
    });
    
    if (!ability) {
      return res.status(404).json({
        status: 'error',
        message: 'Ability not found for this character'
      });
    }
    
    // Check if this is a required ability for the character type
    // For example, magi cannot delete Parma Magica
    if (
      (character.character_type.toLowerCase() === 'magus' && 
       ['Latin', 'Magic Theory', 'Parma Magica', 'Artes Liberales'].includes(ability.ability_name))
    ) {
      return res.status(400).json({
        status: 'error',
        message: `${ability.ability_name} is a required ability for ${character.character_type} characters and cannot be deleted`
      });
    }
    
    // Delete the ability
    await ability.destroy();
    
    res.json({
      status: 'success',
      message: `Ability ${ability.ability_name} successfully deleted`
    });
  } catch (error) {
    console.error('Error deleting character ability:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete character ability'
    });
  }
});

module.exports = router;