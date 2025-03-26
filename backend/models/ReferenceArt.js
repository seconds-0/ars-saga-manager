'use strict';

module.exports = (sequelize, DataTypes) => {
  const ReferenceArt = sequelize.define('ReferenceArt', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM('TECHNIQUE', 'FORM'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'reference_arts',
    timestamps: false,
    underscored: true
  });

  return ReferenceArt;
};