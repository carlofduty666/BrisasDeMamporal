const express = require('express'); 
const router = express.Router();
const gradosController = require('../controllers/grados.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas (si las hay)
router.get('/grados/nivel/:nombre_nivel', gradosController.getGradosByNivel); // Si esta debe ser pública

// Rutas protegidas
router.get('/grados', authMiddleware.verifyToken, gradosController.getAllGrados);
router.get('/grados/:id', authMiddleware.verifyToken, gradosController.getGradoById);
router.get('/grados/:id/materias', authMiddleware.verifyToken, gradosController.getMateriasByGrado);
router.get('/grados/:id/profesores', authMiddleware.verifyToken, gradosController.getProfesoresByGrado);
router.get('/grados/:id/estudiantes', authMiddleware.verifyToken, gradosController.getEstudiantesByGrado);

router.post('/grados', authMiddleware.verifyToken, gradosController.createGrado);
router.post('/grados/asignar-estudiante', authMiddleware.verifyToken, gradosController.asignarEstudianteAGrado);

router.put('/grados/:id', authMiddleware.verifyToken, gradosController.updateGrado);

router.delete('/grados/:gradoID/estudiantes/:estudianteID/:annoEscolarID', authMiddleware.verifyToken, gradosController.eliminarEstudianteDeGrado);
router.delete('/grados/:id', authMiddleware.verifyToken, gradosController.deleteGrado);

module.exports = router;
