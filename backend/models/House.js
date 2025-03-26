'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class House extends Model {
    static associate(models) {
      House.hasMany(models.Character, {
        foreignKey: 'house_id',
        as: 'characters'
      });
    }
  }

  House.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    automatic_virtues: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('automatic_virtues must be an array');
          }
        },
        hasValidStructure(value) {
          if (!value.every(v => typeof v === 'object' && v.reference_virtue_flaw_id)) {
            throw new Error('Each automatic virtue must have a reference_virtue_flaw_id');
          }
        }
      }
    },
    virtue_choices: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('virtue_choices must be an array');
          }
        },
        hasValidStructure(value) {
          if (!value.every(v => 
            typeof v === 'object' && 
            Array.isArray(v.options) && 
            v.options.every(o => o.reference_virtue_flaw_id)
          )) {
            throw new Error('Each virtue choice must have an options array with reference_virtue_flaw_ids');
          }
        }
      }
    },
    special_rules: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      validate: {
        isObject(value) {
          if (typeof value !== 'object' || Array.isArray(value)) {
            throw new Error('special_rules must be an object');
          }
        }
      }
    }
  }, {
    sequelize,
    modelName: 'House',
    tableName: 'houses',
    underscored: true,
    timestamps: true
  });

  return House;
}; 