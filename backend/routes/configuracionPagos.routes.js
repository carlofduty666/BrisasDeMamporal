const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const ctrl = require('../controllers/configuracionPagos.controller');

router.get('/configuracion-pagos', ctrl.getConfig);
router.put('/configuracion-pagos', auth.verifyToken, ctrl.updateConfig);
router.post('/configuracion-pagos/actualizar-precios', auth.verifyToken, ctrl.actualizarPrecios);
router.post('/configuracion-pagos/congelar-mes', auth.verifyToken, ctrl.congelarMes);

module.exports = router;