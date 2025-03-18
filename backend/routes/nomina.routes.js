const express = require('express');
const router = express.Router();
const nominaController = require('../controllers/nomina.controller');

// Rutas para nómina
router.get('/nomina', nominaController.getAllNominas);
router.get('/nomina/:id', nominaController.getNominaById);
router.post('/nomina', nominaController.createNomina);
router.post('/nomina/generar', nominaController.generarNominaAutomatica);
router.put('/nomina/:id', nominaController.updateNomina);
router.delete('/nomina/:id', nominaController.deleteNomina);

// Rutas para pagos de empleados en nómina
router.post('/nomina/:nominaID/pagos', nominaController.agregarPagoEmpleado);
router.put('/nomina/:nominaID/pagos/:personaID', nominaController.updatePagoEmpleado);
router.delete('/nomina/:nominaID/pagos/:personaID', nominaController.deletePagoEmpleado);

// Rutas para deducciones en nómina
router.post('/nomina/:nominaID/deducciones', nominaController.agregarDeduccion);
router.put('/nomina/deducciones/:id', nominaController.updateDeduccion);
router.delete('/nomina/deducciones/:id', nominaController.deleteDeduccion);

// Rutas para bonificaciones en nómina
router.post('/nomina/:nominaID/bonificaciones', nominaController.agregarBonificacion);
router.put('/nomina/bonificaciones/:id', nominaController.updateBonificacion);
router.delete('/nomina/bonificaciones/:id', nominaController.deleteBonificacion);

module.exports = router;
