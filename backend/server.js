const app = require('./src/app');
const sequelize = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// ============================================
// VERIFICAR CONEXIÓN A BASE DE DATOS
// ============================================
async function testDatabaseConnection() {
  try {
    await sequelize.authenticate();
    console.log('  MySQL conectado correctamente');
    console.log(' Base de datos:', process.env.DB_NAME);
    return true;
  } catch (error) {
    console.error(' Error conectando a MySQL:', error.message);
    console.error('');
    console.error(' Verifica:');
    console.error('   - MySQL está corriendo (docker-compose up -d mysql)');
    console.error('   - Las credenciales en .env son correctas');
    console.error('   - La base de datos existe');
    console.error('');
    return false;
  }
}

// ============================================
// INICIAR SERVIDOR
// ============================================
async function startServer() {
  // Verificar conexión a DB primero
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.error('  Iniciando servidor SIN conexión a base de datos...');
    console.error('   Algunas funcionalidades no estarán disponibles.');
    console.error('');
  }

  const server = app.listen(PORT, () => {
    console.log('\n ============================================');
    console.log('   SABELO BACKEND - Servidor iniciado');
    console.log('   ============================================');
    console.log(`    Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`    Modo: ${process.env.NODE_ENV || 'development'}`);
    console.log(`    Base de datos: ${process.env.DB_NAME || 'sabelo'}`);
    console.log('   ============================================');
    console.log('');
    console.log('   Endpoints disponibles:');
    console.log(`   - Health check: http://localhost:${PORT}/health`);
    console.log(`   - API Test: http://localhost:${PORT}/test`);
    console.log(`   - MySQL Test: http://localhost:${PORT}/test/mysql`);
    console.log('   ============================================\n');
  });

  // Manejo de errores del servidor
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(` Puerto ${PORT} ya está en uso`);
      console.error('   Prueba con otro puerto o detén el proceso que lo está usando');
      process.exit(1);
    } else {
      console.error(' Error del servidor:', error);
      process.exit(1);
    }
  });

  // ============================================
  // GRACEFUL SHUTDOWN
  // ============================================
  const gracefulShutdown = async (signal) => {
    console.log(`\n  ${signal} recibido, cerrando servidor...`);
    
    server.close(async () => {
      console.log('  Servidor HTTP cerrado');
      
      try {
        await sequelize.close();
        console.log('  Conexiones a base de datos cerradas');
      } catch (error) {
        console.error(' Error cerrando conexiones:', error);
      }
      
      console.log(' Servidor cerrado correctamente\n');
      process.exit(0);
    });

    // Forzar cierre después de 10 segundos
    setTimeout(() => {
      console.error('  Forzando cierre del servidor...');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// Iniciar el servidor
startServer();