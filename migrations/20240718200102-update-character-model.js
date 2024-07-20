'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Characters', {
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
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        }
      },
      entityId: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      entityType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'character'
      },
      characterType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Grog'
      },
      virtues: {
        type: Sequelize.JSON,
        allowNull: true
      },
      flaws: {
        type: Sequelize.JSON,
        allowNull: true
      },
      characteristicsAndAbilities: {
        type: Sequelize.JSON,
        allowNull: true
      },
      arts: {
        type: Sequelize.JSON,
        allowNull: true
      },
      spells: {
        type: Sequelize.JSON,
        allowNull: true
      },
      equipmentAndCombat: {
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addConstraint('Characters', {
      fields: ['characterType'],
      type: 'check',
      where: {
        characterType: ['Magus', 'Companion', 'Grog', 'Animal', 'Demon', 'Spirit', 'Faerie']
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Characters');
  }
};