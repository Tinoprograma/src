const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());

// Rutas de prueba
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Sabelo API funciona',
    timestamp: new Date().toISOString() 
  });
});

app.get('/test/mysql', async (req, res) => {
  try {
    const sequelize = require('./config/database');
    await sequelize.authenticate();
    res.json({ 
      message: 'MySQL conectado correctamente',
      database: process.env.DB_NAME 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error conectando a MySQL',
      error: error.message 
    });
  }
});

// Rutas principales
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/songs', require('./routes/songs.routes'));
app.use('/api/annotations', require('./routes/annotations.routes'));

// 404 handler - SIN el asterisco
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

module.exports = app;