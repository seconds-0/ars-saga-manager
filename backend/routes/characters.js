const express = require('express');
const { Character, CharacterVirtueFlaw, ReferenceVirtueFlaw } = require('../models');
const ruleEngine = require('../utils/ruleEngine');
const logger = require('../utils/logger');
const { authenticateToken } = require('../routes/auth');
const { v4: uuidv4 } = require('uuid');
const { validateVirtueFlaw, validateCharacter } = require('../middleware/validation');
const { AppError, handleError } = require('../utils/errorHandler');
const sanitizeInputs = require('../middleware/sanitizer');
const { Op } = require('sequelize');

const validateCharacteristics = (characteristics) => {
  const validCharacteristics = ['strength', 'stamina', 'dexterity', 'quickness', 'intelligence', 'presence', 'communication', 'perception'];
  for (let char of validCharacteristics) {
    if (typeof characteristics[char] !== 'number' || characteristics[char] < -3 || characteristics[char] > 3) {
      return `Invalid value for ${char}. Must be a number between -3 and 3.`;
    }
  }
  return null;
};

const calculateDerivedCharacteristics = (character) => {
  return {
    size: 0, // Default size
    confidence: 1, // Default confidence
    // Add more derived characteristics as needed
  };
};

const checkCharacterOwnership = async (req, res, next) => {
  const character = await Character.findOne({
    where: { id: req.params.id, userId: req.user.id }
  });
  if (!character) {
    return res.status(404).json({ message: 'Character not found or you do not have permission' });
  }
  req.character = character;
  next();
};

const router = express.Router();

// Use authenticateToken middleware for all character routes
router.use(authenticateToken);

// Create a new character
router.post('/', validateCharacter, async (req, res) => {
  try {
    const { characterName, characterType, characteristics = {}, useCunning = false } = req.body;
    console.log('Received request body:', req.body);
    console.log('User ID:', req.user.id);

    if (!characterName || characterName.trim() === '') {
      return res.status(400).json({ message: 'Character name is required' });
    }
    if (!characterType || !['Magus', 'Companion', 'Grog', 'Animal', 'Demon', 'Spirit', 'Faerie'].includes(characterType)) {
      return res.status(400).json({ message: 'Valid character type is required' });
    }

    // Ensure all characteristics are present, defaulting to 0 if not provided
    const defaultCharacteristics = {
      strength: 0, stamina: 0, dexterity: 0, quickness: 0,
      intelligence: 0, presence: 0, communication: 0, perception: 0
    };
    const fullCharacteristics = { ...defaultCharacteristics, ...characteristics };

    // Validate characteristics
    const validationError = validateCharacteristics(fullCharacteristics);
    if (validationError) {
      console.log('Validation error:', validationError);
      return res.status(400).json({ message: validationError });
    }

    const character = await Character.create({ 
      characterName, 
      userId: req.user.id,
      characterType,
      entityType: 'character',
      entityId: uuidv4(),
      ...characteristics,
      useCunning,
      totalImprovementPoints: 7 // Default value
    });
    console.log('Character created:', character.toJSON());

    const derivedCharacteristics = calculateDerivedCharacteristics(character);

    res.status(201).json({ ...character.toJSON(), derivedCharacteristics });
  } catch (error) {
    console.error('Error creating character:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error creating character', error: error.message, stack: error.stack });
  }
});

// Get all characters for the authenticated user
router.get('/', async (req, res) => {
  try {
    console.log('Fetching characters for user:', req.user.id);
    console.time('characterFetch');
    
    if (!req.user || !req.user.id) {
      console.error('User not authenticated or user ID missing');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!Character || typeof Character.findAll !== 'function') {
      console.error('Character model is not properly defined');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const characters = await Character.findAll({ 
      where: { userId: req.user.id },
      attributes: { 
        include: ['id', 'characterName', 'virtueFlawPoints', 'maxVirtueFlawPoints']
      }
    });
    
    console.timeEnd('characterFetch');
    console.log('Characters found:', characters.length);
    
    res.json({
      message: 'Characters fetched successfully',
      count: characters.length,
      characters: characters
    });
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ 
      message: 'Error fetching characters', 
      error: error.message, 
      stack: error.stack 
    });
  }
});

// Get a specific character
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching character with ID:', req.params.id);
    console.log('User ID:', req.user.id);

    const character = await Character.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!character) {
      console.log('Character not found');
      return res.status(404).json({ message: 'Character not found' });
    }

    console.log('Character found:', character.toJSON());
    res.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ message: 'Error fetching character', error: error.message });
  }
});

// Update a character
router.put('/:id', checkCharacterOwnership, validateCharacter, async (req, res) => {
  try {
    console.log('Received update request for character:', req.params.id);
    console.log('Request body:', req.body);

    const { useCunning, totalImprovementPoints, ...characteristics } = req.body;
    
    // Validate characteristics
    const validationError = validateCharacteristics(characteristics);
    if (validationError) {
      console.log('Validation error:', validationError);
      return res.status(400).json({ message: validationError });
    }

    const [updated] = await Character.update(
      { ...characteristics, useCunning, totalImprovementPoints },
      { where: { id: req.params.id, userId: req.user.id } }
    );

    if (updated) {
      const updatedCharacter = await Character.findOne({ where: { id: req.params.id } });
      const derivedCharacteristics = calculateDerivedCharacteristics(updatedCharacter);
      console.log('Character updated successfully:', updatedCharacter.toJSON());
      return res.json({ ...updatedCharacter.toJSON(), derivedCharacteristics });
    }
    console.log('Character not found:', req.params.id);
    return res.status(404).json({ message: 'Character not found' });
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ message: 'Error updating character', error: error.message });
  }
});

// Delete a character
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Character.destroy({ 
      where: { id: req.params.id, userId: req.user.id } 
    });
    if (deleted) {
      return res.status(204).send();
    }
    return res.status(404).json({ message: 'Character not found' });
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({ message: 'Error deleting character', error: error.message });
  }
});

// Get eligible virtues and flaws for a character
router.get('/:id/eligible-virtues-flaws', authenticateToken, checkCharacterOwnership, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { search = '', page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const character = await Character.findByPk(id, {
      include: [{
        model: CharacterVirtueFlaw,
        as: 'CharacterVirtueFlaws',
        include: [{
          model: ReferenceVirtueFlaw,
          as: 'referenceVirtueFlaw'
        }]
      }]
    });

    if (!character) {
      return next(new AppError('Character not found', 404));
    }

    const whereClause = search
      ? { name: { [Op.iLike]: `%${search}%` } }
      : {};

    const { rows, count } = await ReferenceVirtueFlaw.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const eligibleVirtuesFlaws = rows.filter(vf => 
      ruleEngine.isVirtueFlawEligible(character, vf)
    );

    res.json({
      virtuesFlaws: eligibleVirtuesFlaws,
      totalCount: count,
      hasNextPage: offset + eligibleVirtuesFlaws.length < count,
    });
  } catch (error) {
    console.error('Error in eligible-virtues-flaws route:', error);
    next(new AppError('Error fetching eligible virtues and flaws', 500));
  }
});

// Get virtues and flaws for a specific character
router.get('/:id/virtues-flaws', async (req, res) => {
  try {
    const character = await Character.findByPk(req.params.id, {
      include: [{
        model: CharacterVirtueFlaw,
        as: 'CharacterVirtueFlaws',
        include: [{
          model: ReferenceVirtueFlaw,
          as: 'referenceVirtueFlaw'
        }]
      }]
    });

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const virtuesFlaws = character.CharacterVirtueFlaws.map(cvf => ({
      id: cvf.id,
      name: cvf.referenceVirtueFlaw.name,
      description: cvf.referenceVirtueFlaw.description,
      cost: cvf.cost,
      selections: cvf.selections
    }));

    res.json(virtuesFlaws);
  } catch (error) {
    console.error('Error fetching virtues and flaws:', error);
    res.status(500).json({ message: 'Error fetching virtues and flaws', error: error.message });
  }
});

// Add a virtue or flaw to a character
router.post('/:id/virtues-flaws', authenticateToken, checkCharacterOwnership, sanitizeInputs, validateVirtueFlaw, async (req, res) => {
  try {
    const { referenceVirtueFlawId, cost, selections } = req.body;
    const character = req.character;
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const virtueFlaw = await ReferenceVirtueFlaw.findByPk(referenceVirtueFlawId);
    if (!virtueFlaw) {
      return res.status(404).json({ message: 'Virtue or Flaw not found' });
    }

    if (!ruleEngine.isVirtueFlawEligible(character, virtueFlaw)) {
      throw new AppError('Character is not eligible for this Virtue or Flaw', 400);
    }

    const newVirtueFlaw = await CharacterVirtueFlaw.create({
      characterId: character.id,
      referenceVirtueFlawId,
      cost,
      selections
    });

    // Update character's virtue/flaw points
    await character.update({
      virtueFlawPoints: character.virtueFlawPoints + cost
    });

    logger.info(`Virtue/Flaw added to character ${req.params.id}`);
    res.status(201).json(newVirtueFlaw);
  } catch (error) {
    logger.error(`Error adding Virtue/Flaw to character ${req.params.id}: ${error.message}`);
    handleError(error, res);
  }
});

// Remove a virtue or flaw from a character
router.delete('/:characterId/virtues-flaws/:virtueFlawId', checkCharacterOwnership, async (req, res) => {
  try {
    const { characterId, virtueFlawId } = req.params;
    const characterVirtueFlaw = await CharacterVirtueFlaw.findOne({
      where: { id: virtueFlawId, characterId }
    });

    if (!characterVirtueFlaw) {
      return res.status(404).json({ message: 'Virtue or Flaw not found for this character' });
    }

    const character = req.character;
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    // Update character's virtue/flaw points
    await character.update({
      virtueFlawPoints: character.virtueFlawPoints - characterVirtueFlaw.cost
    });

    await characterVirtueFlaw.destroy();

    res.status(204).send();
  } catch (error) {
    logger.error('Error removing virtue or flaw:', error);
    res.status(500).json({ message: 'Error removing virtue or flaw' });
  }
});

module.exports = router;