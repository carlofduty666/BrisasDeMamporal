const express = require('express');
const router = express.Router();
const cuposController = require('../controllers/cupos.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/cupos/resumen', cuposController.getResumenCupos);

// Rutas protegidas
router.get('/cupos', authMiddleware.verifyToken, cuposController.getAllCupos);
router.get('/cupos/grado/:gradoID', authMiddleware.verifyToken, cuposController.getCuposByGrado);
router.post('/cupos', authMiddleware.verifyToken, cuposController.createOrUpdateCupo);
router.put('/cupos/:id/capacidad', authMiddleware.verifyToken, cuposController.updateCapacidadCupo);
router.delete('/cupos/:id', authMiddleware.verifyToken, cuposController.deleteCupo);

module.exports = router;
