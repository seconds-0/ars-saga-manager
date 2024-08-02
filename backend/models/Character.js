'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Character extends Model {
    static associate(models) {
      Character.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Character.hasMany(models.CharacterVirtueFlaw, { foreignKey: 'characterId', as: 'CharacterVirtueFlaws' });
    }

    // Calculate remaining virtue/flaw points
    getRemainingVirtueFlawPoints() {
      return this.maxVirtueFlawPoints - this.virtueFlawPoints;
    }

    async addVirtueFlaw(virtueFlawId, cost, selections) {
      const transaction = await sequelize.transaction();
      try {
        await this.increment('virtueFlawPoints', { by: cost, transaction });
        const newVirtueFlaw = await this.createCharacterVirtueFlaw({
          referenceVirtueFlawId: virtueFlawId,
          cost,
          selections
        }, { transaction });
        await transaction.commit();
        return newVirtueFlaw;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }

    async removeVirtueFlaw(virtueFlawId) {
      const transaction = await sequelize.transaction();
      try {
        const virtueFlaw = await this.getCharacterVirtueFlaws({ where: { id: virtueFlawId }, transaction });
        if (!virtueFlaw) {
          throw new Error('Virtue/Flaw not found');
        }
        await this.decrement('virtueFlawPoints', { by: virtueFlaw.cost, transaction });
        await virtueFlaw.destroy({ transaction });
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }
  }
  Character.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    entityId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      unique: true
    },
    characterName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    entityType: {
      type: DataTypes.STRING,
      defaultValue: 'character'
    },
    characterType: {
      type: DataTypes.ENUM('Magus', 'Companion', 'Grog', 'Animal', 'Demon', 'Spirit', 'Faerie'),
      allowNull: false
    },
    age: {
      type: DataTypes.INTEGER,
      defaultValue: 25,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    house: {
      type: DataTypes.ENUM('Bonisagus', 'Tremere', 'Guernicus', 'Mercere', 'Criamon', 'Ex Miscellenia', 'Verditius', 'Bjorner', 'Merenita', 'Tytalus', 'Jerbiton', 'Flambeau'),
      allowNull: true
    },
    abilities: DataTypes.JSON,
    arts: DataTypes.JSON,
    spells: DataTypes.JSON,
    equipment: DataTypes.JSON,

    // New fields for characteristics
    strength: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    stamina: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    dexterity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    quickness: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    intelligence: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    presence: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    communication: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    perception: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    useCunning: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    availableImprovementPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 7,
      allowNull: false
    },
    totalImprovementPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 7,
      allowNull: false
    },
    characteristicModifiers: {
      type: DataTypes.JSON,
      defaultValue: {},
      allowNull: false
    },

    // New fields for virtue/flaw point tracking
    virtueFlawPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    maxVirtueFlawPoints: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      validate: {
        min: 0
      }
    }
  }, {
    sequelize,
    modelName: 'Character',
    hooks: {
      beforeCreate: (character) => {
        if (character.characterType === 'Grog') {
          character.maxVirtueFlawPoints = 3;
        }
      }
    }
  });
  return Character;
};