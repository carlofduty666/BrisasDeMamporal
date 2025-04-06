const express = require('express');
const router = express.Router();
const personaController = require('../controllers/persona.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/personas', personaController.getPersonasByQuery); // Para obtener todas las personas
router.get('/personas/criterio/:field/:value', personaController.getPersonaByCriterio); // Para obtener una persona por criterio es decir 
router.get('/personas/:id/roles', personaController.getRolesDePersona);
router.get('/personas/:id', personaController.getPersonaById); // Para obtener una persona por ID
router.get('/personas/tipo/:tipo', personaController.getPersonasByTipo); // Para obtener personas por tipo
router.get('/personas/tipo/:tipo/:id', personaController.getPersonaTipoById); // Para obtener una persona por tipo y ID
router.get('/personas/representante/:id/estudiantes', personaController.getEstudiantesByRepresentante); // Para obtener estudiantes por representante

router.post('/personas', personaController.createPersona);
router.post('/personas/asignar-rol', personaController.asignarRolAPersona);

router.put('/personas/:id', personaController.updatePersona);
router.delete('/personas/:id', personaController.deletePersona);
router.delete('/personas/:personaID/roles/:rolID', personaController.eliminarRolDePersona);


module.exports = router;