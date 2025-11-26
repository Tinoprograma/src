/**
 * ALBUM MODEL
 * Modelo de álbumes musicales
 *
 * Responsabilidades:
 * - Definir schema de álbumes
 * - Validaciones de campos
 * - Asociaciones con otros modelos
 */

module.exports = (sequelize, DataTypes) => {
  const Album = sequelize.define('Album', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [1, 255],
          msg: 'Título debe tener entre 1 y 255 caracteres'
        }
      }
    },
    artist_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'artists',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    release_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: [1900],
          msg: 'Año debe ser mayor a 1900'
        },
        max: {
          args: [new Date().getFullYear() + 1],
          msg: 'Año no puede ser en el futuro'
        }
      }
    },
    cover_image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Debe ser una URL válida'
        }
      }
    },
    total_tracks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    spotify_album_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    spotify_uri: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    spotify_external_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_by: {
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
    tableName: 'albums',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['artist_id'] },
      { fields: ['slug'] },
      { fields: ['created_by'] }
    ]
  });

  /**
   * Define associations for Album model
   */
  Album.associate = (models) => {
    // Álbum pertenece a un artista
    Album.belongsTo(models.Artist, {
      foreignKey: 'artist_id',
      as: 'artist'
    });

    // Álbum pertenece a un usuario creador
    Album.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator'
    });

    // Álbum tiene múltiples canciones
    Album.hasMany(models.Song, {
      foreignKey: 'album_id',
      as: 'songs',
      onDelete: 'SET NULL'
    });
  };

  return Album;
};
