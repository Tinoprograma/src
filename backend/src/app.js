const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de prueba
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Sabelo API funciona!',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    message: 'Sabelo API - Health Check',
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime()
  });
});

// Ruta de prueba para el frontend
app.get('/api/test/frontend', (req, res) => {
  res.json({
    message: 'Conexión backend-frontend funcionando',
    cors: 'habilitado',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

console.log('✅ Sabelo Backend cargado correctamente');

module.exports = app;