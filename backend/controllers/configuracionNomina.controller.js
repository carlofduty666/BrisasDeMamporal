const db = require('../models');
const ConfiguracionNomina = db.ConfiguracionNomina;

const configuracionController = {
  // Obtener configuración de nómina activa
  getConfiguracionNominaActiva: async (req, res) => {
    try {
      const configuracion = await ConfiguracionNomina.findOne({
        where: { activo: true }
      });
      
      if (!configuracion) {
        return res.status(404).json({ message: 'No hay configuración de nómina activa' });
      }
      
      res.json(configuracion);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener todas las configuraciones de nómina
  getAllConfiguracionesNomina: async (req, res) => {
    try {
      const configuraciones = await ConfiguracionNomina.findAll({
        order: [['createdAt', 'DESC']]
      });
      
      res.json(configuraciones);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener configuración de nómina por ID
  getConfiguracionNominaById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const configuracion = await ConfiguracionNomina.findByPk(id);
      
      if (!configuracion) {
        return res.status(404).json({ message: 'Configuración de nómina no encontrada' });
      }
      
      res.json(configuracion);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Crear configuración de nómina
  createConfiguracionNomina: async (req, res) => {
    try {
      const {
        diasQuincena,
        fechaPrimerPago,
        fechaSegundoPago,
        porcentajeSeguroSocial,
        porcentajeImpuestoSobreRenta,
        activo
      } = req.body;
      
      // Si se está creando una configuración activa, desactivar las demás
      if (activo) {
        await ConfiguracionNomina.update(
          { activo: false },
          { where: { activo: true } }
        );
      }
      
           // Crear la configuración
           const nuevaConfiguracion = await ConfiguracionNomina.create({
            diasQuincena: diasQuincena || 15,
            fechaPrimerPago: fechaPrimerPago || 15,
            fechaSegundoPago: fechaSegundoPago || 30,
            porcentajeSeguroSocial: porcentajeSeguroSocial || 0,
            porcentajeImpuestoSobreRenta: porcentajeImpuestoSobreRenta || 0,
            activo: activo !== undefined ? activo : true
          });
          
          res.status(201).json({
            message: 'Configuración de nómina creada correctamente',
            configuracion: nuevaConfiguracion
          });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
      },
      
      // Actualizar configuración de nómina
      updateConfiguracionNomina: async (req, res) => {
        try {
          const { id } = req.params;
          const {
            diasQuincena,
            fechaPrimerPago,
            fechaSegundoPago,
            porcentajeSeguroSocial,
            porcentajeImpuestoSobreRenta,
            activo
          } = req.body;
          
          // Buscar la configuración
          const configuracion = await ConfiguracionNomina.findByPk(id);
          
          if (!configuracion) {
            return res.status(404).json({ message: 'Configuración de nómina no encontrada' });
          }
          
          // Si se está activando esta configuración, desactivar las demás
          if (activo && !configuracion.activo) {
            await ConfiguracionNomina.update(
              { activo: false },
              { where: { activo: true } }
            );
          }
          
          // Actualizar la configuración
          await configuracion.update({
            diasQuincena: diasQuincena !== undefined ? diasQuincena : configuracion.diasQuincena,
            fechaPrimerPago: fechaPrimerPago !== undefined ? fechaPrimerPago : configuracion.fechaPrimerPago,
            fechaSegundoPago: fechaSegundoPago !== undefined ? fechaSegundoPago : configuracion.fechaSegundoPago,
            porcentajeSeguroSocial: porcentajeSeguroSocial !== undefined ? porcentajeSeguroSocial : configuracion.porcentajeSeguroSocial,
            porcentajeImpuestoSobreRenta: porcentajeImpuestoSobreRenta !== undefined ? porcentajeImpuestoSobreRenta : configuracion.porcentajeImpuestoSobreRenta,
            activo: activo !== undefined ? activo : configuracion.activo
          });
          
          res.json({
            message: 'Configuración de nómina actualizada correctamente',
            configuracion
          });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
      },
      
      // Eliminar configuración de nómina
      deleteConfiguracionNomina: async (req, res) => {
        try {
          const { id } = req.params;
          
          // Buscar la configuración
          const configuracion = await ConfiguracionNomina.findByPk(id);
          
          if (!configuracion) {
            return res.status(404).json({ message: 'Configuración de nómina no encontrada' });
          }
          
          // No permitir eliminar la configuración activa
          if (configuracion.activo) {
            return res.status(400).json({ message: 'No se puede eliminar la configuración activa. Activa otra configuración primero.' });
          }
          
          // Eliminar la configuración
          await configuracion.destroy();
          
          res.json({ message: 'Configuración de nómina eliminada correctamente' });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
    }
};
    
module.exports = configuracionController;
    
