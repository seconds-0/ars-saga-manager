module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      underscored: true,
      tableName: 'Users'
    });

    User.associate = function(models) {
      User.hasMany(models.Character, {
        foreignKey: 'user_id',
        as: 'characters'
      });
    };
  
    return User;
  };