const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { 
  PagoEstudiantes, 
  Personas, 
  MetodoPagos, 
  Aranceles, 
  Inscripciones, 
  AnnoEscolar,
  Grados,
  Secciones
} = require('../models');
const db = require('../models');

const pagoEstudiantesController = {
  // Obtener todos los pagos
  getAllPagos: async (req, res) => {
    try {
      const pagos = await PagoEstudiantes.findAll({
        include: [
          {
            model: Personas,
            as: 'estudiantes',
            attributes: ['id', 'cedula', 'nombre', 'apellido']
          },
          {
            model: Personas,
            as: 'representantes',
            attributes: ['id', 'cedula', 'nombre', 'apellido', 'telefono', 'email']
          },
          {
            model: MetodoPagos,
            as: 'metodoPagos',
            attributes: ['id', 'nombre']
          },
          {
            model: Aranceles,
            as: 'aranceles',
            attributes: ['id', 'nombre', 'monto', 'descripcion']
          },
          {
            model: AnnoEscolar,
            as: 'annoEscolar',
            attributes: ['id', 'periodo']
          },
          {
            model: Inscripciones,
            as: 'inscripciones',
            attributes: ['id', 'gradoID', 'seccionID'],
            include: [
              { model: Grados, as: 'grado', attributes: ['id','nombre_grado'] },
              { model: Secciones, as: 'Secciones', attributes: ['id','nombre_seccion'] }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      res.status(200).json(pagos);
    } catch (err) {
      console.error('Error al obtener pagos:', err);
      res.status(500).json({ 
        message: 'Error al obtener los pagos',
        error: err.message 
      });
    }
  },
  
  // Obtener un pago por ID
  getPagoById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const pago = await PagoEstudiantes.findByPk(id, {
        include: [
          {
            model: Personas,
            as: 'estudiantes',
            attributes: ['id', 'cedula', 'nombre', 'apellido']
          },
          {
            model: Personas,
            as: 'representantes',
            attributes: ['id', 'cedula', 'nombre', 'apellido']
          },
          {
            model: MetodoPagos,
            as: 'metodoPagos',
            attributes: ['id', 'nombre']
          },
          {
            model: Aranceles,
            as: 'aranceles',
            attributes: ['id', 'nombre', 'monto', 'descripcion']
          },
          {
            model: AnnoEscolar,
            as: 'annoEscolar',
            attributes: ['id', 'periodo']
          }
        ]
      });
      
      if (!pago) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      
      res.status(200).json(pago);
    } catch (err) {
      console.error('Error al obtener pago:', err);
      res.status(500).json({ 
        message: 'Error al obtener el pago',
        error: err.message 
      });
    }
  },
  
  // Crear un nuevo pago
  createPago: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      console.log("Iniciando creación de pago");
      console.log("Datos recibidos:", req.body);
      console.log("Archivos recibidos:", req.files ? Object.keys(req.files) : "No hay archivos");
      
      const { 
        estudianteID, 
        representanteID, 
        metodoPagoID, 
        arancelID, 
        inscripcionID,
        annoEscolarID,
        monto,
        montoMora,
        descuento,
        montoTotal,
        mesPago,
        fechaPago,
        referencia,
        observaciones
      } = req.body;
      
      // Validaciones
      if (!estudianteID || !representanteID || !metodoPagoID || !arancelID || !monto) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
      }
      
      // Verificar que el estudiante existe
      const estudiante = await Personas.findOne({ 
        where: { id: estudianteID, tipo: 'estudiante' },
        transaction
      });
      
      if (!estudiante) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Estudiante no encontrado' });
      }
      
      // Verificar que el representante existe
      const representante = await Personas.findOne({ 
        where: { id: representanteID, tipo: 'representante' },
        transaction
      });
      
      if (!representante) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Representante no encontrado' });
      }
      
      // Verificar que el método de pago existe y está activo
      const metodoPago = await MetodoPagos.findOne({ 
        where: { id: metodoPagoID, activo: true },
        transaction
      });
      
      if (!metodoPago) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Método de pago no encontrado o inactivo' });
      }
      
      // Verificar que el arancel existe y está activo
      const arancel = await Aranceles.findOne({ 
        where: { id: arancelID, activo: true },
        transaction
      });
      
      if (!arancel) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Arancel no encontrado o inactivo' });
      }
      
      // Verificar año escolar
      const annoEscolarActivo = await AnnoEscolar.findOne({ 
        where: { id: annoEscolarID, activo: true },
        transaction
      });
      
      if (!annoEscolarActivo) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Año escolar no encontrado o inactivo' });
      }
      
      // Variables para el comprobante
      let urlComprobante = null;
      let nombreArchivo = null;
      let tipoArchivo = null;
      let tamanoArchivo = null;
      
      // Procesar archivo de comprobante si existe
      if (req.files && req.files.comprobante) {
        const comprobante = req.files.comprobante;
        const uploadDir = path.join(__dirname, '../uploads/comprobantes');
        
        // Crear directorio si no existe
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Generar nombre único para el archivo
        const uniqueFilename = `${Date.now()}-${uuidv4()}${path.extname(comprobante.name)}`;
        const filePath = path.join(uploadDir, uniqueFilename);
        
        // Mover el archivo
        await comprobante.mv(filePath);
        
        // Guardar información del archivo
        urlComprobante = `/uploads/comprobantes/${uniqueFilename}`;
        nombreArchivo = comprobante.name;
        tipoArchivo = comprobante.mimetype;
        tamanoArchivo = comprobante.size;
      }
      
      // Calcular monto total si no se proporciona
      const montoFinal = parseFloat(monto) || 0;
      const montoMoraFinal = parseFloat(montoMora) || 0;
      const descuentoFinal = parseFloat(descuento) || 0;
      const montoTotalFinal = montoTotal ? parseFloat(montoTotal) : (montoFinal + montoMoraFinal - descuentoFinal);
      
      // Crear el pago
      const nuevoPago = await PagoEstudiantes.create({
        estudianteID,
        representanteID,
        metodoPagoID,
        arancelID,
        inscripcionID: inscripcionID || null,
        annoEscolarID,
        monto: montoFinal,
        montoMora: montoMoraFinal,
        descuento: descuentoFinal,
        montoTotal: montoTotalFinal,
        mesPago: mesPago || null,
        fechaPago: fechaPago || new Date(),
        referencia: referencia || null,
        estado: metodoPago.nombre === 'Efectivo' ? 'pagado' : 'pendiente',
        urlComprobante,
        nombreArchivo,
        tipoArchivo,
        tamanoArchivo,
        observaciones: observaciones || null
      }, { transaction });
      
      // Si el pago es para una inscripción, actualizar el estado de la inscripción
      if (inscripcionID) {
        const inscripcion = await Inscripciones.findByPk(inscripcionID, { transaction });
        
        if (inscripcion) {
          // Si el arancel es de tipo inscripción, marcar como pagado
          if (arancel.nombre === 'inscripcion') {
            await inscripcion.update({ 
              pagoInscripcionCompletado: true 
            }, { transaction });
          }
        }
      }
      
      await transaction.commit();
      res.status(201).json({ 
        message: 'Pago registrado correctamente',
        pago: nuevoPago
      });
    } catch (err) {
      await transaction.rollback();
      console.error('Error al crear pago:', err);
      res.status(500).json({ 
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  },
  
  // Actualizar estado de un pago
  updateEstadoPago: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      const { estado } = req.body;
      
      if (!['pendiente', 'pagado', 'anulado'].includes(estado)) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Estado no válido' });
      }
      
      const pago = await PagoEstudiantes.findByPk(id, { transaction });
      
      if (!pago) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      
      await pago.update({ estado }, { transaction });
      
      // Si el pago es para una inscripción y el estado cambia a pagado o anulado
      if (pago.inscripcionID) {
        const inscripcion = await Inscripciones.findByPk(pago.inscripcionID, { transaction });
        
        if (inscripcion) {
          const arancel = await Aranceles.findByPk(pago.arancelID, { transaction });
          
          if (arancel && arancel.nombre === 'inscripcion') {
            // Si el pago se marca como pagado, actualizar la inscripción
            if (estado === 'pagado') {
              await inscripcion.update({ 
                pagoInscripcionCompletado: true 
              }, { transaction });
            } 
            // Si el pago se anula, marcar la inscripción como no pagada
            else if (estado === 'anulado') {
              await inscripcion.update({ 
                pagoInscripcionCompletado: false 
              }, { transaction });
            }
          }
        }
      }
      
      await transaction.commit();
      res.status(200).json({ 
        message: 'Estado del pago actualizado correctamente',
        pago
      });
    } catch (err) {
      await transaction.rollback();
      console.error('Error al actualizar estado del pago:', err);
      res.status(500).json({ 
        message: 'Error al actualizar el estado del pago',
        error: err.message 
      });
    }
  },
  
  // Eliminar un pago
  deletePago: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params;
      
      const pago = await PagoEstudiantes.findByPk(id, { transaction });
      
      if (!pago) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      
      // Si el pago tiene un comprobante, eliminar el archivo
      if (pago.urlComprobante) {
        const filePath = path.join(__dirname, '..', pago.urlComprobante);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      // Si el pago es para una inscripción, actualizar el estado de la inscripción
      if (pago.inscripcionID) {
        const inscripcion = await Inscripciones.findByPk(pago.inscripcionID, { transaction });
        
        if (inscripcion) {
          const arancel = await Aranceles.findByPk(pago.arancelID, { transaction });
          
          if (arancel && arancel.nombre === 'inscripcion' && pago.estado === 'pagado') {
            await inscripcion.update({ 
              pagoInscripcionCompletado: false 
            }, { transaction });
          }
        }
      }
      
      await pago.destroy({ transaction });
      
      await transaction.commit();
      res.status(200).json({ message: 'Pago eliminado correctamente' });
    } catch (err) {
      await transaction.rollback();
      console.error('Error al eliminar pago:', err);
      res.status(500).json({ 
        message: 'Error al eliminar el pago',
        error: err.message 
      });
    }
  },
  
  // Obtener pagos por estudiante
  getPagosByEstudiante: async (req, res) => {
    try {
      const { estudianteID } = req.params;
      
      const pagos = await PagoEstudiantes.findAll({
        where: { estudianteID },
        include: [
          {
            model: Personas,
            as: 'estudiantes',
            attributes: ['id', 'cedula', 'nombre', 'apellido']
          },
          {
            model: Personas,
            as: 'representantes',
            attributes: ['id', 'cedula', 'nombre', 'apellido']
          },
          {
            model: MetodoPagos,
            as: 'metodoPagos',
            attributes: ['id', 'nombre']
          },
          {
            model: Aranceles,
            as: 'aranceles',
            attributes: ['id', 'nombre', 'monto', 'descripcion']
          },
          {
            model: AnnoEscolar,
            as: 'annoEscolar',
            attributes: ['id', 'periodo']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      res.status(200).json(pagos);
    } catch (err) {
      console.error('Error al obtener pagos del estudiante:', err);
      res.status(500).json({ 
        message: 'Error al obtener los pagos del estudiante',
        error: err.message 
      });
    }
  },
  
  // Obtener pagos por representante
  getPagosByRepresentante: async (req, res) => {
    try {
      const { representanteID } = req.params;
      
      const pagos = await PagoEstudiantes.findAll({
        where: { representanteID },
        include: [
          {
            model: Personas,
            as: 'estudiantes',
            attributes: ['id', 'cedula', 'nombre', 'apellido']
          },
          {
            model: Personas,
            as: 'representantes',
            attributes: ['id', 'cedula', 'nombre', 'apellido']
          },
          {
            model: MetodoPagos,
            as: 'metodoPagos',
            attributes: ['id', 'nombre']
          },
          {
            model: Aranceles,
            as: 'aranceles',
            attributes: ['id', 'nombre', 'monto', 'descripcion']
          },
          {
            model: AnnoEscolar,
            as: 'annoEscolar',
            attributes: ['id', 'periodo']
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      res.status(200).json(pagos);
    } catch (err) {
      console.error('Error al obtener pagos del representante:', err);
      res.status(500).json({ 
        message: 'Error al obtener los pagos del representante',
        error: err.message 
      });
    }
  },
  
  // Obtener comprobante de pago
  getComprobante: async (req, res) => {
    try {
      const { id } = req.params;
      
      const pago = await PagoEstudiantes.findByPk(id);
      
      if (!pago) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      
      if (!pago.urlComprobante) {
        return res.status(404).json({ message: 'Este pago no tiene comprobante' });
      }
      
      const filePath = path.join(__dirname, '..', pago.urlComprobante);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Archivo de comprobante no encontrado' });
      }
      
      res.sendFile(filePath);
    } catch (err) {
      console.error('Error al obtener comprobante:', err);
      res.status(500).json({ 
        message: 'Error al obtener el comprobante',
        error: err.message 
      });
    }
  },

    // Verificar si un estudiante está al día con sus pagos
    verificarEstadoPagosEstudiante: async (req, res) => {
    try {
      const { estudianteID } = req.params;
      
      // Verificar que el estudiante existe
      const estudiante = await db.Personas.findOne({
        where: { 
          id: estudianteID,
          tipo: 'estudiante'
        }
      });
      
      if (!estudiante) {
        return res.status(404).json({ message: 'Estudiante no encontrado' });
      }
      
      // Lógica para verificar si el estudiante está al día con sus pagos
      // Por ejemplo, verificar si tiene pagos pendientes
      const pagosPendientes = await db.PagoEstudiantes.findAll({
        where: {
          estudianteID,
          estado: 'pendiente'
        }
      });
      
      // Si no tiene pagos pendientes, está al día
      const alDia = pagosPendientes.length === 0;
      
      res.json({ alDia });
    } catch (err) {
      console.error('Error al verificar estado de pagos del estudiante:', err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = pagoEstudiantesController;
