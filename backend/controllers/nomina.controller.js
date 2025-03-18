const db = require('../models');
const Nomina = db.Nomina;
const PagoEmpleados = db.PagoEmpleados;
const DeduccionNomina = db.DeduccionNomina;
const BonificacionNomina = db.BonificacionNomina;
const Personas = db.Personas;
const ConfiguracionNomina = db.ConfiguracionNomina;
const { Op } = require('sequelize');
const moment = require('moment');

const nominaController = {
  // Obtener todas las nóminas
  getAllNominas: async (req, res) => {
    try {
      const nominas = await Nomina.findAll({
        include: [
          {
            model: PagoEmpleados,
            as: 'pagos',
            include: [
              {
                model: Personas,
                as: 'personas',
                attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
              }
            ]
          },
          {
            model: DeduccionNomina,
            as: 'deducciones'
          },
          {
            model: BonificacionNomina,
            as: 'bonificaciones'
          }
        ],
        order: [['fechaPago', 'DESC']]
      });
      
      res.json(nominas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener nómina por ID
  getNominaById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const nomina = await Nomina.findByPk(id, {
        include: [
          {
            model: PagoEmpleados,
            as: 'pagos',
            include: [
              {
                model: Personas,
                as: 'personas',
                attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
              }
            ]
          },
          {
            model: DeduccionNomina,
            as: 'deducciones'
          },
          {
            model: BonificacionNomina,
            as: 'bonificaciones'
          }
        ]
      });
      
      if (!nomina) {
        return res.status(404).json({ message: 'Nómina no encontrada' });
      }
      
      res.json(nomina);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Crear una nueva nómina
  createNomina: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { periodoPago, fechaPago, descripcion, empleados, deducciones, bonificaciones } = req.body;
      
      // Crear la nómina
      const nuevaNomina = await Nomina.create({
        periodoPago,
        fechaPago,
        descripcion
      }, { transaction });
      
      // Procesar empleados
      if (empleados && empleados.length > 0) {
        for (const empleado of empleados) {
          // Verificar que el empleado existe
          const persona = await Personas.findByPk(empleado.personaID);
          if (!persona || !['profesor', 'administrativo', 'obrero'].includes(persona.tipo)) {
            await transaction.rollback();
            return res.status(400).json({ message: `Empleado con ID ${empleado.personaID} no es válido` });
          }
          
          // Crear pago para el empleado
          await PagoEmpleados.create({
            nominaID: nuevaNomina.id,
            personaID: empleado.personaID,
            montoBruto: empleado.montoBruto,
            montoNeto: empleado.montoNeto,
            totalDeducciones: empleado.totalDeducciones,
            totalAsignaciones: empleado.totalAsignaciones
          }, { transaction });
        }
      }
      
      // Procesar deducciones generales
      if (deducciones && deducciones.length > 0) {
        for (const deduccion of deducciones) {
          await DeduccionNomina.create({
            nominaID: nuevaNomina.id,
            nombre: deduccion.nombre,
            monto: deduccion.monto
          }, { transaction });
        }
      }
      
      // Procesar bonificaciones generales
      if (bonificaciones && bonificaciones.length > 0) {
        for (const bonificacion of bonificaciones) {
          await BonificacionNomina.create({
            nominaID: nuevaNomina.id,
            nombre: bonificacion.nombre,
            monto: bonificacion.monto
          }, { transaction });
        }
      }
      
      await transaction.commit();
      
      // Obtener la nómina completa con sus relaciones
      const nominaCompleta = await Nomina.findByPk(nuevaNomina.id, {
        include: [
          {
            model: PagoEmpleados,
            as: 'pagos',
            include: [
              {
                model: Personas,
                as: 'personas',
                attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
              }
            ]
          },
          {
            model: DeduccionNomina,
            as: 'deducciones'
          },
          {
            model: BonificacionNomina,
            as: 'bonificaciones'
          }
        ]
      });
      
      res.status(201).json({
        message: 'Nómina creada correctamente',
        nomina: nominaCompleta
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Generar nómina automática
  generarNominaAutomatica: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { fechaPago, tiposEmpleados = ['profesor', 'administrativo', 'obrero'] } = req.body;
      
      // Obtener configuración de nómina
      const configuracion = await ConfiguracionNomina.findOne({
        where: { activo: true }
      });
      
      if (!configuracion) {
        await transaction.rollback();
        return res.status(404).json({ message: 'No hay configuración de nómina activa' });
      }
      
      // Obtener configuraciones de beneficios
      const beneficios = await ConfiguracionBeneficio.findAll({
        where: { activo: true }
      });
      
      // Determinar el periodo de pago
      const fechaPagoMoment = moment(fechaPago);
      let periodoPago;
      
      if (fechaPagoMoment.date() === configuracion.fechaPrimerPago) {
        periodoPago = `Primera Quincena ${fechaPagoMoment.format('MMMM YYYY')}`;
      } else if (fechaPagoMoment.date() === configuracion.fechaSegundoPago || 
                fechaPagoMoment.date() === fechaPagoMoment.daysInMonth()) {
        periodoPago = `Segunda Quincena ${fechaPagoMoment.format('MMMM YYYY')}`;
      } else {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `La fecha de pago debe ser el ${configuracion.fechaPrimerPago} o ${configuracion.fechaSegundoPago} del mes` 
        });
      }
      
      // Verificar si ya existe una nómina para este periodo
      const nominaExistente = await Nomina.findOne({
        where: { periodoPago }
      });
      
      if (nominaExistente) {
        await transaction.rollback();
        return res.status(400).json({ message: `Ya existe una nómina para el periodo ${periodoPago}` });
      }
      
      // Crear la nómina
      const nuevaNomina = await Nomina.create({
        periodoPago,
        fechaPago,
        descripcion: `Nómina generada automáticamente para ${periodoPago}`
      }, { transaction });
      
      // Obtener todos los empleados de los tipos especificados
      const empleados = await Personas.findAll({
        where: {
          tipo: {
            [Op.in]: tiposEmpleados
          }
        }
      });
      
      // Procesar cada empleado
      for (const empleado of empleados) {
        // Determinar sueldo base según tipo de empleado
        let sueldoBase = 0;
        
        switch (empleado.tipo) {
          case 'profesor':
            sueldoBase = configuracion.sueldoBaseProfesor || 500;
            break;
          case 'administrativo':
            sueldoBase = configuracion.sueldoBaseAdministrativo || 400;
            break;
          case 'obrero':
            sueldoBase = configuracion.sueldoBaseObrero || 350;
            break;
        }
        
        // Calcular beneficios
        let cestaticket = 0;
        let bonoResponsabilidad = 0;
        let bonoPuntualidad = 0;
        let bonoFinDeAño = 0;
        let bonoVacacional = 0;
        let prestacionesSociales = 0;
        let vacaciones = 0;
        let diasVacaciones = 0;
        
        // Aplicar beneficios según configuración
        for (const beneficio of beneficios) {
          // Verificar si el beneficio aplica a este tipo de empleado
          if (beneficio.aplicaA === 'todos' || beneficio.aplicaA === empleado.tipo) {
            const valorBeneficio = beneficio.valorBase + (sueldoBase * (beneficio.porcentajeSueldo / 100));
            
            switch (beneficio.tipo) {
              case 'cestaticket':
                cestaticket = valorBeneficio;
                break;
              case 'responsabilidad':
                bonoResponsabilidad = valorBeneficio;
                break;
              case 'puntualidad':
                bonoPuntualidad = valorBeneficio;
                break;
              case 'finDeAño':
                // Solo aplicar en diciembre o según configuración
                if (fechaPagoMoment.month() === 11) {
                  bonoFinDeAño = valorBeneficio;
                }
                break;
              case 'vacacional':
                // Verificar si corresponde bono vacacional (ejemplo: por fecha de ingreso)
                // Aquí se necesitaría lógica adicional para determinar si aplica
                bonoVacacional = valorBeneficio;
                break;
              case 'prestaciones':
                prestacionesSociales = valorBeneficio;
                break;
            }
          }
        }
        
        // Calcular deducciones
        const deduccionSeguroSocial = sueldoBase * (configuracion.porcentajeSeguroSocial / 100);
        const deduccionImpuesto = sueldoBase * (configuracion.porcentajeImpuestoSobreRenta / 100);
        const totalDeducciones = deduccionSeguroSocial + deduccionImpuesto;
        
        // Calcular totales
        const totalAsignaciones = cestaticket + bonoResponsabilidad + bonoPuntualidad + 
                                 bonoFinDeAño + bonoVacacional + prestacionesSociales + vacaciones;
        
        const montoBruto = sueldoBase;
        const montoNeto = montoBruto - totalDeducciones + totalAsignaciones;
        
        // Crear pago para el empleado
        await PagoEmpleados.create({
          nominaID: nuevaNomina.id,
          personaID: empleado.id,
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
          totalAsignaciones
        }, { transaction });
        
        // Crear bonificaciones individuales para el empleado
        if (cestaticket > 0) {
          await BonificacionNomina.create({
            nominaID: nuevaNomina.id,
            personaID: empleado.id,
            nombre: 'Cestaticket',
            tipo: 'cestaticket',
            monto: cestaticket
          }, { transaction });
        }
        
        if (bonoResponsabilidad > 0) {
          await BonificacionNomina.create({
            nominaID: nuevaNomina.id,
            personaID: empleado.id,
            nombre: 'Bono de Responsabilidad',
            tipo: 'responsabilidad',
            monto: bonoResponsabilidad
          }, { transaction });
        }
        
        if (bonoPuntualidad > 0) {
          await BonificacionNomina.create({
            nominaID: nuevaNomina.id,
            personaID: empleado.id,
            nombre: 'Bono de Puntualidad',
            tipo: 'puntualidad',
            monto: bonoPuntualidad
          }, { transaction });
        }
        
        // Crear deducciones individuales
        await DeduccionNomina.create({
          nominaID: nuevaNomina.id,
          personaID: empleado.id,
          nombre: 'Seguro Social',
          monto: deduccionSeguroSocial
        }, { transaction });
        
        await DeduccionNomina.create({
          nominaID: nuevaNomina.id,
          personaID: empleado.id,
          nombre: 'Impuesto Sobre la Renta',
          monto: deduccionImpuesto
        }, { transaction });
      }
      
      await transaction.commit();
      
      // Obtener la nómina completa con sus relaciones
      const nominaCompleta = await Nomina.findByPk(nuevaNomina.id, {
        include: [
          {
            model: PagoEmpleados,
            as: 'pagos',
            include: [
              {
                model: Personas,
                as: 'personas',
                attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
              }
            ]
          },
          {
            model: DeduccionNomina,
            as: 'deducciones'
          },
          {
            model: BonificacionNomina,
            as: 'bonificaciones'
          }
        ]
      });
      
      res.status(201).json({
        message: 'Nómina generada automáticamente',
        nomina: nominaCompleta
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Actualizar nómina
  updateNomina: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { periodoPago, fechaPago, descripcion } = req.body;
      
      // Verificar que la nómina existe
      const nomina = await Nomina.findByPk(id);
      
      if (!nomina) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Nómina no encontrada' });
      }
      
      // Actualizar datos básicos
      await nomina.update({
        periodoPago: periodoPago || nomina.periodoPago,
        fechaPago: fechaPago || nomina.fechaPago,
        descripcion: descripcion || nomina.descripcion
      }, { transaction });
      
      await transaction.commit();

      // Obtener la nómina actualizada
      const nominaActualizada = await Nomina.findByPk(id, {
        include: [
          {
            model: PagoEmpleados,
            as: 'pagos',
            include: [
              {
                model: Personas,
                as: 'personas',
                attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
              }
            ]
          },
          {
            model: DeduccionNomina,
            as: 'deducciones'
          },
          {
            model: BonificacionNomina,
            as: 'bonificaciones'
          }
        ]
      });
      
      res.json({
        message: 'Nómina actualizada correctamente',
        nomina: nominaActualizada
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Eliminar nómina
  deleteNomina: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { id } = req.params;
      
      // Verificar que la nómina existe
      const nomina = await Nomina.findByPk(id);
      
      if (!nomina) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Nómina no encontrada' });
      }
      
      // Eliminar pagos asociados
      await PagoEmpleados.destroy({
        where: { nominaID: id },
        transaction
      });
      
      // Eliminar deducciones asociadas
      await DeduccionNomina.destroy({
        where: { nominaID: id },
        transaction
      });
      
      // Eliminar bonificaciones asociadas
      await BonificacionNomina.destroy({
        where: { nominaID: id },
        transaction
      });
      
      // Eliminar la nómina
      await nomina.destroy({ transaction });
      
      await transaction.commit();
      
      res.json({ message: 'Nómina eliminada correctamente' });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Agregar pago a nómina
  agregarPagoEmpleado: async (req, res) => {
    try {
      const { nominaID } = req.params;
      const { 
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
        where: {
          nominaID,
          personaID
        }
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
      
      res.status(201).json({
        message: 'Pago agregado correctamente',
        pago: nuevoPago
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Actualizar pago de empleado
  updatePagoEmpleado: async (req, res) => {
    try {
      const { nominaID, personaID } = req.params;
      const { montoBruto, montoNeto, totalDeducciones, totalAsignaciones } = req.body;
      
      // Buscar el pago
      const pago = await PagoEmpleados.findOne({
        where: {
          nominaID,
          personaID
        }
      });
      
      if (!pago) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      
      // Actualizar el pago
      await pago.update({
        montoBruto: montoBruto || pago.montoBruto,
        montoNeto: montoNeto || pago.montoNeto,
        totalDeducciones: totalDeducciones || pago.totalDeducciones,
        totalAsignaciones: totalAsignaciones || pago.totalAsignaciones
      });
      
      res.json({
        message: 'Pago actualizado correctamente',
        pago
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Eliminar pago de empleado
  deletePagoEmpleado: async (req, res) => {
    try {
      const { nominaID, personaID } = req.params;
      
      // Buscar el pago
      const pago = await PagoEmpleados.findOne({
        where: {
          nominaID,
          personaID
        }
      });
      
      if (!pago) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      
      // Eliminar el pago
      await pago.destroy();
      
      res.json({ message: 'Pago eliminado correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Agregar deducción a nómina
  agregarDeduccion: async (req, res) => {
    try {
      const { nominaID } = req.params;
      const { nombre, monto } = req.body;
      
      // Verificar que la nómina existe
      const nomina = await Nomina.findByPk(nominaID);
      
      if (!nomina) {
        return res.status(404).json({ message: 'Nómina no encontrada' });
      }
      
      // Crear la deducción
      const nuevaDeduccion = await DeduccionNomina.create({
        nominaID,
        nombre,
        monto
      });
      
      res.status(201).json({
        message: 'Deducción agregada correctamente',
        deduccion: nuevaDeduccion
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Actualizar deducción
  updateDeduccion: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, monto } = req.body;
      
      // Buscar la deducción
      const deduccion = await DeduccionNomina.findByPk(id);
      
      if (!deduccion) {
        return res.status(404).json({ message: 'Deducción no encontrada' });
      }
      
      // Actualizar la deducción
      await deduccion.update({
        nombre: nombre || deduccion.nombre,
        monto: monto || deduccion.monto
      });
      
      res.json({
        message: 'Deducción actualizada correctamente',
        deduccion
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Eliminar deducción
  deleteDeduccion: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Buscar la deducción
      const deduccion = await DeduccionNomina.findByPk(id);
      
      if (!deduccion) {
        return res.status(404).json({ message: 'Deducción no encontrada' });
      }
      
      // Eliminar la deducción
      await deduccion.destroy();
      
      res.json({ message: 'Deducción eliminada correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Agregar bonificación a nómina
  agregarBonificacion: async (req, res) => {
    try {
      const { nominaID } = req.params;
      const { nombre, monto } = req.body;
      
      // Verificar que la nómina existe
      const nomina = await Nomina.findByPk(nominaID);
      
      if (!nomina) {
        return res.status(404).json({ message: 'Nómina no encontrada' });
      }
      
      // Crear la bonificación
      const nuevaBonificacion = await BonificacionNomina.create({
        nominaID,
        nombre,
        monto
      });
      
      res.status(201).json({
        message: 'Bonificación agregada correctamente',
        bonificacion: nuevaBonificacion
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Actualizar bonificación
  updateBonificacion: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, monto } = req.body;
      
      // Buscar la bonificación
      const bonificacion = await BonificacionNomina.findByPk(id);
      
      if (!bonificacion) {
        return res.status(404).json({ message: 'Bonificación no encontrada' });
      }
      
      // Actualizar la bonificación
      await bonificacion.update({
        nombre: nombre || bonificacion.nombre,
        monto: monto || bonificacion.monto
      });
      
      res.json({
        message: 'Bonificación actualizada correctamente',
        bonificacion
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Eliminar bonificación
  deleteBonificacion: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Buscar la bonificación
      const bonificacion = await BonificacionNomina.findByPk(id);
      
      if (!bonificacion) {
        return res.status(404).json({ message: 'Bonificación no encontrada' });
      }
      
      // Eliminar la bonificación
      await bonificacion.destroy();
      
      res.json({ message: 'Bonificación eliminada correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = nominaController;