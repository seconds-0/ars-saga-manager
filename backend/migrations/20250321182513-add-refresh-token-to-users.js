'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if refresh_token column exists
    const tableInfo = await queryInterface.describeTable('Users');
    
    if (!tableInfo.refresh_token) {
      await queryInterface.addColumn('Users', 'refresh_token', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'account_locked_until'
      });
    }

    if (!tableInfo.refresh_token_expires) {
      await queryInterface.addColumn('Users', 'refresh_token_expires', {
        type: Sequelize.DATE,
        allowNull: true,
        after: 'refresh_token'
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // Check if columns exist before removing them
    const tableInfo = await queryInterface.describeTable('Users');
    
    if (tableInfo.refresh_token) {
      await queryInterface.removeColumn('Users', 'refresh_token');
    }
    
    if (tableInfo.refresh_token_expires) {
      await queryInterface.removeColumn('Users', 'refresh_token_expires');
    }
  }
};
