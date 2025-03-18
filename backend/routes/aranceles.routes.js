const express = require('express');
const router = express.Router();
const arancelesController = require('../controllers/arancel.controller');

router.get('/aranceles', arancelesController.getAllAranceles);
router.get('/aranceles/activos', arancelesController.getArancelesActivos);
router.get('/aranceles/:id', arancelesController.getArancelById);
router.post('/aranceles', arancelesController.createArancel);
router.put('/aranceles/:id', arancelesController.updateArancel);
router.delete('/aranceles/:id', arancelesController.deleteArancel);

module.exports = router;
