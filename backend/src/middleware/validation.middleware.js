const { body, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

// Validaciones para registro de usuario
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email válido requerido'),
  body('username')
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username debe tener 3-50 caracteres y solo letras, números y guiones bajos'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Contraseña debe tener al menos 8 caracteres'),
  body('display_name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nombre para mostrar debe tener 1-100 caracteres'),
  handleValidationErrors
];

// Validaciones para login
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email válido requerido'),
  body('password')
    .notEmpty()
    .withMessage('Contraseña requerida'),
  handleValidationErrors
];

// Validaciones para canciones
const validateSong = [
  body('title')
    .isLength({ min: 1, max: 255 })
    .withMessage('Título es requerido y debe tener máximo 255 caracteres'),
  body('lyrics')
    .isLength({ min: 1 })
    .withMessage('Letras son requeridas'),
  body('artist_id')
    .isInt({ min: 1 })
    .withMessage('ID de artista válido requerido'),
  body('album')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Álbum debe tener máximo 255 caracteres'),
  body('release_year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Año de lanzamiento debe ser válido'),
  handleValidationErrors
];

// Validaciones para anotaciones
const validateAnnotation = [
  body('song_id')
    .isInt({ min: 1 })
    .withMessage('ID de canción válido requerido'),
  body('text_selection')
    .isLength({ min: 1, max: 500 })
    .withMessage('Texto seleccionado requerido (máximo 500 caracteres)'),
  body('start_char')
    .isInt({ min: 0 })
    .withMessage('Posición inicial debe ser un número válido'),
  body('end_char')
    .isInt({ min: 1 })
    .withMessage('Posición final debe ser un número válido'),
  body('explanation')
    .isLength({ min: 10 })
    .withMessage('Explicación debe tener al menos 10 caracteres'),
  body('cultural_context')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Contexto cultural debe tener máximo 1000 caracteres'),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateSong,
  validateAnnotation,
  handleValidationErrors
};