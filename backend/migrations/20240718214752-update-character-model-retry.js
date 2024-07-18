'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the constraint exists
    const constraintExists = await queryInterface.sequelize.query(
      "SELECT 1 FROM pg_constraint WHERE conname = 'Characters_characterType_ck'",
      { type: Sequelize.QueryTypes.SELECT }
    );

    // If the constraint exists, remove it
    if (constraintExists.length > 0) {
      await queryInterface.removeConstraint('Characters', 'Characters_characterType_ck');
    }

    // Add the constraint
    await queryInterface.addConstraint('Characters', {
      fields: ['characterType'],
      type: 'check',
      name: 'Characters_characterType_ck',
      where: {
        characterType: ['Magus', 'Companion', 'Grog', 'Animal', 'Demon', 'Spirit', 'Faerie']
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the constraint
    await queryInterface.removeConstraint('Characters', 'Characters_characterType_ck');
  }
};