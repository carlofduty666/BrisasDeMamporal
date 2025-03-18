const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionNomina.controller');

// Rutas para configuración de nómina
router.get('/configuracion/nomina/activa', configuracionController.getConfiguracionNominaActiva);
router.get('/configuracion/nomina', configuracionController.getAllConfiguracionesNomina);
router.get('/configuracion/nomina/:id', configuracionController.getConfiguracionNominaById);
router.post('/configuracion/nomina', configuracionController.createConfiguracionNomina);
router.put('/configuracion/nomina/:id', configuracionController.updateConfiguracionNomina);
router.delete('/configuracion/nomina/:id', configuracionController.deleteConfiguracionNomina);

module.exports = router;
