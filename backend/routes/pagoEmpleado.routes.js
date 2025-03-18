const express = require('express');
const router = express.Router();
const pagoEmpleadoController = require('../controllers/pagoEmpleados.controller');

// Rutas para pagos de empleados
router.get('/pagos-empleados', pagoEmpleadoController.getAllPagosEmpleados);
router.get('/pagos-empleados/:id', pagoEmpleadoController.getPagoEmpleadoById);
router.get('/pagos-empleados/empleado/:personaID', pagoEmpleadoController.getPagosByEmpleado);
router.get('/pagos-empleados/nomina/:nominaID', pagoEmpleadoController.getPagosByNomina);
router.post('/pagos-empleados', pagoEmpleadoController.createPagoEmpleado);
router.put('/pagos-empleados/:id', pagoEmpleadoController.updatePagoEmpleado);
router.delete('/pagos-empleados/:id', pagoEmpleadoController.deletePagoEmpleado);

module.exports = router;
