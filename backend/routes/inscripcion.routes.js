const express = require('express');
const router = express.Router();
const inscripcionController = require('../controllers/inscripcion.controller');
const authMiddleware = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Configurar para múltiples campos de archivo
const uploadDocumentos = upload.fields([
  { name: /^documento_\d+$/, maxCount: 1 },
  { name: /^documento_representante_\d+$/, maxCount: 1 }
]);

// Rutas públicas
router.get('/inscripciones/cupos-disponibles', inscripcionController.getCuposDisponibles);

// Rutas protegidas
router.get('/inscripciones', authMiddleware.verifyToken, inscripcionController.getAllInscripciones);
router.get('/inscripciones/representante/:representanteID', authMiddleware.verifyToken, inscripcionController.getInscripcionesByRepresentante); // ruta para obtener inscripciones por representante
router.get('/inscripciones/:id', authMiddleware.verifyToken, inscripcionController.getInscripcionById);
router.post('/inscripciones', authMiddleware.verifyToken, inscripcionController.createInscripcion);
router.post('/inscripciones/nuevo-estudiante', authMiddleware.verifyToken, uploadDocumentos, inscripcionController.crearNuevoEstudiante);
router.put('/inscripciones/:id/estado', authMiddleware.verifyToken, inscripcionController.updateEstadoInscripcion);
router.post('/inscripciones/:id/pago', authMiddleware.verifyToken, inscripcionController.registrarPagoInscripcion);
router.get('/inscripciones/:id/comprobante', authMiddleware.verifyToken, inscripcionController.getComprobanteInscripcion);
router.delete('/inscripciones/:id', authMiddleware.verifyToken, inscripcionController.deleteInscripcion);

module.exports = router;
