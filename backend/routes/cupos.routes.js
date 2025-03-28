const express = require('express');
const router = express.Router();
const cuposController = require('../controllers/cupos.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/cupos/resumen', cuposController.getResumenCupos);
router.get('/cupos/grado/:gradoID', cuposController.getCuposByGrado);

// Rutas protegidas
router.get('/cupos', authMiddleware.verifyToken, cuposController.getAllCupos);
router.post('/cupos', authMiddleware.verifyToken, cuposController.createCupo);
router.delete('/cupos/:id', authMiddleware.verifyToken, cuposController.deleteCupo);
router.put('/cupos/:id/capacidad', authMiddleware.verifyToken, cuposController.updateCapacidadCupo);
router.get('/cupos/:id', authMiddleware.verifyToken, cuposController.getCupoById);
router.get('/cupos/seccion/:seccionID', authMiddleware.verifyToken, cuposController.getCuposBySeccion);
router.post('/cupos/actualizar-reales', authMiddleware.verifyToken, cuposController.actualizarCuposReales);


module.exports = router;
