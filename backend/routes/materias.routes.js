const express = require('express');
const router = express.Router();
const materiaController = require('../controllers/materias.controller');

router.get('/materias', materiaController.getAllMaterias); // Para obtener todas las materias
router.get('/materias/:id', materiaController.getMateriaByID); // Para obtener una materia por ID
router.get('/materias/profesor/:id', materiaController.getMateriasByProfesor); // Para obtener todas las materias de un profesor

router.post('/materias', materiaController.createMateria); // Para crear una materia
router.post('/materias/asignar-a-grado', materiaController.asignarMateriaAGrado); // Para asignar materia a grado
router.post('/materias/asignar-profesor', materiaController.asignarProfesorAMateria); // 

router.delete('/materias/:id', materiaController.deleteMateria);
router.delete('/materias/grado/:gradoID/:materiaID/:annoEscolarID', materiaController.eliminarMateriaDeGrado);
router.delete('/materias/profesor/:profesorID/:materiaID/:gradoID/:annoEscolarID', materiaController.eliminarProfesorDeMateria);

router.put('/materias/:id', materiaController.updateMateria);

// materias, secciones
router.post('/materias/asignar-a-seccion', materiaController.asignarMateriaASeccion);
router.get('/materias/seccion/:seccionID', materiaController.getMateriasBySeccion);



module.exports = router;