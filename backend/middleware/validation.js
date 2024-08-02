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
  characterName: Joi.string().required(),
  characterType: Joi.string().valid('Magus', 'Companion', 'Grog', 'Animal', 'Demon', 'Spirit', 'Faerie').required(),
  useCunning: Joi.boolean().optional()
});

const validateCharacter = (req, res, next) => {
  const { error } = characterSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = { validateVirtueFlaw, validateCharacter };