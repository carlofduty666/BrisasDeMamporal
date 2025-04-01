const db = require('../models');
const PagoEstudiantes = db.PagoEstudiantes;
const Personas = db.Personas;
const Aranceles = db.Aranceles;
const MetodoPagos = db.MetodoPagos;
const ConfiguracionPagos = db.ConfiguracionPagos;
const Inscripcion = db.Inscripciones;
const AnnoEscolar = db.AnnoEscolar;
const { Op } = require('sequelize');
const moment = require('moment');
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      const dir = './uploads/comprobantes';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function(req, file, cb) {
      const uniqueFilename = `${uuidv4()}-${file.originalname}`;
      cb(null, uniqueFilename);
    }
  });
  
  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite
    fileFilter: function(req, file, cb) {
      // Validar tipos de archivo permitidos
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Tipo de archivo no permitido. Solo se permiten JPEG, JPG, PNG y PDF.'), false);
      }
      cb(null, true);
    }
  }).single('comprobante');
  
  const pagoEstudiantesController = {
    // Middleware para manejar la subida de comprobantes
    uploadMiddleware: (req, res, next) => {
      upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ message: `Error de Multer: ${err.message}` });
        } else if (err) {
          return res.status(400).json({ message: err.message });
        }
        next();
      });
    },
    
    // Obtener todos los pagos
    getAllPagos: async (req, res) => {
      try {
        const pagos = await PagoEstudiantes.findAll({
          include: [
            {
              model: Personas,
              as: 'estudiantes',
              attributes: ['id', 'nombre', 'apellido', 'cedula']
            },
            {
              model: Personas,
              as: 'representantes',
              attributes: ['id', 'nombre', 'apellido', 'cedula']
            },
            {
              model: Aranceles,
              as: 'aranceles'
            },
            {
              model: MetodoPagos,
              as: 'metodoPagos'
            },
            {
              model: AnnoEscolar,
              as: 'annoEscolar'
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
              attributes: ['id', 'nombre', 'apellido', 'cedula']
            },
            {
              model: Personas,
              as: 'representantes',
              attributes: ['id', 'nombre', 'apellido', 'cedula']
            },
            {
              model: Aranceles,
              as: 'aranceles'
            },
            {
              model: MetodoPagos,
              as: 'metodoPagos'
            },
            {
              model: AnnoEscolar,
              as: 'annoEscolar'
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
              attributes: ['id', 'nombre', 'apellido', 'cedula']
            },
            {
              model: Aranceles,
              as: 'aranceles'
            },
            {
              model: MetodoPagos,
              as: 'metodoPagos'
            },
            {
              model: AnnoEscolar,
              as: 'annoEscolar'
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
    getPagoById: async (req, res) => {
      try {
        const { id } = req.params;
        
        const pago = await PagoEstudiantes.findByPk(id, {
          include: [
            {
              model: Personas,
              as: 'estudiantes',
              attributes: ['id', 'nombre', 'apellido', 'cedula']
            },
            {
              model: Personas,
              as: 'representantes',
              attributes: ['id', 'nombre', 'apellido', 'cedula']
            },
            {
              model: Aranceles,
              as: 'aranceles'
            },
            {
              model: MetodoPagos,
              as: 'metodoPagos'
            },
            {
              model: AnnoEscolar,
              as: 'annoEscolar'
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
    
    // Crear un nuevo pago
    createPago: async (req, res) => {
      const transaction = await db.sequelize.transaction();
      
      try {
        const { 
          estudianteID, 
          representanteID, 
          metodoPagoID, 
          arancelID, 
          inscripcionID,
          annoEscolarID,
          monto,
          mesPago,
          referencia,
          observaciones
        } = req.body;
        
        // Verificar que el estudiante existe
        const estudiante = await Personas.findByPk(estudianteID);
        if (!estudiante || estudiante.tipo !== 'estudiante') {
          await transaction.rollback();
          return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        
        // Verificar que el representante existe
        const representante = await Personas.findByPk(representanteID);
        if (!representante || representante.tipo !== 'representante') {
          await transaction.rollback();
          return res.status(404).json({ message: 'Representante no encontrado' });
        }
        
        // Verificar que el método de pago existe
        const metodoPago = await MetodoPagos.findByPk(metodoPagoID);
        if (!metodoPago || !metodoPago.activo) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Método de pago no encontrado o inactivo' });
        }
        
        // Verificar que el arancel existe
        const arancel = await Aranceles.findByPk(arancelID);
        if (!arancel || !arancel.activo) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Arancel no encontrado o inactivo' });
        }
        
        // Verificar que el año escolar existe
        const annoEscolar = await AnnoEscolar.findByPk(annoEscolarID);
        if (!annoEscolar) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Año escolar no encontrado' });
        }
        
        // Obtener configuración de pagos
        const configuracion = await ConfiguracionPagos.findOne({
          where: { activo: true }
        });
        
        if (!configuracion) {
          await transaction.rollback();
          return res.status(404).json({ message: 'No hay configuración de pagos activa' });
        }
        
        // Calcular fecha de vencimiento
        const fechaActual = moment();
        let fechaVencimiento;
        
        if (mesPago) {
          // Si es una mensualidad, calcular fecha de vencimiento según el mes
          const [mes, anno] = mesPago.split('-');
          fechaVencimiento = moment(`${anno}-${mes}-${configuracion.fechaCorte}`, 'YYYY-MM-DD');
        } else {
          // Si no es mensualidad (ej. inscripción), vence en X días
          fechaVencimiento = moment().add(configuracion.diasGracia, 'days');
        }
        
        // Calcular si aplica mora
        let montoMora = 0;
        let descuento = 0;
        
        if (arancel.nombre.toLowerCase().includes('mensualidad') && fechaActual.isAfter(fechaVencimiento)) {
          // Si es mensualidad y está vencida, aplicar mora
          montoMora = parseFloat(monto) * (parseFloat(configuracion.porcentajeMora) / 100);
        } else if (arancel.nombre.toLowerCase().includes('mensualidad') && 
                  fechaActual.isBefore(fechaVencimiento.clone().subtract(configuracion.diasGracia, 'days'))) {
          // Si es mensualidad y paga con anticipación, aplicar descuento
          descuento = parseFloat(monto) * (parseFloat(configuracion.descuentoProntoPago) / 100);
        }
        
        // Calcular monto total
        const montoTotal = parseFloat(monto) + montoMora - descuento;
        
        // Crear el pago
        const nuevoPago = await PagoEstudiantes.create({
          estudianteID,
          representanteID,
          metodoPagoID,
          arancelID,
          inscripcionID: inscripcionID || null,
          annoEscolarID,
          monto,
          montoMora,
          descuento,
          montoTotal,
          mesPago,
          fechaVencimiento,
          fechaPago: metodoPago.nombre === 'Efectivo' ? moment().toDate() : null,
          referencia,
          comprobante: req.file ? `/uploads/comprobantes/${req.file.filename}` : null,
          estado: metodoPago.nombre === 'Efectivo' ? 'pagado' : 'pendiente',
          observaciones
        }, { transaction });
        
        // Si es un pago de inscripción, actualizar el estado en la tabla de inscripciones
        if (inscripcionID && arancel.nombre.toLowerCase().includes('inscripción')) {
          await Inscripcion.update(
            { pagoInscripcionCompletado: true },
            { 
              where: { id: inscripcionID },
              transaction
            }
          );
        }
        
        await transaction.commit();
        
        res.status(201).json({
          message: 'Pago registrado correctamente',
          pago: nuevoPago
        });
      } catch (err) {
        await transaction.rollback();
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    },

    // Iniciar pago con Stripe
  // iniciarPagoStripe: async (req, res) => {
  //   try {
  //     const { 
  //       estudianteID, 
  //       representanteID, 
  //       arancelID, 
  //       inscripcionID,
  //       annoEscolarID,
  //       mesPago,
  //       observaciones
  //     } = req.body;
      
  //     // Verificar que el estudiante existe
  //     const estudiante = await Personas.findByPk(estudianteID);
  //     if (!estudiante) {
  //       return res.status(404).json({ message: 'Estudiante no encontrado' });
  //     }
      
  //     // Verificar que el representante existe
  //     const representante = await Personas.findByPk(representanteID);
  //     if (!representante) {
  //       return res.status(404).json({ message: 'Representante no encontrado' });
  //     }
      
  //     // Verificar que el arancel existe
  //     const arancel = await Aranceles.findByPk(arancelID);
  //     if (!arancel) {
  //       return res.status(404).json({ message: 'Arancel no encontrado' });
  //     }
      
  //     // Obtener método de pago Stripe
  //     const metodoPagoStripe = await MetodoPagos.findOne({
  //       where: {
  //         nombre: 'Stripe',
  //         activo: true
  //       }
  //     });
      
  //     if (!metodoPagoStripe) {
  //       return res.status(404).json({ message: 'Método de pago Stripe no disponible' });
  //     }
      
  //     // Obtener configuración de pagos
  //     const configuracion = await ConfiguracionPagos.findOne({
  //       where: { activo: true }
  //     });
      
  //     if (!configuracion) {
  //       return res.status(404).json({ message: 'No hay configuración de pagos activa' });
  //     }
      
  //     // Calcular fecha de vencimiento
  //     const fechaActual = moment();
  //     let fechaVencimiento;
      
  //     if (mesPago) {
  //       const [mes, anno] = mesPago.split('-');
  //       fechaVencimiento = moment(`${anno}-${mes}-${configuracion.fechaCorte}`, 'YYYY-MM-DD');
  //     } else {
  //       fechaVencimiento = moment().add(configuracion.diasGracia, 'days');
  //     }
      
  //     // Calcular si aplica mora o descuento
  //     let montoMora = 0;
  //     let descuento = 0;

  //     if (arancel.nombre.toLowerCase().includes('mensualidad') && fechaActual.isAfter(fechaVencimiento)) {
  //       montoMora = parseFloat(arancel.monto) * (parseFloat(configuracion.porcentajeMora) / 100);
  //     } else if (arancel.nombre.toLowerCase().includes('mensualidad') && 
  //               fechaActual.isBefore(fechaVencimiento.clone().subtract(configuracion.diasGracia, 'days'))) {
  //       descuento = parseFloat(arancel.monto) * (parseFloat(configuracion.descuentoProntoPago) / 100);
  //     }

  //     // Calcular monto total
  //     const montoTotal = parseFloat(arancel.monto) + montoMora - descuento;
      
  //     // Crear sesión de Stripe
  //     const session = await stripe.checkout.sessions.create({
  //       payment_method_types: ['card'],
  //       line_items: [
  //         {
  //           price_data: {
  //             currency: 'usd',
  //             product_data: {
  //               name: `${arancel.nombre} - ${estudiante.nombre} ${estudiante.apellido}`,
  //               description: mesPago ? `Mes: ${mesPago}` : arancel.descripcion,
  //             },
  //             unit_amount: Math.round(montoTotal * 100), // Stripe usa centavos
  //           },
  //           quantity: 1,
  //         },
  //       ],
  //       mode: 'payment',
  //       success_url: `${process.env.FRONTEND_URL}/pagos/confirmacion?session_id={CHECKOUT_SESSION_ID}`,
  //       cancel_url: `${process.env.FRONTEND_URL}/pagos/cancelado`,
  //       metadata: {
  //         estudianteID: estudianteID.toString(),
  //         representanteID: representanteID.toString(),
  //         arancelID: arancelID.toString(),
  //         inscripcionID: inscripcionID ? inscripcionID.toString() : '',
  //         annoEscolarID: annoEscolarID.toString(),
  //         mesPago: mesPago || '',
  //         montoOriginal: arancel.monto.toString(),
  //         montoMora: montoMora.toString(),
  //         descuento: descuento.toString(),
  //         montoTotal: montoTotal.toString()
  //       }
  //     });
      
  //     // Registrar el pago como pendiente
  //     const nuevoPago = await PagoEstudiantes.create({
  //       estudianteID,
  //       representanteID,
  //       metodoPagoID: metodoPagoStripe.id,
  //       arancelID,
  //       inscripcionID: inscripcionID || null,
  //       annoEscolarID,
  //       monto: arancel.monto,
  //       montoMora,
  //       descuento,
  //       montoTotal,
  //       mesPago,
  //       fechaVencimiento,
  //       estado: 'pendiente',
  //       stripeSessionID: session.id,
  //       observaciones
  //     });
      
  //     res.json({
  //       id: session.id,
  //       url: session.url,
  //       pagoID: nuevoPago.id
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ message: err.message });
  //   }
  // },
  
  // // Confirmar pago con Stripe
  // confirmarPagoStripe: async (req, res) => {
  //   try {
  //     const { sessionId } = req.params;
      
  //     // Verificar la sesión en Stripe
  //     const session = await stripe.checkout.sessions.retrieve(sessionId);
      
  //     if (!session || session.payment_status !== 'paid') {
  //       return res.status(400).json({ message: 'El pago no ha sido completado' });
  //     }
      
  //     // Buscar el pago pendiente
  //     const pago = await PagoEstudiantes.findOne({
  //       where: { stripeSessionID: sessionId }
  //     });
      
  //     if (!pago) {
  //       return res.status(404).json({ message: 'Pago no encontrado' });
  //     }
      
  //     if (pago.estado === 'pagado') {
  //       return res.status(400).json({ message: 'Este pago ya ha sido confirmado' });
  //     }
      
  //     // Actualizar el pago
  //     await pago.update({
  //       estado: 'pagado',
  //       fechaPago: new Date(),
  //       stripePaymentID: session.payment_intent
  //     });
      
  //     // Si es un pago de inscripción, actualizar el estado en la tabla de inscripciones
  //     if (pago.inscripcionID && pago.arancel.nombre.toLowerCase().includes('inscripción')) {
  //       await Inscripcion.update(
  //         { pagoInscripcionCompletado: true },
  //         { where: { id: pago.inscripcionID } }
  //       );
  //     }
      
  //     res.json({
  //       message: 'Pago confirmado correctamente',
  //       pago
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ message: err.message });
  //   }
  // },
  
  // // Webhook de Stripe para eventos
  // stripeWebhook: async (req, res) => {
  //   const sig = req.headers['stripe-signature'];
  //   let event;
    
  //   try {
  //     event = stripe.webhooks.constructEvent(
  //       req.body,
  //       sig,
  //       process.env.STRIPE_WEBHOOK_SECRET
  //     );
  //   } catch (err) {
  //     console.error(`Error de firma: ${err.message}`);
  //     return res.status(400).send(`Webhook Error: ${err.message}`);
  //   }
    
  //   // Manejar el evento
  //   if (event.type === 'checkout.session.completed') {
  //     const session = event.data.object;
      
  //     try {
  //       // Buscar el pago pendiente
  //       const pago = await PagoEstudiantes.findOne({
  //         where: { stripeSessionID: session.id }
  //       });
        
  //       if (pago && pago.estado !== 'pagado') {
  //         // Actualizar el pago
  //         await pago.update({
  //           estado: 'pagado',
  //           fechaPago: new Date(),
  //           stripePaymentID: session.payment_intent
  //         });
          
  //         // Si es un pago de inscripción, actualizar el estado en la tabla de inscripciones
  //         if (pago.inscripcionID) {
  //           const arancel = await Aranceles.findByPk(pago.arancelID);
  //           if (arancel && arancel.nombre.toLowerCase().includes('inscripción')) {
  //             await Inscripcion.update(
  //               { pagoInscripcionCompletado: true },
  //               { where: { id: pago.inscripcionID } }
  //             );
  //           }
  //         }
  //       }
  //     } catch (err) {
  //       console.error(`Error procesando pago: ${err.message}`);
  //     }
  //   }
    
  //   res.json({ received: true });
  // },

  // Actualizar estado de pago
  updateEstadoPago: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, observaciones } = req.body;
      
      const pago = await PagoEstudiantes.findByPk(id);
      
      if (!pago) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      
      // Validar el estado
      const estadosValidos = ['pendiente', 'pagado', 'vencido', 'anulado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ message: 'Estado no válido' });
      }
      
      // Si se está marcando como pagado, registrar la fecha de pago
      const updateData = {
        estado,
        observaciones: observaciones || pago.observaciones
      };
      
      if (estado === 'pagado' && pago.estado !== 'pagado') {
        updateData.fechaPago = new Date();
      }
      
      await pago.update(updateData);
      
      // Si es un pago de inscripción y se marca como pagado, actualizar el estado en la tabla de inscripciones
      if (pago.inscripcionID && estado === 'pagado') {
        const arancel = await Aranceles.findByPk(pago.arancelID);
        if (arancel && arancel.nombre.toLowerCase().includes('inscripción')) {
          await Inscripcion.update(
            { pagoInscripcionCompletado: true },
            { where: { id: pago.inscripcionID } }
          );
        }
      }
      
      res.json({
        message: 'Estado de pago actualizado correctamente',
        pago
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Subir comprobante de pago
  uploadComprobante: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ message: 'No se ha subido ningún archivo' });
      }
      
      const pago = await PagoEstudiantes.findByPk(id);
      
      if (!pago) {
        // Eliminar el archivo subido
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      
      // Si ya existe un comprobante, eliminar el archivo anterior
      if (pago.comprobante) {
        const rutaAnterior = path.join(__dirname, '..', pago.comprobante);
        if (fs.existsSync(rutaAnterior)) {
          fs.unlinkSync(rutaAnterior);
        }
      }
      
      // Actualizar el pago con la ruta del nuevo comprobante
      await pago.update({
        comprobante: `/uploads/comprobantes/${req.file.filename}`
      });
      
      res.json({
        message: 'Comprobante subido correctamente',
        pago
      });
    } catch (err) {
      // Si hay un error y se subió un archivo, eliminarlo
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Descargar comprobante
  downloadComprobante: async (req, res) => {
    try {
      const { id } = req.params;
      
      const pago = await PagoEstudiantes.findByPk(id);
      
      if (!pago || !pago.comprobante) {
        return res.status(404).json({ message: 'Comprobante no encontrado' });
      }
      
      const rutaArchivo = path.join(__dirname, '..', pago.comprobante);
      
      if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({ message: 'El archivo físico no existe' });
      }
      
      // Obtener el nombre original del archivo
      const nombreArchivo = path.basename(pago.comprobante);
      
      res.download(rutaArchivo, nombreArchivo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Generar reporte de pagos
  generarReportePagos: async (req, res) => {
    try {
      const { 
        fechaInicio, 
        fechaFin, 
        estado, 
        arancelID, 
        metodoPagoID,
        annoEscolarID
      } = req.query;
      
      // Construir condiciones de búsqueda
      const where = {};
      
      if (fechaInicio && fechaFin) {
        where.createdAt = {
          [Op.between]: [
            moment(fechaInicio).startOf('day').toDate(),
            moment(fechaFin).endOf('day').toDate()
          ]
        };
      }
      
      if (estado) {
        where.estado = estado;
      }
      
      if (arancelID) {
        where.arancelID = arancelID;
      }
      
      if (metodoPagoID) {
        where.metodoPagoID = metodoPagoID;
      }
      
      if (annoEscolarID) {
        where.annoEscolarID = annoEscolarID;
      }
      
      // Obtener pagos según filtros
      const pagos = await PagoEstudiantes.findAll({
        where,
        include: [
          {
            model: Personas,
            as: 'estudiantes',
            attributes: ['id', 'nombre', 'apellido', 'cedula']
          },
          {
            model: Personas,
            as: 'representantes',
            attributes: ['id', 'nombre', 'apellido', 'cedula']
          },
          {
            model: Aranceles,
            as: 'aranceles'
          },
          {
            model: MetodoPagos,
            as: 'metodoPagos'
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      // Calcular totales
      const totalPagado = pagos
        .filter(p => p.estado === 'pagado')
        .reduce((sum, p) => sum + parseFloat(p.montoTotal), 0);
      
      const totalPendiente = pagos
        .filter(p => p.estado === 'pendiente')
        .reduce((sum, p) => sum + parseFloat(p.montoTotal), 0);
      
      const totalVencido = pagos
        .filter(p => p.estado === 'vencido')
        .reduce((sum, p) => sum + parseFloat(p.montoTotal), 0);
      
      const totalAnulado = pagos
        .filter(p => p.estado === 'anulado')
        .reduce((sum, p) => sum + parseFloat(p.montoTotal), 0);
      
      res.json({
        pagos,
        resumen: {
          totalRegistros: pagos.length,
          totalPagado,
          totalPendiente,
          totalVencido,
          totalAnulado,
          montoTotal: totalPagado + totalPendiente + totalVencido + totalAnulado
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Verificar pagos vencidos y actualizar estados
  verificarPagosVencidos: async (req, res) => {
    try {
      // Obtener configuración de pagos
      const configuracion = await ConfiguracionPagos.findOne({
        where: { activo: true }
      });
      
      if (!configuracion) {
        return res.status(404).json({ message: 'No hay configuración de pagos activa' });
      }
      
      // Buscar pagos pendientes con fecha de vencimiento pasada
      const pagosVencidos = await PagoEstudiantes.findAll({
        where: {
          estado: 'pendiente',
          fechaVencimiento: {
            [Op.lt]: new Date()
          }
        }
      });
      
      // Actualizar estado a vencido
      const actualizados = [];

      for (const pago of pagosVencidos) {
        await pago.update({
          estado: 'vencido',
          montoMora: parseFloat(pago.monto) * (parseFloat(configuracion.porcentajeMora) / 100),
          montoTotal: parseFloat(pago.monto) + (parseFloat(pago.monto) * (parseFloat(configuracion.porcentajeMora) / 100)) - parseFloat(pago.descuento)
        });
        actualizados.push(pago);
      }
      
      res.json({
        message: `${actualizados.length} pagos actualizados a estado vencido`,
        pagosActualizados: actualizados
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },

  // Verificar estado de pagos de un estudiante
  verificarEstadoPagosEstudiante: async (req, res) => {
    try {
      const { estudianteID } = req.params;
      
      // Obtener el año escolar activo
      const annoEscolar = await AnnoEscolar.findOne({
        where: { activo: true }
      });
      
      if (!annoEscolar) {
        return res.status(404).json({ message: 'No hay un año escolar activo' });
      }
      
      // Obtener pagos pendientes o vencidos del estudiante en el año escolar actual
      const pagosPendientes = await PagoEstudiantes.findAll({
        where: {
          estudianteID,
          annoEscolarID: annoEscolar.id,
          estado: {
            [Op.in]: ['pendiente', 'vencido']
          }
        }
      });
      
      // Verificar si hay pagos de mensualidad pendientes
      const mensualidadesPendientes = await PagoEstudiantes.findAll({
        where: {
          estudianteID,
          annoEscolarID: annoEscolar.id,
          estado: {
            [Op.in]: ['pendiente', 'vencido']
          }
        },
        include: [
          {
            model: Aranceles,
            as: 'aranceles',
            where: {
              nombre: {
                [Op.like]: '%mensualidad%'
              }
            }
          }
        ]
      });
      
      // Obtener el último pago realizado
      const ultimoPago = await PagoEstudiantes.findOne({
        where: {
          estudianteID,
          annoEscolarID: annoEscolar.id,
          estado: 'pagado'
        },
        order: [['fechaPago', 'DESC']]
      });
      
      res.json({
        estudianteID,
        alDia: pagosPendientes.length === 0,
        pagosPendientes: pagosPendientes.length,
        mensualidadesPendientes: mensualidadesPendientes.length,
        ultimoPago: ultimoPago ? {
          id: ultimoPago.id,
          fecha: ultimoPago.fechaPago,
          monto: ultimoPago.montoTotal
        } : null
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = pagoEstudiantesController;