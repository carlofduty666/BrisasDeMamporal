const db = require('../models');
const Inscripcion = db.Inscripcion;
const Personas = db.Personas;
const Grados = db.Grados;
const Secciones = db.Secciones;
const AnnoEscolar = db.AnnoEscolar;
const Documentos = db.Documentos;
const PagoEstudiantes = db.PagoEstudiantes;
const Grado_Personas = db.Grado_Personas;
const Seccion_Personas = db.Seccion_Personas;
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const inscripcionController = {
  // Obtener todas las inscripciones
  getAllInscripciones: async (req, res) => {
    try {
      const { annoEscolarID, estado } = req.query;
      
      const whereClause = {};
      if (annoEscolarID) whereClause.annoEscolarID = annoEscolarID;
      if (estado) whereClause.estado = estado;
      
      const inscripciones = await Inscripcion.findAll({
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
            as: 'seccion'
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
      
      const inscripciones = await Inscripcion.findAll({
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
            as: 'seccion'
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
      
      const inscripcion = await Inscripcion.findByPk(id, {
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
            as: 'seccion'
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
            as: 'secciones'
          }
        ]
      });
      
      // Calcular cupos disponibles por grado y sección
      const cuposDisponibles = {};
      
      for (const grado of grados) {
        cuposDisponibles[grado.id] = {
          nombre: grado.nombre_grado,
          secciones: {}
        };
        
        for (const seccion of grado.secciones) {
          // Contar estudiantes inscritos en esta sección para el año escolar activo
          const estudiantesInscritos = await Seccion_Personas.count({
            where: {
              seccionID: seccion.id,
              annoEscolarID: annoEscolar.id
            }
          });
          
          cuposDisponibles[grado.id].secciones[seccion.id] = {
            nombre: seccion.nombre_seccion,
            capacidad: seccion.capacidad || 30, // Valor por defecto si no está definido
            ocupados: estudiantesInscritos,
            disponibles: (seccion.capacidad || 30) - estudiantesInscritos
          };
        }
        
        // Calcular total de cupos disponibles para el grado
        cuposDisponibles[grado.id].totalDisponibles = Object.values(cuposDisponibles[grado.id].secciones)
          .reduce((total, seccion) => total + seccion.disponibles, 0);
      }
      
      res.json({
        annoEscolar,
        cuposDisponibles
      });
    } catch (err) {
      console.error(err);
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
      const inscripcionExistente = await Inscripcion.findOne({
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
      const nuevaInscripcion = await Inscripcion.create({
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
      const inscripcionCompleta = await Inscripcion.findByPk(nuevaInscripcion.id, {
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
            as: 'seccion'
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
      const { 
        cedula, nombre, apellido, fechaNacimiento, 
        lugarNacimiento, genero, direccion, gradoID, 
        observaciones, representanteID 
      } = req.body;
      
      // Obtener el año escolar activo
      const annoEscolar = await AnnoEscolar.findOne({
        where: { activo: true }
      });
      
      if (!annoEscolar) {
        await transaction.rollback();
        return res.status(404).json({ message: 'No hay un año escolar activo' });
      }
      
      // Verificar si ya existe un estudiante con la misma cédula
      const estudianteExistente = await Personas.findOne({
        where: { cedula, tipo: 'estudiante' }
      });
      
      if (estudianteExistente) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Ya existe un estudiante con esta cédula' });
      }
      
      // Validar que el representante existe
      const representante = await Personas.findOne({
        where: { id: representanteID, tipo: 'representante' }
      });
      
      if (!representante) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Representante no encontrado' });
      }
      
      // Validar que el grado existe
      const grado = await Grados.findByPk(gradoID);
      
      if (!grado) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Grado no encontrado' });
      }
      
      // Crear el estudiante
      const nuevoEstudiante = await Personas.create({
        cedula,
        nombre,
        apellido,
        fechaNacimiento,
        lugarNacimiento,
        genero,
        direccion,
        tipo: 'estudiante',
        representanteID,
        observaciones
      }, { transaction });
      
      // Procesar documentos
      const documentosSubidos = [];
      const uploadDir = path.join(__dirname, '../uploads/documentos');
      
      // Asegurarse de que la carpeta existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Procesar cada documento
      if (req.files) {
        for (const fieldName in req.files) {
          if (fieldName.startsWith('documento_')) {
            const file = req.files[fieldName];
            const tipoDocumento = fieldName.replace('documento_', '');
            
            // Generar nombre único para el archivo
            const uniqueFilename = `${uuidv4()}${path.extname(file.name)}`;
            const filePath = path.join(uploadDir, uniqueFilename);
            
            // Guardar el archivo
            await new Promise((resolve, reject) => {
              fs.writeFile(filePath, file.data, (err) => {
                if (err) reject(err);
                else resolve();
              });
            });
            
            // Crear registro en la base de datos
            const documento = await Documentos.create({
              personaID: nuevoEstudiante.id,
              tipoDocumento,
              urlDocumento: `/uploads/documentos/${uniqueFilename}`,
              descripcion: `Documento de inscripción: ${tipoDocumento}`
            }, { transaction });
            
            documentosSubidos.push(documento);
          }
        }
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
            annoEscolarID: annoEscolar.id
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
      const nuevaInscripcion = await Inscripcion.create({
        estudianteID: nuevoEstudiante.id,
        representanteID,
        gradoID,
        seccionID: seccionAsignada.id,
        annoEscolarID: annoEscolar.id,
        fechaInscripcion: new Date(),
        estado: 'pendiente',
        observaciones,
        montoInscripcion,
        pagado: false
      }, { transaction });
      
      // Asignar estudiante al grado
      await Grado_Personas.create({
        personaID: nuevoEstudiante.id,
        gradoID,
        annoEscolarID: annoEscolar.id
      }, { transaction });
      
      // Asignar estudiante a la sección
      await Seccion_Personas.create({
        personaID: nuevoEstudiante.id,
        seccionID: seccionAsignada.id,
        annoEscolarID: annoEscolar.id
      }, { transaction });
      
      await transaction.commit();
      
      res.status(201).json({
        message: 'Estudiante inscrito correctamente',
        estudiante: nuevoEstudiante,
        inscripcion: nuevaInscripcion,
        documentos: documentosSubidos,
        inscripcionId: nuevaInscripcion.id
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Actualizar estado de inscripción
  updateEstadoInscripcion: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, observaciones } = req.body;
      
      const inscripcion = await Inscripcion.findByPk(id);
      
      if (!inscripcion) {
        return res.status(404).json({ message: 'Inscripción no encontrada' });
      }
      
      // Validar estado
      if (!['pendiente', 'aprobada', 'rechazada'].includes(estado)) {
        return res.status(400).json({ message: 'Estado no válido' });
      }
      
      await inscripcion.update({
        estado,
        observaciones: observaciones || inscripcion.observaciones
      });
      
      res.json({
        message: `Inscripción ${estado} correctamente`,
        inscripcion
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
      
      const inscripcion = await Inscripcion.findByPk(id);
      
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
      
      const inscripcion = await Inscripcion.findByPk(id, {
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
            as: 'seccion'
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
      
      const inscripcion = await Inscripcion.findByPk(id);
      
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