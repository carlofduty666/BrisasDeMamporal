const express = require('express');
const router = express.Router();
const personaController = require('../controllers/persona.controller');

router.get('/personas', personaController.getAllPersonas); // Para obtener todas las personas
router.get('/personas/:field/:value', personaController.getPersonaByCriterio); // Para obtener una persona por criterio
router.get('/personas/:id/roles', personaController.getRolesDePersona);

router.post('/personas', personaController.createPersona);
router.post('/personas/asignar-rol', personaController.asignarRolAPersona);

router.put('/personas/:id', personaController.updatePersona);
router.delete('/personas/:id', personaController.deletePersona);
router.delete('/personas/:personaID/roles/:rolID', personaController.eliminarRolDePersona);


module.exports = router;