'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CharacterVirtueFlaw extends Model {
    static associate(models) {
      CharacterVirtueFlaw.belongsTo(models.Character, {
        foreignKey: 'character_id',
        as: 'character'
      });
      CharacterVirtueFlaw.belongsTo(models.ReferenceVirtueFlaw, {
        foreignKey: 'reference_virtue_flaw_id',
        as: 'referenceVirtueFlaw'
      });
    }
  }

  CharacterVirtueFlaw.init({
    character_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'characters',
        key: 'id'
      }
    },
    reference_virtue_flaw_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'reference_virtues_flaws',
        key: 'id'
      }
    },
    cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_house_virtue_flaw: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    house_virtue_type: {
      type: DataTypes.ENUM('automatic', 'chosen', 'ex_miscellanea_virtue', 'ex_miscellanea_flaw'),
      allowNull: true,
      validate: {
        isValidForHouseVirtueFlaw(value) {
          if (this.is_house_virtue_flaw && !value) {
            throw new Error('house_virtue_type is required when is_house_virtue_flaw is true');
          }
        }
      }
    },
    selections: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: null
    }
  }, {
    sequelize,
    modelName: 'CharacterVirtueFlaw',
    tableName: 'character_virtues_flaws',
    underscored: true,
    timestamps: true
  });

  return CharacterVirtueFlaw;
};