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
router.get('/grados/profesor/:profesorID', authMiddleware.verifyToken, gradosController.getGradosByProfesor);
router.get('/grados/:id/estudiantes', authMiddleware.verifyToken, gradosController.getEstudiantesByGrado);
router.get('/grados/estudiante/:id', authMiddleware.verifyToken, gradosController.getGradosByEstudiante);

router.post('/grados', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission('crear_grados'), gradosController.createGrado);
router.post('/grados/asignar-estudiante', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission('editar_grados'), gradosController.asignarEstudianteAGrado);
router.post('/grados/:gradoID/asignar-profesor', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission('editar_grados'), gradosController.asignarProfesor);
router.post('/grados/transferir-estudiante', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission('editar_grados'), gradosController.transferirEstudianteDeGrado);
router.post('/grados/transferir-estudiantes-masivo', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission('editar_grados'), gradosController.transferirEstudiantesMasivo);

router.put('/grados/:id', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission('editar_grados'), gradosController.updateGrado);

router.delete('/grados/:gradoID/estudiantes/:estudianteID/:annoEscolarID', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission('editar_grados'), gradosController.eliminarEstudianteDeGrado);
router.delete('/grados/:gradoID/profesores/:profesorID/:annoEscolarID', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission('editar_grados'), gradosController.eliminarProfesorDeGrado);
router.delete('/grados/:id', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission('eliminar_grados'), gradosController.deleteGrado);

module.exports = router;
