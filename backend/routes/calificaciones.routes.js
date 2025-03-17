const express = require('express');
const router = express.Router();
const calificacionesController = require('../controllers/calificaciones.controller');

// Rutas para calificaciones
router.get('/calificaciones', calificacionesController.getAllCalificaciones);
router.get('/calificaciones/:id', calificacionesController.getCalificacionById);
router.get('/calificaciones/evaluacion/:evaluacionID', calificacionesController.getCalificacionesByEvaluacion);
router.get('/calificaciones/estudiante/:estudianteID', calificacionesController.getCalificacionesByEstudiante);
router.get('/calificaciones/notas-lapso', calificacionesController.getNotasByLapso);
router.get('/calificaciones/notas-definitivas', calificacionesController.getNotasDefinitivas);

router.post('/calificaciones', calificacionesController.createCalificacion);
router.post('/calificaciones/lote', calificacionesController.registrarCalificacionesLote);
router.post('/calificaciones/calcular-definitivas', calificacionesController.calcularNotasDefinitivas);
router.post('/calificaciones/recuperacion', calificacionesController.registrarNotaRecuperacion);

router.put('/calificaciones/:id', calificacionesController.updateCalificacion);

router.delete('/calificaciones/:id', calificacionesController.deleteCalificacion);

module.exports = router;
