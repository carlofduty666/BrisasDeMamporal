const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Rutas públicas
router.post('/auth/register', authController.register);
router.post('/auth/register-profesor', authController.registerProfesor);
router.post('/auth/register-empleado-admin', authController.registerEmpleadoAdmin);
router.post('/auth/verify-email', authController.verifyEmail);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

router.get('/personas/verificar-profesor/:cedula', authController.verificarProfesor);
router.get('/personas/verificar-personal/:tipo/:cedula', authController.verificarPersonal);

// Rutas protegidas
// router.get('/auth/profile', verifyToken, authController.getProfile);

module.exports = router;
