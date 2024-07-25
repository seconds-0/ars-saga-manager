'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Character extends Model {
    static associate(models) {
      Character.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
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
    virtues: DataTypes.JSON,
    flaws: DataTypes.JSON,
    abilities: DataTypes.JSON,
    arts: DataTypes.JSON,
    spells: DataTypes.JSON,
    equipment: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Character',
  });
  return Character;
};