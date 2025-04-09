const express = require('express');
const router = express.Router();
const evaluacionesController = require('../controllers/evaluaciones.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Rutas para evaluaciones
router.get('/evaluaciones', verifyToken, evaluacionesController.getAllEvaluaciones);
router.get('/evaluaciones/filtradas', verifyToken, evaluacionesController.getEvaluacionesFiltradas);
router.get('/evaluaciones/:id', verifyToken, evaluacionesController.getEvaluacionById);
router.get('/evaluaciones/profesor/:profesorID', verifyToken, evaluacionesController.getEvaluacionesByProfesor);
router.get('/evaluaciones/estudiante/:estudianteID', verifyToken, evaluacionesController.getEvaluacionesByEstudiante);
router.get('/evaluaciones/verificar-porcentajes', verifyToken, evaluacionesController.verificarPorcentajesLapso);

// Rutas para crear y actualizar evaluaciones (ahora sin multer)
router.post('/evaluaciones', verifyToken, evaluacionesController.createEvaluacion);
router.post('/evaluaciones/archivos', verifyToken, evaluacionesController.uploadArchivoEvaluacion);

router.put('/evaluaciones/:id', verifyToken, evaluacionesController.updateEvaluacion);

router.delete('/evaluaciones/:id', verifyToken, evaluacionesController.deleteEvaluacion);
router.delete('/evaluaciones/archivos/:id', verifyToken, evaluacionesController.deleteArchivoEvaluacion);

router.get('/evaluaciones/descargar/:id', verifyToken, evaluacionesController.downloadArchivoEvaluacion);

module.exports = router;
