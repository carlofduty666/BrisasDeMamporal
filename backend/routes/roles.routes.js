const express = require('express');
const router = express.Router();
const rolController = require('../controllers/roles.controller');

router.get('/roles', rolController.getAllRoles);
router.get('/roles/:id', rolController.getRolById);
router.get('/roles/:id/personas', rolController.getPersonasByRol);

router.post('/roles', rolController.createRol);

router.put('/roles/:id', rolController.updateRol);

router.delete('/roles/:id', rolController.deleteRol);

module.exports = router;