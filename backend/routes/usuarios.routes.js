const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Obtener todos los usuarios
router.get('/usuarios', authMiddleware.verifyToken, usuariosController.getAllUsuarios);

// Obtener usuario por ID
router.get('/usuarios/:id', authMiddleware.verifyToken, usuariosController.getUsuarioById);

// Obtener usuario por email
router.get('/usuarios/email/:email', authMiddleware.verifyToken, usuariosController.getUsuarioByEmail);

// Actualizar usuario
router.put('/usuarios/:id', authMiddleware.verifyToken, usuariosController.updateUsuario);

// Cambiar contraseña
router.put('/usuarios/:id/cambiar-password', authMiddleware.verifyToken, usuariosController.cambiarPassword);

// Restablecer contraseña (por admin)
router.put('/usuarios/:id/restablecer-password', authMiddleware.verifyToken, usuariosController.restablecerPassword);

// Verificar usuario
router.put('/usuarios/:id/verificar', authMiddleware.verifyToken, usuariosController.verificarUsuario);

// Eliminar usuario
router.delete('/usuarios/:id', authMiddleware.verifyToken, usuariosController.deleteUsuario);

module.exports = router;