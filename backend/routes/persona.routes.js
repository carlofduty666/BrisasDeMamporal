const express = require('express');
const router = express.Router();
const personaController = require('../controllers/persona.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/personas', authMiddleware.verifyToken, personaController.getPersonasByQuery); // Para obtener todas las personas
router.get('/personas/criterio/:field/:value', authMiddleware.verifyToken, personaController.getPersonaByCriterio); // Para obtener una persona por criterio es decir 
router.get('/personas/:id/roles', authMiddleware.verifyToken, personaController.getRolesDePersona);
router.get('/personas/:id', authMiddleware.verifyToken, personaController.getPersonaById); // Para obtener una persona por ID
router.get('/personas/tipo/:tipo', authMiddleware.verifyToken, personaController.getPersonasByTipo); // Para obtener personas por tipo
router.get('/personas/tipo/:tipo/:id', authMiddleware.verifyToken, personaController.getPersonaTipoById); // Para obtener una persona por tipo y ID
router.get('/personas/representante/:id/estudiantes', authMiddleware.verifyToken, personaController.getEstudiantesByRepresentante); // Para obtener estudiantes por representante
router.get('/personas/estudiante/:id/representante', authMiddleware.verifyToken,personaController.getRepresentanteByEstudiante); // Para obtener representate por estudiante
router.get('/personas/profesor/:id/estudiantes', authMiddleware.verifyToken, personaController.getEstudiantesByProfesor); // Para obtener estudiantes por profesor
router.get('/personas/estudiante/:id/profesores', authMiddleware.verifyToken,personaController.getProfesorByEstudiante); // Para obtener profesores por estudiante

router.post('/personas', authMiddleware.verifyToken, personaController.createPersona);
router.post('/personas/asignar-rol', authMiddleware.verifyToken,personaController.asignarRolAPersona);

router.put('/personas/:id', authMiddleware.verifyToken, personaController.updatePersona);
router.delete('/personas/:id', authMiddleware.verifyToken, personaController.deletePersona);
router.delete('/personas/:personaID/roles/:rolID', authMiddleware.verifyToken, personaController.eliminarRolDePersona);


module.exports = router;