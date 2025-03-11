const express = require('express');
const router = express.Router();
const nivelController = require('../controllers/nivel.controller');

router.get('/nivel', nivelController.getAllNiveles);
router.get('/nivel/:id', nivelController.getNivelById);
router.post('/nivel', nivelController.createNivel);
router.put('/nivel/:id', nivelController.updateNivel);
router.delete('/nivel/:id', nivelController.deleteNivel);

module.exports = router;