'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add new fields to ReferenceVirtueFlaw table
    await queryInterface.addColumn('reference_virtues_flaws', 'requires_specification', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('reference_virtues_flaws', 'specification_type', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('reference_virtues_flaws', 'specification_options_query', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('reference_virtues_flaws', 'affects_ability_cost', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('reference_virtues_flaws', 'ability_score_bonus', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Add selections field to CharacterVirtueFlaw table
    await queryInterface.addColumn('character_virtues_flaws', 'selections', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: null
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove fields from ReferenceVirtueFlaw table
    await queryInterface.removeColumn('reference_virtues_flaws', 'requires_specification');
    await queryInterface.removeColumn('reference_virtues_flaws', 'specification_type');
    await queryInterface.removeColumn('reference_virtues_flaws', 'specification_options_query');
    await queryInterface.removeColumn('reference_virtues_flaws', 'affects_ability_cost');
    await queryInterface.removeColumn('reference_virtues_flaws', 'ability_score_bonus');

    // Remove selections field from CharacterVirtueFlaw table
    await queryInterface.removeColumn('character_virtues_flaws', 'selections');
  }
};
