const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Crear carpeta de logs si no existe
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Definir formatos
const errorFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${metaStr ? '\n' + metaStr : ''}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'sabelo-api' },
  transports: [
    // Archivo de errores
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: errorFormat
    }),

    // Archivo de todos los logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: errorFormat
    }),

    // Archivo de acceso HTTP
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      maxsize: 5242880,
      maxFiles: 5,
      format: errorFormat
    })
  ]
});

// En desarrollo, también mostrar en consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.LOG_LEVEL || 'debug'
    })
  );
}

// Log levels
const log = {
  // Info: evento esperado (login, creación de recursos)
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },

  // Warn: algo inesperado pero recuperable
  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },

  // Error: error pero no crítico
  error: (message, meta = {}) => {
    logger.error(message, meta);
  },

  // Debug: información de debug
  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },

  // HTTP: acceso HTTP
  http: (method, path, status, duration, user = null) => {
    logger.info('HTTP', {
      method,
      path,
      status,
      duration_ms: duration,
      user
    });
  },

  // Database: operaciones de BD
  database: (operation, table, duration, user = null) => {
    logger.info('DATABASE', {
      operation,
      table,
      duration_ms: duration,
      user
    });
  },

  // Auth: eventos de autenticación
  auth: (event, user, details = {}) => {
    logger.info('AUTH', {
      event, // 'login', 'logout', 'register', 'failed_login'
      user,
      ...details
    });
  },

  // Custom: log personalizado
  custom: (category, message, meta = {}) => {
    logger.info(message, {
      category,
      ...meta
    });
  }
};

module.exports = log;