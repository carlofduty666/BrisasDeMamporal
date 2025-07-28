const db = require('../models');
const Inscripciones = db.Inscripciones;
const Personas = db.Personas;
const Grados = db.Grados;
const Secciones = db.Secciones;
const AnnoEscolar = db.AnnoEscolar;
const Documentos = db.Documentos;
const PagoEstudiantes = db.PagoEstudiantes;
const Grado_Personas = db.Grado_Personas;
const Seccion_Personas = db.Seccion_Personas;
const { Op, literal } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const inscripcionController = {
  // Obtener todas las inscripciones
  getAllInscripciones: async (req, res) => {
    try {
      const { annoEscolarID, estado, estudianteID } = req.query;
      
      const whereClause = {};
      if (annoEscolarID) whereClause.annoEscolarID = annoEscolarID;
      if (estado) whereClause.estado = estado;
      if (estudianteID) whereClause.estudianteID = estudianteID;
      
      const inscripciones = await Inscripciones.findAll({
        where: whereClause,
        include: [
          {
            model: Personas,
            as: 'estudiante',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'fechaNacimiento']
          },
          {
            model: Personas,
            as: 'representante',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'email', 'telefono']
          },
          {
            model: Grados,
            as: 'grado'
          },
          {
            model: Secciones,
            as: 'Secciones'
          },
          {
            model: AnnoEscolar,
            as: 'annoEscolar'
          }
        ],
        order: [['fechaInscripcion', 'DESC']]
      });
      
      res.json(inscripciones);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener inscripciones por representante
  getInscripcionesByRepresentante: async (req, res) => {
    try {
      const { representanteID } = req.params;
      const { annoEscolarID } = req.query;
      
      const whereClause = { representanteID };
      if (annoEscolarID) whereClause.annoEscolarID = annoEscolarID;
      
      const inscripciones = await Inscripciones.findAll({
        where: whereClause,
        include: [
          {
            model: Personas,
            as: 'estudiante',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'fechaNacimiento']
          },
          {
            model: Grados,
            as: 'grado'
          },
          {
            model: Secciones,
            as: 'Secciones'
          },
          {
            model: AnnoEscolar,
            as: 'annoEscolar'
          }
        ],
        order: [['fechaInscripcion', 'DESC']]
      });
      
      res.json(inscripciones);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener inscripción por ID
  getInscripcionById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const inscripcion = await Inscripciones.findByPk(id, {
        include: [
          {
            model: Personas,
            as: 'estudiante',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'fechaNacimiento', 'genero', 'direccion'],
            include: [
              {
                model: Documentos,
                as: 'documentos'
              }
            ]
          },
          {
            model: Personas,
            as: 'representante',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'email', 'telefono', 'direccion']
          },
          {
            model: Grados,
            as: 'grado'
          },
          {
            model: Secciones,
            as: 'Secciones'
          },
          {
            model: AnnoEscolar,
            as: 'annoEscolar'
          },
          {
            model: PagoEstudiantes,
            as: 'pagos',
            include: [
              {
                model: db.Aranceles,
                as: 'aranceles'
              },
              {
                model: db.MetodoPagos,
                as: 'metodoPagos'
              }
            ]
          }
        ]
      });
      
      if (!inscripcion) {
        return res.status(404).json({ message: 'Inscripción no encontrada' });
      }
      
      res.json(inscripcion);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },

  getInscripcionActualByEstudiante: async (req, res) => {
      try {
        const { estudianteID } = req.params;
        
        // Obtener el año escolar activo
        const annoEscolar = await AnnoEscolar.findOne({
          where: { activo: true }
        });
        
        if (!annoEscolar) {
          return res.status(404).json({ message: 'No hay un año escolar activo' });
        }
        
        // Buscar la inscripción del estudiante en el año escolar activo
        const inscripcion = await Inscripciones.findOne({
          where: {
            estudianteID,
            annoEscolarID: annoEscolar.id
          },
          include: [
            {
              model: Grados,
              as: 'grado'
            },
            {
              model: Secciones,
              as: 'Secciones'
            },
            {
              model: AnnoEscolar,
              as: 'annoEscolar'
            }
          ]
        });
        
        if (!inscripcion) {
          return res.status(404).json({ message: 'No se encontró inscripción para este estudiante en el año escolar activo' });
        }
        
        res.json(inscripcion);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
  },

  
  // Obtener cupos disponibles por grado
  getCuposDisponibles: async (req, res) => {
    try {
      // Obtener el año escolar activo
      const annoEscolar = await AnnoEscolar.findOne({
        where: { activo: true }
      });
      
      if (!annoEscolar) {
        return res.status(404).json({ message: 'No hay un año escolar activo' });
      }
      
      // Obtener todos los grados
      const grados = await Grados.findAll({
        include: [
          {
            model: Secciones,
            as: 'Secciones'  // Asegúrate de que este alias coincida con tu modelo
          }
        ]
      });
      
      // Calcular cupos disponibles por grado y sección
      const cuposDisponibles = {};
      
      for (const grado of grados) {
        cuposDisponibles[grado.id] = {
          nombre: grado.nombre_grado,
          secciones: {},
          totalDisponibles: 0
        };
        
        // Verificar si grado.Secciones existe y es un array
        const secciones = grado.Secciones || [];
        
        if (Array.isArray(secciones) && secciones.length > 0) {
          for (const seccion of secciones) {
            // Contar estudiantes inscritos en esta sección para el año escolar activo
            const estudiantesInscritos = await Seccion_Personas.count({
              where: {
                seccionID: seccion.id,
                annoEscolarID: annoEscolar.id
              }
            });
            
            const capacidad = seccion.capacidad || 30;
            const disponibles = Math.max(0, capacidad - estudiantesInscritos);
            
            cuposDisponibles[grado.id].secciones[seccion.id] = {
              nombre: seccion.nombre_seccion,
              capacidad: capacidad,
              ocupados: estudiantesInscritos,
              disponibles: disponibles
            };
            
            cuposDisponibles[grado.id].totalDisponibles += disponibles;
          }
        } else {
          console.log(`No hay secciones para el grado ${grado.id} o no es un array`);
          // Si no hay secciones, intentar obtener secciones directamente
          const seccionesSeparadas = await Secciones.findAll({
            where: { gradoID: grado.id }
          });
          
          for (const seccion of seccionesSeparadas) {
            const estudiantesInscritos = await Seccion_Personas.count({
              where: {
                seccionID: seccion.id,
                annoEscolarID: annoEscolar.id
              }
            });
            
            const capacidad = seccion.capacidad || 30;
            const disponibles = Math.max(0, capacidad - estudiantesInscritos);
            
            cuposDisponibles[grado.id].secciones[seccion.id] = {
              nombre: seccion.nombre_seccion,
              capacidad: capacidad,
              ocupados: estudiantesInscritos,
              disponibles: disponibles
            };
            
            cuposDisponibles[grado.id].totalDisponibles += disponibles;
          }
        }
      }
      
      res.json({
        annoEscolar,
        cuposDisponibles
      });
    } catch (err) {
      console.error('Error en getCuposDisponibles:', err);
      res.status(500).json({ message: err.message });
    }
  },

  
  // Crear nueva inscripción
  createInscripcion: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const {
        estudianteID,
        representanteID,
        gradoID,
        annoEscolarID,
        observaciones
      } = req.body;
      
      // Validar que el estudiante existe y es de tipo estudiante
      const estudiante = await Personas.findOne({
        where: { id: estudianteID, tipo: 'estudiante' }
      });
      
      if (!estudiante) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Estudiante no encontrado o no es de tipo estudiante' });
      }
      
      // Validar que el representante existe y es de tipo representante
      const representante = await Personas.findOne({
        where: { id: representanteID, tipo: 'representante' }
      });
      
      if (!representante) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Representante no encontrado o no es de tipo representante' });
      }
      
      // Validar que el grado existe
      const grado = await Grados.findByPk(gradoID);
      
      if (!grado) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Grado no encontrado' });
      }
      
      // Validar que el año escolar existe
      const annoEscolar = await AnnoEscolar.findByPk(annoEscolarID);
      
      if (!annoEscolar) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Año escolar no encontrado' });
      }
      
      // Verificar si ya existe una inscripción para este estudiante en este año escolar
      const inscripcionExistente = await Inscripciones.findOne({
        where: {
          estudianteID,
          annoEscolarID
        }
      });
      
      if (inscripcionExistente) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: 'Ya existe una inscripción para este estudiante en este año escolar',
          inscripcion: inscripcionExistente
        });
      }
      
      // Buscar una sección con cupos disponibles
      const secciones = await Secciones.findAll({
        where: { gradoID }
      });
      
      let seccionAsignada = null;
      
      for (const seccion of secciones) {
        // Contar estudiantes inscritos en esta sección para el año escolar
        const estudiantesInscritos = await Seccion_Personas.count({
          where: {
            seccionID: seccion.id,
            annoEscolarID
          }
        });
        
        if (estudiantesInscritos < (seccion.capacidad || 30)) {
          seccionAsignada = seccion;
          break;
        }
      }
      
      if (!seccionAsignada) {
        await transaction.rollback();
        return res.status(400).json({ message: 'No hay cupos disponibles en ninguna sección para este grado' });
      }
      
      // Obtener el arancel de inscripción
      const arancelInscripcion = await db.Aranceles.findOne({
        where: {
          nombre: { [Op.like]: '%inscripci%' },
          activo: true
        }
      });
      
      const montoInscripcion = arancelInscripcion ? arancelInscripcion.monto : 0;
      
      // Crear la inscripción
      const nuevaInscripcion = await Inscripciones.create({
        estudianteID,
        representanteID,
        gradoID,
        seccionID: seccionAsignada.id,
        annoEscolarID,
        fechaInscripcion: new Date(),
        estado: 'pendiente',
        observaciones,
        montoInscripcion,
        pagado: false
      }, { transaction });
      
      // Asignar estudiante al grado
      await Grado_Personas.create({
        personaID: estudianteID,
        gradoID,
        annoEscolarID
      }, { transaction });
      
      // Asignar estudiante a la sección
      await Seccion_Personas.create({
        personaID: estudianteID,
        seccionID: seccionAsignada.id,
        annoEscolarID
      }, { transaction });
      
      await transaction.commit();
      
      // Obtener la inscripción completa con sus relaciones
      const inscripcionCompleta = await Inscripciones.findByPk(nuevaInscripcion.id, {
        include: [
          {
            model: Personas,
            as: 'estudiante',
            attributes: ['id', 'nombre', 'apellido', 'cedula']
          },
          {
            model: Personas,
            as: 'representante',
            attributes: ['id', 'nombre', 'apellido', 'cedula']
          },
          {
            model: Grados,
            as: 'grado'
          },
          {
            model: Secciones,
            as: 'Secciones'
          },
          {
            model: AnnoEscolar,
            as: 'annoEscolar'
          }
        ]
      });
      
      res.status(201).json({
        message: 'Inscripción creada correctamente',
        inscripcion: inscripcionCompleta
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  

  // Crear nuevo estudiante e inscripción en un solo paso
  crearNuevoEstudiante: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      console.log("Iniciando creación de nuevo estudiante");
      console.log("Archivos recibidos:", req.files ? Object.keys(req.files) : "No hay archivos");
      
      // ================== VALIDACIONES INICIALES ==================
      const annoEscolar = await AnnoEscolar.findOne({ 
        where: { activo: true },
        transaction 
      });
      if (!annoEscolar) {
        await transaction.rollback();
        return res.status(404).json({ message: 'No hay año escolar activo' });
      }

      // Extraer datos del body
      const { 
        cedula, nombre, apellido, fechaNacimiento, 
        lugarNacimiento, genero, direccion, gradoID, 
        observaciones, documentosCompletos
      } = req.body;

      // ================== VALIDAR ESTUDIANTE ==================
      if (await Personas.findOne({ where: { cedula, tipo: 'estudiante' }, transaction })) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Estudiante ya existe' });
      }

      // ================== REPRESENTANTE ==================
      const representanteData = {
        cedula: req.body.rep_cedula,
        nombre: req.body.rep_nombre,
        apellido: req.body.rep_apellido,
        telefono: req.body.rep_telefono,
        email: req.body.rep_email,
        direccion: req.body.rep_direccion,
        profesion: req.body.rep_profesion,
        tipo: 'representante'
      };

      let representante = await Personas.findOne({
        where: { cedula: representanteData.cedula, tipo: 'representante' },
        transaction
      });

      if (!representante) {
        representante = await Personas.create(representanteData, { transaction });
      }

      // ================== VALIDAR GRADO ==================
      const grado = await Grados.findByPk(gradoID, { transaction });
      if (!grado) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Grado no existe' });
      }

      // ================== CREAR ESTUDIANTE ==================
      const nuevoEstudiante = await Personas.create({
        cedula,
        nombre,
        apellido,
        fechaNacimiento,
        lugarNacimiento,
        genero,
        direccion,
        tipo: 'estudiante',
        observaciones
      }, { transaction });

      // ================== PROCESAR ARCHIVOS ==================
      // Convertir el string 'true'/'false' a booleano
      const tieneDocumentos = documentosCompletos === 'true';
      
      if (req.files && Object.keys(req.files).length > 0) {
        console.log("Procesando archivos...");
        const uploadDir = path.join(__dirname, '../uploads/documentos');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
      
        for (const fieldName of Object.keys(req.files)) {
          const file = req.files[fieldName];
          let personaID, tipoDocumento;
          
          console.log(`Procesando archivo: ${fieldName}, nombre: ${file.name}`);
      
          try {
            // Procesar representante/estudiante
            if (fieldName.includes('representante')) {
              tipoDocumento = fieldName.split('_').pop();
              personaID = representante.id;
            } else {
              tipoDocumento = fieldName.split('_').pop();
              personaID = nuevoEstudiante.id;
            }
      
            // Mover archivo
            const uniqueFilename = `${Date.now()}-${uuidv4()}-${file.name.replace(/\s+/g, '_')}`;
            const filePath = path.join(uploadDir, uniqueFilename);
            
            await file.mv(filePath);
      
            // Guardar en DB
            await Documentos.create({ 
              personaID,
              tipoDocumento,
              urlDocumento: `/uploads/documentos/${uniqueFilename}`,
              nombre_archivo: file.name,
              tamano: file.size,
              tipo_archivo: file.mimetype,
              descripcion: `Documento ${tipoDocumento} subido durante inscripción`
            }, { transaction });
      
          } catch (error) {
            console.error(`Error procesando archivo ${fieldName}:`, error);
            await transaction.rollback();
            return res.status(500).json({ 
              message: `Error al procesar el archivo ${fieldName}: ${error.message}`
            });
          }
        }
      } else {
        console.log("No se recibieron archivos para procesar");
      }

      // ================== ASIGNAR SECCIÓN ==================
      const seccionAsignada = await Secciones.findOne({
        where: {
          gradoID,
          capacidad: { [Op.gt]: literal('(SELECT COUNT(*) FROM `Seccion_Personas` WHERE `seccionID` = `Secciones`.`id`)') }
        },
        transaction
      });

      if (!seccionAsignada) {
        await transaction.rollback();
        return res.status(400).json({ message: 'No hay cupos disponibles' });
      }

      // ================== CREAR INSCRIPCIÓN ==================
      // Obtener el arancel de inscripción
      const arancelInscripcion = await db.Aranceles.findOne({ 
        where: { nombre: { [Op.like]: '%inscripci%' }, activo: true }, 
        transaction 
      });
      
      const montoInscripcion = arancelInscripcion?.monto || 0;

      // IMPORTANTE: Usar el valor de documentosCompletos que viene del frontend
      const inscripcion = await Inscripciones.create({
        estudianteID: nuevoEstudiante.id,
        representanteID: representante.id,
        gradoID,
        seccionID: seccionAsignada.id,
        annoEscolarID: annoEscolar.id,
        fechaInscripcion: new Date(),
        estado: 'pendiente',
        observaciones,
        documentosCompletos: tieneDocumentos,
        pagoInscripcionCompletado: false,
        montoInscripcion
      }, { transaction });

      await Promise.all([
        Grado_Personas.create({
          personaID: nuevoEstudiante.id,
          gradoID,
          annoEscolarID: annoEscolar.id
        }, { transaction }),

        Seccion_Personas.create({
          personaID: nuevoEstudiante.id,
          seccionID: seccionAsignada.id,
          annoEscolarID: annoEscolar.id
        }, { transaction })
      ]);

      // ================== CREAR PAGO PENDIENTE ==================
      // Verificar si existe un método de pago por defecto para inscripciones
      const metodoPagoDefault = await db.MetodoPagos.findOne({
        where: { nombre: { [Op.like]: '%transferencia%' }, activo: true },
        transaction
      }) || await db.MetodoPagos.findOne({
        where: { activo: true },
        transaction
      });

      if (arancelInscripcion) {
        // Crear un pago pendiente para la inscripción
        await PagoEstudiantes.create({
          // personaID: nuevoEstudiante.id,
          estudianteID: nuevoEstudiante.id,
          representanteID: representante.id,
          arancelID: arancelInscripcion.id,
          metodoPagoID: metodoPagoDefault ? metodoPagoDefault.id : null,
          inscripcionID: inscripcion.id,
          monto: montoInscripcion,
          fechaPago: new Date(),
          estado: 'pendiente',
          observaciones: 'Pago de inscripción pendiente de verificación',
          annoEscolarID: annoEscolar.id
        }, { transaction });
      }

      // ================== CONFIRMAR TRANSACCIÓN ==================
      await transaction.commit();

      res.status(201).json({
        message: 'Estudiante inscrito correctamente',
        estudiante: nuevoEstudiante,
        inscripcionId: inscripcion.id
      });

    } catch (err) {
      await transaction.rollback();
      console.error('Error general:', err);
      res.status(500).json({ 
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  },

  // Añadir este método al controlador de inscripciones
  updateInscripcionDocumentos: async (req, res) => {
    try {
      const { id } = req.params;
      const { documentosCompletos } = req.body;
      
      const inscripcion = await Inscripciones.findByPk(id);
      
      if (!inscripcion) {
        return res.status(404).json({ message: 'Inscripción no encontrada' });
      }
      
      await inscripcion.update({
        documentosCompletos: documentosCompletos === true || documentosCompletos === 'true'
      });
      
      res.json({
        message: 'Estado de documentos actualizado correctamente',
        inscripcion
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  
  // Actualizar estado de inscripción
  updateEstadoInscripcion: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, observaciones } = req.body;
      
      const inscripcion = await Inscripciones.findByPk(id);
      
      if (!inscripcion) {
        return res.status(404).json({ message: 'Inscripción no encontrada' });
      }
      
      // Validar estado
      if (!['pendiente', 'inscrito', 'retirado', 'graduado', 'aprobado', 'rechazado'].includes(estado)) {
        return res.status(400).json({ message: 'Estado no válido' });
      }
      
      await inscripcion.update({
        estado,
        observaciones: observaciones || inscripcion.observaciones
      });
      
      res.json({
        message: `Estudiante ${estado} correctamente`,
        inscripcion
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },

  // Actualizar datos de inscripción (grado, sección, etc.)
  updateInscripcionData: async (req, res) => {
    try {
      const { id } = req.params;
      const { gradoID, seccionID, observaciones } = req.body;
      
      const inscripcion = await Inscripciones.findByPk(id);
      
      if (!inscripcion) {
        return res.status(404).json({ message: 'Inscripción no encontrada' });
      }
      
      // Verificar que el grado existe si se proporciona
      if (gradoID) {
        const grado = await db.Grados.findByPk(gradoID);
        if (!grado) {
          return res.status(404).json({ message: 'Grado no encontrado' });
        }
      }
      
      // Verificar que la sección existe si se proporciona
      if (seccionID) {
        const seccion = await db.Secciones.findByPk(seccionID);
        if (!seccion) {
          return res.status(404).json({ message: 'Sección no encontrada' });
        }
      }
      
      // Actualizar los campos proporcionados
      const updateData = {};
      if (gradoID !== undefined) updateData.gradoID = gradoID;
      if (seccionID !== undefined) updateData.seccionID = seccionID;
      if (observaciones !== undefined) updateData.observaciones = observaciones;
      
      await inscripcion.update(updateData);
      
      // Obtener la inscripción actualizada con sus relaciones
      const updatedInscripcion = await Inscripciones.findByPk(id, {
        include: [
          {
            model: db.Personas,
            as: 'estudiante'
          },
          {
            model: db.Personas,
            as: 'representante'
          },
          {
            model: db.AnnoEscolar,
            as: 'annoEscolar'
          },
          {
            model: db.Grados,
            as: 'grado'
          },
          {
            model: db.Secciones,
            as: 'Secciones'
          }
        ]
      });
      
      res.json({
        message: 'Datos de inscripción actualizados correctamente',
        inscripcion: updatedInscripcion
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Registrar pago de inscripción
  registrarPagoInscripcion: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { id } = req.params;
      const { metodoPagoID, referencia, monto, fecha } = req.body;
      
      const inscripcion = await Inscripciones.findByPk(id);
      
      if (!inscripcion) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Inscripción no encontrada' });
      }
      
      // Validar método de pago
      const metodoPago = await db.MetodoPagos.findByPk(metodoPagoID);
      
      if (!metodoPago) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Método de pago no encontrado' });
      }
      
      // Obtener el arancel de inscripción
      const arancelInscripcion = await db.Aranceles.findOne({
        where: {
          nombre: { [Op.like]: '%inscripci%' },
          activo: true
        }
      });
      
      if (!arancelInscripcion) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Arancel de inscripción no encontrado' });
      }
      
      // Crear el pago
      const pago = await PagoEstudiantes.create({
        personaID: inscripcion.estudianteID,
        arancelID: arancelInscripcion.id,
        metodoPagoID,
        inscripcionID: inscripcion.id,
        monto: monto || inscripcion.montoInscripcion,
        referencia,
        fecha: fecha || new Date(),
        estado: 'procesado',
        observaciones: 'Pago de inscripción'
      }, { transaction });
      
      // Actualizar estado de inscripción
      await inscripcion.update({
        pagado: true
      }, { transaction });
      
      await transaction.commit();
      
      res.json({
        message: 'Pago de inscripción registrado correctamente',
        pago
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener comprobante de inscripción
  getComprobanteInscripcion: async (req, res) => {
    try {
      const { id } = req.params;
      
      const inscripcion = await Inscripciones.findByPk(id, {
        include: [
          {
            model: Personas,
            as: 'estudiante',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'fechaNacimiento', 'genero', 'direccion']
          },
          {
            model: Personas,
            as: 'representante',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'email', 'telefono', 'direccion']
          },
          {
            model: Grados,
            as: 'grado'
          },
          {
            model: Secciones,
            as: 'Secciones'
          },
          {
            model: AnnoEscolar,
            as: 'annoEscolar'
          },
          {
            model: PagoEstudiantes,
            as: 'pagos',
            include: [
              {
                model: db.Aranceles,
                as: 'arancel'
              },
              {
                model: db.MetodoPagos,
                as: 'metodoPago'
              }
            ]
          }
        ]
      });
      
      if (!inscripcion) {
        return res.status(404).json({ message: 'Inscripción no encontrada' });
      }
      
      // Obtener documentos del estudiante
      const documentos = await Documentos.findAll({
        where: { personaID: inscripcion.estudianteID }
      });
      
      res.json({
        inscripcion,
        documentos,
        fechaComprobante: new Date()
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
 // Eliminar inscripción
 deleteInscripcion: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { id } = req.params;
      
      const inscripcion = await Inscripciones.findByPk(id);
      
      if (!inscripcion) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Inscripción no encontrada' });
      }
      
      // Verificar si hay pagos asociados
      const pagos = await PagoEstudiantes.count({
        where: { inscripcionID: id }
      });
      
      if (pagos > 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'No se puede eliminar la inscripción porque tiene pagos asociados' });
      }
      
      // Eliminar asignaciones de grado y sección
      await Grado_Personas.destroy({
        where: {
          personaID: inscripcion.estudianteID,
          annoEscolarID: inscripcion.annoEscolarID
        },
        transaction
      });
      
      await Seccion_Personas.destroy({
        where: {
          personaID: inscripcion.estudianteID,
          annoEscolarID: inscripcion.annoEscolarID
        },
        transaction
      });
      
      // Eliminar la inscripción
      await inscripcion.destroy({ transaction });
      
      await transaction.commit();
      
      res.json({ message: 'Inscripción eliminada correctamente' });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = inscripcionController;