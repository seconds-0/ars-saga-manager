'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Characters');
    if (!tableInfo.virtueFlawPoints) {
      await queryInterface.addColumn('Characters', 'virtueFlawPoints', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('Characters');
    if (tableInfo.virtueFlawPoints) {
      await queryInterface.removeColumn('Characters', 'virtueFlawPoints');
    }
  }
};