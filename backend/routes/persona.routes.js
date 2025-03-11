const express = require('express');
const router = express.Router();
const personaController = require('../controllers/persona.controller');

router.get('/personas', personaController.getAllPersonas); // Para obtener todas las personas
router.get('/personas/:field/:value', personaController.getPersonaByCriterio); // Para obtener una persona por criterio
router.post('/', personaController.createPersona);

module.exports = router;