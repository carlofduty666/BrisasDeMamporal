const express = require('express'); 
const router = express.Router();
const gradosController = require('../controllers/grados.controller');

router.get('/grados', gradosController.getAllGrados); // Para obtener todos los grados
router.get('/grados/:id', gradosController.getGradoById); // Para obtener un grado por id
router.get('/grados/nivel/:nivel', gradosController.getGradoByNivel); // Para obtener un grado por nivel
router.post('/grados', gradosController.createGrado); // Para crear un nuevo grado
router.delete('/grados/:id', gradosController.deleteGrado); // Para eliminar un grado por ID
router.put('/grados/:id', gradosController.updateGrado); // Para actualizar un grado por ID

module.exports = router;