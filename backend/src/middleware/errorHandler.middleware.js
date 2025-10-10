const logger = require('../utils/logger');

// Clase para errores de la aplicación
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware de manejo de errores
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Error interno del servidor';

  // Log del error
  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    method: req.method,
    path: req.path,
    body: req.body,
    user: req.user?.id,
    stack: err.stack
  });

  // Errores de validación de Sequelize
  if (err.name === 'ValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors
    });
  }

  // Errores de duplicado (unique constraint)
  if (err.name === 'UniqueConstraintError') {
    const fields = Object.keys(err.fields);
    const field = fields[0];
    return res.status(409).json({
      success: false,
      message: `Ya existe un registro con ese ${field}`,
      field,
      code: 'UNIQUE_CONSTRAINT'
    });
  }

  // Errores de clave foránea
  if (err.name === 'ForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'No se puede realizar esta operación debido a relaciones con otros registros',
      code: 'FOREIGN_KEY_CONSTRAINT',
      details: {
        table: err.table,
        fields: err.fields
      }
    });
  }

  // Errores personalizados de la app
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
      code: err.statusCode
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(400).json({
        success: false,
        message: 'Archivo demasiado grande',
        code: 'FILE_TOO_LARGE'
      });
    }
  }

  // Error genérico
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    code: err.statusCode,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.details
    })
  });
};

// Wrapper para async functions
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { 
  AppError, 
  errorHandler, 
  asyncHandler 
};