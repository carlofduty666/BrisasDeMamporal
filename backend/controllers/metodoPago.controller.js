const db = require('../models');
const MetodoPagos = db.MetodoPagos;

const metodoPagoController = {
  // Obtener todos los métodos de pago
  getAllMetodosPago: async (req, res) => {
    try {
      const metodosPago = await MetodoPagos.findAll({
        order: [['nombre', 'ASC']]
      });
      
      res.json(metodosPago);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener métodos de pago activos
  getMetodosPagoActivos: async (req, res) => {
    try {
      const metodosPago = await MetodoPagos.findAll({
        where: { activo: true },
        order: [['nombre', 'ASC']]
      });
      
      res.json(metodosPago);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener método de pago por ID
  getMetodoPagoById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const metodoPago = await MetodoPagos.findByPk(id);
      
      if (!metodoPago) {
        return res.status(404).json({ message: 'Método de pago no encontrado' });
      }
      
      res.json(metodoPago);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Crear método de pago
  createMetodoPago: async (req, res) => {
    try {
      const { nombre, activo } = req.body;
      
      // Validar datos
      if (!nombre) {
        return res.status(400).json({ message: 'El nombre es requerido' });
      }
      
      // Verificar si ya existe un método de pago con el mismo nombre
      const metodoPagoExistente = await MetodoPagos.findOne({
        where: { nombre }
      });
      
      if (metodoPagoExistente) {
        return res.status(400).json({ message: 'Ya existe un método de pago con este nombre' });
      }
      
      // Crear método de pago
      const nuevoMetodoPago = await MetodoPagos.create({
        nombre,
        activo: activo !== undefined ? activo : true
      });
      
      res.status(201).json({
        message: 'Método de pago creado correctamente',
        metodoPago: nuevoMetodoPago
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Actualizar método de pago
  updateMetodoPago: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, activo } = req.body;
      
      // Buscar el método de pago
      const metodoPago = await MetodoPagos.findByPk(id);
      
      if (!metodoPago) {
        return res.status(404).json({ message: 'Método de pago no encontrado' });
      }
      
      // Verificar si ya existe otro método de pago con el mismo nombre
      if (nombre && nombre !== metodoPago.nombre) {
        const metodoPagoExistente = await MetodoPagos.findOne({
          where: { nombre }
        });
        
        if (metodoPagoExistente) {
          return res.status(400).json({ message: 'Ya existe otro método de pago con este nombre' });
        }
      }
      
      // Actualizar método de pago
      await metodoPago.update({
        nombre: nombre || metodoPago.nombre,
        activo: activo !== undefined ? activo : metodoPago.activo
      });
      
      res.json({
        message: 'Método de pago actualizado correctamente',
        metodoPago
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Eliminar método de pago
  deleteMetodoPago: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Buscar el método de pago
      const metodoPago = await MetodoPagos.findByPk(id);
      
      if (!metodoPago) {
        return res.status(404).json({ message: 'Método de pago no encontrado' });
      }
      
      // Verificar si el método de pago está siendo utilizado en pagos
      const pagosAsociados = await db.PagoEstudiantes.count({
        where: { metodoPagoID: id }
      });
      
      if (pagosAsociados > 0) {
        // En lugar de eliminar, desactivar
        await metodoPago.update({ activo: false });
        
        return res.json({
          message: 'El método de pago está siendo utilizado en pagos. Se ha desactivado en lugar de eliminarse.',
          metodoPago
        });
      }
      
      // Eliminar el método de pago
      await metodoPago.destroy();
      
      res.json({ message: 'Método de pago eliminado correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = metodoPagoController;
