'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columna role a users
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM('user', 'moderator', 'admin'),
      defaultValue: 'user',
      after: 'reputation_score',
      comment: 'Rol del usuario'
    });

    // Agregar columna is_active para poder desactivar usuarios
    await queryInterface.addColumn('users', 'is_active', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      after: 'role',
      comment: 'Si el usuario está activo'
    });

    // Crear tabla de auditoría para registrar cambios de admins
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Tipo de acción realizada'
      },
      entity_type: {
        type: Sequelize.ENUM('annotation', 'song', 'album', 'artist', 'user'),
        allowNull: false
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      old_value: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Valor anterior (antes del cambio)'
      },
      new_value: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Valor nuevo (después del cambio)'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Razón del cambio'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Agregar índices
    await queryInterface.addIndex('audit_logs', ['admin_id'], { name: 'idx_audit_logs_admin_id' });
    await queryInterface.addIndex('audit_logs', ['entity_type', 'entity_id'], { name: 'idx_audit_logs_entity' });

    console.log('  Sistema de roles y auditoría creado');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('audit_logs');
    await queryInterface.removeColumn('users', 'is_active');
    await queryInterface.removeColumn('users', 'role');
    console.log('  Sistema de roles y auditoría eliminado');
  }
};