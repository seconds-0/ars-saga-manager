// backend/middleware/validation.js

const Joi = require('joi');
const { AppError } = require('../utils/errorHandler');

const virtueFlawSchema = Joi.object({
  referenceVirtueFlawId: Joi.number().integer().required(),
  cost: Joi.number().integer().optional(),
  selections: Joi.any().optional(), // Allow any type for selections initially
  is_house_virtue_flaw: Joi.boolean().optional()
});

const validateVirtueFlaw = (req, res, next) => {
  const { error } = virtueFlawSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const createCharacterSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  character_type: Joi.string().valid('magus', 'companion', 'grog').required(),
  use_cunning: Joi.boolean().optional(),
  // Characteristics are handled separately in the route for now
  // age: Joi.number().integer().min(5).optional() // Age can be optional on creation
});

const validateCharacter = (req, res, next) => {
  console.log('Validating character CREATION request body:', req.body);
  const { error } = createCharacterSchema.validate(req.body);
  if (error) {
    console.log('Creation validation error:', error.details);
    return res.status(400).json({ message: error.details[0].message });
  }
  console.log('Character creation validation passed');
  next();
};

const updateCharacterSchema = Joi.object({
  name: Joi.string().trim().min(1).optional(),
  character_type: Joi.string().valid('magus', 'companion', 'grog').optional(),
  use_cunning: Joi.boolean().optional(),
  age: Joi.number().integer().min(5).optional(),
  total_improvement_points: Joi.number().integer().optional(),
  recalculateXp: Joi.boolean().optional(),
  strength: Joi.number().integer().min(-3).max(3).optional(),
  stamina: Joi.number().integer().min(-3).max(3).optional(),
  dexterity: Joi.number().integer().min(-3).max(3).optional(),
  quickness: Joi.number().integer().min(-3).max(3).optional(),
  intelligence: Joi.number().integer().min(-3).max(3).optional(),
  presence: Joi.number().integer().min(-3).max(3).optional(),
  communication: Joi.number().integer().min(-3).max(3).optional(),
  perception: Joi.number().integer().min(-3).max(3).optional()
}).min(1) // Require at least one field in the update payload
  .unknown(false); // Disallow any keys not explicitly defined here

const validateCharacterUpdate = (req, res, next) => {
  console.log('Validating character UPDATE request body:', req.body);
  const { error } = updateCharacterSchema.validate(req.body);
  if (error) {
    console.error('Update validation error details:', error.details);
    return res.status(400).json({ 
        message: `Validation Error: ${error.details[0].message}` 
    });
  }
  console.log('Character update validation passed');
  next();
};

module.exports = { validateVirtueFlaw, validateCharacter, validateCharacterUpdate };