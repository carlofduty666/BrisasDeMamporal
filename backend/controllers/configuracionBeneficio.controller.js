const db = require('../models');
const ConfiguracionBeneficio = db.ConfiguracionBeneficio;

const configuracionBeneficioController = {
  // Obtener todas las configuraciones de beneficios
  getAllConfiguracionesBeneficios: async (req, res) => {
    try {
      const configuraciones = await ConfiguracionBeneficio.findAll({
        order: [['nombre', 'ASC']]
      });
      
      res.json(configuraciones);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener configuraciones activas
  getConfiguracionesBeneficiosActivas: async (req, res) => {
    try {
      const configuraciones = await ConfiguracionBeneficio.findAll({
        where: { activo: true },
        order: [['nombre', 'ASC']]
      });
      
      res.json(configuraciones);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },

    // Obtener configuración por ID
    getConfiguracionBeneficioById: async (req, res) => {
        try {
          const { id } = req.params;
          
          const configuracion = await ConfiguracionBeneficio.findByPk(id);
          
          if (!configuracion) {
            return res.status(404).json({ message: 'Configuración de beneficio no encontrada' });
          }
          
          res.json(configuracion);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
      },
      
      // Obtener configuraciones por tipo
      getConfiguracionesBeneficiosByTipo: async (req, res) => {
        try {
          const { tipo } = req.params;
          
          const configuraciones = await ConfiguracionBeneficio.findAll({
            where: { tipo },
            order: [['nombre', 'ASC']]
          });
          
          res.json(configuraciones);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
      },
      
      // Crear configuración de beneficio
      createConfiguracionBeneficio: async (req, res) => {
        try {
          const { 
            nombre, 
            tipo, 
            valorBase, 
            porcentajeSueldo, 
            aplicaA, 
            formula, 
            activo, 
            descripcion 
          } = req.body;
          
          // Validar datos
          if (!nombre || !tipo) {
            return res.status(400).json({ message: 'Nombre y tipo son campos requeridos' });
          }
          
          // Crear configuración
          const nuevaConfiguracion = await ConfiguracionBeneficio.create({
            nombre,
            tipo,
            valorBase: valorBase || 0,
            porcentajeSueldo: porcentajeSueldo || 0,
            aplicaA: aplicaA || 'todos',
            formula,
            activo: activo !== undefined ? activo : true,
            descripcion
          });
          
          res.status(201).json({
            message: 'Configuración de beneficio creada correctamente',
            configuracion: nuevaConfiguracion
          });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
      },
      
      // Actualizar configuración de beneficio
      updateConfiguracionBeneficio: async (req, res) => {
        try {
          const { id } = req.params;
          const { 
            nombre, 
            tipo, 
            valorBase, 
            porcentajeSueldo, 
            aplicaA, 
            formula, 
            activo, 
            descripcion 
          } = req.body;
          
          // Buscar la configuración
          const configuracion = await ConfiguracionBeneficio.findByPk(id);
          
          if (!configuracion) {
            return res.status(404).json({ message: 'Configuración de beneficio no encontrada' });
          }
          
          // Actualizar configuración
          await configuracion.update({
            nombre: nombre || configuracion.nombre,
            tipo: tipo || configuracion.tipo,
            valorBase: valorBase !== undefined ? valorBase : configuracion.valorBase,
            porcentajeSueldo: porcentajeSueldo !== undefined ? porcentajeSueldo : configuracion.porcentajeSueldo,
            aplicaA: aplicaA || configuracion.aplicaA,
            formula: formula !== undefined ? formula : configuracion.formula,
            activo: activo !== undefined ? activo : configuracion.activo,
            descripcion: descripcion !== undefined ? descripcion : configuracion.descripcion
          });
          
          res.json({
            message: 'Configuración de beneficio actualizada correctamente',
            configuracion
          });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
      },
      
      // Eliminar configuración de beneficio
      deleteConfiguracionBeneficio: async (req, res) => {
        try {
          const { id } = req.params;
          
          // Buscar la configuración
          const configuracion = await ConfiguracionBeneficio.findByPk(id);
          
          if (!configuracion) {
            return res.status(404).json({ message: 'Configuración de beneficio no encontrada' });
          }
          
          // Eliminar la configuración
          await configuracion.destroy();
          
          res.json({ message: 'Configuración de beneficio eliminada correctamente' });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
    }
};
    
module.exports = configuracionBeneficioController;
    