'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Characters');

    // Function to add column if it doesn't exist
    const addColumnIfNotExists = async (columnName, columnDefinition) => {
      if (!(columnName in tableDescription)) {
        await queryInterface.addColumn('Characters', columnName, columnDefinition);
      }
    };

    // Add new columns to the existing Characters table
    await addColumnIfNotExists('entityType', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'character'
    });

    await addColumnIfNotExists('entityId', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false
    });

    // Add other new columns (if they don't already exist)
    const columns = ['virtues', 'flaws', 'characteristics', 'abilities', 'arts', 'spells', 'equipment'];
    for (const column of columns) {
      await addColumnIfNotExists(column, {
        type: Sequelize.JSON,
        allowNull: true
      });
    }

    // Check if the constraint exists
    const constraintExists = await queryInterface.sequelize.query(
      "SELECT 1 FROM pg_constraint WHERE conname = 'Characters_characterType_ck'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (constraintExists.length === 0) {
      // If the constraint doesn't exist, add it
      await queryInterface.addConstraint('Characters', {
        fields: ['characterType'],
        type: 'check',
        name: 'Characters_characterType_ck',
        where: {
          characterType: ['Magus', 'Companion', 'Grog', 'Animal', 'Demon', 'Spirit', 'Faerie']
        }
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the constraint if it exists
    await queryInterface.removeConstraint('Characters', 'Characters_characterType_ck');
    
    // Remove the new columns
    await queryInterface.removeColumn('Characters', 'entityType');
    await queryInterface.removeColumn('Characters', 'entityId');
    
    const columns = ['virtues', 'flaws', 'characteristics', 'abilities', 'arts', 'spells', 'equipment'];
    for (const column of columns) {
      await queryInterface.removeColumn('Characters', column);
    }
  }
};