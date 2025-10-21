const db = require('../models');
const Secciones = db.Secciones;
const Grados = db.Grados;
const Personas = db.Personas;
const Seccion_Personas = db.Seccion_Personas;
const AnnoEscolar = db.AnnoEscolar;
const { Op } = require('sequelize');

const seccionesController = {
  // Obtener todas las secciones
  getAllSecciones: async (req, res) => {
    try {
      const secciones = await Secciones.findAll({
        include: [
          {
            model: Grados,
            as: 'Grados',
            include: [
              {
                model: db.Niveles,
                as: 'Niveles'
              }
            ]
          }
        ],
        order: [
          ['gradoID', 'ASC'],
          ['nombre_seccion', 'ASC']
        ]
      });
    
    // Enriquecer los datos con información adicional
    const seccionesConInfo = secciones.map(seccion => {
      const seccionData = seccion.toJSON();
      
      // Añadir información del grado y nivel directamente
      if (seccionData.grado) {
        seccionData.nombreGrado = seccionData.grado.nombre_grado;
        
        if (seccionData.grado.nivel) {
          seccionData.nombreNivel = seccionData.grado.nivel.nombre_nivel;
        }
      }
      
      return seccionData;
    });
    
    res.json(seccionesConInfo);
  } catch (err) {
    console.error('Error al obtener secciones:', err);
    res.status(500).json({ message: err.message });
  }
},



  
  // Obtener secciones públicas (sin autenticación)
  getSeccionesPublicas: async (req, res) => {
    try {
      const secciones = await Secciones.findAll({
        where: { activo: true },
        include: [
          {
            model: Grados,
            as: 'Grados'
          }
        ],
        attributes: ['id', 'nombre_seccion', 'gradoID', 'capacidad'],
        order: [
          ['gradoID', 'ASC'],
          ['nombre_seccion', 'ASC']
        ]
      });
      
      res.json(secciones);
    } catch (err) {
      console.error('Error al obtener secciones públicas:', err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener sección por ID
  getSeccionById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const seccion = await Secciones.findByPk(id, {
        include: [
          {
            model: Grados,
            as: 'Grados'
          }
        ]
      });
      
      if (!seccion) {
        return res.status(404).json({ message: 'Sección no encontrada' });
      }
      
      res.json(seccion);
    } catch (err) {
      console.error('Error al obtener sección por ID:', err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener secciones por grado
  getSeccionesByGrado: async (req, res) => {
    try {
      const { gradoID } = req.params;
      
      const secciones = await Secciones.findAll({
        where: { gradoID },
        include: [
          {
            model: Grados,
            as: 'Grados',
            include: [
              {
                model: db.Niveles,
                as: 'Niveles'
              }
            ]
          }
        ],
        order: [['nombre_seccion', 'ASC']]
      });
      
      res.json(secciones);
    } catch (err) {
      console.error('Error al obtener secciones por grado:', err);
      res.status(500).json({ message: err.message });
    }
  },
  // Obtener secciones por estudiante
  getSeccionesByEstudiante: async (req, res) => {
    try {
      const { id } = req.params;
      const { annoEscolarID } = req.query;
      
      if (!annoEscolarID) {
        return res.status(400).json({ message: 'Se requiere el ID del año escolar' });
      }
      
      // Verificar que el estudiante existe
      const estudiante = await db.Personas.findOne({
        where: { id, tipo: 'estudiante' }
      });
      
      if (!estudiante) {
        return res.status(404).json({ message: 'Estudiante no encontrado' });
      }
      
      // Obtener las secciones del estudiante para el año escolar especificado
      const secciones = await db.Secciones.findAll({
        include: [
          {
            model: db.Personas,
            as: 'personas',
            where: { id },
            through: {
              model: db.Seccion_Personas,
              where: { annoEscolarID },
              attributes: []
            },
            attributes: []
          },
          {
            model: db.Grados,
            as: 'Grados',
            include: [
              {
                model: db.Niveles,
                as: 'Niveles'
              }
            ]
          }
        ]
      });
      
      res.json(secciones);
    } catch (err) {
      console.error('Error al obtener secciones por estudiante:', err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Crear nueva sección
  createSeccion: async (req, res) => {
    try {
      const { nombre_seccion, gradoID, capacidad, activo } = req.body;
      
      // Validar que el grado existe
      const grado = await Grados.findByPk(gradoID);
      
      if (!grado) {
        return res.status(404).json({ message: 'Grado no encontrado' });
      }
      
      // Verificar si ya existe una sección con el mismo nombre en el mismo grado
      const seccionExistente = await Secciones.findOne({
        where: {
          nombre_seccion,
          gradoID
        }
      });
      
      if (seccionExistente) {
        return res.status(400).json({ message: 'Ya existe una sección con este nombre en el grado seleccionado' });
      }
      
      // Crear la sección
      const nuevaSeccion = await Secciones.create({
        nombre_seccion,
        gradoID,
        capacidad: capacidad || 30,
        activo: activo !== undefined ? activo : true
      });
      
      // Obtener la sección creada con sus relaciones
      const seccionConRelaciones = await Secciones.findByPk(nuevaSeccion.id, {
        include: [
          {
            model: Grados,
            as: 'Grados'
          }
        ]
      });
      
      res.status(201).json(seccionConRelaciones);
    } catch (err) {
      console.error('Error al crear sección:', err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Actualizar sección
  updateSeccion: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre_seccion, gradoID, capacidad, activo } = req.body;
      
      // Verificar que la sección existe
      const seccion = await Secciones.findByPk(id);
      
      if (!seccion) {
        return res.status(404).json({ message: 'Sección no encontrada' });
      }
      
      // Validar que el grado existe
      if (gradoID) {
        const grado = await Grados.findByPk(gradoID);
        
        if (!grado) {
          return res.status(404).json({ message: 'Grado no encontrado' });
        }
      }
      
      // Verificar si ya existe otra sección con el mismo nombre en el mismo grado
      if (nombre_seccion && gradoID) {
        const seccionExistente = await Secciones.findOne({
          where: {
            nombre_seccion,
            gradoID,
            id: { [Op.ne]: id }
          }
        });
        
        if (seccionExistente) {
          return res.status(400).json({ message: 'Ya existe otra sección con este nombre en el grado seleccionado' });
        }
      }
      
      // Actualizar la sección
      await seccion.update({
        nombre_seccion: nombre_seccion || seccion.nombre_seccion,
        gradoID: gradoID || seccion.gradoID,
        capacidad: capacidad !== undefined ? capacidad : seccion.capacidad,
        activo: activo !== undefined ? activo : seccion.activo
      });
      
      // Obtener la sección actualizada con sus relaciones
      const seccionActualizada = await Secciones.findByPk(id, {
        include: [
          {
            model: Grados,
            as: 'Grados'
          }
        ]
      });
      
      res.json(seccionActualizada);
    } catch (err) {
      console.error('Error al actualizar sección:', err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Eliminar sección
  deleteSeccion: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar que la sección existe
      const seccion = await Secciones.findByPk(id);
      
      if (!seccion) {
        return res.status(404).json({ message: 'Sección no encontrada' });
      }
      
      // Verificar si hay estudiantes asignados a esta sección
      const estudiantesAsignados = await Seccion_Personas.count({
        where: { seccionID: id }
      });
      
      if (estudiantesAsignados > 0) {
        return res.status(400).json({ 
          message: 'No se puede eliminar la sección porque tiene estudiantes asignados',
          estudiantesAsignados
        });
      }
      
      // Eliminar la sección
      await seccion.destroy();
      
      res.json({ message: 'Sección eliminada correctamente' });
    } catch (err) {
      console.error('Error al eliminar sección:', err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener estudiantes por sección
  getEstudiantesBySeccion: async (req, res) => {
    try {
      const { id } = req.params;
      const { annoEscolarID } = req.query;
      
      // Verificar que la sección existe
      const seccion = await Secciones.findByPk(id);
      
      if (!seccion) {
        return res.status(404).json({ message: 'Sección no encontrada' });
      }
      
      // Obtener el año escolar si no se proporciona
      let idAnnoEscolar = annoEscolarID;
      
      if (!idAnnoEscolar) {
        const annoEscolarActivo = await AnnoEscolar.findOne({
          where: { activo: true }
        });
        
        if (annoEscolarActivo) {
          idAnnoEscolar = annoEscolarActivo.id;
        }
      }
      
      // Construir la consulta
      const whereClause = { seccionID: id };
      
      if (idAnnoEscolar) {
        whereClause.annoEscolarID = idAnnoEscolar;
      }
      
      // Obtener los IDs de los estudiantes asignados a la sección
      const asignaciones = await Seccion_Personas.findAll({
        where: whereClause,
        attributes: ['personaID']
      });
      
      const estudianteIDs = asignaciones.map(asignacion => asignacion.personaID);
      
      // Obtener los datos de los estudiantes
      const estudiantes = await Personas.findAll({
        where: {
          id: { [Op.in]: estudianteIDs },
          tipo: 'estudiante'
        },
        attributes: ['id', 'nombre', 'apellido', 'cedula', 'fechaNacimiento', 'genero']
      });
      
      res.json(estudiantes);
    } catch (err) {
      console.error('Error al obtener estudiantes por sección:', err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Asignar estudiante a sección
  asignarEstudianteASeccion: async (req, res) => {
    try {
      const { estudianteID, seccionID, annoEscolarID } = req.body;
      
      // Validar que el estudiante existe
      const estudiante = await Personas.findOne({
        where: { id: estudianteID, tipo: 'estudiante' }
      });
      
      if (!estudiante) {
        return res.status(404).json({ message: 'Estudiante no encontrado' });
      }
      
      // Validar que la sección existe
      const seccion = await Secciones.findByPk(seccionID);
      
      if (!seccion) {
        return res.status(404).json({ message: 'Sección no encontrada' });
      }
      
      // Validar que el año escolar existe
      const annoEscolar = await AnnoEscolar.findByPk(annoEscolarID);
      
      if (!annoEscolar) {
        return res.status(404).json({ message: 'Año escolar no encontrado' });
      }
      
      // Verificar si el estudiante ya está asignado a esta sección en este año escolar
      const asignacionExistente = await Seccion_Personas.findOne({
        where: {
          personaID: estudianteID,
          seccionID,
          annoEscolarID
        }
      });
      
      if (asignacionExistente) {
        return res.status(400).json({ message: 'El estudiante ya está asignado a esta sección' });
      }
      
      // Verificar si el estudiante ya está asignado a CUALQUIER sección en este año escolar
      const otraAsignacion = await Seccion_Personas.findOne({
        where: {
          personaID: estudianteID,
          annoEscolarID
        }
      });
      
      if (otraAsignacion) {
        // Obtener el nombre de la sección para el mensaje de error
        const seccionActual = await Secciones.findByPk(otraAsignacion.seccionID);
        
        return res.status(400).json({ 
          message: `El estudiante ya está asignado a la sección ${seccionActual ? seccionActual.nombre_seccion : otraAsignacion.seccionID} en este año escolar`,
          seccionActual: otraAsignacion.seccionID
        });
      }
      
      // Verificar capacidad de la sección
      const estudiantesEnSeccion = await Seccion_Personas.count({
        where: {
          seccionID,
          annoEscolarID
        }
      });
      
      if (estudiantesEnSeccion >= seccion.capacidad) {
        return res.status(400).json({ message: 'La sección ha alcanzado su capacidad máxima' });
      }
      
      // Crear la asignación
      const nuevaAsignacion = await Seccion_Personas.create({
        personaID: estudianteID,
        seccionID,
        annoEscolarID
      });
      
      res.status(201).json({
        message: 'Estudiante asignado correctamente a la sección',
        asignacion: nuevaAsignacion
      });
    } catch (err) {
      console.error('Error al asignar estudiante a sección:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Transferir estudiantes entre secciones
  transferirEstudiantes: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { estudiantesIDs, seccionDestinoID, annoEscolarID } = req.body;
      
      if (!estudiantesIDs || !Array.isArray(estudiantesIDs) || estudiantesIDs.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Se requiere al menos un estudiante para transferir' });
      }
      
      if (!seccionDestinoID) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Se requiere una sección de destino' });
      }
      
      if (!annoEscolarID) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Se requiere el ID del año escolar' });
      }
      
      // Verificar que la sección de destino existe
      const seccionDestino = await db.Secciones.findByPk(seccionDestinoID);
      if (!seccionDestino) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Sección de destino no encontrada' });
      }
      
      // Verificar capacidad de la sección destino
      const estudiantesEnSeccionDestino = await db.Seccion_Personas.count({
        where: {
          seccionID: seccionDestinoID,
          annoEscolarID
        }
      });
      
      if (estudiantesEnSeccionDestino + estudiantesIDs.length > seccionDestino.capacidad) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `La sección destino no tiene capacidad suficiente. Capacidad: ${seccionDestino.capacidad}, Ocupados: ${estudiantesEnSeccionDestino}, Solicitados: ${estudiantesIDs.length}` 
        });
      }
      
      // Procesar cada estudiante
      for (const estudianteID of estudiantesIDs) {
        // Verificar que el estudiante existe
        const estudiante = await db.Personas.findOne({
          where: { id: estudianteID, tipo: 'estudiante' }
        });
        
        if (!estudiante) {
          continue; // Saltamos este estudiante si no existe
        }
        
        // Buscar la asignación actual del estudiante
        const asignacionActual = await db.Seccion_Personas.findOne({
          where: {
            personaID: estudianteID,
            annoEscolarID
          }
        });
        
        if (asignacionActual) {
          // Si ya está en la sección destino, no hacemos nada
          if (asignacionActual.seccionID === seccionDestinoID) {
            continue;
          }
          
          // Eliminar asignación actual
          await asignacionActual.destroy({ transaction });
        }
        
        // Crear nueva asignación
        await db.Seccion_Personas.create({
          personaID: estudianteID,
          seccionID: seccionDestinoID,
          annoEscolarID
        }, { transaction });
        
        // Actualizar la inscripción si existe
        const inscripcion = await db.Inscripciones.findOne({
          where: {
            estudianteID,
            annoEscolarID
          }
        });
        
        if (inscripcion) {
          await inscripcion.update({
            seccionID: seccionDestinoID
          }, { transaction });
        }
      }
      
      await transaction.commit();
      
      res.status(200).json({
        message: `${estudiantesIDs.length} estudiante(s) transferido(s) correctamente a la sección ${seccionDestino.nombre_seccion}`
      });
      
    } catch (err) {
      await transaction.rollback();
      console.error('Error al transferir estudiantes:', err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Transferir múltiples estudiantes entre secciones (masivo)
  transferirEstudiantesMasivoSecciones: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { estudiantesIDs, seccionOrigenID, seccionDestinoID, annoEscolarID } = req.body;
      
      if (!estudiantesIDs || !Array.isArray(estudiantesIDs) || estudiantesIDs.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Se requiere al menos un estudiante para transferir' });
      }
      
      if (!seccionDestinoID) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Se requiere una sección de destino' });
      }
      
      if (!annoEscolarID) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Se requiere el ID del año escolar' });
      }
      
      // Verificar que la sección de destino existe
      const seccionDestino = await db.Secciones.findByPk(seccionDestinoID, { transaction });
      if (!seccionDestino) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Sección de destino no encontrada' });
      }
      
      // Verificar capacidad de la sección destino
      const estudiantesEnSeccionDestino = await db.Seccion_Personas.count({
        where: {
          seccionID: seccionDestinoID,
          annoEscolarID
        },
        transaction
      });
      
      if (estudiantesEnSeccionDestino + estudiantesIDs.length > seccionDestino.capacidad) {
        await transaction.rollback();
        return res.status(400).json({ 
          message: `La sección destino no tiene capacidad suficiente. Capacidad: ${seccionDestino.capacidad}, Ocupados: ${estudiantesEnSeccionDestino}, Solicitados: ${estudiantesIDs.length}` 
        });
      }
      
      const transferencias = [];
      const errores = [];
      
      // Procesar cada estudiante
      for (const estudianteID of estudiantesIDs) {
        try {
          // Verificar que el estudiante existe
          const estudiante = await db.Personas.findOne({
            where: { id: estudianteID, tipo: 'estudiante' },
            transaction
          });
          
          if (!estudiante) {
            errores.push({ estudianteID, error: 'Estudiante no encontrado' });
            continue;
          }
          
          // Buscar la asignación actual del estudiante
          const asignacionActual = await db.Seccion_Personas.findOne({
            where: {
              personaID: estudianteID,
              annoEscolarID
            },
            transaction
          });
          
          if (!asignacionActual) {
            errores.push({ estudianteID, error: 'No tiene sección asignada' });
            continue;
          }
          
          // Si ya está en la sección destino, no hacemos nada
          if (asignacionActual.seccionID === seccionDestinoID) {
            errores.push({ estudianteID, error: 'Ya está asignado a la sección destino' });
            continue;
          }
          
          // Eliminar asignación actual
          await asignacionActual.destroy({ transaction });
          
          // Crear nueva asignación
          await db.Seccion_Personas.create({
            personaID: estudianteID,
            seccionID: seccionDestinoID,
            annoEscolarID
          }, { transaction });
          
          // Actualizar la inscripción si existe
          const inscripcion = await db.Inscripciones.findOne({
            where: {
              estudianteID,
              annoEscolarID
            },
            transaction
          });
          
          if (inscripcion) {
            await inscripcion.update({
              seccionID: seccionDestinoID
            }, { transaction });
          }
          
          transferencias.push(estudianteID);
          
        } catch (err) {
          errores.push({ estudianteID, error: err.message });
        }
      }
      
      await transaction.commit();
      
      res.status(200).json({
        message: `${transferencias.length} estudiante(s) transferido(s) correctamente a la sección ${seccionDestino.nombre_seccion}`,
        estudiantesTransferidos: transferencias,
        errores: errores.length > 0 ? errores : undefined
      });
      
    } catch (err) {
      await transaction.rollback();
      console.error('Error al transferir estudiantes masivamente entre secciones:', err);
      res.status(500).json({ message: err.message });
    }
  },

  // Eliminar estudiante de sección
  removeEstudianteFromSeccion: async (req, res) => {
    try {
      const { seccionID, estudianteID, annoEscolarID } = req.params;
      
      // Verificar que la asignación existe
      const asignacion = await Seccion_Personas.findOne({
        where: {
          personaID: estudianteID,
          seccionID,
          annoEscolarID
        }
      }); 
      
      if (!asignacion) {
        return res.status(404).json({ message: 'Asignación no encontrada' });
      }
      
      // Eliminar la asignación
      await asignacion.destroy();
      
      res.json({ message: 'Estudiante eliminado de la sección correctamente' });
    } catch (err) {
      console.error('Error al eliminar estudiante de sección:', err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = seccionesController;
