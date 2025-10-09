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
    .withMessage('Username debe tener 3-50 caracteres alfanuméricos'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Contraseña debe tener al menos 8 caracteres'),
  body('display_name')
    .optional()
    .isLength({ min: 1, max: 100 }),
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
    .withMessage('Título requerido (máximo 255 caracteres)'),
  body('lyrics')
    .isLength({ min: 1 })
    .withMessage('Letras requeridas'),
  body('artist_id')
    .isInt({ min: 1 })
    .withMessage('ID de artista válido requerido'),
  body('album')
    .optional()
    .isLength({ max: 255 }),
  body('release_year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 }),
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
    .withMessage('Posición inicial válida requerida'),
  body('end_char')
    .isInt({ min: 1 })
    .withMessage('Posición final válida requerida'),
  body('explanation')
    .isLength({ min: 10 })
    .withMessage('Explicación debe tener al menos 10 caracteres'),
  body('cultural_context')
    .optional()
    .isLength({ max: 1000 }),
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateSong,
  validateAnnotation,
  handleValidationErrors
};