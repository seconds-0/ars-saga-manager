'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Characters', 'strength', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
    await queryInterface.addColumn('Characters', 'stamina', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
    await queryInterface.addColumn('Characters', 'dexterity', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
    await queryInterface.addColumn('Characters', 'quickness', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
    await queryInterface.addColumn('Characters', 'intelligence', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
    await queryInterface.addColumn('Characters', 'presence', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
    await queryInterface.addColumn('Characters', 'communication', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
    await queryInterface.addColumn('Characters', 'perception', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
    await queryInterface.addColumn('Characters', 'useCunning', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
    await queryInterface.addColumn('Characters', 'totalImprovementPoints', {
      type: Sequelize.INTEGER,
      defaultValue: 7,
      allowNull: false
    });
    await queryInterface.addColumn('Characters', 'characteristicModifiers', {
      type: Sequelize.JSON,
      defaultValue: {},
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Characters', 'strength');
    await queryInterface.removeColumn('Characters', 'stamina');
    await queryInterface.removeColumn('Characters', 'dexterity');
    await queryInterface.removeColumn('Characters', 'quickness');
    await queryInterface.removeColumn('Characters', 'intelligence');
    await queryInterface.removeColumn('Characters', 'presence');
    await queryInterface.removeColumn('Characters', 'communication');
    await queryInterface.removeColumn('Characters', 'perception');
    await queryInterface.removeColumn('Characters', 'useCunning');
    await queryInterface.removeColumn('Characters', 'totalImprovementPoints');
    await queryInterface.removeColumn('Characters', 'characteristicModifiers');
  }
};