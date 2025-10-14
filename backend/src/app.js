const express = require('express');
const spotifyRoutes = require('./services/spotify');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// ============================================
// MIDDLEWARES
// ============================================

// Seguridad básica
app.use(helmet());

// CORS - Permitir requests desde el frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================
// RUTAS DE TESTING
// ============================================

app.get('/test', (req, res) => {
  res.json({ 
    message: '✅ Sabelo API funciona correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/test/mysql', async (req, res) => {
  try {
    const sequelize = require('./config/database');
    await sequelize.authenticate();
    res.json({ 
      message: '✅ MySQL conectado correctamente',
      database: process.env.DB_NAME 
    });
  } catch (error) {
    res.status(500).json({ 
      message: '❌ Error conectando a MySQL',
      error: error.message 
    });
  }
});

// ============================================
// RUTAS PRINCIPALES
// ============================================

app.use('/api/spotify', spotifyRoutes);
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/songs', require('./routes/songs.routes'));
app.use('/api/annotations', require('./routes/annotations.routes'));
app.use('/api/artists', require('./routes/artists.routes'));
app.use('/api/albums', require('./routes/albums.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'Sabelo API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: '🎵 Sabelo API - Backend funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      test: '/test',
      testMySQL: '/test/mysql',
      auth: '/api/auth',
      users: '/api/users',
      songs: '/api/songs',
      annotations: '/api/annotations',
      artists: '/api/artists'
    }
  });
});

// ============================================
// MANEJO DE ERRORES
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('❌ Error global:', err.stack);
  
  res.status(err.status || 500).json({
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err 
    })
  });
});

module.exports = app;