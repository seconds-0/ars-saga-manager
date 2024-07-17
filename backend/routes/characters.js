const express = require('express');
const { Character } = require('../models');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Use authenticateToken middleware for all character routes
router.use(authenticateToken);

// Create a new character
router.post('/', async (req, res) => {
  try {
    const { name, entityType } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Character name is required' });
    }
    const character = await Character.create({ 
      name, 
      userId: req.user.id,
      entityType: entityType || 'character'
    });
    res.status(201).json(character);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ message: 'Error creating character', error: error.message });
  }
});

// Get all characters for the authenticated user
router.get('/', async (req, res) => {
  try {
    const characters = await Character.findAll({ where: { userId: req.user.id } });
    res.json(characters);
  } catch (error) {
    console.error('Error fetching characters:', error);
    res.status(500).json({ message: 'Error fetching characters', error: error.message });
  }
});

// Get a specific character by ID
router.get('/:id', async (req, res) => {
  try {
    const character = await Character.findOne({ 
      where: { id: req.params.id, userId: req.user.id } 
    });
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    res.json(character);
  } catch (error) {
    console.error('Error fetching character:', error);
    res.status(500).json({ message: 'Error fetching character', error: error.message });
  }
});

// Update a character
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Character name is required' });
    }
    const [updated] = await Character.update({ name }, { 
      where: { id: req.params.id, userId: req.user.id } 
    });
    if (updated) {
      const updatedCharacter = await Character.findOne({ where: { id: req.params.id } });
      return res.json(updatedCharacter);
    }
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

module.exports = router;