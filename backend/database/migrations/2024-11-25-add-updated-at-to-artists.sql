-- ============================================
-- MIGRACIÓN: Agregar columna updated_at a artists
-- Fecha: 2024-11-25
-- Descripción: Sincronizar tabla artists con modelo Sequelize
-- ============================================

-- UP: Agregar columna updated_at
ALTER TABLE `artists` 
ADD COLUMN `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
AFTER `created_at`;

-- Actualizar registros existentes para que updated_at = created_at
UPDATE `artists` 
SET `updated_at` = `created_at` 
WHERE `updated_at` IS NULL;

-- DOWN (Rollback): Eliminar columna updated_at
-- ALTER TABLE `artists` DROP COLUMN `updated_at`;