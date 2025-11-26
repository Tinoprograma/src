/**
 * ANNOTATION MODEL
 * Modelo de anotaciones de canciones
 *
 * Responsabilidades:
 * - Definir schema de anotaciones
 * - Validaciones de campos
 * - Asociaciones con otros modelos
 */

module.exports = (sequelize, DataTypes) => {
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

  /**
   * Define associations for Annotation model
   */
  Annotation.associate = (models) => {
    // Anotación pertenece a una canción
    Annotation.belongsTo(models.Song, {
      foreignKey: 'song_id',
      as: 'song'
    });

    // Anotación pertenece a un usuario
    Annotation.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Annotation;
};
