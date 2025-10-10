const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const { errorHandler } = require('./middleware/errorHandler.middleware');
const logger = require('./utils/logger');

// Inicializar app
const app = express();

// ============================================
// MIDDLEWARE DE SEGURIDAD Y PARSEO
// ============================================

// Helmet: headers de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Compression
app.use(compression());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// LOGGING
// ============================================

// Morgan para HTTP logging
app.use(morgan((tokens, req, res) => {
  const duration = tokens['response-time'](req, res);
  logger.http(
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    parseFloat(duration),
    req.user?.id
  );
  return null; // No loguear en consola (ya lo hace morgan)
}));

// ============================================
// RUTAS
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/artists', require('./routes/artists.routes'));
app.use('/api/albums', require('./routes/albums.routes'));
app.use('/api/songs', require('./routes/songs.routes'));
app.use('/api/annotations', require('./routes/annotations.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// ============================================
// 404 - Rutas no encontradas
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// ============================================
// ERROR HANDLER (Debe ser último)
// ============================================

app.use(errorHandler);

module.exports = app;