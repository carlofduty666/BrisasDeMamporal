const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materias.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas (si las hay)
// router.get('/materias/publicas', materiaController.getMateriasPublicas);

// Rutas protegidas
router.get('/materias', authMiddleware.verifyToken, materiaController.getAllMaterias);
router.get('/materias/:id', authMiddleware.verifyToken, materiaController.getMateriaByID);
router.get('/materias/profesor/:id', authMiddleware.verifyToken, materiaController.getMateriasByProfesor);
router.get('/materias/grado/:id', authMiddleware.verifyToken, materiaController.getMateriasByGrado); // Añadida esta ruta

router.post('/materias', authMiddleware.verifyToken, materiaController.createMateria);
router.post('/materias/asignar-a-grado', authMiddleware.verifyToken, materiaController.asignarMateriaAGrado);
router.post('/materias/asignar-profesor', authMiddleware.verifyToken, materiaController.asignarProfesorAMateria);

router.delete('/materias/:id', authMiddleware.verifyToken, materiaController.deleteMateria);
router.delete('/materias/grado/:gradoID/:materiaID/:annoEscolarID', authMiddleware.verifyToken, materiaController.eliminarMateriaDeGrado);
router.delete('/materias/profesor/:profesorID/:materiaID/:gradoID/:annoEscolarID', authMiddleware.verifyToken, materiaController.eliminarProfesorDeMateria);

router.put('/materias/:id', authMiddleware.verifyToken, materiaController.updateMateria);

// materias, secciones
router.post('/materias/asignar-a-seccion', authMiddleware.verifyToken, materiaController.asignarMateriaASeccion);
router.get('/materias/seccion/:seccionID', authMiddleware.verifyToken, materiaController.getMateriasBySeccion);

module.exports = router;
