const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const ctrl = require('../controllers/mensualidades.controller');

router.get('/mensualidades', ctrl.list);
router.get('/mensualidades/resumen-mensual', auth.verifyToken, ctrl.resumenMensual);
router.get('/mensualidades/resumen-anual', auth.verifyToken, ctrl.resumenAnual);
router.get('/mensualidades/estudiante/:estudianteID', ctrl.listByEstudiante);
router.post('/mensualidades/inscripcion/:inscripcionID/generar', ctrl.generarPorInscripcion);
router.patch('/mensualidades/:id/aprobar', auth.verifyToken, ctrl.aprobar);
router.patch('/mensualidades/:id/rechazar', auth.verifyToken, ctrl.rechazar);
router.post('/mensualidades/:id/recordatorio', auth.verifyToken, ctrl.recordatorio);
router.post('/mensualidades/recordatorios/masivo', auth.verifyToken, ctrl.recordatorioMasivo);
router.post('/mensualidades/recalcular-moras', auth.verifyToken, ctrl.recalcularMoras);
router.patch('/mensualidades/:id/reportar', auth.verifyToken, ctrl.reportar);
router.get('/mensualidades/export', auth.verifyToken, ctrl.exportMensual);

module.exports = router;