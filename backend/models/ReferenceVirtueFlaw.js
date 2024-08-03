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
    effects: DataTypes.JSONB
  }, {
    sequelize,
    modelName: 'ReferenceVirtueFlaw',
    tableName: 'reference_virtues_flaws'
  });
  return ReferenceVirtueFlaw;
};