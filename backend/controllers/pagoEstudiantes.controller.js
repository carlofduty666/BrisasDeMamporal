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

const { ConfiguracionPagos } = require('../models');

const pagoEstudiantesController = {
  // Obtener todos los pagos
  getAllPagos: async (req, res) => {
    try {
      // Construir filtros desde query params
      const { mesPago, annoEscolarID, estado } = req.query;
      const where = {};
      
      // Normalizar mesPago para aceptar tanto números como nombres de mes
      if (mesPago) {
        const normalizaMes = (valor) => {
          if (valor == null) return null;
          const m = String(valor).trim().toLowerCase();
          const mapa = {
            '1':'1','01':'1','enero':'1',
            '2':'2','02':'2','febrero':'2',
            '3':'3','03':'3','marzo':'3',
            '4':'4','04':'4','abril':'4',
            '5':'5','05':'5','mayo':'5',
            '6':'6','06':'6','junio':'6',
            '7':'7','07':'7','julio':'7',
            '8':'8','08':'8','agosto':'8',
            '9':'9','09':'9','septiembre':'9','setiembre':'9',
            '10':'10','octubre':'10',
            '11':'11','noviembre':'11',
            '12':'12','diciembre':'12'
          };
          return mapa[m] || valor;
        };
        
        const mesNormalizado = normalizaMes(mesPago);
        // Buscar por el valor normalizado (número del mes como string)
        where.mesPago = mesNormalizado;
      }
      if (annoEscolarID) where.annoEscolarID = Number(annoEscolarID);
      if (estado) where.estado = estado;

      const pagos = await PagoEstudiantes.findAll({
        where,
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
            required: false,
            attributes: ['id', 'gradoID', 'seccionID'],
            include: [
              { model: Grados, as: 'grado', attributes: ['id','nombre_grado'] },
              { model: Secciones, as: 'Secciones', attributes: ['id','nombre_seccion'] }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Adjuntar snapshot de mensualidad y buscar grado/sección del estudiante
      const pagosEnriquecidos = await Promise.all(pagos.map(async (p) => {
        const plain = p.toJSON();
        
        // Buscar grado del estudiante para el año escolar del pago
        try {
          const gradoPersona = await db.Grado_Personas.findOne({
            where: { 
              personaID: p.estudianteID, 
              annoEscolarID: p.annoEscolarID 
            },
            include: [
              {
                model: db.Grados,
                as: 'grado',
                attributes: ['id', 'nombre_grado'],
                include: [
                  {
                    model: db.Niveles,
                    as: 'Niveles',
                    attributes: ['id', 'nombre_nivel']
                  }
                ]
              }
            ]
          });
          
          if (gradoPersona && gradoPersona.grado) {
            plain.grado = gradoPersona.grado;
          }
        } catch (e) {
          console.error('Error al buscar grado del estudiante:', e);
        }
        
        // Buscar sección del estudiante para el año escolar del pago
        try {
          const seccionPersona = await db.Seccion_Personas.findOne({
            where: { 
              personaID: p.estudianteID, 
              annoEscolarID: p.annoEscolarID,
              rol: 'estudiante'
            },
            include: [
              {
                model: db.Secciones,
                as: 'secciones',
                attributes: ['id', 'nombre_seccion']
              }
            ]
          });
          
          if (seccionPersona && seccionPersona.secciones) {
            plain.seccion = seccionPersona.secciones;
          }
        } catch (e) {
          console.error('Error al buscar sección del estudiante:', e);
        }
        
        // Adjuntar snapshot de mensualidad
        try {
          const mensualidad = await db.Mensualidades.findOne({ where: { pagoID: p.id } });
          if (mensualidad) {
            const m = mensualidad.toJSON();
            const nombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
            const mesNombre = m.mes ? nombres[m.mes - 1] : null;
            plain.mensualidadSnapshot = {
              precioAplicadoUSD: m.precioAplicadoUSD,
              precioAplicadoVES: m.precioAplicadoVES,
              tasaAplicadaMes: m.tasaAplicadaMes,
              porcentajeMoraAplicado: m.porcentajeMoraAplicado,
              fechaCorteAplicada: m.fechaCorteAplicada,
              configCongelada: m.configCongelada,
              moraAplicadaUSD: m.moraAplicadaUSD,
              moraAplicadaVES: m.moraAplicadaVES,
              mes: m.mes,
              mesNombre: mesNombre,
              anio: m.anio,
              estadoMensualidad: m.estado
            };
          }
        } catch (e) {
          // si no hay mensualidad vinculada, se omite
        }
        return plain;
      }));
      res.status(200).json(pagosEnriquecidos);
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
          },
          {
            model: Inscripciones,
            as: 'inscripciones',
            required: false,
            attributes: ['id', 'gradoID', 'seccionID'],
            include: [
              { model: Grados, as: 'grado', attributes: ['id','nombre_grado'] },
              { model: Secciones, as: 'Secciones', attributes: ['id','nombre_seccion'] }
            ]
          }
        ]
      });
      
      if (!pago) {
        return res.status(404).json({ message: 'Pago no encontrado' });
      }
      
      // Adjuntar snapshot de mensualidad y buscar grado/sección del estudiante
      const plain = pago.toJSON();
      
      // Buscar grado del estudiante para el año escolar del pago
      try {
        const gradoPersona = await db.Grado_Personas.findOne({
          where: { 
            personaID: pago.estudianteID, 
            annoEscolarID: pago.annoEscolarID 
          },
          include: [
            {
              model: db.Grados,
              as: 'grado',
              attributes: ['id', 'nombre_grado'],
              include: [
                {
                  model: db.Niveles,
                  as: 'Niveles',
                  attributes: ['id', 'nombre_nivel']
                }
              ]
            }
          ]
        });
        
        if (gradoPersona && gradoPersona.grado) {
          plain.grado = gradoPersona.grado;
        }
      } catch (e) {
        console.error('Error al buscar grado del estudiante:', e);
      }
      
      // Buscar sección del estudiante para el año escolar del pago
      try {
        const seccionPersona = await db.Seccion_Personas.findOne({
          where: { 
            personaID: pago.estudianteID, 
            annoEscolarID: pago.annoEscolarID,
            rol: 'estudiante'
          },
          include: [
            {
              model: db.Secciones,
              as: 'secciones',
              attributes: ['id', 'nombre_seccion']
            }
          ]
        });
        
        if (seccionPersona && seccionPersona.secciones) {
          plain.seccion = seccionPersona.secciones;
        }
      } catch (e) {
        console.error('Error al buscar sección del estudiante:', e);
      }
      
      // Adjuntar snapshot de mensualidad
      try {
        const mensualidad = await db.Mensualidades.findOne({ where: { pagoID: pago.id } });
        if (mensualidad) {
          const m = mensualidad.toJSON();
          plain.mensualidadSnapshot = {
            precioAplicadoUSD: m.precioAplicadoUSD,
            precioAplicadoVES: m.precioAplicadoVES,
            porcentajeMoraAplicado: m.porcentajeMoraAplicado,
            fechaCorteAplicada: m.fechaCorteAplicada,
            configCongelada: m.configCongelada,
            moraAplicadaUSD: m.moraAplicadaUSD,
            moraAplicadaVES: m.moraAplicadaVES,
            mes: m.mes,
            anio: m.anio,
            estadoMensualidad: m.estado
          };
        }
      } catch (e) {
        // sin mensualidad vinculada
      }
      
      res.status(200).json(plain);
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
      
      // Validaciones (simplificadas para el flujo de reporte de comprobante)
      // Requerimos: estudianteID, representanteID, annoEscolarID y monto
      if (!estudianteID || !representanteID || !annoEscolarID || !monto) {
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
      
      // Verificar/Asignar método de pago
      let metodoPago = null;
      let metodoPagoIdToUse = null;
      if (metodoPagoID) {
        // Validar el método recibido
        metodoPago = await MetodoPagos.findOne({ 
          where: { id: metodoPagoID, activo: true },
          transaction
        });
        if (!metodoPago) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Método de pago no encontrado o inactivo' });
        }
        metodoPagoIdToUse = metodoPago.id;
      } else {
        // Opción B: usar un método por defecto explícito
        const [mp] = await MetodoPagos.findOrCreate({
          where: { nombre: 'Transferencia - Pago móvil' },
          defaults: { activo: true },
          transaction
        });
        metodoPago = mp;
        metodoPagoIdToUse = mp.id;
      }

      // Verificar/Asignar arancel
      let arancel = null;
      let arancelIdToUse = null;
      if (arancelID) {
        arancel = await Aranceles.findOne({ 
          where: { id: arancelID, activo: true },
          transaction
        });
        if (!arancel) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Arancel no encontrado o inactivo' });
        }
        arancelIdToUse = arancel.id;
      } else {
        // Sin arancel explícito, usamos un arancel genérico de mensualidad para cumplir NOT NULL
        const [ar] = await Aranceles.findOrCreate({
          where: { nombre: 'Mensualidad' },
          defaults: { monto: 0, descripcion: 'Pago mensual reportado', activo: true },
          transaction
        });
        arancel = ar;
        arancelIdToUse = ar.id;
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
      
      // Crear el pago (cumpliendo NOT NULL con valores por defecto cuando faltan)
      const nuevoPago = await PagoEstudiantes.create({
        estudianteID,
        representanteID,
        metodoPagoID: metodoPagoIdToUse, // siempre definido a este punto
        arancelID: arancelIdToUse,       // siempre definido a este punto
        inscripcionID: inscripcionID || null,
        annoEscolarID,
        monto: montoFinal,
        montoMora: montoMoraFinal,
        descuento: descuentoFinal,
        montoTotal: montoTotalFinal,
        mesPago: mesPago || null,
        fechaPago: fechaPago || new Date(),
        referencia: referencia || null,
        estado: (metodoPago && metodoPago.nombre === 'Efectivo') ? 'pagado' : 'pendiente',
        urlComprobante,
        nombreArchivo,
        tipoArchivo,
        tamanoArchivo,
        observaciones: observaciones || null
      }, { transaction });

      // Intentar vincular con mensualidad correspondiente (estudiante + annoEscolar + mes)
      const normalizaMes = (valor) => {
        if (valor == null) return null;
        const m = String(valor).trim().toLowerCase();
        const mapa = {
          '1':1,'01':1,'enero':1,
          '2':2,'02':2,'febrero':2,
          '3':3,'03':3,'marzo':3,
          '4':4,'04':4,'abril':4,
          '5':5,'05':5,'mayo':5,
          '6':6,'06':6,'junio':6,
          '7':7,'07':7,'julio':7,
          '8':8,'08':8,'agosto':8,
          '9':9,'09':9,'septiembre':9,'setiembre':9,
          '10':10,'octubre':10,
          '11':11,'noviembre':11,
          '12':12,'diciembre':12
        };
        return mapa[m] ?? (Number.isFinite(Number(m)) ? Number(m) : null);
      };

      const mesNumerico = normalizaMes(mesPago);
      if (mesNumerico) {
        const mensualidad = await db.Mensualidades.findOne({
          where: { estudianteID, annoEscolarID, mes: mesNumerico },
          transaction
        });
        if (mensualidad) {
          // Estado reportado al existir comprobante o instrucción creada
          const nuevoEstado = nuevoPago.estado === 'pagado' ? 'pagado' : 'reportado';
          await mensualidad.update({ pagoID: nuevoPago.id, estado: nuevoEstado }, { transaction });
        }
      }
      
      // Si el pago es para una inscripción, actualizar el estado de la inscripción
      if (inscripcionID) {
        const inscripcion = await Inscripciones.findByPk(inscripcionID, { transaction });
        
        if (inscripcion) {
          // Si el arancel es de tipo inscripción, marcar como pagado
          if (arancel && arancel.nombre === 'inscripcion') {
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

      // Sincronizar mensualidad vinculada (si existe)
      const mensualidad = await db.Mensualidades.findOne({ where: { pagoID: pago.id }, transaction });
      if (mensualidad) {
        if (estado === 'pagado') {
          await mensualidad.update({ estado: 'pagado' }, { transaction });
        } else if (estado === 'anulado') {
          await mensualidad.update({ estado: 'pendiente', pagoID: null }, { transaction });
        } else if (estado === 'pendiente') {
          await mensualidad.update({ estado: 'pendiente' }, { transaction });
        }
      }
      
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
          },
          {
            model: Inscripciones,
            as: 'inscripciones',
            required: false,
            attributes: ['id', 'gradoID', 'seccionID'],
            include: [
              { model: Grados, as: 'grado', attributes: ['id','nombre_grado'] },
              { model: Secciones, as: 'Secciones', attributes: ['id','nombre_seccion'] }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      // Adjuntar snapshot de mensualidad y buscar grado/sección del estudiante
      const pagosEnriquecidos = await Promise.all(pagos.map(async (p) => {
        const plain = p.toJSON();
        
        // Buscar grado del estudiante para el año escolar del pago
        try {
          const gradoPersona = await db.Grado_Personas.findOne({
            where: { 
              personaID: p.estudianteID, 
              annoEscolarID: p.annoEscolarID 
            },
            include: [
              {
                model: db.Grados,
                as: 'grado',
                attributes: ['id', 'nombre_grado'],
                include: [
                  {
                    model: db.Niveles,
                    as: 'Niveles',
                    attributes: ['id', 'nombre_nivel']
                  }
                ]
              }
            ]
          });
          
          if (gradoPersona && gradoPersona.grado) {
            plain.grado = gradoPersona.grado;
          }
        } catch (e) {
          console.error('Error al buscar grado del estudiante:', e);
        }
        
        // Buscar sección del estudiante para el año escolar del pago
        try {
          const seccionPersona = await db.Seccion_Personas.findOne({
            where: { 
              personaID: p.estudianteID, 
              annoEscolarID: p.annoEscolarID,
              rol: 'estudiante'
            },
            include: [
              {
                model: db.Secciones,
                as: 'secciones',
                attributes: ['id', 'nombre_seccion']
              }
            ]
          });
          
          if (seccionPersona && seccionPersona.secciones) {
            plain.seccion = seccionPersona.secciones;
          }
        } catch (e) {
          console.error('Error al buscar sección del estudiante:', e);
        }
        
        // Adjuntar snapshot de mensualidad
        try {
          const mensualidad = await db.Mensualidades.findOne({ where: { pagoID: p.id } });
          if (mensualidad) {
            const m = mensualidad.toJSON();
            const nombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
            const mesNombre = m.mes ? nombres[m.mes - 1] : null;
            plain.mensualidadSnapshot = {
              precioAplicadoUSD: m.precioAplicadoUSD,
              precioAplicadoVES: m.precioAplicadoVES,
              tasaAplicadaMes: m.tasaAplicadaMes,
              porcentajeMoraAplicado: m.porcentajeMoraAplicado,
              fechaCorteAplicada: m.fechaCorteAplicada,
              configCongelada: m.configCongelada,
              moraAplicadaUSD: m.moraAplicadaUSD,
              moraAplicadaVES: m.moraAplicadaVES,
              mes: m.mes,
              mesNombre: mesNombre,
              anio: m.anio,
              estadoMensualidad: m.estado
            };
          }
        } catch (e) {
          // si no hay mensualidad vinculada, se omite
        }
        return plain;
      }));
      
      res.status(200).json(pagosEnriquecidos);
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
          },
          {
            model: Inscripciones,
            as: 'inscripciones',
            required: false,
            attributes: ['id', 'gradoID', 'seccionID'],
            include: [
              { model: Grados, as: 'grado', attributes: ['id','nombre_grado'] },
              { model: Secciones, as: 'Secciones', attributes: ['id','nombre_seccion'] }
            ]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      // Adjuntar snapshot de mensualidad y buscar grado/sección del estudiante
      const pagosEnriquecidos = await Promise.all(pagos.map(async (p) => {
        const plain = p.toJSON();
        
        // Buscar grado del estudiante para el año escolar del pago
        try {
          const gradoPersona = await db.Grado_Personas.findOne({
            where: { 
              personaID: p.estudianteID, 
              annoEscolarID: p.annoEscolarID 
            },
            include: [
              {
                model: db.Grados,
                as: 'grado',
                attributes: ['id', 'nombre_grado'],
                include: [
                  {
                    model: db.Niveles,
                    as: 'Niveles',
                    attributes: ['id', 'nombre_nivel']
                  }
                ]
              }
            ]
          });
          
          if (gradoPersona && gradoPersona.grado) {
            plain.grado = gradoPersona.grado;
          }
        } catch (e) {
          console.error('Error al buscar grado del estudiante:', e);
        }
        
        // Buscar sección del estudiante para el año escolar del pago
        try {
          const seccionPersona = await db.Seccion_Personas.findOne({
            where: { 
              personaID: p.estudianteID, 
              annoEscolarID: p.annoEscolarID,
              rol: 'estudiante'
            },
            include: [
              {
                model: db.Secciones,
                as: 'secciones',
                attributes: ['id', 'nombre_seccion']
              }
            ]
          });
          
          if (seccionPersona && seccionPersona.secciones) {
            plain.seccion = seccionPersona.secciones;
          }
        } catch (e) {
          console.error('Error al buscar sección del estudiante:', e);
        }
        
        // Adjuntar snapshot de mensualidad
        try {
          const mensualidad = await db.Mensualidades.findOne({ where: { pagoID: p.id } });
          if (mensualidad) {
            const m = mensualidad.toJSON();
            const nombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
            const mesNombre = m.mes ? nombres[m.mes - 1] : null;
            plain.mensualidadSnapshot = {
              precioAplicadoUSD: m.precioAplicadoUSD,
              precioAplicadoVES: m.precioAplicadoVES,
              tasaAplicadaMes: m.tasaAplicadaMes,
              porcentajeMoraAplicado: m.porcentajeMoraAplicado,
              fechaCorteAplicada: m.fechaCorteAplicada,
              configCongelada: m.configCongelada,
              moraAplicadaUSD: m.moraAplicadaUSD,
              moraAplicadaVES: m.moraAplicadaVES,
              mes: m.mes,
              mesNombre: mesNombre,
              anio: m.anio,
              estadoMensualidad: m.estado
            };
          }
        } catch (e) {
          // si no hay mensualidad vinculada, se omite
        }
        return plain;
      }));
      
      res.status(200).json(pagosEnriquecidos);
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
  },

  // Resetear TODOS los pagos del sistema (requiere owner/admin y confirmar = "BORRAR")
  resetPagos: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { confirmar } = req.body || {};
      if (confirmar !== 'BORRAR') {
        await transaction.rollback();
        return res.status(400).json({ message: 'Confirmación inválida. Envía confirmar = "BORRAR"' });
      }

      // Eliminar archivos de comprobantes existentes antes del borrado
      const pagosConArchivos = await PagoEstudiantes.findAll({
        where: { urlComprobante: { [db.Sequelize.Op.ne]: null } },
        transaction
      });
      let archivosEliminados = 0;
      for (const p of pagosConArchivos) {
        const filePath = path.join(__dirname, '..', p.urlComprobante);
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            archivosEliminados++;
          }
        } catch (e) {
          // Continuar aunque no se pueda borrar algún archivo
        }
      }

      // Borrar todos los pagos (FK en Mensualidades.pagoID con onDelete: SET NULL)
      const pagosEliminados = await PagoEstudiantes.destroy({ where: {}, transaction });

      await transaction.commit();
      return res.status(200).json({
        message: 'Pagos reseteados correctamente',
        pagosEliminados,
        archivosEliminados
      });
    } catch (err) {
      await transaction.rollback();
      console.error('Error al resetear pagos:', err);
      return res.status(500).json({ message: 'Error al resetear pagos', error: err.message });
    }
  }
};

module.exports = pagoEstudiantesController;
