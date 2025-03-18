const express = require('express');
const router = express.Router();
const liquidacionController = require('../controllers/liquidacion.controller');

// Rutas para liquidaciones
router.get('/liquidaciones', liquidacionController.getAllLiquidaciones);
router.get('/liquidaciones/:id', liquidacionController.getLiquidacionById);
router.get('/liquidaciones/empleado/:personaID', liquidacionController.getLiquidacionesByEmpleado);
router.post('/liquidaciones', liquidacionController.createLiquidacion);
router.post('/liquidaciones/calcular', liquidacionController.calcularLiquidacion);
router.put('/liquidaciones/:id', liquidacionController.updateLiquidacion);
router.put('/liquidaciones/:id/pagar', liquidacionController.marcarLiquidacionComoPagada);
router.delete('/liquidaciones/:id', liquidacionController.deleteLiquidacion);

module.exports = router;
