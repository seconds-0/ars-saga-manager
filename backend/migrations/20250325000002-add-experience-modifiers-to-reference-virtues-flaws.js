'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add magical experience modifier
    await queryInterface.addColumn('reference_virtues_flaws', 'magical_exp_modifier', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
    
    // Add general experience modifier
    await queryInterface.addColumn('reference_virtues_flaws', 'general_exp_modifier', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
    
    // Add category for general experience modifier
    await queryInterface.addColumn('reference_virtues_flaws', 'general_exp_modifier_category', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('reference_virtues_flaws', 'magical_exp_modifier');
    await queryInterface.removeColumn('reference_virtues_flaws', 'general_exp_modifier');
    await queryInterface.removeColumn('reference_virtues_flaws', 'general_exp_modifier_category');
  }
};
