const db = require('../models');
const Roles = db.Roles;

const rolesController = {
  // Obtener todos los roles
  getAllRoles: async (req, res) => {
    try {
      const roles = await Roles.findAll();
      res.json(roles);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener rol por ID
  getRolById: async (req, res) => {
    try {
      const rol = await Roles.findByPk(req.params.id);
      if (rol) {
        res.json(rol);
      } else {
        res.status(404).json({ message: 'Rol no encontrado' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Crear nuevo rol
  createRol: async (req, res) => {
    try {
      const { nombre, descripcion } = req.body;
      
      if (!nombre) {
        return res.status(400).json({ message: 'El nombre del rol es requerido' });
      }
      
      const existingRol = await Roles.findOne({ where: { nombre } });
      if (existingRol) {
        return res.status(400).json({ message: 'Ya existe un rol con este nombre' });
      }
      
      const newRol = await Roles.create({ nombre, descripcion });
      res.status(201).json(newRol);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  },
  
  // Actualizar rol
  updateRol: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion } = req.body;
      
      const rol = await Roles.findByPk(id);
      if (!rol) {
        return res.status(404).json({ message: 'Rol no encontrado' });
      }
      
      if (nombre) {
        const existingRol = await Roles.findOne({ 
          where: { nombre, id: { [db.Sequelize.Op.ne]: id } } 
        });
        
        if (existingRol) {
          return res.status(400).json({ message: 'Ya existe otro rol con este nombre' });
        }
      }
      
      await rol.update({ nombre, descripcion });
      
      res.json(rol);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  },
  
  // Eliminar rol
  deleteRol: async (req, res) => {
    try {
      const { id } = req.params;
      
      const rol = await Roles.findByPk(id);
      if (!rol) {
        return res.status(404).json({ message: 'Rol no encontrado' });
      }
      
      // Verificar si hay personas con este rol
      const personasCount = await db.Persona_Roles.count({ where: { rolID: id } });
      if (personasCount > 0) {
        return res.status(400).json({ 
          message: 'No se puede eliminar este rol porque está asignado a personas' 
        });
      }
      
      await rol.destroy();
      
      res.json({ message: 'Rol eliminado correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener personas con un rol específico
  getPersonasByRol: async (req, res) => {
    try {
      const { id } = req.params;
      
      const rol = await Roles.findByPk(id, {
        include: [{
          model: db.Persona,
          as: 'personas',
          through: { attributes: [] }
        }]
      });
      
      if (!rol) {
        return res.status(404).json({ message: 'Rol no encontrado' });
      }
      
      res.json(rol.personas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = rolesController;
