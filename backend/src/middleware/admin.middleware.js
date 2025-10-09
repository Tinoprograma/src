const sequelize = require('../config/database');

// Verificar si es admin
const adminOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Debes estar autenticado' });
    }

    const [user] = await sequelize.query(
      'SELECT role FROM users WHERE id = :id',
      {
        replacements: { id: req.user.id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos de administrador' });
    }

    next();
  } catch (error) {
    console.error('Error en adminOnly:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Verificar si es admin o moderador
const moderatorOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Debes estar autenticado' });
    }

    const [user] = await sequelize.query(
      'SELECT role FROM users WHERE id = :id',
      {
        replacements: { id: req.user.id },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user.role !== 'admin' && user.role !== 'moderator') {
      return res.status(403).json({ message: 'No tienes permisos suficientes' });
    }

    next();
  } catch (error) {
    console.error('Error en moderatorOrAdmin:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Registrar cambios en auditoría
const logAudit = async (adminId, action, entityType, entityId, oldValue = null, newValue = null, reason = null) => {
  try {
    await sequelize.query(
      `INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, old_value, new_value, reason)
       VALUES (:admin_id, :action, :entity_type, :entity_id, :old_value, :new_value, :reason)`,
      {
        replacements: {
          admin_id: adminId,
          action,
          entity_type: entityType,
          entity_id: entityId,
          old_value: oldValue ? JSON.stringify(oldValue) : null,
          new_value: newValue ? JSON.stringify(newValue) : null,
          reason
        }
      }
    );

    console.log(`📋 Auditoría: ${action} en ${entityType} #${entityId}`);
  } catch (error) {
    console.error('Error registrando auditoría:', error);
  }
};

module.exports = {
  adminOnly,
  moderatorOrAdmin,
  logAudit
};