const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false  // Desactivar logs por ahora
  }
);

// Comentar el test automático para que no bloquee el inicio
// async function testConnection() {
//   try {
//     await sequelize.authenticate();
//     console.log('  MySQL conectado correctamente');
//   } catch (error) {
//     console.error('❌ Error conectando a MySQL:', error.message);
//   }
// }
// testConnection();

module.exports = sequelize;