'use strict';

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { sequelize, ReferenceAbility, CharacterAbility, Character, CharacterVirtueFlaw, ReferenceVirtueFlaw } = require('../models');
const { authenticateToken } = require('./auth');
const experienceService = require('../services/experienceService');
const { 
  calculateXPForLevel, 
  calculateLevelFromXP, 
  applyVirtueEffects, 
  isAbilityAppropriateForCharacterType,
  calculateEffectiveScore,
  getAbilityCost,
  hasAffinityWithAbility
} = require('../utils/abilityUtils');

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
      include: [
        {
          model: CharacterVirtueFlaw,
          as: 'CharacterVirtueFlaws',
          include: [
            {
              model: ReferenceVirtueFlaw,
              as: 'referenceVirtueFlaw',  // Corrected to match the model association
              // Only select fields we actually need, explicitly excluding timestamps
              attributes: {
                include: ['id', 'name', 'description', 'type', 'size', 
                  'ability_score_bonus', 'specification_type', 'affects_ability_cost'],
                exclude: ['createdAt', 'updatedAt', 'created_at', 'updated_at']
              }
            }
          ]
        }
      ]
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
        const nextLevelXP = ability.score > 0 
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
    
    // Get character's virtues/flaws to check for Affinity
    const characterVirtuesFlaws = await CharacterVirtueFlaw.findAll({
      where: { character_id: characterId },
      include: [{
        model: ReferenceVirtueFlaw,
        as: 'referenceVirtueFlaw'
      }],
      transaction
    });
    
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
    
    // Get character's virtues/flaws to check for Affinity
    const characterVirtuesFlaws = await CharacterVirtueFlaw.findAll({
      where: { character_id: characterId },
      include: [{
        model: ReferenceVirtueFlaw,
        as: 'referenceVirtueFlaw'
      }],
      transaction
    });
    
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
      // Only allow increasing XP for now
      if (experience_points < ability.experience_points) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'Decreasing experience points is not supported'
        });
      }
      
      // Calculate the cost of the XP increase using our utility function
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
      
      updatedXP = experience_points;
      updatedScore = calculateLevelFromXP(experience_points);
      updatesMade = true;
    } 
    // If score is provided, update XP accordingly
    else if (score !== undefined && score !== ability.score) {
      // Only allow increasing score for now
      if (score < ability.score) {
        await transaction.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'Decreasing ability score is not supported'
        });
      }
      
      const newXP = calculateXPForLevel(score);
      
      // Calculate cost using our utility function
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
    await transaction.rollback();
    console.error('Error updating character ability:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update character ability',
      details: error.message
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