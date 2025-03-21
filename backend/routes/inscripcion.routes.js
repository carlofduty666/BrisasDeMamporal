const express = require('express');
const router = express.Router();
const inscripcionController = require('../controllers/inscripcion.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Middleware para manejar la subida de múltiples archivos
const uploadDocumentos = upload.fields([
  { name: /^documento_.*$/, maxCount: 1 }
]);

// Rutas públicas
router.get('/inscripcion/cupos-disponibles', inscripcionController.getCuposDisponibles);

// Rutas protegidas
router.get('/inscripciones', authMiddleware.verifyToken, inscripcionController.getAllInscripciones);
router.get('/inscripciones/representante/:representanteID', authMiddleware.verifyToken, inscripcionController.getInscripcionesByRepresentante);
router.get('/inscripciones/:id', authMiddleware.verifyToken, inscripcionController.getInscripcionById);
router.post('/inscripciones', authMiddleware.verifyToken, inscripcionController.createInscripcion);
router.post('/inscripcion/nuevo-estudiante', authMiddleware.verifyToken, uploadDocumentos, inscripcionController.crearNuevoEstudiante);
router.put('/inscripciones/:id/estado', authMiddleware.verifyToken, inscripcionController.updateEstadoInscripcion);
router.post('/inscripciones/:id/pago', authMiddleware.verifyToken, inscripcionController.registrarPagoInscripcion);
router.get('/inscripciones/:id/comprobante', authMiddleware.verifyToken, inscripcionController.getComprobanteInscripcion);
router.delete('/inscripciones/:id', authMiddleware.verifyToken, inscripcionController.deleteInscripcion);

module.exports = router;
