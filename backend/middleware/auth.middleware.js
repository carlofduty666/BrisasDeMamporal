const jwt = require('jsonwebtoken');
const db = require('../models');
const Usuarios = db.Usuarios;

exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    
    // Verificar si el usuario existe
    const usuario = await Usuarios.findByPk(decoded.id);
    if (!usuario) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    // Añadir información del usuario al request
    req.userId = decoded.id;
    req.personaId = decoded.personaID;
    req.userType = decoded.tipo;
    req.userPermissions = decoded.permisos || [];
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(401).json({ message: 'Token inválido' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.userType !== 'adminWeb' && req.userType !== 'owner' && req.userType !== 'administrativo') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
};

exports.isTeacher = (req, res, next) => {
  if (req.userType !== 'profesor' && req.userType !== 'adminWeb' && req.userType !== 'owner') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de profesor' });
  }
  next();
};

exports.isRepresentante = (req, res, next) => {
  if (req.userType !== 'representante' && req.userType !== 'adminWeb' && req.userType !== 'owner') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de representante' });
  }
  next();
};
exports.isEstudiante = (req, res, next) => { // exports es para que se pueda usar en otros archivos sustituye al module.exports
  if (req.userType !== 'estudiante' && req.userType !== 'adminWeb' && req.userType !== 'owner') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de estudiante' });
  }
  next();
};

// Middleware para autorizar múltiples roles
exports.authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.userType) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    // Mapear roles del frontend a roles del backend
    const roleMapping = {
      'admin': 'adminWeb',
      'owner': 'owner',
      'adminWeb': 'adminWeb',
      'profesor': 'profesor',
      'estudiante': 'estudiante',
      'representante': 'representante'
    };

    const userRole = req.userType;
    const hasPermission = allowedRoles.some(role => {
      const mappedRole = roleMapping[role] || role;
      return userRole === mappedRole;
    });

    if (!hasPermission) {
      return res.status(403).json({ 
        message: 'Acceso denegado. No tienes permisos para acceder a este recurso' 
      });
    }

    next();
  };
};

// Middleware para verificar permisos específicos
exports.requirePermission = (requiredPermissions) => {
  return (req, res, next) => {
    if (!req.userType) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    // Si es owner o adminWeb, tiene todos los permisos
    if (req.userType === 'owner' || req.userType === 'adminWeb') {
      return next();
    }

    const userPermissions = req.userPermissions || [];
    const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];

    const hasPermission = permissions.some(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ 
        message: 'Acceso denegado. No tienes permisos para acceder a este recurso',
        requiredPermissions: permissions
      });
    }

    next();
  };
};

