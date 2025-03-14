const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materias.controller');

router.get('/materias', materiaController.getAllMaterias); // Para obtener todas las materias
router.get('/materias/:id', materiaController.getMateriaByID); // Para obtener una materia por ID
router.get('/materias/grado/:id', materiaController.getMateriasByGrado); // Para obtener todas las materias de un grado
router.get('/materias/profesor/:id', materiaController.getMateriasByProfesor); // Para obtener todas las materias de un profesor
router.post('/materias', materiaController.createMateria);
router.put('/materias/:id', materiaController.updateMateria);
router.delete('/materias/:id', materiaController.deleteMateria);

module.exports = router;