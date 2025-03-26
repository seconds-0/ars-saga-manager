'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new fields to ReferenceVirtueFlaw
    await queryInterface.addColumn('reference_virtues_flaws', 'magical_exp_modifier', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('reference_virtues_flaws', 'general_exp_modifier', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('reference_virtues_flaws', 'general_exp_modifier_category', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('reference_virtues_flaws', 'exp_rate_modifier', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Add new fields to Character
    await queryInterface.addColumn('characters', 'age', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 20
    });

    await queryInterface.addColumn('characters', 'general_exp_available', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('characters', 'magical_exp_available', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('characters', 'restricted_exp_pools', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: []
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove fields from ReferenceVirtueFlaw
    await queryInterface.removeColumn('reference_virtues_flaws', 'magical_exp_modifier');
    await queryInterface.removeColumn('reference_virtues_flaws', 'general_exp_modifier');
    await queryInterface.removeColumn('reference_virtues_flaws', 'general_exp_modifier_category');
    await queryInterface.removeColumn('reference_virtues_flaws', 'exp_rate_modifier');

    // Remove fields from Character
    await queryInterface.removeColumn('characters', 'age');
    await queryInterface.removeColumn('characters', 'general_exp_available');
    await queryInterface.removeColumn('characters', 'magical_exp_available');
    await queryInterface.removeColumn('characters', 'restricted_exp_pools');
  }
};