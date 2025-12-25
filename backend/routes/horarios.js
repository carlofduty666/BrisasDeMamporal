const express = require('express');
const router = express.Router();
const horariosController = require('../controllers/horariosController');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

// Rutas para horarios
router.get('/', authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo']), horariosController.getHorarios);
router.get('/:id', authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo']), horariosController.getHorarioById);
router.post('/', authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo']), horariosController.createHorario);
router.put('/:id', authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo']), horariosController.updateHorario);
router.delete('/:id', authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo']), horariosController.deleteHorario);

// Ruta específica para obtener horarios por grado y sección
router.get('/grado/:grado_id/seccion/:seccion_id', 
  authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo', 'profesor', 'estudiante', 'representante']), 
  horariosController.getHorariosByGradoSeccion
);

// Rutas para clases actuales y próximas
router.get('/clases-actuales', 
  authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo', 'profesor', 'estudiante', 'representante']), 
  horariosController.getClasesActuales
);

router.get('/proximas-clases', 
  authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo', 'profesor', 'estudiante', 'representante']), 
  horariosController.getProximasClases
);

module.exports = router;
