'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Characters');
    if (!tableInfo.availableImprovementPoints) {
      await queryInterface.addColumn('Characters', 'availableImprovementPoints', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Characters');
    if (tableInfo.availableImprovementPoints) {
      await queryInterface.removeColumn('Characters', 'availableImprovementPoints');
    }
  }
};