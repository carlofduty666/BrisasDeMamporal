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

// Obtener permisos específicos de un usuario (SOLO Usuario_Permisos)
// Usado por el modal de gestión de permisos
exports.getPermisosEspecificosUsuario = async (req, res) => {
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

    // NOTA: Este endpoint retorna SOLO permisos específicos del usuario en Usuario_Permisos
    // Los permisos del rol se obtienen por separado
    const usuarioPermisos = await Usuario_Permiso.findAll({
      where: { usuarioID },
      include: [{
        model: Permiso,
        as: 'permiso',
        attributes: ['id', 'nombre', 'descripcion', 'categoria']
      }]
    });

    const permisos = usuarioPermisos
      .map(up => up.permiso)
      .sort((a, b) => {
        if (a.categoria !== b.categoria) {
          return a.categoria.localeCompare(b.categoria);
        }
        return a.nombre.localeCompare(b.nombre);
      });

    res.status(200).json(permisos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener permisos de un usuario (combinados: rol base + permisos adicionales)
// Usado por el login para cargar permisos completos
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

    // NOTA: Este endpoint retorna SOLO permisos específicos del usuario en Usuario_Permisos
    // Los permisos del rol se obtienen por separado
    const usuarioPermisos = await Usuario_Permiso.findAll({
      where: { usuarioID },
      include: [{
        model: Permiso,
        as: 'permiso',
        attributes: ['id', 'nombre', 'descripcion', 'categoria']
      }]
    });

    const permisos = usuarioPermisos
      .map(up => up.permiso)
      .sort((a, b) => {
        if (a.categoria !== b.categoria) {
          return a.categoria.localeCompare(b.categoria);
        }
        return a.nombre.localeCompare(b.nombre);
      });

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

    console.log('📝 Asignando permisos al usuario:', usuarioID);
    console.log('📋 Permisos a asignar:', permisoIDs);
    console.log('📊 Total de permisos:', permisoIDs?.length);

    // Validar datos de entrada
    if (!usuarioID) {
      await transaction.rollback();
      return res.status(400).json({ message: 'El ID del usuario es requerido' });
    }

    if (!Array.isArray(permisoIDs)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'permisoIDs debe ser un array' });
    }

    // Verificar que el usuario existe
    const usuario = await Usuarios.findByPk(usuarioID, { transaction });
    if (!usuario) {
      await transaction.rollback();
      console.log('❌ Usuario no encontrado:', usuarioID);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log('✓ Usuario encontrado:', usuario.email);

    // Remover permisos anteriores
    const eliminados = await Usuario_Permiso.destroy({
      where: { usuarioID },
      transaction
    });

    console.log('🗑️  Permisos anteriores eliminados:', eliminados);

    // Si no hay permisos que asignar, solo eliminar y terminar
    if (permisoIDs.length === 0) {
      await transaction.commit();
      console.log('✓ Todos los permisos removidos (array vacío)');
      return res.status(200).json({ message: 'Permisos actualizados exitosamente' });
    }

    // Verificar que todos los permisos existen
    const permisosExistentes = await Permiso.findAll({
      where: { id: permisoIDs },
      attributes: ['id'],
      transaction
    });

    console.log('🔍 Permisos encontrados en BD:', permisosExistentes.length);

    if (permisosExistentes.length !== permisoIDs.length) {
      await transaction.rollback();
      console.log('❌ Algunos permisos no existen');
      return res.status(400).json({ message: 'Algunos permisos no existen' });
    }

    // Asignar nuevos permisos
    const permisosData = permisoIDs.map(permisoID => ({
      usuarioID: parseInt(usuarioID),
      permisoID: parseInt(permisoID)
    }));

    console.log('📦 Datos a insertar:', JSON.stringify(permisosData, null, 2));

    const result = await Usuario_Permiso.bulkCreate(permisosData, { 
      transaction,
      validate: true,
      ignoreDuplicates: false
    });

    console.log('✓ Permisos insertados:', result.length);

    await transaction.commit();
    console.log('✓ Transacción confirmada exitosamente');

    res.status(200).json({ message: 'Permisos actualizados exitosamente' });
  } catch (error) {
    console.error('❌ Error al asignar permisos:', error);
    console.error('Stack trace:', error.stack);
    await transaction.rollback();
    res.status(500).json({ message: error.message, error: error.toString() });
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