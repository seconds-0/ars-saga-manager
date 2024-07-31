'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TYPE enum_reference_virtues_flaws_size ADD VALUE IF NOT EXISTS 'Free';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing enum values
    // You would need to create a new enum type without 'Free' and update the column to use the new type
  }
};
