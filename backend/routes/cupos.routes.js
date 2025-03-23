const express = require('express');
const router = express.Router();
const cuposController = require('../controllers/cupos.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/cupos/resumen', cuposController.getResumenCupos);
router.get('/cupos/grado/:gradoID', cuposController.getCuposByGrado);

// Rutas protegidas
router.get('/cupos', cuposController.getAllCupos);
router.post('/cupos', cuposController.createCupo);
router.put('/cupos/:id/capacidad', authMiddleware.verifyToken, cuposController.updateCapacidadCupo);
router.delete('/cupos/:id', cuposController.deleteCupo);

module.exports = router;
