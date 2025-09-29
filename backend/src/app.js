const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware básico
app.use(cors());
app.use(express.json());

// Ruta de prueba básica
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Sabelo API funciona',
    timestamp: new Date().toISOString() 
  });
});

// Ruta para probar MySQL
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

module.exports = app;