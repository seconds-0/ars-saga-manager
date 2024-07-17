module.exports = (sequelize, DataTypes) => {
  const Character = sequelize.define('Character', {
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
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'character'
    }
  });

  Character.associate = function(models) {
    Character.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Character;
};