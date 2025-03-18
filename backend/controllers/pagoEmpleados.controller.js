const db = require('../models');
const PagoEmpleados = db.PagoEmpleados;
const Personas = db.Personas;
const Nomina = db.Nomina;
const BonificacionNomina = db.BonificacionNomina;
const DeduccionNomina = db.DeduccionNomina;

const pagoEmpleadoController = {
  // Obtener todos los pagos de empleados
  getAllPagosEmpleados: async (req, res) => {
    try {
      const pagos = await PagoEmpleados.findAll({
        include: [
          {
            model: Personas,
            as: 'personas',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
          },
          {
            model: Nomina,
            as: 'nomina'
          },
          {
            model: BonificacionNomina,
            as: 'bonificaciones'
          },
          {
            model: DeduccionNomina,
            as: 'deducciones'
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      res.json(pagos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener pago por ID
  getPagoEmpleadoById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const pago = await PagoEmpleados.findByPk(id, {
        include: [
          {
            model: Personas,
            as: 'personas',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
          },
          {
            model: Nomina,
            as: 'nomina'
          },
          {
            model: BonificacionNomina,
            as: 'bonificaciones'
          },
          {
            model: DeduccionNomina,
            as: 'deducciones'
          }
        ]
      });
      
      if (!pago) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      
      res.json(pago);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener pagos por empleado
  getPagosByEmpleado: async (req, res) => {
    try {
      const { personaID } = req.params;
      
      const pagos = await PagoEmpleados.findAll({
        where: { personaID },
        include: [
          {
            model: Personas,
            as: 'personas',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
          },
          {
            model: Nomina,
            as: 'nomina'
          },
          {
            model: BonificacionNomina,
            as: 'bonificaciones'
          },
          {
            model: DeduccionNomina,
            as: 'deducciones'
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      res.json(pagos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener pagos por nómina
  getPagosByNomina: async (req, res) => {
    try {
      const { nominaID } = req.params;
      
      const pagos = await PagoEmpleados.findAll({
        where: { nominaID },
        include: [
          {
            model: Personas,
            as: 'personas',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
          },
          {
            model: BonificacionNomina,
            as: 'bonificaciones'
          },
          {
            model: DeduccionNomina,
            as: 'deducciones'
          }
        ],
        order: [['personaID', 'ASC']]
      });
      
      res.json(pagos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Crear pago de empleado
  createPagoEmpleado: async (req, res) => {
    try {
      const {
        nominaID,
        personaID,
        sueldoBase,
        cestaticket,
        bonoResponsabilidad,
        bonoPuntualidad,
        bonoFinDeAño,
        bonoVacacional,
        prestacionesSociales,
        vacaciones,
        diasVacaciones,
        montoBruto,
        montoNeto,
        totalDeducciones,
        totalAsignaciones,
        observaciones
      } = req.body;
      
      // Verificar que la nómina existe
      const nomina = await Nomina.findByPk(nominaID);
      if (!nomina) {
        return res.status(404).json({ message: 'Nómina no encontrada' });
      }
      
      // Verificar que el empleado existe
      const persona = await Personas.findByPk(personaID);
      if (!persona || !['profesor', 'administrativo', 'obrero'].includes(persona.tipo)) {
        return res.status(400).json({ message: 'Empleado no válido' });
      }
      
      // Verificar si ya existe un pago para este empleado en esta nómina
      const pagoExistente = await PagoEmpleados.findOne({
        where: { nominaID, personaID }
      });
      
      if (pagoExistente) {
        return res.status(400).json({ message: 'Ya existe un pago para este empleado en esta nómina' });
      }
      
      // Crear el pago
      const nuevoPago = await PagoEmpleados.create({
        nominaID,
        personaID,
        sueldoBase: sueldoBase || 0,
        cestaticket: cestaticket || 0,
        bonoResponsabilidad: bonoResponsabilidad || 0,
        bonoPuntualidad: bonoPuntualidad || 0,
        bonoFinDeAño: bonoFinDeAño || 0,
        bonoVacacional: bonoVacacional || 0,
        prestacionesSociales: prestacionesSociales || 0,
        vacaciones: vacaciones || 0,
        diasVacaciones: diasVacaciones || 0,
        montoBruto: montoBruto || sueldoBase || 0,
        montoNeto: montoNeto || 0,
        totalDeducciones: totalDeducciones || 0,
        totalAsignaciones: totalAsignaciones || 0,
        observaciones
      });
      
      // Obtener el pago completo con sus relaciones
      const pagoCompleto = await PagoEmpleados.findByPk(nuevoPago.id, {
        include: [
          {
            model: Personas,
            as: 'personas',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
          },
          {
            model: Nomina,
            as: 'nomina'
          }
        ]
      });
      
      res.status(201).json({
        message: 'Pago de empleado creado correctamente',
        pago: pagoCompleto
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Actualizar pago de empleado
  updatePagoEmpleado: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        sueldoBase,
        cestaticket,
        bonoResponsabilidad,
        bonoPuntualidad,
        bonoFinDeAño,
        bonoVacacional,
        prestacionesSociales,
        vacaciones,
        diasVacaciones,
        montoBruto,
        montoNeto,
        totalDeducciones,
        totalAsignaciones,
        observaciones
      } = req.body;
      
      // Buscar el pago
      const pago = await PagoEmpleados.findByPk(id);
      
      if (!pago) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      
      // Actualizar el pago
      await pago.update({
        sueldoBase: sueldoBase !== undefined ? sueldoBase : pago.sueldoBase,
        cestaticket: cestaticket !== undefined ? cestaticket : pago.cestaticket,
        bonoResponsabilidad: bonoResponsabilidad !== undefined ? bonoResponsabilidad : pago.bonoResponsabilidad,
        bonoPuntualidad: bonoPuntualidad !== undefined ? bonoPuntualidad : pago.bonoPuntualidad,
        bonoFinDeAño: bonoFinDeAño !== undefined ? bonoFinDeAño : pago.bonoFinDeAño,
        bonoVacacional: bonoVacacional !== undefined ? bonoVacacional : pago.bonoVacacional,
        prestacionesSociales: prestacionesSociales !== undefined ? prestacionesSociales : pago.prestacionesSociales,
        vacaciones: vacaciones !== undefined ? vacaciones : pago.vacaciones,
        diasVacaciones: diasVacaciones !== undefined ? diasVacaciones : pago.diasVacaciones,
        montoBruto: montoBruto !== undefined ? montoBruto : pago.montoBruto,
        montoNeto: montoNeto !== undefined ? montoNeto : pago.montoNeto,
        totalDeducciones: totalDeducciones !== undefined ? totalDeducciones : pago.totalDeducciones,
        totalAsignaciones: totalAsignaciones !== undefined ? totalAsignaciones : pago.totalAsignaciones,
        observaciones: observaciones !== undefined ? observaciones : pago.observaciones
      });
      
      // Obtener el pago actualizado con sus relaciones
      const pagoActualizado = await PagoEmpleados.findByPk(id, {
        include: [
          {
            model: Personas,
            as: 'personas',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
          },
          {
            model: Nomina,
            as: 'nomina'
          }
        ]
      });
      
      res.json({
        message: 'Pago de empleado actualizado correctamente',
        pago: pagoActualizado
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Eliminar pago de empleado
  deletePagoEmpleado: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Buscar el pago
      const pago = await PagoEmpleados.findByPk(id);
      
      if (!pago) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      
      // Eliminar el pago
      await pago.destroy();
      
      res.json({ message: 'Pago de empleado eliminado correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = pagoEmpleadoController;
