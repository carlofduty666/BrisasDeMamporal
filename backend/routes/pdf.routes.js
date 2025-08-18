const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

// Ruta para generar PDF de horario por grado y sección
router.get('/horario/:grado_id/:seccion_id', 
  authorizeRoles(['admin', 'owner', 'adminWeb', 'profesor', 'estudiante', 'representante']), 
  pdfController.generarHorarioPDF
);

module.exports = router;