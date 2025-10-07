const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Song = sequelize.define('Song', {
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
  lyrics: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  album: {
    type: DataTypes.STRING(255)
  },
  release_year: {
    type: DataTypes.INTEGER
  },
  cover_image_url: {
    type: DataTypes.STRING(500)
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  annotation_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  created_by: {
    type: DataTypes.INTEGER
  },
  // 👇 NUEVOS CAMPOS PARA SPOTIFY
  spotify_track_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'ID del track en Spotify'
  },
  spotify_uri: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'URI de Spotify (spotify:track:xxxx)'
  },
  spotify_preview_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de vista previa de 30 segundos'
  },
  spotify_external_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL pública de Spotify'
  }
}, {
  tableName: 'songs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Song;