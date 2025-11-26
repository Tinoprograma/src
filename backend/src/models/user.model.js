/**
 * USER MODEL
 * Modelo de usuarios del sistema
 *
 * Responsabilidades:
 * - Definir schema de usuarios
 * - Validaciones de campos
 * - Asociaciones con otros modelos
 */

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: 'unique_email',
        msg: 'Este email ya está registrado'
      },
      validate: {
        isEmail: {
          msg: 'Debe ser un email válido'
        }
      }
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: 'unique_username',
        msg: 'Este username ya está registrado'
      },
      validate: {
        len: {
          args: [3, 50],
          msg: 'Username debe tener entre 3 y 50 caracteres'
        }
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    display_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    country_code: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    reputation_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('user', 'moderator', 'admin'),
      defaultValue: 'user',
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['email'] },
      { fields: ['username'] },
      { fields: ['role'] }
    ]
  });

  User.associate = (models) => {
    // Un usuario puede crear múltiples artistas
    User.hasMany(models.Artist, {
      foreignKey: 'user_id',
      as: 'artists',
      onDelete: 'SET NULL'
    });

    // Un usuario puede crear múltiples canciones
    User.hasMany(models.Song, {
      foreignKey: 'created_by',
      as: 'createdSongs',
      onDelete: 'SET NULL'
    });

    // Un usuario puede crear múltiples álbumes
    User.hasMany(models.Album, {
      foreignKey: 'created_by',
      as: 'createdAlbums',
      onDelete: 'SET NULL'
    });

    // Un usuario puede crear múltiples anotaciones
    User.hasMany(models.Annotation, {
      foreignKey: 'user_id',
      as: 'annotations',
      onDelete: 'CASCADE'
    });
  };

  return User;
};
