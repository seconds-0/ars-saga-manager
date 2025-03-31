const express = require('express');
const { Character, CharacterVirtueFlaw, ReferenceVirtueFlaw } = require('../models');
const ruleEngine = require('../utils/ruleEngine');
const logger = require('../utils/logger');
const { authenticateToken } = require('../routes/auth');
const { v4: uuidv4 } = require('uuid');
const { validateVirtueFlaw, validateCharacter, validateCharacterUpdate } = require('../middleware/validation');
const { AppError, handleError } = require('../utils/errorHandler');
const sanitizeInputs = require('../middleware/sanitizer');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const { calculateCharacterExperience, recalculateAndUpdateExp } = require('../utils/experienceUtils');

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
    where: { id: req.params.id, user_id: req.user.id }
  });
  if (!character) {
    return res.status(404).json({ message: 'Character not found or you do not have permission' });
  }
  req.character = character;
  next();
};

const router = express.Router();

// Create a new character
router.post('/', authenticateToken, validateCharacter, async (req, res) => {
  try {
    const { name, character_type, characteristics = {}, use_cunning = false } = req.body;
    
    // Enhanced logging for debugging auth issues
    console.log('Request headers:', {
      authorization: req.headers.authorization ? 'Present' : 'Missing',
      contentType: req.headers['content-type']
    });
    console.log('Auth user data:', {
      userPresent: !!req.user,
      userId: req.user?.id,
      tokenPayload: req.user
    });

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      console.error('Authentication error:', {
        userPresent: !!req.user,
        userIdPresent: !!req.user?.id,
        headers: req.headers
      });
      return res.status(401).json({ message: 'Invalid user ID' });
    }

    // Use the ID directly from the token payload
    const user_id = req.user.id;

    // Verify user exists with enhanced error logging
    const user = await sequelize.models.User.findByPk(user_id);
    if (!user) {
      console.error('Database user not found:', {
        requestedId: user_id,
        tokenPayload: req.user
      });
      return res.status(404).json({ message: 'User not found' });
    }

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Character name is required' });
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

    console.log('Creating character with data:', {
      name,
      user_id,
      character_type,
      characteristics: fullCharacteristics,
      use_cunning
    });

    const character = await Character.create({
      name,
      user_id, // Use user_id from token
      character_type,
      entityType: 'character',
      entityId: uuidv4(),
      ...fullCharacteristics,
      use_cunning,
      total_improvement_points: 7, // Default value
      age: req.body.age || 25 // Set initial age from request or default to 25
    });
    console.log('Character created:', character.toJSON());

    // Calculate initial Exp pools
    const expValues = calculateCharacterExperience(character, []);
    await character.update(expValues);
    console.log('Experience values calculated:', expValues);

    const derivedCharacteristics = calculateDerivedCharacteristics(character);

    res.status(201).json({ ...character.toJSON(), derivedCharacteristics });
  } catch (error) {
    console.error('Error creating character:', error);
    console.error('Error stack:', error.stack);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Error creating character', error: error.message });
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
      where: { user_id: req.user.id },
      attributes: ['id', 'name', 'character_type', 'house_id', 'age', 'general_exp_available', 'magical_exp_available']
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
      where: { id: req.params.id, user_id: req.user.id }
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
router.put('/:id', checkCharacterOwnership, validateCharacterUpdate, async (req, res) => {
  try {
    console.log('Received update request for character:', req.params.id);
    console.log('Request body:', req.body);

    // Extract known fields explicitly, handle characteristics separately if needed
    const { 
        age, 
        recalculateXp, // This field is only used as a flag, not saved directly
        use_cunning, 
        total_improvement_points, 
        ...characteristics 
    } = req.body;
    
    // Prepare the update payload, excluding recalculateXp
    const updatePayload = {};
    if (age !== undefined) updatePayload.age = age;
    if (use_cunning !== undefined) updatePayload.use_cunning = use_cunning;
    if (total_improvement_points !== undefined) updatePayload.total_improvement_points = total_improvement_points;
    // Add valid characteristics to the payload
    const validCharacteristics = ['strength', 'stamina', 'dexterity', 'quickness', 'intelligence', 'presence', 'communication', 'perception'];
    for (const char of validCharacteristics) {
        if (characteristics[char] !== undefined) {
            updatePayload[char] = characteristics[char];
        }
    }

    // Check if there's anything to update
    if (Object.keys(updatePayload).length === 0) {
        console.log('No valid fields to update found in request body.');
        // Optionally return a 200 OK or a specific message
        const currentCharacter = await Character.findByPk(req.params.id);
        const derived = calculateDerivedCharacteristics(currentCharacter);
        return res.json({ ...currentCharacter.toJSON(), derivedCharacteristics: derived });
    }
    console.log('Prepared update payload:', updatePayload);

    // Check if age is being updated or recalculation is requested
    const character = await Character.findByPk(req.params.id);
    const isAgeUpdated = age !== undefined && Number(age) !== Number(character.age);
    const forceRecalculate = req.body.recalculateXp === true;
    
    console.log('Character update details:', {
      characterId: req.params.id,
      currentAge: character.age,
      newAge: age,
      isAgeUpdated,
      forceRecalculate,
      recalculateXpInRequest: req.body.recalculateXp
    });

    // Use the prepared updatePayload
    const [updated] = await Character.update(
      updatePayload, 
      { where: { id: req.params.id, user_id: req.user.id } }
    );

    if (updated) {
      // If age was updated or recalculation is requested, recalculate experience
      if (isAgeUpdated || forceRecalculate) {
        console.log('Age updated or recalculation requested, recalculating experience');
        try {
          const updatedCharacter = await recalculateAndUpdateExp(req.params.id, { Character, CharacterVirtueFlaw, ReferenceVirtueFlaw });
          console.log('Experience recalculated successfully:', {
            generalXp: updatedCharacter.general_exp_available,
            magicalXp: updatedCharacter.magical_exp_available,
            restrictedPools: updatedCharacter.restricted_exp_pools
          });
        } catch (recalcError) {
          console.error('Error recalculating experience:', recalcError);
          console.error('Stack trace:', recalcError.stack);
        }
      } else {
        console.log('Not recalculating experience - age not updated and recalculation not forced');
      }
      
      const updatedCharacter = await Character.findOne({ where: { id: req.params.id } });
      const derivedCharacteristics = calculateDerivedCharacteristics(updatedCharacter);
      console.log('Character updated successfully:', updatedCharacter.toJSON());
      return res.json({ ...updatedCharacter.toJSON(), derivedCharacteristics });
    }
    console.log('Character not found or update failed:', req.params.id);
    return res.status(404).json({ message: 'Character not found or update failed' });
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({ message: 'Error updating character', error: error.message });
  }
});

// Delete a character
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Character.destroy({ 
      where: { id: req.params.id, user_id: req.user.id } 
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
    console.log('Fetching virtues and flaws for character:', req.params.id);
    
    const character = await Character.findByPk(req.params.id, {
      include: [{
        model: CharacterVirtueFlaw,
        as: 'CharacterVirtueFlaws',
        include: [{
          model: ReferenceVirtueFlaw,
          as: 'referenceVirtueFlaw',
          attributes: ['id', 'name', 'description', 'type', 'size', 'category', 'realm', 'prerequisites', 'incompatibilities']
        }]
      }]
    });

    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }

    const virtuesFlaws = character.CharacterVirtueFlaws.map(cvf => ({
      id: cvf.id,
      referenceVirtueFlaw: cvf.referenceVirtueFlaw,
      is_house_virtue_flaw: cvf.is_house_virtue_flaw || false,
      cost: cvf.cost,
      selections: cvf.selections
    }));

    // Calculate remaining points (default is 10)
    const remainingPoints = 10 - (character.virtueFlawPoints || 0);

    res.json({
      virtuesFlaws: virtuesFlaws,
      remainingPoints: remainingPoints
    });
  } catch (error) {
    console.error('Error fetching virtues and flaws:', error);
    res.status(500).json({ message: 'Error fetching virtues and flaws', error: error.message });
  }
});

// Add a virtue or flaw to a character
router.post('/:id/virtues-flaws', authenticateToken, checkCharacterOwnership, sanitizeInputs, validateVirtueFlaw, async (req, res) => {
  try {
    const { referenceVirtueFlawId, cost, selections } = req.body;
    console.log('Adding virtue/flaw to character:', req.params.id, 'virtue/flaw ID:', referenceVirtueFlawId);
    console.log('Request body:', req.body);
    
    const character = req.character;
    if (!character) {
      return res.status(404).json({ status: 'fail', message: 'Character not found' });
    }

    const virtueFlaw = await ReferenceVirtueFlaw.findByPk(referenceVirtueFlawId);
    if (!virtueFlaw) {
      return res.status(404).json({ status: 'fail', message: 'Virtue or Flaw not found' });
    }

    console.log('Found virtue/flaw:', { id: virtueFlaw.id, name: virtueFlaw.name, type: virtueFlaw.type });
    
    // Check for eligibility
    const isEligible = ruleEngine.isVirtueFlawEligible(character, virtueFlaw);
    if (!isEligible) {
      throw new AppError('Character is not eligible for this Virtue or Flaw', 400);
    }

    // Calculate cost if not provided
    const calculatedCost = cost || (virtueFlaw.type === 'Virtue' ? 
      (virtueFlaw.size === 'Major' ? 3 : 1) : 0);

    console.log('Calculated cost:', calculatedCost);
    
    // Create the virtue/flaw entry
    const newVirtueFlaw = await CharacterVirtueFlaw.create({
      character_id: character.id,
      reference_virtue_flaw_id: referenceVirtueFlawId,
      cost: calculatedCost,
      selections: selections || null,
      is_house_virtue_flaw: req.body.is_house_virtue_flaw || false
    });
    
    console.log('Created virtue/flaw entry:', newVirtueFlaw.id);

    // Update character's virtue/flaw points - handle null values
    const currentPoints = character.virtueFlawPoints || 0;
    console.log('Current virtueFlawPoints:', currentPoints, 'Adding cost:', calculatedCost);
    
    await character.update({
      virtueFlawPoints: currentPoints + calculatedCost
    });
    
    // Recalculate experience after adding virtue/flaw
    await recalculateAndUpdateExp(character.id, { Character, CharacterVirtueFlaw, ReferenceVirtueFlaw });
    console.log('Experience recalculated after adding virtue/flaw');

    logger.logger.info(`Virtue/Flaw added to character ${req.params.id}`);
    res.status(201).json(newVirtueFlaw);
  } catch (error) {
    console.error('Error stack:', error.stack);
    console.error('Error adding Virtue/Flaw:', error.name, error.message);
    
    // Log more data for debugging
    if (req.character) {
      console.log('Character data:', { 
        id: req.character.id, 
        name: req.character.name,
        virtueFlawPoints: req.character.virtueFlawPoints 
      });
    }
    
    logger.logger.error(`Error adding Virtue/Flaw to character ${req.params.id}: ${error.message}`);
    handleError(error, res);
  }
});

// Update virtue/flaw selections
router.put('/:id/virtues-flaws/:virtueFlawId', authenticateToken, checkCharacterOwnership, sanitizeInputs, async (req, res) => {
  try {
    const characterId = req.params.id;
    const { virtueFlawId } = req.params;
    const { selections } = req.body;
    
    console.log('Updating virtue/flaw selections:', { characterId, virtueFlawId, selections });
    
    // Find the CharacterVirtueFlaw and include the ReferenceVirtueFlaw data
    const characterVirtueFlaw = await CharacterVirtueFlaw.findOne({
      where: { 
        id: virtueFlawId, 
        character_id: characterId 
      },
      include: [{
        model: ReferenceVirtueFlaw,
        as: 'referenceVirtueFlaw'
      }]
    });
    
    if (!characterVirtueFlaw) {
      console.log('Virtue/flaw not found:', { virtueFlawId, characterId });
      return res.status(404).json({ status: 'fail', message: 'Virtue or Flaw not found for this character' });
    }
    
    // Validate selections based on specification_type
    const referenceVirtueFlaw = characterVirtueFlaw.referenceVirtueFlaw;
    if (referenceVirtueFlaw.requires_specification && !selections) {
      return res.status(400).json({
        status: 'fail',
        message: `This ${referenceVirtueFlaw.type} requires a selection of type: ${referenceVirtueFlaw.specification_type}`
      });
    }
    
    // Update the selections in the CharacterVirtueFlaw record
    await characterVirtueFlaw.update({ selections });
    
    // Fetch the updated record to return to the client
    const updatedCharacterVirtueFlaw = await CharacterVirtueFlaw.findOne({
      where: { id: virtueFlawId },
      include: [{
        model: ReferenceVirtueFlaw,
        as: 'referenceVirtueFlaw',
        attributes: ['id', 'name', 'description', 'type', 'size', 'category', 'realm', 
                    'requires_specification', 'specification_type', 'ability_score_bonus']
      }]
    });
    
    // Recalculate abilities scores for Puissant-like virtues
    // This will be handled by the GET /characters/:id/abilities endpoint
    
    logger.logger.info(`Updated virtue/flaw ${virtueFlawId} selections for character ${characterId}`);
    res.status(200).json({
      status: 'success',
      data: updatedCharacterVirtueFlaw
    });
  } catch (error) {
    console.error('Error stack:', error.stack);
    console.error('Error updating virtue/flaw selections:', error.name, error.message);
    logger.logger.error(`Error updating virtue/flaw selections: ${error.message}`);
    res.status(500).json({ status: 'error', message: 'Error updating virtue/flaw selections' });
  }
});

// Remove a virtue or flaw from a character
router.delete('/:id/virtues-flaws/:virtueFlawId', authenticateToken, checkCharacterOwnership, async (req, res) => {
  try {
    const characterId = req.params.id;
    const { virtueFlawId } = req.params;
    
    console.log('Removing virtue/flaw:', { characterId, virtueFlawId });
    
    const characterVirtueFlaw = await CharacterVirtueFlaw.findOne({
      where: { 
        id: virtueFlawId, 
        character_id: characterId 
      }
    });
    
    if (!characterVirtueFlaw) {
      console.log('Virtue/flaw not found:', { virtueFlawId, characterId });
      return res.status(404).json({ status: 'fail', message: 'Virtue or Flaw not found for this character' });
    }
    
    console.log('Found virtue/flaw to delete:', characterVirtueFlaw.id);
    
    const character = req.character;
    if (!character) {
      return res.status(404).json({ status: 'fail', message: 'Character not found' });
    }
    
    // Update character's virtue/flaw points - handle null values
    const currentPoints = character.virtueFlawPoints || 0;
    console.log('Current virtue/flaw points:', currentPoints, 'Subtracting cost:', characterVirtueFlaw.cost);
    
    await character.update({
      virtueFlawPoints: Math.max(0, currentPoints - characterVirtueFlaw.cost)
    });
    
    await characterVirtueFlaw.destroy();
    
    // Recalculate experience after removing virtue/flaw
    await recalculateAndUpdateExp(character.id, { Character, CharacterVirtueFlaw, ReferenceVirtueFlaw });
    console.log('Experience recalculated after removing virtue/flaw');
    
    logger.logger.info(`Removed virtue/flaw ${virtueFlawId} from character ${characterId}`);
    res.status(204).send();
  } catch (error) {
    console.error('Error stack:', error.stack);
    console.error('Error removing virtue/flaw:', error.name, error.message);
    logger.logger.error(`Error removing virtue or flaw: ${error.message}`);
    res.status(500).json({ status: 'error', message: 'Error removing virtue or flaw' });
  }
});

module.exports = router;