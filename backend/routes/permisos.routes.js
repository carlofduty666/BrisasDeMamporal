const express = require('express');
const permisosController = require('../controllers/permisos.controller');
const { verifyToken, isAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// Obtener todos los permisos
router.get('/', permisosController.getAllPermisos);

// Obtener permisos por categoría
router.get('/categoria/:categoria', permisosController.getPermisosByCategoria);

// Obtener permisos de un usuario
router.get('/usuario/:usuarioID', permisosController.getPermisosByUsuario);

// Obtener SOLO permisos específicos del usuario (sin los del rol)
router.get('/usuario/:usuarioID/especificos', permisosController.getPermisosEspecificosUsuario);

// Crear permiso (solo admin)
router.post('/', verifyToken, isAdmin, permisosController.crearPermiso);

// Asignar permiso a un usuario
router.post('/usuario/asignar', verifyToken, isAdmin, permisosController.asignarPermisoUsuario);

// Remover permiso de un usuario
router.delete('/usuario/remover', verifyToken, isAdmin, permisosController.removerPermisoUsuario);

// Asignar múltiples permisos a un usuario
router.post('/usuario/asignar-multiples', verifyToken, isAdmin, permisosController.asignarMultiplesPermisosUsuario);

module.exports = router;