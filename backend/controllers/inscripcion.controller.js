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
            as: 'Secciones'
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
      // Extraer datos del estudiante
      const { 
        cedula, nombre, apellido, fechaNacimiento, 
        lugarNacimiento, genero, direccion, gradoID, 
        observaciones
      } = req.body;
      
      // Datos del representante (con prefijo rep_)
      const representanteData = {
        cedula: req.body.rep_cedula,
        nombre: req.body.rep_nombre,
        apellido: req.body.rep_apellido,
        telefono: req.body.rep_telefono,
        email: req.body.rep_email,
        direccion: req.body.rep_direccion,
        profesion: req.body.rep_profesion,
        // lugarTrabajo: req.body.rep_lugarTrabajo,
        tipo: 'representante'
      };
      
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
      
      // Verificar si el representante ya existe o crear uno nuevo
      let representante = await Personas.findOne({
        where: { cedula: representanteData.cedula, tipo: 'representante' }
      });
      
      if (!representante) {
        representante = await Personas.create(representanteData, { transaction });
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
        representanteID: representante.id,
        observaciones
      }, { transaction });
      
      // Procesar documentos
      const documentosSubidos = [];
      
      // Procesar documentos del estudiante
      if (req.files) {
        // Iterar sobre todos los archivos subidos
        for (const fieldName in req.files) {
          if (fieldName.startsWith('documento_') && !fieldName.includes('representante')) {
            const files = req.files[fieldName];
            if (files && files.length > 0) {
              const file = files[0]; // Tomamos el primer archivo
              const tipoDocumento = fieldName.replace('documento_', '');
              
              // Crear registro en la base de datos
              const documento = await Documentos.create({
                personaID: nuevoEstudiante.id,
                tipoDocumento,
                urlDocumento: file.path.replace(/\\/g, '/').replace('backend/', '/'),
                descripcion: `Documento de inscripción: ${tipoDocumento}`
              }, { transaction });
              
              documentosSubidos.push(documento);
            }
          }
          
          // Procesar documentos del representante
          if (fieldName.includes('documento_representante')) {
            const files = req.files[fieldName];
            if (files && files.length > 0) {
              const file = files[0]; // Tomamos el primer archivo
              const tipoDocumento = fieldName.replace('documento_representante_', '');
              
              // Crear registro en la base de datos
              await Documentos.create({
                personaID: representante.id,
                tipoDocumento,
                urlDocumento: file.path.replace(/\\/g, '/').replace('backend/', '/'),
                descripcion: `Documento de representante: ${tipoDocumento}`
              }, { transaction });
            }
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
        representanteID: representante.id,
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