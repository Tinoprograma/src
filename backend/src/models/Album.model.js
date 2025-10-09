const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Album = sequelize.define('Album', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  artist_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  release_year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  cover_image_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  total_tracks: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total de canciones en el álbum'
  },
  spotify_album_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ID del álbum en Spotify'
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
    allowNull: true,
    comment: 'Descripción del álbum'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'albums',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Album;