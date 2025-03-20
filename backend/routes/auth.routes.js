const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Rutas públicas
router.post('/auth/register', authController.register);
router.post('/auth/verify-email', authController.verifyEmail);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// Rutas protegidas
// router.get('/auth/profile', verifyToken, authController.getProfile);

module.exports = router;
