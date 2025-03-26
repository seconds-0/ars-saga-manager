'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create reference_abilities table
    await queryInterface.createTable('reference_abilities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      category: {
        type: Sequelize.ENUM('GENERAL', 'ACADEMIC', 'MARTIAL', 'SUPERNATURAL', 'ARCANE'),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      puissant_allowed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      affinity_allowed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Create character_abilities table
    await queryInterface.createTable('character_abilities', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      character_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'characters',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      ability_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      score: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      specialty: {
        type: Sequelize.STRING,
        allowNull: true
      },
      category: {
        type: Sequelize.ENUM('GENERAL', 'ACADEMIC', 'MARTIAL', 'SUPERNATURAL', 'ARCANE'),
        allowNull: false
      },
      experience_points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for performance
    await queryInterface.addIndex('character_abilities', ['character_id']);
    await queryInterface.addIndex('character_abilities', ['ability_name']);
    await queryInterface.addIndex('reference_abilities', ['name']);
    await queryInterface.addIndex('reference_abilities', ['category']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('character_abilities');
    await queryInterface.dropTable('reference_abilities');
    
    // Drop the ENUM types
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_character_abilities_category";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reference_abilities_category";');
  }
};