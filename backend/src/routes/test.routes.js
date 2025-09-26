const express = require('express');
const router = express.Router();
const testController = require('../controllers/test.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Ruta pública de health check
router.get('/health', testController.getHealth);

// Ruta para probar base de datos
router.get('/database', testController.testDatabase);

// Ruta protegida de prueba
router.get('/auth', authenticateToken, testController.testAuth);

module.exports = router;