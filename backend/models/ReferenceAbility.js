'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReferenceAbility extends Model {
    static associate(models) {
      // define association here
    }
  }
  
  ReferenceAbility.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    category: {
      type: DataTypes.ENUM('GENERAL', 'ACADEMIC', 'MARTIAL', 'SUPERNATURAL', 'ARCANE'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    puissant_allowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    affinity_allowed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'ReferenceAbility',
    tableName: 'reference_abilities',
    underscored: true
  });
  
  return ReferenceAbility;
};