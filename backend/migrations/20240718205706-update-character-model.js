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
      entityType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'character'
      },
      characterType: {
        type: Sequelize.STRING,
        allowNull: false
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
      virtues: {
        type: Sequelize.JSON,
        allowNull: true
      },
      flaws: {
        type: Sequelize.JSON,
        allowNull: true
      },
      characteristics: {
        type: Sequelize.JSON,
        allowNull: true
      },
      abilities: {
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
      equipment: {
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