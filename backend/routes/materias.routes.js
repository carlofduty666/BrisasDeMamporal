const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materias.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas (si las hay)
// router.get('/materias/publicas', materiaController.getMateriasPublicas);

// Rutas protegidas
router.get('/materias/profesor/:id', authMiddleware.verifyToken, materiaController.getMateriasByProfesor);
router.get('/materias/profesor/:profesorID/grado/:gradoID', authMiddleware.verifyToken, materiaController.getMateriasByProfesorEnGrado);
router.get('/materias/:materiaID/grados', authMiddleware.verifyToken, materiaController.getGradosByMateria);
router.get('/grado/:gradoID/materias', authMiddleware.verifyToken, materiaController.getMateriasByGrado);
router.get('/materias/:id/profesores', authMiddleware.verifyToken, materiaController.getProfesoresByMateria);

router.get('/materias/:id', authMiddleware.verifyToken, materiaController.getMateriaByID);
router.get('/materias', authMiddleware.verifyToken, materiaController.getAllMaterias);

router.post('/materias', authMiddleware.verifyToken, materiaController.createMateria);
router.post('/materias/asignar-a-grado', authMiddleware.verifyToken, materiaController.asignarMateriaAGrado);
router.post('/materias/asignar-profesor-materia', authMiddleware.verifyToken, materiaController.asignarProfesorAMateria);
router.post('/materias/asignar-profesor-grado', authMiddleware.verifyToken, materiaController.asignarProfesorAGrado);

router.delete('/materias/:id', authMiddleware.verifyToken, materiaController.deleteMateria);
router.delete('/materias/grado/:gradoID/:materiaID/:annoEscolarID', authMiddleware.verifyToken, materiaController.eliminarMateriaDeGrado);
router.delete('/materias/profesor/:profesorID/:materiaID/:gradoID/:annoEscolarID', authMiddleware.verifyToken, materiaController.eliminarProfesorDeMateria);

router.put('/materias/:id', authMiddleware.verifyToken, materiaController.updateMateria);

// Obtener materias por sección
router.get('/materias/seccion/:seccionID', authMiddleware.verifyToken, materiaController.getMateriasBySeccion);

module.exports = router;
