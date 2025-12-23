const express = require('express');
const router = express.Router();
const personaController = require('../controllers/persona.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/personas/profesor/materia-grado', authMiddleware.verifyToken, personaController.getProfesorByMateriaGrado);
router.get('/personas', authMiddleware.verifyToken, personaController.getPersonasByQuery);
router.get('/personas/criterio/:field/:value', authMiddleware.verifyToken, personaController.getPersonaByCriterio);
router.get('/personas/:id/roles', authMiddleware.verifyToken, personaController.getRolesDePersona);
router.get('/personas/:id', authMiddleware.verifyToken, personaController.getPersonaById);
router.get('/personas/tipo/:tipo', authMiddleware.verifyToken, personaController.getPersonasByTipo);
router.get('/personas/tipo/:tipo/:id', authMiddleware.verifyToken, personaController.getPersonaTipoById);
router.get('/personas/representante/:id/estudiantes', authMiddleware.verifyToken, personaController.getEstudiantesByRepresentante);
router.get('/personas/estudiante/:id/representante', authMiddleware.verifyToken, personaController.getRepresentanteByEstudiante);
router.get('/personas/profesor/:id/estudiantes', authMiddleware.verifyToken, personaController.getEstudiantesByProfesor);
router.get('/personas/estudiante/:id/profesores', authMiddleware.verifyToken, personaController.getProfesorByEstudiante);

router.post('/personas', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission(['crear_estudiantes', 'crear_profesores', 'crear_representantes', 'crear_empleados']), personaController.createPersona);
router.post('/personas/asignar-rol', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission('gestionar_usuarios'), personaController.asignarRolAPersona);

router.put('/personas/:id', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission(['editar_estudiantes', 'editar_profesores', 'editar_representantes', 'editar_empleados']), personaController.updatePersona);
router.delete('/personas/:id', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission(['eliminar_estudiantes', 'eliminar_profesores', 'eliminar_representantes', 'eliminar_empleados']), personaController.deletePersona);
router.delete('/personas/:personaID/roles/:rolID', authMiddleware.verifyToken, authMiddleware.loadUserPermissions, authMiddleware.requirePermission('gestionar_usuarios'), personaController.eliminarRolDePersona);


module.exports = router;