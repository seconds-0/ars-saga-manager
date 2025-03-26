'use strict';

const express = require('express');
const router = express.Router();
const { ReferenceArt } = require('../models');

// Get all reference arts
router.get('/reference-arts', async (req, res) => {
  try {
    const { type } = req.query;
    const whereClause = {};
    
    // Filter by type (TECHNIQUE or FORM) if provided
    if (type) {
      whereClause.type = type.toUpperCase();
    }
    
    const arts = await ReferenceArt.findAll({
      where: whereClause,
      order: [
        ['type', 'ASC'],
        ['name', 'ASC']
      ]
    });
    
    res.json({
      status: 'success',
      data: arts
    });
  } catch (error) {
    console.error('Error fetching reference arts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reference arts'
    });
  }
});

// Get a specific reference art by ID
router.get('/reference-arts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const art = await ReferenceArt.findByPk(id);
    
    if (!art) {
      return res.status(404).json({
        status: 'error',
        message: 'Art not found'
      });
    }
    
    res.json({
      status: 'success',
      data: art
    });
  } catch (error) {
    console.error(`Error fetching art with id ${req.params.id}:`, error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch art'
    });
  }
});

module.exports = router;