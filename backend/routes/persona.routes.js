const express = require('express');
const router = express.Router();
const personaController = require('../controllers/persona.controller');

router.get('/personas', personaController.getAllPersonas); // Para obtener todas las personas
router.get('/personas/:field/:value', personaController.getPersonaByCriterio); // Para obtener una persona por criterio
router.post('/personas', personaController.createPersona);
router.put('/personas/:id', personaController.updatePersona);
router.delete('/personas/:id', personaController.deletePersona);

module.exports = router;