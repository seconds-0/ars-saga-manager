'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the column already exists
    try {
      const tableInfo = await queryInterface.describeTable('characters');
      if (!tableInfo.use_cunning) {
        await queryInterface.addColumn('characters', 'use_cunning', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        });
      }
    } catch (error) {
      console.log('Migration 20250208000000: Column check or addition failed:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable('characters');
      if (tableInfo.use_cunning) {
        await queryInterface.removeColumn('characters', 'use_cunning');
      }
    } catch (error) {
      console.log('Migration 20250208000000 (down): Column removal failed:', error.message);
    }
  }
}; 