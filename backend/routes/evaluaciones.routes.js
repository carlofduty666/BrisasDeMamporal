const express = require('express');
const router = express.Router();
const evaluacionesController = require('../controllers/evaluaciones.controller');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = './uploads/evaluaciones';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB límite
  fileFilter: function(req, file, cb) {
    // Validar tipos de archivo permitidos
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Tipo de archivo no permitido'), false);
    }
    cb(null, true);
  }
});

// Rutas para evaluaciones
router.get('/evaluaciones', evaluacionesController.getAllEvaluaciones);
router.get('/evaluaciones/filtradas', evaluacionesController.getEvaluacionesFiltradas);
router.get('/evaluaciones/:id', evaluacionesController.getEvaluacionById);
router.get('/evaluaciones/profesor/:profesorID', evaluacionesController.getEvaluacionesByProfesor);
router.get('/evaluaciones/estudiante/:estudianteID', evaluacionesController.getEvaluacionesByEstudiante);
router.get('/evaluaciones/verificar-porcentajes', evaluacionesController.verificarPorcentajesLapso);

router.post('/evaluaciones', upload.single('archivo'), evaluacionesController.createEvaluacion);
router.post('/evaluaciones/archivos', upload.single('archivo'), evaluacionesController.uploadArchivoEvaluacion);

router.put('/evaluaciones/:id', upload.single('archivo'), evaluacionesController.updateEvaluacion);

router.delete('/evaluaciones/:id', evaluacionesController.deleteEvaluacion);
router.delete('/evaluaciones/archivos/:id', evaluacionesController.deleteArchivoEvaluacion);

router.get('/evaluaciones/descargar/:id', evaluacionesController.downloadArchivoEvaluacion);

module.exports = router;
