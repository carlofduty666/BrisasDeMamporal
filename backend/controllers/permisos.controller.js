const db = require('../models');
const Permiso = db.Permiso;
const Rol_Permiso = db.Rol_Permiso;
const Usuario_Permiso = db.Usuario_Permiso;
const Usuarios = db.Usuarios;
const Roles = db.Roles;

// Obtener todos los permisos
exports.getAllPermisos = async (req, res) => {
  try {
    const permisos = await Permiso.findAll({
      order: [['categoria', 'ASC'], ['nombre', 'ASC']]
    });
    res.status(200).json(permisos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener permisos por categoría
exports.getPermisosByCategoria = async (req, res) => {
  try {
    const { categoria } = req.params;
    const permisos = await Permiso.findAll({
      where: { categoria },
      order: [['nombre', 'ASC']]
    });
    res.status(200).json(permisos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener permisos de un rol
exports.getPermisosByRol = async (req, res) => {
  try {
    const { rolID } = req.params;
    const permisos = await Permiso.findAll({
      include: [{
        model: Roles,
        as: 'roles',
        where: { id: rolID },
        through: { attributes: [] },
        attributes: []
      }],
      order: [['categoria', 'ASC'], ['nombre', 'ASC']]
    });
    res.status(200).json(permisos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener permisos de un usuario (combinados: rol base + permisos adicionales)
exports.getPermisosByUsuario = async (req, res) => {
  try {
    const { usuarioID } = req.params;

    const usuario = await Usuarios.findByPk(usuarioID, {
      include: [{
        model: db.Personas,
        as: 'persona',
        attributes: ['tipo']
      }]
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const tipo = usuario.persona.tipo;

    let permisos = [];

    // Si es owner o adminWeb, tiene acceso a TODO
    if (tipo === 'owner' || tipo === 'adminWeb') {
      permisos = await Permiso.findAll({
        order: [['categoria', 'ASC'], ['nombre', 'ASC']]
      });
    } else {
      // Obtener permisos base del tipo de usuario (si existe rol)
      const roles = await Roles.findAll({
        where: { nombre: tipo },
        include: [{
          model: Permiso,
          as: 'permisos',
          through: { attributes: [] },
          attributes: ['id', 'nombre', 'descripcion', 'categoria', 'ruta']
        }]
      });

      const rolesPermisos = new Set();
      roles.forEach(rol => {
        if (rol.permisos) {
          rol.permisos.forEach(p => rolesPermisos.add(p.id));
        }
      });

      // Obtener permisos adicionales del usuario (sin include para evitar problemas con composite key)
      const usuarioPermisos = await Usuario_Permiso.findAll({
        where: { usuarioID },
        attributes: ['permisoID'],
        raw: true
      });

      // Combinar permisos
      const permisosMap = new Map();

      // Primero agregar permisos del rol (solo si hay alguno)
      if (rolesPermisos.size > 0) {
        const rolesPermisosData = await Permiso.findAll({
          where: { id: Array.from(rolesPermisos) }
        });

        rolesPermisosData.forEach(p => {
          permisosMap.set(p.id, p);
        });
      }

      // Luego agregar permisos adicionales del usuario
      if (usuarioPermisos.length > 0) {
        const permisoIDs = usuarioPermisos.map(up => up.permisoID);
        const usuariosPermisosData = await Permiso.findAll({
          where: { id: permisoIDs }
        });

        usuariosPermisosData.forEach(p => {
          permisosMap.set(p.id, p);
        });
      }

      permisos = Array.from(permisosMap.values());
    }

    res.status(200).json(permisos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Asignar permiso a un usuario
exports.asignarPermisoUsuario = async (req, res) => {
  try {
    const { usuarioID, permisoID } = req.body;

    // Verificar que el usuario existe
    const usuario = await Usuarios.findByPk(usuarioID);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar que el permiso existe
    const permiso = await Permiso.findByPk(permisoID);
    if (!permiso) {
      return res.status(404).json({ message: 'Permiso no encontrado' });
    }

    // Verificar que no existe ya
    const existe = await Usuario_Permiso.findOne({
      where: { usuarioID, permisoID }
    });

    if (existe) {
      return res.status(400).json({ message: 'El usuario ya tiene este permiso' });
    }

    // Asignar permiso
    await Usuario_Permiso.create({ usuarioID, permisoID });

    res.status(201).json({ message: 'Permiso asignado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remover permiso de un usuario
exports.removerPermisoUsuario = async (req, res) => {
  try {
    const { usuarioID, permisoID } = req.body;

    const resultado = await Usuario_Permiso.destroy({
      where: { usuarioID, permisoID }
    });

    if (resultado === 0) {
      return res.status(404).json({ message: 'Permiso no encontrado en el usuario' });
    }

    res.status(200).json({ message: 'Permiso removido exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Asignar múltiples permisos a un usuario
exports.asignarMultiplesPermisosUsuario = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { usuarioID, permisoIDs } = req.body;

    // Verificar que el usuario existe
    const usuario = await Usuarios.findByPk(usuarioID, { transaction });
    if (!usuario) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Remover permisos anteriores
    await Usuario_Permiso.destroy({
      where: { usuarioID },
      transaction
    });

    // Asignar nuevos permisos
    const permisosData = permisoIDs.map(permisoID => ({
      usuarioID,
      permisoID
    }));

    await Usuario_Permiso.bulkCreate(permisosData, { transaction });

    await transaction.commit();

    res.status(201).json({ message: 'Permisos actualizados exitosamente' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

// Asignar permisos a un rol
exports.asignarPermisosRol = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { rolID, permisoIDs } = req.body;

    // Verificar que el rol existe
    const rol = await Roles.findByPk(rolID, { transaction });
    if (!rol) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Rol no encontrado' });
    }

    // Remover permisos anteriores
    await Rol_Permiso.destroy({
      where: { rolID },
      transaction
    });

    // Asignar nuevos permisos
    const permisosData = permisoIDs.map(permisoID => ({
      rolID,
      permisoID
    }));

    await Rol_Permiso.bulkCreate(permisosData, { transaction });

    await transaction.commit();

    res.status(201).json({ message: 'Permisos de rol actualizados exitosamente' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

// Crear permiso
exports.crearPermiso = async (req, res) => {
  try {
    const { nombre, descripcion, categoria, ruta } = req.body;

    const permiso = await Permiso.create({
      nombre,
      descripcion,
      categoria,
      ruta
    });

    res.status(201).json(permiso);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'El nombre del permiso ya existe' });
    }
    res.status(500).json({ message: error.message });
  }
};