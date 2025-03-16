const express = require('express');
const router = express.Router();
const seccionController = require('../controllers/secciones.controller');

// Rutas básicas CRUD
router.get('/secciones', seccionController.getAllSecciones);
router.get('/secciones/:id', seccionController.getSeccionById);
router.get('/secciones/grado/:gradoID', seccionController.getSeccionesByGrado);
router.post('/secciones', seccionController.createSeccion);
router.put('/secciones/:id', seccionController.updateSeccion);
router.delete('/secciones/:id', seccionController.deleteSeccion);

// Rutas para gestionar estudiantes en secciones
router.post('/secciones/asignar-estudiante', seccionController.asignarEstudianteASeccion);
router.delete('/secciones/:seccionID/estudiantes/:estudianteID/anno/:annoEscolarID', seccionController.eliminarEstudianteDeSeccion);
router.get('/secciones/:seccionID/estudiantes', seccionController.getEstudiantesBySeccion);

// Rutas para gestionar profesores en secciones
router.post('/secciones/asignar-profesor-materia', seccionController.asignarProfesorASeccionMateria);

module.exports = router;
