const express = require('express');
const router = express.Router();
const horariosController = require('../controllers/horariosController');
const { verifyToken, authorizeRoles } = require('../middleware/auth.middleware');

// Ruta de prueba sin autenticación (temporal)
router.get('/test-clases', (req, res) => {
  res.json({
    message: 'Ruta de prueba funcionando',
    timestamp: new Date().toISOString()
  });
});

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

// RUTAS ESPECÍFICAS PRIMERO (antes de las rutas con parámetros)
// Rutas para clases actuales y próximas
router.get('/clases-actuales', 
  authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo', 'profesor', 'estudiante', 'representante']), 
  horariosController.getClasesActuales
);

router.get('/proximas-clases', 
  authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo', 'profesor', 'estudiante', 'representante']), 
  horariosController.getProximasClases
);

// Ruta específica para obtener horarios por grado y sección
router.get('/grado/:grado_id/seccion/:seccion_id', 
  authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo', 'profesor', 'estudiante', 'representante']), 
  horariosController.getHorariosByGradoSeccion
);

// Ruta para validar conflictos sin crear
router.post('/validar-conflictos',
  authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo']),
  horariosController.validarConflictos
);

// RUTAS GENERALES CON PARÁMETROS AL FINAL
router.get('/', authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo']), horariosController.getHorarios);
router.post('/', authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo']), horariosController.createHorario);
router.get('/:id', authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo']), horariosController.getHorarioById);
router.put('/:id', authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo']), horariosController.updateHorario);
router.delete('/:id', authorizeRoles(['admin', 'owner', 'adminWeb', 'administrativo']), horariosController.deleteHorario);

module.exports = router;
