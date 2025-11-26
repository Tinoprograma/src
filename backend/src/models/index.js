/**
 * MODELS ORCHESTRATOR - SABELO
 */

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ============================================
// 1. IMPORTAR DEFINICIONES DE MODELOS
// ============================================

const userModel = require('./user.model');
const artistModel = require('./artist.model');
const albumModel = require('./album.model');
const songModel = require('./song.model');
const annotationModel = require('./annotation.model');

// ============================================
// 2. INICIALIZAR MODELOS
// ============================================

const models = {
  User: userModel(sequelize, DataTypes),
  Artist: artistModel(sequelize, DataTypes),
  Album: albumModel(sequelize, DataTypes),
  Song: songModel(sequelize, DataTypes),
  Annotation: annotationModel(sequelize, DataTypes)
};

// ============================================
// 3. EJECUTAR ASOCIACIONES
// ============================================

// Ejecutar el método associate() de cada modelo
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// ============================================
// 4. AGREGAR SEQUELIZE AL OBJETO DE MODELOS
// ============================================

models.sequelize = sequelize;
models.Sequelize = Sequelize;

// ============================================
// 5. EXPORTAR MODELOS
// ============================================

module.exports = {
  // Sequelize instance y clase
  sequelize,
  Sequelize,

  // Modelos individuales
  User: models.User,
  Artist: models.Artist,
  Album: models.Album,
  Song: models.Song,
  Annotation: models.Annotation,

  // Helper para sincronizar BD (usar con cuidado en producción)
  sync: async (options = {}) => {
    return sequelize.sync(options);
  },

  // Exportar todos los modelos en un objeto (útil para testing)
  models
};
