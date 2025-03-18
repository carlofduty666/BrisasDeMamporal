const db = require('../models');
const Liquidacion = db.Liquidacion;
const Personas = db.Personas;
const ConfiguracionBeneficio = db.ConfiguracionBeneficio;
const { Op } = require('sequelize');
const moment = require('moment');

const liquidacionController = {
  // Obtener todas las liquidaciones
  getAllLiquidaciones: async (req, res) => {
    try {
      const liquidaciones = await Liquidacion.findAll({
        include: [
          {
            model: Personas,
            as: 'persona',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      res.json(liquidaciones);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener liquidación por ID
  getLiquidacionById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const liquidacion = await Liquidacion.findByPk(id, {
        include: [
          {
            model: Personas,
            as: 'persona',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
          }
        ]
      });
      
      if (!liquidacion) {
        return res.status(404).json({ message: 'Liquidación no encontrada' });
      }
      
      res.json(liquidacion);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener liquidaciones por empleado
  getLiquidacionesByEmpleado: async (req, res) => {
    try {
      const { personaID } = req.params;
      
      const liquidaciones = await Liquidacion.findAll({
        where: { personaID },
        include: [
          {
            model: Personas,
            as: 'persona',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      res.json(liquidaciones);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Crear liquidación
  createLiquidacion: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const {
        personaID,
        fechaInicio,
        fechaFin,
        motivo,
        añosServicio,
        sueldoPromedio,
        prestacionesSociales,
        bonoFinDeAño,
        bonoVacacional,
        vacacionesPendientes,
        diasVacacionesPendientes,
        otrosBeneficios,
        observaciones
      } = req.body;
      
      // Verificar que el empleado existe
      const persona = await Personas.findByPk(personaID);
      
      if (!persona || !['profesor', 'administrativo', 'obrero'].includes(persona.tipo)) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Empleado no válido' });
      }
      
      // Calcular total de liquidación
      const totalLiquidacion = (
        parseFloat(prestacionesSociales || 0) +
        parseFloat(bonoFinDeAño || 0) +
        parseFloat(bonoVacacional || 0) +
        parseFloat(vacacionesPendientes || 0) +
        parseFloat(otrosBeneficios || 0)
      );
      
      // Crear la liquidación
      const nuevaLiquidacion = await Liquidacion.create({
        personaID,
        fechaInicio,
        fechaFin,
        motivo,
        añosServicio: añosServicio || 0,
        sueldoPromedio: sueldoPromedio || 0,
        prestacionesSociales: prestacionesSociales || 0,
        bonoFinDeAño: bonoFinDeAño || 0,
        bonoVacacional: bonoVacacional || 0,
        vacacionesPendientes: vacacionesPendientes || 0,
        diasVacacionesPendientes: diasVacacionesPendientes || 0,
        otrosBeneficios: otrosBeneficios || 0,
        totalLiquidacion,
        observaciones,
        estado: 'pendiente'
      }, { transaction });
      
      await transaction.commit();
      
      // Obtener la liquidación completa
      const liquidacionCompleta = await Liquidacion.findByPk(nuevaLiquidacion.id, {
        include: [
          {
            model: Personas,
            as: 'persona',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
          }
        ]
      });
      
      res.status(201).json({
        message: 'Liquidación creada correctamente',
        liquidacion: liquidacionCompleta
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Calcular liquidación automáticamente
  calcularLiquidacion: async (req, res) => {
    try {
      const {
        personaID,
        fechaInicio,
        fechaFin,
        motivo
      } = req.body;
      
      // Verificar que el empleado existe
      const persona = await Personas.findByPk(personaID);
      
      if (!persona || !['profesor', 'administrativo', 'obrero'].includes(persona.tipo)) {
        return res.status(400).json({ message: 'Empleado no válido' });
      }
      
      // Obtener configuraciones de beneficios
      const beneficios = await ConfiguracionBeneficio.findAll({
        where: { 
          activo: true,
          [Op.or]: [
            { aplicaA: 'todos' },
            { aplicaA: persona.tipo }
          ]
        }
      });
      
      // Calcular años de servicio
      const inicio = moment(fechaInicio);
      const fin = moment(fechaFin);
      const añosServicio = fin.diff(inicio, 'years', true);
      
      // Determinar sueldo promedio (ejemplo)
      let sueldoPromedio = 0;
      switch (persona.tipo) {
        case 'profesor':
          sueldoPromedio = 500; // Ejemplo
          break;
        case 'administrativo':
          sueldoPromedio = 400; // Ejemplo
          break;
        case 'obrero':
          sueldoPromedio = 350; // Ejemplo
          break;
      }
      
      // Calcular prestaciones sociales (ejemplo: 30 días por año de servicio)
      const prestacionesSociales = (sueldoPromedio / 30) * 30 * añosServicio;
      
      // Calcular bono fin de año proporcional
      const mesActual = moment().month() + 1;
      const bonoFinDeAño = (sueldoPromedio * 3) * (mesActual / 12);
      
      // Calcular vacaciones pendientes (ejemplo: 15 días por año)
      const diasVacacionesPendientes = Math.floor(15 * añosServicio);
      const vacacionesPendientes = (sueldoPromedio / 30) * diasVacacionesPendientes;
      
      // Calcular bono vacacional (ejemplo: 15 días adicionales)
      const bonoVacacional = (sueldoPromedio / 30) * 15;
      
      // Calcular total
      const totalLiquidacion = prestacionesSociales + bonoFinDeAño + vacacionesPendientes + bonoVacacional;
      
      res.json({
        personaID,
        fechaInicio,
        fechaFin,
        motivo,
        añosServicio,
        sueldoPromedio,
        prestacionesSociales,
        bonoFinDeAño,
        bonoVacacional,
        vacacionesPendientes,
        diasVacacionesPendientes,
        totalLiquidacion,
        mensaje: 'Esta es una pre-liquidación calculada automáticamente. Puede ajustar los valores antes de crear la liquidación.'
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Actualizar liquidación
  updateLiquidacion: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        fechaInicio,
        fechaFin,
        motivo,
        añosServicio,
        sueldoPromedio,
        prestacionesSociales,
        bonoFinDeAño,
        bonoVacacional,
        vacacionesPendientes,
        diasVacacionesPendientes,
        otrosBeneficios,
        observaciones,
        estado,
        fechaPago
      } = req.body;
      
      // Buscar la liquidación
      const liquidacion = await Liquidacion.findByPk(id);
      
      if (!liquidacion) {
        return res.status(404).json({ message: 'Liquidación no encontrada' });
      }
      
      // Calcular total de liquidación
      const totalLiquidacion = (
        parseFloat(prestacionesSociales || liquidacion.prestacionesSociales || 0) +
        parseFloat(bonoFinDeAño || liquidacion.bonoFinDeAño || 0) +
        parseFloat(bonoVacacional || liquidacion.bonoVacacional || 0) +
        parseFloat(vacacionesPendientes || liquidacion.vacacionesPendientes || 0) +
        parseFloat(otrosBeneficios || liquidacion.otrosBeneficios || 0)
      );
      
            // Actualizar la liquidación
      await liquidacion.update({
        fechaInicio: fechaInicio || liquidacion.fechaInicio,
        fechaFin: fechaFin || liquidacion.fechaFin,
        motivo: motivo || liquidacion.motivo,
        añosServicio: añosServicio !== undefined ? añosServicio : liquidacion.añosServicio,
        sueldoPromedio: sueldoPromedio !== undefined ? sueldoPromedio : liquidacion.sueldoPromedio,
        prestacionesSociales: prestacionesSociales !== undefined ? prestacionesSociales : liquidacion.prestacionesSociales,
        bonoFinDeAño: bonoFinDeAño !== undefined ? bonoFinDeAño : liquidacion.bonoFinDeAño,
        bonoVacacional: bonoVacacional !== undefined ? bonoVacacional : liquidacion.bonoVacacional,
        vacacionesPendientes: vacacionesPendientes !== undefined ? vacacionesPendientes : liquidacion.vacacionesPendientes,
        diasVacacionesPendientes: diasVacacionesPendientes !== undefined ? diasVacacionesPendientes : liquidacion.diasVacacionesPendientes,
        otrosBeneficios: otrosBeneficios !== undefined ? otrosBeneficios : liquidacion.otrosBeneficios,
        totalLiquidacion,
        observaciones: observaciones !== undefined ? observaciones : liquidacion.observaciones,
        estado: estado || liquidacion.estado,
        fechaPago: fechaPago || liquidacion.fechaPago
      });
      
      // Obtener la liquidación actualizada
      const liquidacionActualizada = await Liquidacion.findByPk(id, {
        include: [
          {
            model: Personas,
            as: 'persona',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
          }
        ]
      });
      
      res.json({
        message: 'Liquidación actualizada correctamente',
        liquidacion: liquidacionActualizada
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Eliminar liquidación
  deleteLiquidacion: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Buscar la liquidación
      const liquidacion = await Liquidacion.findByPk(id);
      
      if (!liquidacion) {
        return res.status(404).json({ message: 'Liquidación no encontrada' });
      }
      
      // Eliminar la liquidación
      await liquidacion.destroy();
      
      res.json({ message: 'Liquidación eliminada correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Cambiar estado de liquidación a pagado
  marcarLiquidacionComoPagada: async (req, res) => {
    try {
      const { id } = req.params;
      const { fechaPago } = req.body;
      
      // Buscar la liquidación
      const liquidacion = await Liquidacion.findByPk(id);
      
      if (!liquidacion) {
        return res.status(404).json({ message: 'Liquidación no encontrada' });
      }
      
      // Actualizar estado
      await liquidacion.update({
        estado: 'pagado',
        fechaPago: fechaPago || new Date()
      });
      
      res.json({
        message: 'Liquidación marcada como pagada',
        liquidacion
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = liquidacionController;

