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
      },
      // Password reset fields
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true
      },
      // Security fields
      failedLoginAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      accountLockedUntil: {
        type: DataTypes.DATE,
        allowNull: true
      },
      // Refresh token fields
      refreshToken: {
        type: DataTypes.STRING,
        allowNull: true
      },
      refreshTokenExpires: {
        type: DataTypes.DATE,
        allowNull: true
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