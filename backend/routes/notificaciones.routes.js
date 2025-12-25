const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const ctrl = require('../controllers/notificaciones.controller');

router.post('/notificaciones/destinatarios', auth.verifyToken, ctrl.obtenerDestinatarios);
router.post('/notificaciones', auth.verifyToken, ctrl.crear);
router.post('/notificaciones/:id/enviar', auth.verifyToken, ctrl.enviar);
router.get('/notificaciones', auth.verifyToken, ctrl.listar);
router.get('/notificaciones/mis-notificaciones', auth.verifyToken, ctrl.misNotificaciones);
router.get('/notificaciones/:id', auth.verifyToken, ctrl.obtenerPorId);
router.patch('/notificaciones/usuario/:id/leer', auth.verifyToken, ctrl.marcarComoLeida);
router.delete('/notificaciones/:id', auth.verifyToken, ctrl.eliminar);

module.exports = router;
