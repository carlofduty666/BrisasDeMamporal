const express = require('express');
const router = express.Router();
const seccionesController = require('../controllers/secciones.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas (si las hay)
router.get('/secciones/publicas', seccionesController.getSeccionesPublicas);

// Rutas protegidas - solo lectura
// NOTA: Las rutas más específicas deben ir primero para evitar que sean interceptadas por :id
router.get('/secciones/grado/:gradoID', seccionesController.getSeccionesByGrado);
router.get('/secciones/estudiante/:id', authMiddleware.verifyToken, seccionesController.getSeccionesByEstudiante);
router.get('/secciones/:id/estudiantes', authMiddleware.verifyToken, seccionesController.getEstudiantesBySeccion);
router.get('/secciones', authMiddleware.verifyToken, seccionesController.getAllSecciones);
router.get('/secciones/:id', authMiddleware.verifyToken, seccionesController.getSeccionById);


// Rutas protegidas - requieren permisos de administrador
router.post('/secciones', authMiddleware.verifyToken, seccionesController.createSeccion);
router.put('/secciones/:id', authMiddleware.verifyToken, seccionesController.updateSeccion);
router.delete('/secciones/:id', authMiddleware.verifyToken, seccionesController.deleteSeccion);

// Rutas para asignar/desasignar estudiantes
router.post('/secciones/asignar-estudiante', authMiddleware.verifyToken, seccionesController.asignarEstudianteASeccion);
router.post('/transferir-estudiantes', authMiddleware.verifyToken, seccionesController.transferirEstudiantes);
router.post('/secciones/transferir-estudiantes-masivo', authMiddleware.verifyToken, seccionesController.transferirEstudiantesMasivoSecciones);
router.delete('/secciones/:seccionID/estudiantes/:estudianteID/anno/:annoEscolarID', authMiddleware.verifyToken, seccionesController.removeEstudianteFromSeccion);

module.exports = router;