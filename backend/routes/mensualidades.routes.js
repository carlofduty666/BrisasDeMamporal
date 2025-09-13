const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const ctrl = require('../controllers/mensualidades.controller');

router.get('/mensualidades', ctrl.list);
router.get('/mensualidades/estudiante/:estudianteID', auth.verifyToken, ctrl.listByEstudiante);
router.post('/mensualidades/inscripcion/:inscripcionID/generar', ctrl.generarPorInscripcion);
router.patch('/mensualidades/:id/aprobar', auth.verifyToken, ctrl.aprobar);
router.patch('/mensualidades/:id/rechazar', auth.verifyToken, ctrl.rechazar);
router.post('/mensualidades/:id/recordatorio', auth.verifyToken, ctrl.recordatorio);
router.patch('/mensualidades/:id/reportar', ctrl.reportar);

module.exports = router;