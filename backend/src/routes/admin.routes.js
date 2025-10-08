const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { adminOnly, moderatorOrAdmin } = require('../middleware/admin.middleware');
const { authenticateToken } = require('../middleware/auth.middleware');

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// ANOTACIONES (moderators y admins)
router.patch('/annotations/:annotationId/verify', moderatorOrAdmin, adminController.verifyAnnotation);
router.delete('/annotations/:annotationId', moderatorOrAdmin, adminController.deleteAnnotation);

// CANCIONES (solo admins)
router.patch('/songs/:songId/lyrics', adminOnly, adminController.updateSongLyrics);
router.delete('/songs/:songId', adminOnly, adminController.deleteSong);

// ARTISTAS (solo admins)
router.patch('/artists/:artistId', adminOnly, adminController.updateArtist);
router.delete('/artists/:artistId', adminOnly, adminController.deleteArtist);

// ÁLBUMES (solo admins)
router.patch('/albums/:albumId', adminOnly, adminController.updateAlbum);
router.delete('/albums/:albumId', adminOnly, adminController.deleteAlbum);

// AUDITORÍA (solo admins)
router.get('/audit-logs', adminOnly, adminController.getAuditLogs);

module.exports = router;