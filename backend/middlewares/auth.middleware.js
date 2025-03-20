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
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(401).json({ message: 'Token inválido' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.userType !== 'adminWeb' && req.userType !== 'owner') {
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

