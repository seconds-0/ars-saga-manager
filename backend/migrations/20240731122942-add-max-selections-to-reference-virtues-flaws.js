'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('reference_virtues_flaws');
    if (!tableInfo.max_selections) {
      await queryInterface.addColumn('reference_virtues_flaws', 'max_selections', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('reference_virtues_flaws');
    if (tableInfo.max_selections) {
      await queryInterface.removeColumn('reference_virtues_flaws', 'max_selections');
    }
  }
};