const express = require('express'); 
const router = express.Router();
const gradosController = require('../controllers/grados.controller');

router.get('/grados', gradosController.getAllGrados); // Para obtener todos los grados
router.get('/grados/:id', gradosController.getGradoById); // Para obtener un grado por id
router.get('/grados/nivel/:nombre_nivel', gradosController.getGradosByNivel); // Para obtener un grado por nivel
router.get('/grados/:id/materias', gradosController.getMateriasByGrado); // Para obtener las materias de un grado
router.get('/grados/:id/profesores', gradosController.getProfesoresByGrado); // Para obtener los profesores de un grado
router.get('/grados/:id/estudiantes', gradosController.getEstudiantesByGrado); // Para obtener los estudiantes de un grado

router.post('/grados', gradosController.createGrado); // Para crear un nuevo grado
router.post('/grados/asignar-estudiante', gradosController.asignarEstudianteAGrado); // Para asignar un estudiante a un grado

router.put('/grados/:id', gradosController.updateGrado); // Para actualizar un grado por ID

router.delete('/grados/:gradoID/estudiantes/:estudianteID/:annoEscolarID', gradosController.eliminarEstudianteDeGrado);
router.delete('/grados/:id', gradosController.deleteGrado); // Para eliminar un grado por ID


module.exports = router;