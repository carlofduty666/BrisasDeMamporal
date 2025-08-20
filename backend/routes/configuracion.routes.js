const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracion.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas para configuración de bloqueo de calificaciones
router.get('/configuracion/bloqueo-calificaciones', authMiddleware.verifyToken, configuracionController.getBloqueoCalificaciones);
router.post('/configuracion/bloqueo-calificaciones', authMiddleware.verifyToken, configuracionController.setBloqueoCalificaciones);
router.get('/configuracion/verificar-bloqueo', authMiddleware.verifyToken, configuracionController.verificarBloqueoCalificaciones);

// Rutas para configuraciones generales de calificaciones
router.get('/configuracion/calificaciones', authMiddleware.verifyToken, configuracionController.getAllConfiguraciones);
router.post('/configuracion/calificaciones', authMiddleware.verifyToken, configuracionController.createConfiguracion);
router.put('/configuracion/calificaciones/:id', authMiddleware.verifyToken, configuracionController.updateConfiguracion);
router.delete('/configuracion/calificaciones/:id', authMiddleware.verifyToken, configuracionController.deleteConfiguracion);

module.exports = router;