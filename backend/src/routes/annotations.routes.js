const express = require('express');
const router = express.Router();
const annotationsController = require('../controllers/annotations.controller');
const { authenticateToken, optionalAuth } = require('../middleware/auth.middleware');
const { validateAnnotation } = require('../middleware/validation.middleware');

// Obtener anotaciones de una canción (público)
router.get('/song/:song_id', optionalAuth, annotationsController.getBySong);

// Crear nueva anotación (requiere autenticación)
router.post('/', authenticateToken, validateAnnotation, annotationsController.create);

// Votar anotación (requiere autenticación)
router.post('/:id/vote', authenticateToken, annotationsController.vote);

// Actualizar anotación (requiere autenticación)
router.put('/:id', authenticateToken, annotationsController.update);

// Eliminar anotación (requiere autenticación)
router.delete('/:id', authenticateToken, annotationsController.delete);

module.exports = router;