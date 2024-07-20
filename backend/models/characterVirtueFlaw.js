module.exports = (sequelize, DataTypes) => {
    const CharacterVirtueFlaw = sequelize.define('CharacterVirtueFlaw', {
      notes: {
        type: DataTypes.TEXT
      }
    }, {
      tableName: 'character_virtues_flaws'
    });
  
    CharacterVirtueFlaw.associate = function(models) {
      CharacterVirtueFlaw.belongsTo(models.Character, {
        foreignKey: 'characterId'
      });
      CharacterVirtueFlaw.belongsTo(models.ReferenceVirtueFlaw, {
        foreignKey: 'referenceVirtueFlawId'
      });
    };
  
    return CharacterVirtueFlaw;
  };