const express = require('express');
const router = express.Router();
const { ReferenceVirtueFlaw } = require('../models');

router.get('/', async (req, res) => {
  try {
    console.log('Fetching reference virtues and flaws...');
    
    // Get query parameters for filtering and pagination
    const { category, type, size, search } = req.query;
    
    // Build the where clause based on query parameters
    const whereClause = {};
    
    if (category) whereClause.category = category;
    if (type) whereClause.type = type;
    if (size) whereClause.size = size;
    if (search) {
      whereClause.name = {
        [require('sequelize').Op.iLike]: `%${search}%`
      };
    }
    
    console.log('Using where clause:', JSON.stringify(whereClause));
    
    // Execute the query with the where clause
    const referenceVirtuesFlaws = await ReferenceVirtueFlaw.findAll({
      where: whereClause,
      attributes: [
        'id', 'name', 'type', 'size', 'category', 'realm', 
        'description', 'source', 'prerequisites', 'incompatibilities',
        'effects', 'allowed_sizes', 'max_selections'
      ],
      order: [
        ['type', 'ASC'],
        ['category', 'ASC'],
        ['name', 'ASC']
      ]
    });
    
    console.log('Fetched reference virtues and flaws:', referenceVirtuesFlaws.length); // Debug log
    
    // Return the results
    res.json(referenceVirtuesFlaws);
  } catch (error) {
    console.error('Error fetching reference virtues and flaws:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error fetching reference virtues and flaws', 
      error: error.message
    });
  }
});

module.exports = router;