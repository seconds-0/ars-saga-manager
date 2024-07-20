'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_reference_virtues_flaws_category" 
      RENAME VALUE 'Social' TO 'Social Status';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_reference_virtues_flaws_category" 
      RENAME VALUE 'Social Status' TO 'Social';
    `);
  }
};