'use strict';

const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { ReferenceAbility, CharacterAbility, Character, CharacterVirtueFlaw, ReferenceVirtueFlaw } = require('../models');
const { isAuthenticated } = require('../middleware/validation');
const { calculateXPForLevel, calculateLevelFromXP, applyVirtueEffects, isAbilityAppropriateForCharacterType } = require('../utils/abilityUtils');

// Get all reference abilities
router.get('/reference-abilities', async (req, res) => {
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

// Get reference abilities by category
router.get('/reference-abilities/category/:category', async (req, res) => {
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
router.get('/characters/:characterId/abilities', isAuthenticated, async (req, res) => {
  try {
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
              as: 'ReferenceVirtueFlaw'
            }
          ]
        }
      ]
    });
    
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
    
    // Get all virtues that affect abilities
    const abilityVirtues = character.CharacterVirtueFlaws.filter(vf => 
      vf.ReferenceVirtueFlaw.is_virtue && 
      (vf.ReferenceVirtueFlaw.name.includes('Puissant') || 
       vf.ReferenceVirtueFlaw.name.includes('Affinity'))
    );
    
    // Apply virtue effects to ability scores
    const enhancedAbilities = abilities.map(ability => {
      const { score, xp } = applyVirtueEffects(
        ability.score,
        ability.experience_points,
        abilityVirtues,
        ability.ability_name
      );
      
      return {
        ...ability.toJSON(),
        effective_score: score
      };
    });
    
    res.json({
      status: 'success',
      data: enhancedAbilities
    });
  } catch (error) {
    console.error(`Error fetching abilities for character ${req.params.characterId}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch character abilities'
    });
  }
});

// Add a new ability to a character
router.post('/characters/:characterId/abilities', isAuthenticated, async (req, res) => {
  try {
    const { characterId } = req.params;
    const { ability_name, category, specialty, experience_points } = req.body;
    
    if (!ability_name || !category) {
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
      }
    });
    
    if (!character) {
      return res.status(404).json({
        status: 'error',
        message: 'Character not found or access denied'
      });
    }
    
    // Check if the ability exists in the reference abilities
    const referenceAbility = await ReferenceAbility.findOne({
      where: {
        name: ability_name
      }
    });
    
    if (!referenceAbility) {
      return res.status(400).json({
        status: 'error',
        message: `Ability "${ability_name}" not found in reference abilities`
      });
    }
    
    // Check if the ability is appropriate for the character type
    if (!isAbilityAppropriateForCharacterType(ability_name, category, character.character_type)) {
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
      }
    });
    
    if (existingAbility) {
      return res.status(400).json({
        status: 'error',
        message: `Character already has ability "${ability_name}"`
      });
    }
    
    // Calculate score from XP if provided
    let score = 0;
    let xp = experience_points || 0;
    
    if (xp > 0) {
      score = calculateLevelFromXP(xp);
    }
    
    // Create the new ability
    const newAbility = await CharacterAbility.create({
      character_id: characterId,
      ability_name,
      score,
      specialty: specialty || null,
      category,
      experience_points: xp
    });
    
    res.status(201).json({
      status: 'success',
      data: newAbility
    });
  } catch (error) {
    console.error('Error adding ability to character:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add ability to character'
    });
  }
});

// Update an ability for a character
router.put('/characters/:characterId/abilities/:abilityId', isAuthenticated, async (req, res) => {
  try {
    const { characterId, abilityId } = req.params;
    const { score, specialty, experience_points } = req.body;
    
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
    
    // Find the ability to update
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
    
    // Handle updates
    let updatedXP = ability.experience_points;
    let updatedScore = ability.score;
    
    // If XP is provided, update score accordingly
    if (experience_points !== undefined) {
      updatedXP = experience_points;
      updatedScore = calculateLevelFromXP(experience_points);
    } 
    // If score is provided, update XP accordingly
    else if (score !== undefined) {
      updatedScore = score;
      updatedXP = calculateXPForLevel(score);
    }
    
    // Update the ability
    await ability.update({
      score: updatedScore,
      specialty: specialty !== undefined ? specialty : ability.specialty,
      experience_points: updatedXP
    });
    
    // Fetch the updated ability
    const updatedAbility = await CharacterAbility.findByPk(abilityId);
    
    res.json({
      status: 'success',
      data: updatedAbility
    });
  } catch (error) {
    console.error('Error updating character ability:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update character ability'
    });
  }
});

// Delete an ability from a character
router.delete('/characters/:characterId/abilities/:abilityId', isAuthenticated, async (req, res) => {
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