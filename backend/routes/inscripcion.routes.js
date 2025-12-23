const express = require('express');
const router = express.Router();
const inscripcionController = require('../controllers/inscripcion.controller');
// const uploadMiddleware = require('../middleware/upload.middleware');
const authMiddleware= require('../middleware/auth.middleware'); // Importar el middleware de autenticación

const disableFileUpload = (req, res, next) => {
  req.disableFileUpload = true;
  next();
};

// Rutas públicas
router.get('/inscripciones/cupos-disponibles', inscripcionController.getCuposDisponibles);

// Rutas protegidas
router.get('/inscripciones', authMiddleware.verifyToken, inscripcionController.getAllInscripciones);
router.get('/inscripciones/representante/:representanteID', authMiddleware.verifyToken, inscripcionController.getInscripcionesByRepresentante);
router.get('/inscripciones/:id', authMiddleware.verifyToken, inscripcionController.getInscripcionById);
router.post('/inscripciones', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission('crear_inscripciones'), inscripcionController.createInscripcion);
router.get('/inscripciones/estudiante/:estudianteID/actual', authMiddleware.verifyToken, inscripcionController.getInscripcionActualByEstudiante);

router.post(
  '/inscripciones/nuevo-estudiante', 
  authMiddleware.verifyToken,
  authMiddleware.loadUserPermissions,
  (req, res, next) => {
    console.log('Procesando solicitud de nueva inscripción');
    console.log('Headers:', req.headers);
    next();
  },
  inscripcionController.crearNuevoEstudiante
);
router.put('/inscripciones/:id/estado', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission('editar_inscripciones'), inscripcionController.updateEstadoInscripcion);
router.put('/:id/datos', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission('editar_inscripciones'), inscripcionController.updateInscripcionData);
router.post('/inscripciones/:id/pago', authMiddleware.verifyToken, inscripcionController.registrarPagoInscripcion);
router.get('/inscripciones/:id/comprobante', authMiddleware.verifyToken, inscripcionController.getComprobanteInscripcion);
router.delete('/inscripciones/:id', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission('eliminar_inscripciones'), inscripcionController.deleteInscripcion);

router.put('/inscripciones/:id/update-estado', 
  disableFileUpload, 
  authMiddleware.verifyToken,
  authMiddleware.loadUserPermissions,
  authMiddleware.requirePermission('editar_inscripciones'),
  inscripcionController.updateInscripcionDocumentos
);

module.exports = router;
