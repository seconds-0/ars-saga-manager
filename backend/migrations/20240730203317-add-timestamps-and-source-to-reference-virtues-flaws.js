'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('reference_virtues_flaws', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    await queryInterface.addColumn('reference_virtues_flaws', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    await queryInterface.addColumn('reference_virtues_flaws', 'source', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('reference_virtues_flaws', 'createdAt');
    await queryInterface.removeColumn('reference_virtues_flaws', 'updatedAt');
    await queryInterface.removeColumn('reference_virtues_flaws', 'source');
  }
};