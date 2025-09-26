// Controlador temporal para probar que todo funciona

class TestController {
  // Ruta de prueba básica
  async getHealth(req, res) {
    try {
      res.json({
        message: 'Sabelo API funcionando',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error en health check',
        error: error.message
      });
    }
  }

  // Prueba de autenticación (sin base de datos aún)
  async testAuth(req, res) {
    res.json({
      message: 'Ruta protegida funcionando',
      user: req.user,
      timestamp: new Date().toISOString()
    });
  }

  // Prueba de base de datos (cuando esté configurada)
  async testDatabase(req, res) {
    try {
      const sequelize = require('../config/database');
      await sequelize.authenticate();
      
      res.json({
        message: 'Conexión a base de datos exitosa',
        database: process.env.DB_NAME,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error de conexión a base de datos',
        error: error.message
      });
    }
  }
}

module.exports = new TestController();