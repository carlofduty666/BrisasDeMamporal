const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporte.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Ruta para descargar la nómina de una sección en Excel
router.get('/reportes/nomina-seccion/:seccionID', reporteController.generarNominaSeccion);

module.exports = router;
