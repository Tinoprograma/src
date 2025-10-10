/**
 * ARCHIVO CENTRAL DE MODELOS - SABELO
 * 
 * Este archivo:
 * 1. Carga la conexión a BD
 * 2. Define todos los modelos
 * 3. Establece asociaciones
 * 4. Exporta los modelos para usar en toda la app
 * 
 * USO:
 * const { User, Artist, Song } = require('../models');
 * 
 * Ubicación: backend/src/models/index.js
 */

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ============================================
// 1. DEFINIR MODELOS
// ============================================

// 📦 USER MODEL
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

// 📦 ARTIST MODEL
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

// 📦 ALBUM MODEL
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

// 📦 SONG MODEL
const Song = sequelize.define('Song', {
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
  album_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'albums',
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  track_number: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1],
        msg: 'Número de track debe ser mayor a 0'
      }
    }
  },
  is_single: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  lyrics: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Las letras no pueden estar vacías'
      }
    }
  },
  album: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'DEPRECATED: usar album_id'
  },
  release_year: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: {
        args: [1900],
        msg: 'Año debe ser mayor a 1900'
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
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  annotation_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
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
  spotify_track_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  spotify_uri: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  spotify_preview_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  spotify_external_url: {
    type: DataTypes.STRING(500),
    allowNull: true
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
  tableName: 'songs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['artist_id'] },
    { fields: ['album_id'] },
    { fields: ['view_count'] },
    { fields: ['created_by'] }
  ]
});

// 📦 ANNOTATION MODEL
const Annotation = sequelize.define('Annotation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  song_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'songs',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  text_selection: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: {
        args: [1, 500],
        msg: 'Texto seleccionado debe tener entre 1 y 500 caracteres'
      }
    }
  },
  start_char: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'start_char no puede ser negativo'
      }
    }
  },
  end_char: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: [1],
        msg: 'end_char debe ser mayor a 0'
      }
    }
  },
  explanation: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
    validate: {
      len: {
        args: [10, Infinity],
        msg: 'Explicación debe tener al menos 10 caracteres'
      }
    }
  },
  cultural_context: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  upvotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  downvotes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'pending', 'rejected', 'hidden', 'deleted'),
    defaultValue: 'active',
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
  tableName: 'annotations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['song_id', 'start_char', 'end_char'] },
    { fields: ['user_id'] },
    { fields: ['upvotes'] },
    { fields: ['status'] },
    { fields: ['is_verified'] }
  ]
});

// ============================================
// 2. DEFINIR ASOCIACIONES
// ============================================

/**
 * USER ASSOCIATIONS
 */
User.hasMany(Artist, {
  foreignKey: 'user_id',
  as: 'artists',
  onDelete: 'SET NULL'
});

User.hasMany(Song, {
  foreignKey: 'created_by',
  as: 'createdSongs',
  onDelete: 'SET NULL'
});

User.hasMany(Album, {
  foreignKey: 'created_by',
  as: 'createdAlbums',
  onDelete: 'SET NULL'
});

User.hasMany(Annotation, {
  foreignKey: 'user_id',
  as: 'annotations',
  onDelete: 'CASCADE'
});

/**
 * ARTIST ASSOCIATIONS
 */
Artist.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'creator'
});

Artist.hasMany(Song, {
  foreignKey: 'artist_id',
  as: 'songs',
  onDelete: 'CASCADE'
});

Artist.hasMany(Album, {
  foreignKey: 'artist_id',
  as: 'albums',
  onDelete: 'CASCADE'
});

/**
 * ALBUM ASSOCIATIONS
 */
Album.belongsTo(Artist, {
  foreignKey: 'artist_id',
  as: 'artist'
});

Album.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

Album.hasMany(Song, {
  foreignKey: 'album_id',
  as: 'songs',
  onDelete: 'SET NULL'
});

/**
 * SONG ASSOCIATIONS
 */
Song.belongsTo(Artist, {
  foreignKey: 'artist_id',
  as: 'artist'
});

Song.belongsTo(Album, {
  foreignKey: 'album_id',
  as: 'album'
});

Song.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

Song.hasMany(Annotation, {
  foreignKey: 'song_id',
  as: 'annotations',
  onDelete: 'CASCADE'
});

/**
 * ANNOTATION ASSOCIATIONS
 */
Annotation.belongsTo(Song, {
  foreignKey: 'song_id',
  as: 'song'
});

Annotation.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// ============================================
// 3. EXPORTAR MODELOS Y SEQUELIZE
// ============================================

module.exports = {
  // Sequelize instance
  sequelize,
  Sequelize,

  // Models
  User,
  Artist,
  Album,
  Song,
  Annotation,

  // Helper para sincronizar BD (usar con cuidado en producción)
  sync: async (options = {}) => {
    return sequelize.sync(options);
  }
};