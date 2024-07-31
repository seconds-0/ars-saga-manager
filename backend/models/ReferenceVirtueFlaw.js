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
    size: DataTypes.ENUM('Minor', 'Major'),
    category: DataTypes.STRING,
    realm: DataTypes.STRING,
    description: DataTypes.TEXT,
    source: DataTypes.TEXT,
    allowed_sizes: {
      type: DataTypes.JSONB,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ReferenceVirtueFlaw',
    tableName: 'reference_virtues_flaws'
  });
  return ReferenceVirtueFlaw;
};