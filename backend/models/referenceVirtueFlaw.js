module.exports = (sequelize, DataTypes) => {
    const ReferenceVirtueFlaw = sequelize.define('ReferenceVirtueFlaw', {
      type: {
        type: DataTypes.ENUM('Virtue', 'Flaw'),
        allowNull: false
      },
      size: {
        type: DataTypes.ENUM('Major', 'Minor', 'Major or Minor', 'Free'),
        allowNull: false
      },
      category: {
        type: DataTypes.ENUM('General', 'Social', 'Hermetic', 'Supernatural', 'Tainted', 'Mystery', 'Heroic', 'Child', 'Personality', 'Story', 'Mundane Beast'),
        allowNull: false
      },
      realm: {
        type: DataTypes.ENUM('None', 'Faerie', 'Magic', 'Infernal', 'Divine'),
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    }, {
      tableName: 'reference_virtues_flaws',
      timestamps: false
    });
  
    ReferenceVirtueFlaw.associate = function(models) {
      ReferenceVirtueFlaw.belongsToMany(models.Character, {
        through: 'CharacterVirtueFlaw',
        foreignKey: 'referenceVirtueFlawId',
        as: 'characters'
      });
    };
  
    return ReferenceVirtueFlaw;
  };