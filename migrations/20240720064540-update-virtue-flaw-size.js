'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('reference_virtues_flaws', 'size', {
      type: Sequelize.ENUM('Major', 'Minor', 'Major or Minor', 'Free'),
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('reference_virtues_flaws', 'size', {
      type: Sequelize.ENUM('Major', 'Minor'),
      allowNull: false
    });
  }
};