'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Check if 'cost' column exists in 'character_virtues_flaws' table
      const characterVirtuesFlawsColumns = await queryInterface.describeTable('character_virtues_flaws');
      if (!characterVirtuesFlawsColumns.cost) {
        await queryInterface.addColumn('character_virtues_flaws', 'cost', {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        }, { transaction });
      }

      // Update ReferenceVirtueFlaw model to match the database
      await queryInterface.changeColumn('reference_virtues_flaws', 'type', {
        type: Sequelize.ENUM('Virtue', 'Flaw'),
        allowNull: false
      }, { transaction });

      await queryInterface.changeColumn('reference_virtues_flaws', 'size', {
        type: Sequelize.ENUM('Minor', 'Major'),
        allowNull: false
      }, { transaction });

      await queryInterface.changeColumn('reference_virtues_flaws', 'category', {
        type: Sequelize.STRING,
        allowNull: false
      }, { transaction });

      await queryInterface.changeColumn('reference_virtues_flaws', 'realm', {
        type: Sequelize.STRING,
        allowNull: false
      }, { transaction });

      // Check if columns exist in 'reference_virtues_flaws' table before adding
      const referenceVirtuesFlawsColumns = await queryInterface.describeTable('reference_virtues_flaws');

      if (!referenceVirtuesFlawsColumns.max_selections) {
        await queryInterface.addColumn('reference_virtues_flaws', 'max_selections', {
          type: Sequelize.INTEGER,
          allowNull: true
        }, { transaction });
      }

      if (!referenceVirtuesFlawsColumns.prerequisites) {
        await queryInterface.addColumn('reference_virtues_flaws', 'prerequisites', {
          type: Sequelize.JSONB,
          allowNull: true
        }, { transaction });
      }

      if (!referenceVirtuesFlawsColumns.incompatibilities) {
        await queryInterface.addColumn('reference_virtues_flaws', 'incompatibilities', {
          type: Sequelize.JSONB,
          allowNull: true
        }, { transaction });
      }

      if (!referenceVirtuesFlawsColumns.effects) {
        await queryInterface.addColumn('reference_virtues_flaws', 'effects', {
          type: Sequelize.JSONB,
          allowNull: true
        }, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Revert changes if needed
      await queryInterface.removeColumn('character_virtues_flaws', 'cost', { transaction });
      
      await queryInterface.changeColumn('reference_virtues_flaws', 'type', {
        type: Sequelize.STRING,
        allowNull: false
      }, { transaction });

      await queryInterface.changeColumn('reference_virtues_flaws', 'size', {
        type: Sequelize.STRING,
        allowNull: false
      }, { transaction });

      await queryInterface.changeColumn('reference_virtues_flaws', 'category', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.changeColumn('reference_virtues_flaws', 'realm', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      await queryInterface.removeColumn('reference_virtues_flaws', 'max_selections', { transaction });
      await queryInterface.removeColumn('reference_virtues_flaws', 'prerequisites', { transaction });
      await queryInterface.removeColumn('reference_virtues_flaws', 'incompatibilities', { transaction });
      await queryInterface.removeColumn('reference_virtues_flaws', 'effects', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};