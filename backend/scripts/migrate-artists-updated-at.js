/**
 * Script de migración: Agregar updated_at a artists
 * Uso: node backend/scripts/migrate-artists-updated-at.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'sabelo_db'
  });

  try {
    console.log(' Iniciando migración: add updated_at to artists');
    
    // Verificar si la columna ya existe
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM artists LIKE 'updated_at'"
    );

    if (columns.length > 0) {
      console.log('  La columna updated_at ya existe en artists');
      await connection.end();
      return;
    }

    // Agregar columna updated_at
    console.log('📝 Agregando columna updated_at...');
    await connection.query(`
      ALTER TABLE artists 
      ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      AFTER created_at
    `);

    // Actualizar registros existentes
    console.log('📝 Actualizando registros existentes...');
    await connection.query(`
      UPDATE artists 
      SET updated_at = created_at
    `);

    console.log('  Migración completada exitosamente');
    
    // Verificar resultado
    const [result] = await connection.query('DESCRIBE artists');
    console.log('\n📋 Estructura actual de la tabla artists:');
    console.table(result);

  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

migrate()
  .then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migración falló:', error);
    process.exit(1);
  });