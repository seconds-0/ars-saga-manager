'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    return queryInterface.bulkInsert('Users', [
      {
        id: 6, // Matching the token's user ID
        email: 'test@example.com',
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', {
      id: 6
    }, {});
  }
}; 