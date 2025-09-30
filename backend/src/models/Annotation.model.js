const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Annotation = sequelize.define('Annotation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  song_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  text_selection: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  start_char: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  end_char: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  explanation: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  cultural_context: {
    type: DataTypes.TEXT
  },
  upvotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  downvotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'hidden', 'deleted'),
    defaultValue: 'active'
  }
}, {
  tableName: 'annotations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Annotation;