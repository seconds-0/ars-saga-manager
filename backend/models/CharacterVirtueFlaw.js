'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CharacterVirtueFlaw extends Model {
    static associate(models) {
      CharacterVirtueFlaw.belongsTo(models.Character, { foreignKey: 'characterId', as: 'character' });
      CharacterVirtueFlaw.belongsTo(models.ReferenceVirtueFlaw, { foreignKey: 'referenceVirtueFlawId', as: 'referenceVirtueFlaw' });
    }
  }
  CharacterVirtueFlaw.init({
    characterId: DataTypes.INTEGER,
    referenceVirtueFlawId: DataTypes.INTEGER,
    cost: DataTypes.INTEGER,
    notes: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'CharacterVirtueFlaw',
    tableName: 'character_virtues_flaws'
  });
  return CharacterVirtueFlaw;
};