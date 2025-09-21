const express = require('express');
const router = express.Router();
const annoEscolarController = require('../controllers/annoEscolar.controller');

// Rutas para año escolar
router.get('/anno-escolar', annoEscolarController.getAllAnnoEscolares); // Obtener todos los años escolares
router.get('/anno-escolar/actual', annoEscolarController.getAnnoEscolarActual); // Obtener el año escolar actual (activo)
router.get('/anno-escolar/:id', annoEscolarController.getAnnoEscolarById); // Obtener año escolar por ID
router.get('/anno-escolar/:id/meses', annoEscolarController.getMesesAnnoEscolar); // Obtener meses del año escolar

router.post('/anno-escolar', annoEscolarController.createAnnoEscolar); // Crear nuevo año escolar

router.put('/anno-escolar/:id', annoEscolarController.updateAnnoEscolar); // Actualizar año escolar por ID
router.put('/anno-escolar/:id/activar', annoEscolarController.setAnnoEscolarActivo); // Activar año escolar por ID

router.delete('/anno-escolar/:id', annoEscolarController.deleteAnnoEscolar); // Eliminar año escolar por ID

module.exports = router;
