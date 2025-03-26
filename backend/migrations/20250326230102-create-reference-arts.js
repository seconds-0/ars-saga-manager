'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('reference_arts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      type: {
        type: Sequelize.ENUM('TECHNIQUE', 'FORM'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      }
      // No timestamp fields - the model has timestamps: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('reference_arts');
  }
};