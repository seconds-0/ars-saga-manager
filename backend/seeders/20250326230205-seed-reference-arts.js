'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Seed the standard 10 Hermetic Techniques
    const techniques = [
      {
        name: 'Creo',
        type: 'TECHNIQUE',
        description: 'The Art of creation, making things from nothing or making things whole'
      },
      {
        name: 'Intellego',
        type: 'TECHNIQUE',
        description: 'The Art of perception and knowledge, gaining information'
      },
      {
        name: 'Muto',
        type: 'TECHNIQUE',
        description: 'The Art of transformation, changing the essential nature of something'
      },
      {
        name: 'Perdo',
        type: 'TECHNIQUE',
        description: 'The Art of destruction and degradation'
      },
      {
        name: 'Rego',
        type: 'TECHNIQUE',
        description: 'The Art of control and command, manipulating things according to their nature'
      }
    ];

    // Seed the standard 10 Hermetic Forms
    const forms = [
      {
        name: 'Animal',
        type: 'FORM',
        description: 'The Form of animals and animal products'
      },
      {
        name: 'Aquam',
        type: 'FORM',
        description: 'The Form of water and liquids'
      },
      {
        name: 'Auram',
        type: 'FORM',
        description: 'The Form of air and weather'
      },
      {
        name: 'Corpus',
        type: 'FORM',
        description: 'The Form of human bodies'
      },
      {
        name: 'Herbam',
        type: 'FORM',
        description: 'The Form of plants and plant products'
      },
      {
        name: 'Ignem',
        type: 'FORM',
        description: 'The Form of fire and heat'
      },
      {
        name: 'Imaginem',
        type: 'FORM',
        description: 'The Form of images, sounds, and sensory species'
      },
      {
        name: 'Mentem',
        type: 'FORM',
        description: 'The Form of minds and thoughts'
      },
      {
        name: 'Terram',
        type: 'FORM',
        description: 'The Form of earth and solid materials'
      },
      {
        name: 'Vim',
        type: 'FORM',
        description: 'The Form of magical power itself'
      }
    ];

    // Let's not include timestamp fields since we've set timestamps: false in the model
    
    // Insert all the arts - the model has timestamps: false
    await queryInterface.bulkInsert('reference_arts', [...techniques, ...forms]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('reference_arts', null, {});
  }
};