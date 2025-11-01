const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materias.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas (si las hay)
// router.get('/materias/publicas', materiaController.getMateriasPublicas);

// Rutas protegidas
// NOTA: Las rutas más específicas van PRIMERO para evitar ser interceptadas por :id

// GET - Rutas específicas con 2 parámetros
router.get('/materias/profesor/:profesorID/grado/:gradoID', authMiddleware.verifyToken, materiaController.getMateriasByProfesorEnGrado);
router.get('/materias/seccion/:seccionID', authMiddleware.verifyToken, materiaController.getMateriasBySeccion);

// GET - Rutas específicas con palabra clave + 1 parámetro
router.get('/materias/profesor/:id', authMiddleware.verifyToken, materiaController.getMateriasByProfesor);
router.get('/materias/:id/profesores', authMiddleware.verifyToken, materiaController.getProfesoresByMateria);
router.get('/materias/:materiaID/grados', authMiddleware.verifyToken, materiaController.getGradosByMateria);
router.get('/grado/:gradoID/materias', authMiddleware.verifyToken, materiaController.getMateriasByGrado);

// GET - Rutas genéricas
router.get('/materias', authMiddleware.verifyToken, materiaController.getAllMaterias);
router.get('/materias/:id', authMiddleware.verifyToken, materiaController.getMateriaByID);

// POST
router.post('/materias', authMiddleware.verifyToken, materiaController.createMateria);
router.post('/materias/asignar-a-grado', authMiddleware.verifyToken, materiaController.asignarMateriaAGrado);
router.post('/materias/asignar-profesor-materia', authMiddleware.verifyToken, materiaController.asignarProfesorAMateria);
router.post('/materias/asignar-profesor-grado', authMiddleware.verifyToken, materiaController.asignarProfesorAGrado);

// DELETE - Rutas específicas primero
router.delete('/materias/grado/:gradoID/:materiaID/:annoEscolarID', authMiddleware.verifyToken, materiaController.eliminarMateriaDeGrado);
router.delete('/materias/profesor/:profesorID/:materiaID/:gradoID/:annoEscolarID', authMiddleware.verifyToken, materiaController.eliminarProfesorDeMateria);
router.delete('/materias/:id', authMiddleware.verifyToken, materiaController.deleteMateria);

// PUT
router.put('/materias/:id', authMiddleware.verifyToken, materiaController.updateMateria);

module.exports = router;
