const express = require('express');
const router = express.Router();
const { ReferenceVirtueFlaw } = require('../models');

router.get('/', async (req, res) => {
  try {
    const referenceVirtuesFlaws = await ReferenceVirtueFlaw.findAll();
    console.log('Fetched reference virtues and flaws:', referenceVirtuesFlaws.length); // Debug log
    res.json(referenceVirtuesFlaws);
  } catch (error) {
    console.error('Error fetching reference virtues and flaws:', error);
    res.status(500).json({ message: 'Error fetching reference virtues and flaws' });
  }
});

module.exports = router;