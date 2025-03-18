const express = require('express');
const router = express.Router();
const configuracionBeneficioController = require('../controllers/configuracionBeneficio.controller');

// Rutas para configuración de beneficios
router.get('/configuracion/beneficios', configuracionBeneficioController.getAllConfiguracionesBeneficios);
router.get('/configuracion/beneficios/activos', configuracionBeneficioController.getConfiguracionesBeneficiosActivas);
router.get('/configuracion/beneficios/:id', configuracionBeneficioController.getConfiguracionBeneficioById);
router.get('/configuracion/beneficios/tipo/:tipo', configuracionBeneficioController.getConfiguracionesBeneficiosByTipo);
router.post('/configuracion/beneficios', configuracionBeneficioController.createConfiguracionBeneficio);
router.put('/configuracion/beneficios/:id', configuracionBeneficioController.updateConfiguracionBeneficio);
router.delete('/configuracion/beneficios/:id', configuracionBeneficioController.deleteConfiguracionBeneficio);

module.exports = router;
