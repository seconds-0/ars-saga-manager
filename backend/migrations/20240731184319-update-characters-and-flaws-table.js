'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Characters table
    const charactersInfo = await queryInterface.describeTable('Characters');
    
    if (!charactersInfo.maxVirtueFlawPoints) {
      await queryInterface.addColumn('Characters', 'maxVirtueFlawPoints', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }

    if (!charactersInfo.totalImprovementPoints) {
      await queryInterface.addColumn('Characters', 'totalImprovementPoints', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 7
      });
    }

    if (!charactersInfo.characteristicModifiers) {
      await queryInterface.addColumn('Characters', 'characteristicModifiers', {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
      });
    }

    // character_virtues_flaws table
    const characterVirtuesFlawsInfo = await queryInterface.describeTable('character_virtues_flaws');
    
    if (!characterVirtuesFlawsInfo.selections) {
      await queryInterface.addColumn('character_virtues_flaws', 'selections', {
        type: Sequelize.JSONB,
        allowNull: true
      });
    }

    // reference_virtues_flaws table
    const referenceVirtuesFlawsInfo = await queryInterface.describeTable('reference_virtues_flaws');
    
    if (!referenceVirtuesFlawsInfo.source) {
      await queryInterface.addColumn('reference_virtues_flaws', 'source', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const charactersInfo = await queryInterface.describeTable('Characters');
    const characterVirtuesFlawsInfo = await queryInterface.describeTable('character_virtues_flaws');
    const referenceVirtuesFlawsInfo = await queryInterface.describeTable('reference_virtues_flaws');

    if (charactersInfo.maxVirtueFlawPoints) {
      await queryInterface.removeColumn('Characters', 'maxVirtueFlawPoints');
    }
    if (charactersInfo.totalImprovementPoints) {
      await queryInterface.removeColumn('Characters', 'totalImprovementPoints');
    }
    if (charactersInfo.characteristicModifiers) {
      await queryInterface.removeColumn('Characters', 'characteristicModifiers');
    }
    if (characterVirtuesFlawsInfo.selections) {
      await queryInterface.removeColumn('character_virtues_flaws', 'selections');
    }
    if (referenceVirtuesFlawsInfo.source) {
      await queryInterface.removeColumn('reference_virtues_flaws', 'source');
    }
  }
};