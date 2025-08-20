const db = require('../models');
const ConfiguracionCalificaciones = db.ConfiguracionCalificaciones;
const { Op } = require('sequelize');

const configuracionController = {
  // Obtener configuración de bloqueo de calificaciones
  getBloqueoCalificaciones: async (req, res) => {
    try {
      const { annoEscolarID } = req.query;
      
      // Si no se especifica año escolar, buscar el activo
      let whereClause = {};
      if (annoEscolarID) {
        whereClause.annoEscolarID = annoEscolarID;
      } else {
        // Buscar configuración del año escolar activo
        const annoEscolarActivo = await db.AnnoEscolar.findOne({
          where: { activo: true }
        });
        if (annoEscolarActivo) {
          whereClause.annoEscolarID = annoEscolarActivo.id;
        }
      }

      // Por ahora, simulamos la configuración de bloqueo usando campos existentes
      // En una implementación real, se añadirían campos específicos al modelo
      const configuracion = await ConfiguracionCalificaciones.findOne({
        where: {
          ...whereClause,
          activo: true
        },
        include: [
          {
            model: db.AnnoEscolar,
            as: 'AnnoEscolar',
            attributes: ['id', 'periodo', 'fechaInicio', 'fechaFin']
          }
        ]
      });

      if (!configuracion) {
        return res.status(404).json({ 
          message: 'No se encontró configuración de bloqueo de calificaciones' 
        });
      }

      // Simulamos el bloqueo basado en la fecha de fin del año escolar
      const fechaLimite = configuracion.AnnoEscolar?.fechaFin || new Date();
      const fechaActual = new Date();
      const bloqueado = fechaActual > new Date(fechaLimite);

      const respuesta = {
        id: configuracion.id,
        fechaLimite: fechaLimite,
        activo: bloqueado,
        mensaje: bloqueado 
          ? 'Las calificaciones han sido bloqueadas después del cierre del año escolar.'
          : 'Las calificaciones están disponibles para edición.',
        annoEscolarID: configuracion.annoEscolarID
      };

      res.status(200).json(respuesta);

    } catch (error) {
      console.error('Error al obtener configuración de bloqueo:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Crear o actualizar configuración de bloqueo de calificaciones
  setBloqueoCalificaciones: async (req, res) => {
    try {
      const { fechaLimite, activo, mensaje, annoEscolarID } = req.body;

      if (!fechaLimite || !annoEscolarID) {
        return res.status(400).json({ 
          message: 'Se requieren fechaLimite y annoEscolarID' 
        });
      }

      // Buscar configuración existente
      let configuracion = await ConfiguracionCalificaciones.findOne({
        where: {
          annoEscolarID,
          activo: true
        }
      });

      if (configuracion) {
        // Actualizar configuración existente
        // Por ahora solo actualizamos la descripción con la información del bloqueo
        await configuracion.update({
          descripcion: JSON.stringify({
            fechaLimite,
            activo: activo || false,
            mensaje: mensaje || 'Configuración de bloqueo de calificaciones'
          })
        });
      } else {
        // Crear nueva configuración
        configuracion = await ConfiguracionCalificaciones.create({
          annoEscolarID,
          descripcion: JSON.stringify({
            fechaLimite,
            activo: activo || false,
            mensaje: mensaje || 'Configuración de bloqueo de calificaciones'
          }),
          activo: true
        });
      }

      const respuesta = {
        id: configuracion.id,
        fechaLimite,
        activo: activo || false,
        mensaje: mensaje || 'Configuración actualizada correctamente',
        annoEscolarID
      };

      res.status(200).json(respuesta);

    } catch (error) {
      console.error('Error al configurar bloqueo de calificaciones:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Verificar si las calificaciones están bloqueadas
  verificarBloqueoCalificaciones: async (req, res) => {
    try {
      const { annoEscolarID } = req.query;

      // Obtener configuración de bloqueo
      const configuracionResponse = await configuracionController.getBloqueoCalificaciones(
        { query: { annoEscolarID } }, 
        { 
          status: (code) => ({ json: (data) => data }),
          json: (data) => data 
        }
      );

      const bloqueado = configuracionResponse.activo || false;
      
      res.status(200).json({
        bloqueado,
        fechaLimite: configuracionResponse.fechaLimite,
        mensaje: configuracionResponse.mensaje
      });

    } catch (error) {
      console.error('Error al verificar bloqueo de calificaciones:', error);
      res.status(500).json({ 
        bloqueado: false,
        mensaje: 'Error al verificar el estado de bloqueo' 
      });
    }
  },

  // Obtener todas las configuraciones de calificaciones
  getAllConfiguraciones: async (req, res) => {
    try {
      const { annoEscolarID } = req.query;
      
      const whereClause = {};
      if (annoEscolarID) {
        whereClause.annoEscolarID = annoEscolarID;
      }

      const configuraciones = await ConfiguracionCalificaciones.findAll({
        where: whereClause,
        include: [
          {
            model: db.AnnoEscolar,
            as: 'AnnoEscolar',
            attributes: ['id', 'periodo', 'fechaInicio', 'fechaFin']
          },
          {
            model: db.Grados,
            as: 'Grado',
            attributes: ['id', 'nombre_grado'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json(configuraciones);

    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Crear configuración de calificaciones
  createConfiguracion: async (req, res) => {
    try {
      const configuracionData = req.body;

      const configuracion = await ConfiguracionCalificaciones.create(configuracionData);

      const configuracionCompleta = await ConfiguracionCalificaciones.findByPk(
        configuracion.id,
        {
          include: [
            {
              model: db.AnnoEscolar,
              as: 'AnnoEscolar',
              attributes: ['id', 'periodo']
            },
            {
              model: db.Grados,
              as: 'Grado',
              attributes: ['id', 'nombre_grado'],
              required: false
            }
          ]
        }
      );

      res.status(201).json(configuracionCompleta);

    } catch (error) {
      console.error('Error al crear configuración:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Actualizar configuración de calificaciones
  updateConfiguracion: async (req, res) => {
    try {
      const { id } = req.params;
      const configuracionData = req.body;

      const configuracion = await ConfiguracionCalificaciones.findByPk(id);

      if (!configuracion) {
        return res.status(404).json({ message: 'Configuración no encontrada' });
      }

      await configuracion.update(configuracionData);

      const configuracionActualizada = await ConfiguracionCalificaciones.findByPk(
        id,
        {
          include: [
            {
              model: db.AnnoEscolar,
              as: 'AnnoEscolar',
              attributes: ['id', 'periodo']
            },
            {
              model: db.Grados,
              as: 'Grado',
              attributes: ['id', 'nombre_grado'],
              required: false
            }
          ]
        }
      );

      res.status(200).json(configuracionActualizada);

    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      res.status(500).json({ message: error.message });
    }
  },

  // Eliminar configuración de calificaciones
  deleteConfiguracion: async (req, res) => {
    try {
      const { id } = req.params;

      const configuracion = await ConfiguracionCalificaciones.findByPk(id);

      if (!configuracion) {
        return res.status(404).json({ message: 'Configuración no encontrada' });
      }

      await configuracion.destroy();

      res.status(200).json({ message: 'Configuración eliminada correctamente' });

    } catch (error) {
      console.error('Error al eliminar configuración:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = configuracionController;