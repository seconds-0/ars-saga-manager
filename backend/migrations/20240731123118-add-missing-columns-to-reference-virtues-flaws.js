'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('reference_virtues_flaws');

    if (!tableInfo.max_selections) {
      await queryInterface.addColumn('reference_virtues_flaws', 'max_selections', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }

    if (!tableInfo.prerequisites) {
      await queryInterface.addColumn('reference_virtues_flaws', 'prerequisites', {
        type: Sequelize.JSONB,
        allowNull: true
      });
    }

    if (!tableInfo.incompatibilities) {
      await queryInterface.addColumn('reference_virtues_flaws', 'incompatibilities', {
        type: Sequelize.JSONB,
        allowNull: true
      });
    }

    if (!tableInfo.effects) {
      await queryInterface.addColumn('reference_virtues_flaws', 'effects', {
        type: Sequelize.JSONB,
        allowNull: true
      });
    }

    // Note: 'allowed_sizes' is not in the current schema, so we'll skip it
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('reference_virtues_flaws');

    if (tableInfo.max_selections) {
      await queryInterface.removeColumn('reference_virtues_flaws', 'max_selections');
    }
    if (tableInfo.prerequisites) {
      await queryInterface.removeColumn('reference_virtues_flaws', 'prerequisites');
    }
    if (tableInfo.incompatibilities) {
      await queryInterface.removeColumn('reference_virtues_flaws', 'incompatibilities');
    }
    if (tableInfo.effects) {
      await queryInterface.removeColumn('reference_virtues_flaws', 'effects');
    }
  }
};