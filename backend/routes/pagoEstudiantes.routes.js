const express = require('express');
const router = express.Router();
const pagoEstudiantesController = require('../controllers/pagoEstudiantes.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas para obtener pagos
router.get('/pagos', pagoEstudiantesController.getAllPagos);
router.get('/pagos/:id', authMiddleware.verifyToken, pagoEstudiantesController.getPagoById);
router.get('/pagos/estudiante/:estudianteID', pagoEstudiantesController.getPagosByEstudiante);
router.get('/pagos/representante/:representanteID', authMiddleware.verifyToken, pagoEstudiantesController.getPagosByRepresentante);
router.get('/pagos/:id/comprobante', authMiddleware.verifyToken, pagoEstudiantesController.getComprobante);
router.get('/pagos/estudiante/:estudianteID/estado', authMiddleware.verifyToken, pagoEstudiantesController.verificarEstadoPagosEstudiante);

// Rutas para crear y actualizar pagos
router.post('/pagos', authMiddleware.verifyToken, pagoEstudiantesController.createPago);
router.put('/pagos/:id/estado', authMiddleware.verifyToken, pagoEstudiantesController.updateEstadoPago);
router.delete('/pagos/:id', authMiddleware.verifyToken, pagoEstudiantesController.deletePago);

// Reset de pagos (solo admin/owner y requiere confirmar = "BORRAR")
router.post('/pagos/reset', authMiddleware.verifyToken, authMiddleware.isAdmin, pagoEstudiantesController.resetPagos);

module.exports = router;
