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
  }
}, {
  tableName: 'songs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Song;