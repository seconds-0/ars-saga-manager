'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ReferenceVirtueFlaw extends Model {
    static associate(models) {
      ReferenceVirtueFlaw.hasMany(models.CharacterVirtueFlaw, { foreignKey: 'referenceVirtueFlawId', as: 'characterVirtuesFlaws' });
    }
  }
  ReferenceVirtueFlaw.init({
    name: DataTypes.STRING,
    type: DataTypes.ENUM('Virtue', 'Flaw'),
    size: DataTypes.ENUM('Minor', 'Major', 'Free'),
    category: DataTypes.STRING,
    realm: DataTypes.STRING,
    description: DataTypes.TEXT,
    source: DataTypes.TEXT,
    allowed_sizes: DataTypes.JSONB,
    max_selections: DataTypes.INTEGER,
    prerequisites: DataTypes.JSONB,
    incompatibilities: DataTypes.JSONB,
    effects: DataTypes.JSONB,
    magical_exp_modifier: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    general_exp_modifier: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    general_exp_modifier_category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    exp_rate_modifier: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    requires_specification: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    specification_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    specification_options_query: {
      type: DataTypes.STRING,
      allowNull: true
    },
    affects_ability_cost: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    ability_score_bonus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'ReferenceVirtueFlaw',
    tableName: 'reference_virtues_flaws'
  });
  return ReferenceVirtueFlaw;
};