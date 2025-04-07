const express = require('express');
const router = express.Router();
const calificacionesController = require('../controllers/calificaciones.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/calificaciones', authMiddleware.verifyToken, calificacionesController.getAllCalificaciones);
router.get('/calificaciones/:id', authMiddleware.verifyToken, calificacionesController.getCalificacionById);
router.get('/calificaciones/evaluacion/:evaluacionID', authMiddleware.verifyToken, calificacionesController.getCalificacionesByEvaluacion);
router.get('/calificaciones/estudiante/:estudianteID', authMiddleware.verifyToken, calificacionesController.getCalificacionesByEstudiante);
router.get('/calificaciones/materia/:materiaID', authMiddleware.verifyToken, calificacionesController.getCalificacionesByMateria);
router.get('/calificaciones/grado/:gradoID/seccion/:seccionID', authMiddleware.verifyToken, calificacionesController.getCalificacionesByGradoSeccion);
router.get('/calificaciones/resumen/estudiante/:estudianteID', authMiddleware.verifyToken, calificacionesController.getResumenCalificacionesByEstudiante);

router.get('/notas/lapso', authMiddleware.verifyToken, calificacionesController.getNotasByLapso);
router.get('/notas/definitivas', authMiddleware.verifyToken, calificacionesController.getNotasDefinitivas);

router.post('/calificaciones', authMiddleware.verifyToken, calificacionesController.createCalificacion);
router.post('/calificaciones/lote', authMiddleware.verifyToken, calificacionesController.registrarCalificacionesLote);
router.post('/notas/definitivas/calcular', authMiddleware.verifyToken, calificacionesController.calcularNotasDefinitivas);
router.post('/notas/recuperacion', authMiddleware.verifyToken, calificacionesController.registrarNotaRecuperacion);

router.put('/calificaciones/:id', authMiddleware.verifyToken, calificacionesController.updateCalificacion);

router.delete('/calificaciones/:id', authMiddleware.verifyToken, calificacionesController.deleteCalificacion);

module.exports = router;