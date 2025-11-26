/**
 * ARTIST MODEL
 * Modelo de artistas musicales
 *
 * Responsabilidades:
 * - Definir schema de artistas
 * - Validaciones de campos
 * - Asociaciones con otros modelos
 */

module.exports = (sequelize, DataTypes) => {
  const Artist = sequelize.define('Artist', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: 'Nombre debe tener entre 1 y 255 caracteres'
        }
      }
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        name: 'unique_artist_slug',
        msg: 'Este slug ya existe'
      }
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Debe ser una URL válida'
        }
      }
    },
    country_code: {
      type: DataTypes.STRING(3),
      allowNull: true
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
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
    tableName: 'artists',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['country_code'] },
      { fields: ['verified'] },
      { fields: ['slug'] },
      { fields: ['user_id'] }
    ]
  });

  Artist.associate = (models) => {
    // Artista pertenece a un usuario creador
    Artist.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'creator'
    });

    // Artista tiene múltiples canciones
    Artist.hasMany(models.Song, {
      foreignKey: 'artist_id',
      as: 'songs',
      onDelete: 'CASCADE'
    });

    // Artista tiene múltiples álbumes
    Artist.hasMany(models.Album, {
      foreignKey: 'artist_id',
      as: 'albums',
      onDelete: 'CASCADE'
    });
  };

  return Artist;
};
