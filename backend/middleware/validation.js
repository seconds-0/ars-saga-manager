// backend/middleware/validation.js

const Joi = require('joi');

const virtueFlawSchema = Joi.object({
  referenceVirtueFlawId: Joi.number().integer().positive().required(),
  selections: Joi.object().optional()
});

const validateVirtueFlaw = (req, res, next) => {
  const { error } = virtueFlawSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const characterSchema = Joi.object({
  name: Joi.string().required(),
  character_type: Joi.string().valid('magus', 'companion', 'grog').required(),
  use_cunning: Joi.boolean().optional()
});

const validateCharacter = (req, res, next) => {
  console.log('Validating character request body:', req.body);
  const { error } = characterSchema.validate(req.body);
  if (error) {
    console.log('Validation error:', error.details);
    return res.status(400).json({ message: error.details[0].message });
  }
  console.log('Character validation passed');
  next();
};

module.exports = { validateVirtueFlaw, validateCharacter };