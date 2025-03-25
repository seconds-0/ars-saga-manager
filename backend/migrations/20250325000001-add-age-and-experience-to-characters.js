'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('characters', 'age', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 25,
      validate: {
        min: 5,
        max: 1000
      }
    });
    
    // Add general experience field
    await queryInterface.addColumn('characters', 'general_exp_available', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
    
    // Add magical experience field (for magi only)
    await queryInterface.addColumn('characters', 'magical_exp_available', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
    
    // Add category-specific experience fields
    await queryInterface.addColumn('characters', 'martial_exp_available', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
    
    await queryInterface.addColumn('characters', 'academic_exp_available', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
    
    await queryInterface.addColumn('characters', 'arcane_exp_available', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
    
    await queryInterface.addColumn('characters', 'supernatural_exp_available', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
    
    await queryInterface.addColumn('characters', 'social_exp_available', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('characters', 'age');
    await queryInterface.removeColumn('characters', 'general_exp_available');
    await queryInterface.removeColumn('characters', 'magical_exp_available');
    await queryInterface.removeColumn('characters', 'martial_exp_available');
    await queryInterface.removeColumn('characters', 'academic_exp_available');
    await queryInterface.removeColumn('characters', 'arcane_exp_available');
    await queryInterface.removeColumn('characters', 'supernatural_exp_available');
    await queryInterface.removeColumn('characters', 'social_exp_available');
  }
};
