const express = require('express');
const router = express.Router();
const pagoEstudiantesController = require('../controllers/pagoEstudiantes.controller');

// Rutas para pagos de estudiantes
router.get('/pagos', pagoEstudiantesController.getAllPagos);
router.get('/pagos/estudiante/:estudianteID', pagoEstudiantesController.getPagosByEstudiante);
router.get('/pagos/representante/:representanteID', pagoEstudiantesController.getPagosByRepresentante);
router.get('/pagos/:id', pagoEstudiantesController.getPagoById);
router.get('/pagos/reporte', pagoEstudiantesController.generarReportePagos);
router.get('/pagos/verificar-vencidos', pagoEstudiantesController.verificarPagosVencidos);

router.post('/pagos', pagoEstudiantesController.uploadMiddleware, pagoEstudiantesController.createPago);
// router.post('/pagos/stripe', pagoEstudiantesController.iniciarPagoStripe);
// router.post('/pagos/stripe/webhook', pagoEstudiantesController.stripeWebhook);
// router.post('/pagos/confirmar/:sessionId', pagoEstudiantesController.confirmarPagoStripe);
router.post('/pagos/:id/comprobante', pagoEstudiantesController.uploadMiddleware, pagoEstudiantesController.uploadComprobante);

router.put('/pagos/:id/estado', pagoEstudiantesController.updateEstadoPago);

router.get('/pagos/:id/comprobante', pagoEstudiantesController.downloadComprobante);

module.exports = router;
