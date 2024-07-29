'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Characters');

    if (!tableInfo.strength) {
      await queryInterface.addColumn('Characters', 'strength', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    }
    if (!tableInfo.stamina) {
      await queryInterface.addColumn('Characters', 'stamina', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    }
    if (!tableInfo.dexterity) {
      await queryInterface.addColumn('Characters', 'dexterity', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    }
    if (!tableInfo.quickness) {
      await queryInterface.addColumn('Characters', 'quickness', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    }
    if (!tableInfo.intelligence) {
      await queryInterface.addColumn('Characters', 'intelligence', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    }
    if (!tableInfo.presence) {
      await queryInterface.addColumn('Characters', 'presence', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    }
    if (!tableInfo.communication) {
      await queryInterface.addColumn('Characters', 'communication', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    }
    if (!tableInfo.perception) {
      await queryInterface.addColumn('Characters', 'perception', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      });
    }
    if (!tableInfo.useCunning) {
      await queryInterface.addColumn('Characters', 'useCunning', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }
    if (!tableInfo.totalImprovementPoints) {
      await queryInterface.addColumn('Characters', 'totalImprovementPoints', {
        type: Sequelize.INTEGER,
        defaultValue: 7,
        allowNull: false
      });
    }
    if (!tableInfo.characteristicModifiers) {
      await queryInterface.addColumn('Characters', 'characteristicModifiers', {
        type: Sequelize.JSON,
        defaultValue: {},
        allowNull: false
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable('Characters');

    if (tableInfo.strength) {
      await queryInterface.removeColumn('Characters', 'strength');
    }
    if (tableInfo.stamina) {
      await queryInterface.removeColumn('Characters', 'stamina');
    }
    if (tableInfo.dexterity) {
      await queryInterface.removeColumn('Characters', 'dexterity');
    }
    if (tableInfo.quickness) {
      await queryInterface.removeColumn('Characters', 'quickness');
    }
    if (tableInfo.intelligence) {
      await queryInterface.removeColumn('Characters', 'intelligence');
    }
    if (tableInfo.presence) {
      await queryInterface.removeColumn('Characters', 'presence');
    }
    if (tableInfo.communication) {
      await queryInterface.removeColumn('Characters', 'communication');
    }
    if (tableInfo.perception) {
      await queryInterface.removeColumn('Characters', 'perception');
    }
    if (tableInfo.useCunning) {
      await queryInterface.removeColumn('Characters', 'useCunning');
    }
    if (tableInfo.totalImprovementPoints) {
      await queryInterface.removeColumn('Characters', 'totalImprovementPoints');
    }
    if (tableInfo.characteristicModifiers) {
      await queryInterface.removeColumn('Characters', 'characteristicModifiers');
    }
  }
};