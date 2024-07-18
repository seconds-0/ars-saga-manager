module.exports = (sequelize, DataTypes) => {
  const Character = sequelize.define('Character', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'character'
    },
    characterType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['Magus', 'Companion', 'Grog', 'Animal', 'Demon', 'Spirit', 'Faerie']]
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    entityId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    virtues: {
      type: DataTypes.JSON,
      allowNull: true
    },
    flaws: {
      type: DataTypes.JSON,
      allowNull: true
    },
    characteristics: {
      type: DataTypes.JSON,
      allowNull: true
    },
    abilities: {
      type: DataTypes.JSON,
      allowNull: true
    },
    arts: {
      type: DataTypes.JSON,
      allowNull: true
    },
    spells: {
      type: DataTypes.JSON,
      allowNull: true
    },
    equipment: {
      type: DataTypes.JSON,
      allowNull: true
    }
  });

  Character.associate = function(models) {
    Character.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Character;
};