'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the column exists before trying to remove it
    const tableInfo = await queryInterface.describeTable('Users');
    if (tableInfo.username) {
      await queryInterface.removeColumn('Users', 'username');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // If you need to revert this migration, you can add the column back
    // await queryInterface.addColumn('Users', 'username', Sequelize.STRING);
  }
};