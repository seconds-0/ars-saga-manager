'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if reference_virtues_flaws table has camelCase timestamps
      const hasCamelCaseColumns = await queryInterface.sequelize.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'reference_virtues_flaws' 
         AND column_name IN ('createdAt', 'updatedAt')`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      // If camelCase columns exist, rename them to snake_case
      if (hasCamelCaseColumns.length > 0) {
        // Rename createdAt to created_at
        await queryInterface.renameColumn('reference_virtues_flaws', 'createdAt', 'created_at');
        
        // Rename updatedAt to updated_at
        await queryInterface.renameColumn('reference_virtues_flaws', 'updatedAt', 'updated_at');
        
        console.log('Successfully renamed timestamp columns to snake_case in reference_virtues_flaws table');
      } else {
        console.log('No camelCase timestamp columns found in reference_virtues_flaws table. Migration skipped.');
      }
    } catch (error) {
      console.error('Error during migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Check if reference_virtues_flaws table has snake_case timestamps
      const hasSnakeCaseColumns = await queryInterface.sequelize.query(
        `SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'reference_virtues_flaws' 
         AND column_name IN ('created_at', 'updated_at')`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      // If snake_case columns exist, rename them back to camelCase
      if (hasSnakeCaseColumns.length > 0) {
        // Rename created_at to createdAt
        await queryInterface.renameColumn('reference_virtues_flaws', 'created_at', 'createdAt');
        
        // Rename updated_at to updatedAt
        await queryInterface.renameColumn('reference_virtues_flaws', 'updated_at', 'updatedAt');
        
        console.log('Successfully renamed timestamp columns back to camelCase in reference_virtues_flaws table');
      } else {
        console.log('No snake_case timestamp columns found in reference_virtues_flaws table. Reverting skipped.');
      }
    } catch (error) {
      console.error('Error during reversion:', error);
      throw error;
    }
  }
};