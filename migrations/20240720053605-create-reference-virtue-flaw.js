'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reference_virtues_flaws', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: Sequelize.ENUM('Virtue', 'Flaw'),
        allowNull: false
      },
      size: {
        type: Sequelize.ENUM('Major', 'Minor'),
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('General', 'Social', 'Hermetic', 'Supernatural', 'Tainted', 'Mystery', 'Heroic', 'Child', 'Personality', 'Story', 'Mundane Beast'),
        allowNull: false
      },
      realm: {
        type: Sequelize.ENUM('None', 'Faerie', 'Magic', 'Infernal', 'Divine'),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('reference_virtues_flaws');
  }
};