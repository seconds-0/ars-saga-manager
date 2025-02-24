'use strict';
const { Model } = require('sequelize');
const { isValidCharacterType } = require('../utils/ruleEngine');

module.exports = (sequelize, DataTypes) => {
  class Character extends Model {
    static associate(models) {
      Character.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Character.hasMany(models.CharacterVirtueFlaw, {
        foreignKey: 'character_id',
        as: 'CharacterVirtueFlaws'
      });
      Character.belongsTo(models.House, {
        foreignKey: 'house_id',
        as: 'house'
      });
    }
  }
  
  Character.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    character_type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isValidType(value) {
          if (!isValidCharacterType(value)) {
            throw new Error('Only Grog, Companion, and Magus are currently supported');
          }
        }
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    house_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'houses',
        key: 'id'
      },
      validate: {
        isValidForCharacterType() {
          if (this.house_id && this.character_type.toLowerCase() !== 'magus') {
            throw new Error('Only magi can belong to a house');
          }
        }
      }
    },
    selected_house_virtues: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('selected_house_virtues must be an array');
          }
        }
      }
    },
    use_cunning: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Character',
    tableName: 'characters',
    underscored: true
  });
  
  return Character;
};