const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const ctrl = require('../controllers/mensualidades.controller');

router.get('/mensualidades', ctrl.list);
router.get('/mensualidades/estudiante/:estudianteID', auth.verifyToken, ctrl.listByEstudiante);
router.post('/mensualidades/inscripcion/:inscripcionID/generar', auth.verifyToken, ctrl.generarPorInscripcion);
router.patch('/mensualidades/:id/aprobar', auth.verifyToken, ctrl.aprobar);
router.patch('/mensualidades/:id/rechazar', auth.verifyToken, ctrl.rechazar);
router.post('/mensualidades/:id/recordatorio', auth.verifyToken, ctrl.recordatorio);
router.post('/mensualidades/recordatorios/masivo', auth.verifyToken, ctrl.recordatorioMasivo);
router.post('/mensualidades/recalcular-moras', auth.verifyToken, ctrl.recalcularMoras);
router.patch('/mensualidades/:id/reportar', auth.verifyToken, ctrl.reportar);

module.exports = router;