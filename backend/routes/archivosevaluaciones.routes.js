const express = require('express');
const router = express.Router();
const archivosEvaluacionesController = require('../controllers/archivosevaluaciones.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Rutas para archivos de evaluaciones
router.get('/archivos-evaluaciones/evaluacion/:evaluacionID', verifyToken, archivosEvaluacionesController.getArchivosByEvaluacion);
router.get('/archivos-evaluaciones/entregas/:evaluacionID', verifyToken, archivosEvaluacionesController.getEntregasByEvaluacion);
router.get('/archivos-evaluaciones/estudiante/:evaluacionID/:estudianteID', verifyToken, archivosEvaluacionesController.getArchivosByEstudiante);
router.get('/archivos-evaluaciones/descargar/:id', verifyToken, archivosEvaluacionesController.downloadArchivo);

router.post('/archivos-evaluaciones/upload/:evaluacionID', verifyToken, archivosEvaluacionesController.uploadArchivoEstudiante);

router.delete('/archivos-evaluaciones/:id', verifyToken, archivosEvaluacionesController.deleteArchivo);

module.exports = router;