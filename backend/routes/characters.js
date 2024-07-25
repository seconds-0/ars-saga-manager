const express = require('express');
const { Character } = require('../models');
const { authenticateToken } = require('./auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Use authenticateToken middleware for all character routes
router.use(authenticateToken);

// Create a new character
router.post('/', async (req, res) => {
  try {
    const { characterName, characterType } = req.body;
    console.log('Received request body:', req.body);
    console.log('User ID:', req.user.id);

    if (!characterName || characterName.trim() === '') {
      return res.status(400).json({ message: 'Character name is required' });
    }
    if (!characterType || !['Magus', 'Companion', 'Grog', 'Animal', 'Demon', 'Spirit', 'Faerie'].includes(characterType)) {
      return res.status(400).json({ message: 'Valid character type is required' });
    }
    const character = await Character.create({ 
      characterName, 
      userId: req.user.id,
      characterType,
      entityType: 'character',
      entityId: uuidv4()
    });
    console.log('Character created:', character.toJSON());
    res.status(201).json(character);
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
    
    // Add error handling for req.user
    if (!req.user || !req.user.id) {
      console.error('User not authenticated or user ID missing');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if Character model is properly imported
    if (!Character || typeof Character.findAll !== 'function') {
      console.error('Character model is not properly defined');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const characters = await Character.findAll({ 
      where: { userId: req.user.id },
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

// Get a specific character by ID
router.get('/:id', async (req, res) => {
  try {
    console.log('Fetching character with ID:', req.params.id);
    console.log('User ID:', req.user.id);
    const character = await Character.findOne({ 
      where: { id: req.params.id, userId: req.user.id } 
    });
    console.log('Character found:', character);
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
    const { name, characterType } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Character name is required' });
    }
    if (!characterType || !['Magus', 'Companion', 'Grog', 'Animal', 'Demon', 'Spirit', 'Faerie'].includes(characterType)) {
      return res.status(400).json({ message: 'Valid character type is required' });
    }
    const [updated] = await Character.update({ name, characterType }, { 
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