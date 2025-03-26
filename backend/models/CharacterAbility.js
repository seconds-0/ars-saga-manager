'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CharacterAbility extends Model {
    static associate(models) {
      CharacterAbility.belongsTo(models.Character, {
        foreignKey: 'character_id',
        as: 'character'
      });
    }
  }
  
  CharacterAbility.init({
    character_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'characters',
        key: 'id'
      }
    },
    ability_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 20
      }
    },
    specialty: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM('GENERAL', 'ACADEMIC', 'MARTIAL', 'SUPERNATURAL', 'ARCANE'),
      allowNull: false
    },
    experience_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    sequelize,
    modelName: 'CharacterAbility',
    tableName: 'character_abilities',
    underscored: true
  });
  
  return CharacterAbility;
};