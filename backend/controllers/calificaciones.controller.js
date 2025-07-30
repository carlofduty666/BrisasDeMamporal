const db = require('../models');
const Calificaciones = db.Calificaciones;
const Evaluaciones = db.Evaluaciones;
const Personas = db.Personas;
const Materias = db.Materias;
const NotasLapsos = db.NotasLapsos;
const NotasDefinitivas = db.NotasDefinitivas;
const ConfiguracionCalificaciones = db.ConfiguracionCalificaciones;
const { Sequelize, Op } = db.Sequelize;

const calificacionesController = {
    // Obtener todas las calificaciones
    getAllCalificaciones: async (req, res) => {
      try {
        const calificaciones = await Calificaciones.findAll({
          include: [
            { 
              model: Evaluaciones, 
              as: 'Evaluaciones',
              include: [
                { model: Materias, as: 'Materias' }
              ]
            },
            { 
              model: Personas, 
              as: 'Personas',
              attributes: ['id', 'nombre', 'apellido', 'cedula']
            }
          ]
        });
        
        res.json(calificaciones);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    },
    
    // Obtener calificación por ID
    getCalificacionById: async (req, res) => {
      try {
        const { id } = req.params;
        
        const calificacion = await Calificaciones.findByPk(id, {
          include: [
            { 
              model: Evaluaciones, 
              as: 'Evaluaciones',
              include: [
                { model: Materias, as: 'Materias' }
              ]
            },
            { 
              model: Personas, 
              as: 'Personas',
              attributes: ['id', 'nombre', 'apellido', 'cedula']
            }
          ]
        });
        
        if (!calificacion) {
          return res.status(404).json({ message: 'Calificación no encontrada' });
        }
        
        res.json(calificacion);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    },
    
    // Obtener calificaciones por evaluación
    getCalificacionesByEvaluacion: async (req, res) => {
      try {
        const { evaluacionID } = req.params;
        
        const calificaciones = await Calificaciones.findAll({
          where: { evaluacionID },
          include: [
            { 
              model: Personas, 
              as: 'Personas',
              attributes: ['id', 'nombre', 'apellido', 'cedula']
            }
          ],
          order: [
            [{ model: Personas, as: 'Personas' }, 'apellido', 'ASC'],
            [{ model: Personas, as: 'Personas' }, 'nombre', 'ASC']
          ]
        });
        
        res.json(calificaciones);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    },
    
    // Obtener calificación específica de un estudiante para una evaluación
    getCalificacionByEstudianteAndEvaluacion: async (req, res) => {
      try {
        const { estudianteID, evaluacionID } = req.params;
        
        const calificacion = await Calificaciones.findOne({
          where: {
            personaID: estudianteID,
            evaluacionID: evaluacionID
          },
          include: [
            { 
              model: Evaluaciones, 
              as: 'Evaluaciones',
              include: [
                { model: Materias, as: 'Materias' }
              ]
            },
            { 
              model: Personas, 
              as: 'Personas',
              attributes: ['id', 'nombre', 'apellido', 'cedula']
            }
          ]
        });
        
        if (!calificacion) {
          return res.status(404).json({ message: 'Calificación no encontrada' });
        }
        
        res.json(calificacion);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    },

    // Obtener calificaciones por estudiante
    getCalificacionesByEstudiante: async (req, res) => {
      try {
        const { estudianteID } = req.params;
        const { annoEscolarID, materiaID, lapso } = req.query;
        
        const whereClause = { personaID: estudianteID };
        
        if (annoEscolarID) {
          whereClause.annoEscolarID = annoEscolarID;
        }
        
        const calificaciones = await Calificaciones.findAll({
          where: whereClause,
          include: [
            { 
              model: Evaluaciones, 
              as: 'Evaluaciones',
              include: [
                { model: Materias, as: 'Materias' }
              ],
              where: {
                ...(materiaID && { materiaID }),
                ...(lapso && { lapso })
              }
            }
          ],
          order: [
            [{ model: Evaluaciones, as: 'Evaluaciones' }, 'lapso', 'ASC'],
            [{ model: Evaluaciones, as: 'Evaluaciones' }, { model: Materias, as: 'Materias' }, 'asignatura', 'ASC'],
            [{ model: Evaluaciones, as: 'Evaluaciones' }, 'fechaEvaluacion', 'ASC']
          ]
        });
        
        res.json(calificaciones);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    },

    getCalificacionesByMateria: async (req, res) => {
      try {
        const { materiaID } = req.params;
        const { estudianteID, annoEscolarID, lapso } = req.query;
        
        const whereClause = { 
          '$Evaluacion.materiaID$': materiaID 
        };
        
        if (estudianteID) {
          whereClause.personaID = estudianteID;
        }
        
        if (annoEscolarID) {
          whereClause['$Evaluacion.annoEscolarID$'] = annoEscolarID;
        }
        
        if (lapso) {
          whereClause['$Evaluacion.lapso$'] = lapso;
        }
        
        const calificaciones = await Calificaciones.findAll({
          where: whereClause,
          include: [
            { 
              model: Evaluaciones, 
              as: 'Evaluaciones',
              required: true,
              include: [
                { model: Materias, as: 'Materias' }
              ]
            },
            { 
              model: Personas, 
              as: 'Personas',
              attributes: ['id', 'nombre', 'apellido', 'cedula']
            }
          ],
          order: [
            [{ model: Evaluaciones, as: 'Evaluaciones' }, 'lapso', 'ASC'],
            [{ model: Evaluaciones, as: 'Evaluaciones' }, 'fechaEvaluacion', 'ASC']
          ]
        });
        
        res.json(calificaciones);
      } catch (err) {
        console.error('Error al obtener calificaciones por materia:', err);
        res.status(500).json({ message: err.message });
      }
    },
    
    // Obtener calificaciones por grado y sección
    getCalificacionesByGradoSeccion: async (req, res) => {
      try {
        const { gradoID, seccionID } = req.params;
        const { annoEscolarID, lapso, materiaID } = req.query;
        
        if (!gradoID || !seccionID) {
          return res.status(400).json({ message: 'Se requieren los IDs de grado y sección' });
        }
        
        const whereClause = {
          '$Evaluacion.gradoID$': gradoID,
          '$Evaluacion.seccionID$': seccionID
        };
        
        if (annoEscolarID) {
          whereClause['$Evaluacion.annoEscolarID$'] = annoEscolarID;
        }
        
        if (lapso) {
          whereClause['$Evaluacion.lapso$'] = lapso;
        }
        
        if (materiaID) {
          whereClause['$Evaluacion.materiaID$'] = materiaID;
        }
        
        const calificaciones = await Calificaciones.findAll({
          where: whereClause,
          include: [
            { 
              model: Evaluaciones, 
              as: 'Evaluaciones',
              required: true,
              include: [
                { model: Materias, as: 'Materias' }
              ]
            },
            { 
              model: Personas, 
              as: 'Personas',
              attributes: ['id', 'nombre', 'apellido', 'cedula']
            }
          ],
          order: [
            [{ model: Personas, as: 'Personas' }, 'apellido', 'ASC'],
            [{ model: Personas, as: 'Personas' }, 'nombre', 'ASC'],
            [{ model: Evaluaciones, as: 'Evaluaciones' }, 'lapso', 'ASC'],
            [{ model: Evaluaciones, as: 'Evaluaciones' }, 'fechaEvaluacion', 'ASC']
          ]
        });
        
        res.json(calificaciones);
      } catch (err) {
        console.error('Error al obtener calificaciones por grado y sección:', err);
        res.status(500).json({ message: err.message });
      }
    },

    // Obtener calificaciones de un estudiante específico
    getCalificacionesByEstudiante: async (req, res) => {
      try {
        const { estudianteID } = req.params;
        const { annoEscolarID } = req.query;
        
        if (!estudianteID) {
          return res.status(400).json({ message: 'Se requiere el ID del estudiante' });
        }
        
        // Construir filtros
        const whereClause = { personaID: estudianteID };
        
        // Buscar calificaciones con evaluaciones incluidas
        const calificaciones = await Calificaciones.findAll({
          where: whereClause,
          include: [
            {
              model: Evaluaciones,
              as: 'Evaluaciones', 
              where: annoEscolarID ? { annoEscolarID } : {},
              include: [
                {
                  model: db.Materias,
                  as: 'Materias',
                  attributes: ['id', 'asignatura']
                }
              ]
            }
          ],
          order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json(calificaciones);
      } catch (error) {
        console.error('Error al obtener calificaciones del estudiante:', error);
        res.status(500).json({ message: error.message });
      }
    },
    
    // Obtener resumen de calificaciones por estudiante
    getResumenCalificacionesByEstudiante: async (req, res) => {
      try {
        const { estudianteID } = req.params;
        const { annoEscolarID } = req.query;
        
        if (!estudianteID) {
          return res.status(400).json({ message: 'Se requiere el ID del estudiante' });
        }
        
        // Verificar que el estudiante existe
        const estudiante = await Personas.findOne({
          where: { 
            id: estudianteID,
            tipo: 'estudiante'
          }
        });
        
        if (!estudiante) {
          return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        
        // Obtener todas las materias del estudiante para el año escolar
        const whereClause = {};
        if (annoEscolarID) {
          whereClause.annoEscolarID = annoEscolarID;
        }
        
        // Obtener notas por lapso
        const notasLapso = await NotasLapsos.findAll({
          where: {
            estudianteID,
            ...whereClause
          },
          include: [
            { model: Materias, as: 'Materia' }
          ],
          order: [
            ['lapso', 'ASC'],
            [{ model: Materias, as: 'Materia' }, 'asignatura', 'ASC']
          ]
        });
        
        // Obtener notas definitivas
        const notasDefinitivas = await NotasDefinitivas.findAll({
          where: {
            estudianteID,
            ...whereClause
          },
          include: [
            { model: Materias, as: 'Materia' }
          ],
          order: [
            [{ model: Materias, as: 'Materia' }, 'asignatura', 'ASC']
          ]
        });
        
        // Agrupar notas por materia
        const materias = {};
        
        // Procesar notas por lapso
        notasLapso.forEach(nota => {
          const materiaID = nota.materiaID;
          if (!materias[materiaID]) {
            materias[materiaID] = {
              id: materiaID,
              asignatura: nota.Materia.asignatura,
              lapsos: {},
              definitiva: null,
              aprobado: null
            };
          }
          
          materias[materiaID].lapsos[nota.lapso] = {
            nota: nota.nota,
            porcentajeEvaluado: nota.porcentajeEvaluado
          };
        });
        
        // Procesar notas definitivas
        notasDefinitivas.forEach(nota => {
          const materiaID = nota.materiaID;
          if (!materias[materiaID]) {
            materias[materiaID] = {
              id: materiaID,
              asignatura: nota.Materia.asignatura,
              lapsos: {},
              definitiva: null,
              aprobado: null
            };
          }
          
          materias[materiaID].definitiva = nota.nota;
          materias[materiaID].aprobado = nota.aprobado;
          materias[materiaID].recuperacion = nota.recuperacion;
          materias[materiaID].notaRecuperacion = nota.notaRecuperacion;
        });
        
        // Convertir a array
        const resumen = Object.values(materias);
        
        res.json({
          estudiante: {
            id: estudiante.id,
            nombre: estudiante.nombre,
            apellido: estudiante.apellido,
            cedula: estudiante.cedula
          },
          materias: resumen
        });
      } catch (err) {
        console.error('Error al obtener resumen de calificaciones:', err);
        res.status(500).json({ message: err.message });
      }
    },
    
    // Crear una calificación
    createCalificacion: async (req, res) => {
      const transaction = await db.sequelize.transaction();
      
      try {
        const { evaluacionID, personaID, calificacion, observaciones, annoEscolarID } = req.body;
        
        // Validar que la evaluación existe
        const evaluacion = await Evaluaciones.findByPk(evaluacionID);
        if (!evaluacion) {
          await transaction.rollback();
          return res.status(404).json({ message: 'Evaluación no encontrada' });
        }
        
        // Validar que el estudiante existe
        const estudiante = await Personas.findByPk(personaID);
        if (!estudiante || estudiante.tipo !== 'estudiante') {
          await transaction.rollback();
          return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        
        // Validar que la calificación está en el rango correcto (0-20)
        if (calificacion < 0 || calificacion > 20) {
          await transaction.rollback();
          return res.status(400).json({ message: 'La calificación debe estar entre 0 y 20' });
        }
        
        // Verificar si ya existe una calificación para este estudiante en esta evaluación
        const calificacionExistente = await Calificaciones.findOne({
          where: { evaluacionID, personaID }
        });
        
        if (calificacionExistente) {
          await transaction.rollback();
          return res.status(400).json({ 
            message: 'Ya existe una calificación para este estudiante en esta evaluación',
            calificacionExistente
          });
        }
        
        // Crear la calificación
        const nuevaCalificacion = await Calificaciones.create({
          evaluacionID,
          personaID,
          calificacion,
          observaciones,
          annoEscolarID: annoEscolarID || evaluacion.annoEscolarID,
          fechaRegistro: new Date()
        }, { transaction });
        
        // Actualizar la nota del lapso
        await actualizarNotaLapso(
          personaID, 
          evaluacion.materiaID, 
          evaluacion.gradoID, 
          evaluacion.seccionID, 
          evaluacion.annoEscolarID, 
          evaluacion.lapso,
          transaction
        );
        
        await transaction.commit();
        
        res.status(201).json(nuevaCalificacion);
      } catch (err) {
        await transaction.rollback();
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    },
    // Actualizar una calificación
    updateCalificacion: async (req, res) => {
        const transaction = await db.sequelize.transaction();
        
        try {
        const { id } = req.params;
        const { calificacion, observaciones } = req.body;
        
        const calificacionExistente = await Calificaciones.findByPk(id, {
            include: [{ model: Evaluaciones, as: 'Evaluaciones' }]
        });
        
        if (!calificacionExistente) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Calificación no encontrada' });
        }
        
        // Validar que la calificación está en el rango correcto (0-20)
        if (calificacion < 0 || calificacion > 20) {
            await transaction.rollback();
            return res.status(400).json({ message: 'La calificación debe estar entre 0 y 20' });
        }
        
        // Actualizar la calificación
        await calificacionExistente.update({
            calificacion: calificacion || calificacionExistente.calificacion,
            observaciones: observaciones !== undefined ? observaciones : calificacionExistente.observaciones
        }, { transaction });
        
        const evaluacion = calificacionExistente.Evaluaciones;

        // Actualizar la nota del lapso
        await actualizarNotaLapso(
            calificacionExistente.personaID, 
            evaluacion.materiaID, 
            evaluacion.gradoID, 
            evaluacion.seccionID, 
            evaluacion.annoEscolarID, 
            evaluacion.lapso,
            transaction
        );
        
        await transaction.commit();
        
        res.json(calificacionExistente);
        } catch (err) {
        await transaction.rollback();
        console.error(err);
        res.status(500).json({ message: err.message });
        }
    },

    // Eliminar una calificación
    deleteCalificacion: async (req, res) => {
        const transaction = await db.sequelize.transaction();
        
        try {
        const { id } = req.params;
        
        const calificacion = await Calificaciones.findByPk(id, {
            include: [{ model: Evaluaciones, as: 'Evaluaciones' }]
        });
        
        if (!calificacion) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Calificación no encontrada' });
        }
        
        const evaluacion = calificacion.Evaluaciones;
        
        // Eliminar la calificación
        await calificacion.destroy({ transaction });
        
        // Actualizar la nota del lapso
        await actualizarNotaLapso(
            calificacion.personaID, 
            evaluacion.materiaID, 
            evaluacion.gradoID, 
            evaluacion.seccionID, 
            evaluacion.annoEscolarID, 
            evaluacion.lapso,
            transaction
        );
        
        await transaction.commit();
        
        res.json({ message: 'Calificación eliminada correctamente' });
        } catch (err) {
        await transaction.rollback();
        console.error(err);
        res.status(500).json({ message: err.message });
        }
    },

    // Registrar calificaciones en lote para una evaluación
  registrarCalificacionesLote: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { evaluacionID, calificaciones } = req.body;
      
      // Validar que la evaluación existe
      const evaluacion = await Evaluaciones.findByPk(evaluacionID);
      if (!evaluacion) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Evaluación no encontrada' });
      }
      
      // Validar el formato de las calificaciones
      if (!Array.isArray(calificaciones) || calificaciones.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ message: 'El formato de calificaciones es inválido' });
      }
      
      const resultados = [];
      const errores = [];
      
      // Procesar cada calificación
      for (const item of calificaciones) {
        const { personaID, calificacion, observaciones } = item;
        
        // Validar que el estudiante existe
        const estudiante = await Personas.findByPk(personaID);
        if (!estudiante || estudiante.tipo !== 'estudiante') {
          errores.push({ personaID, error: 'Estudiante no encontrado o no es de tipo estudiante' });
          continue;
        }
        
        // Validar que la calificación está en el rango correcto (0-20)
        if (calificacion < 0 || calificacion > 20) {
          errores.push({ personaID, error: 'La calificación debe estar entre 0 y 20' });
          continue;
        }
        
        // Verificar si ya existe una calificación para este estudiante en esta evaluación
        const calificacionExistente = await Calificaciones.findOne({
          where: { evaluacionID, personaID }
        });
        
        if (calificacionExistente) {
          // Actualizar la calificación existente
          await calificacionExistente.update({
            calificacion,
            observaciones: observaciones || calificacionExistente.observaciones
          }, { transaction });
          
          resultados.push({
            id: calificacionExistente.id,
            personaID,
            calificacion,
            actualizado: true
          });
        } else {
          // Crear una nueva calificación
          const nuevaCalificacion = await Calificaciones.create({
            evaluacionID,
            personaID,
            calificacion,
            observaciones,
            annoEscolarID: evaluacion.annoEscolarID,
            fechaRegistro: new Date()
          }, { transaction });
          
          resultados.push({
            id: nuevaCalificacion.id,
            personaID,
            calificacion,
            actualizado: false
          });
        }
        
        // Actualizar la nota del lapso para cada estudiante
        await actualizarNotaLapso(
          personaID, 
          evaluacion.materiaID, 
          evaluacion.gradoID, 
          evaluacion.seccionID, 
          evaluacion.annoEscolarID, 
          evaluacion.lapso,
          transaction
        );
      }
      
      await transaction.commit();
      
      res.status(200).json({
        message: 'Calificaciones registradas correctamente',
        resultados,
        errores
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },

    // Obtener notas por lapso
  getNotasByLapso: async (req, res) => {
    try {
      const { estudianteID, materiaID, annoEscolarID, lapso } = req.query;
      
      const whereClause = {};
      
      if (estudianteID) whereClause.estudianteID = estudianteID;
      if (materiaID) whereClause.materiaID = materiaID;
      if (annoEscolarID) whereClause.annoEscolarID = annoEscolarID;
      if (lapso) whereClause.lapso = lapso;
      
      const notasLapso = await NotasLapsos.findAll({
        where: whereClause,
        include: [
          { 
            model: Personas, 
            as: 'Personas',
            attributes: ['id', 'nombre', 'apellido', 'cedula']
          },
          { 
            model: Materias, 
            as: 'Materia'
          }
        ],
        order: [
          ['annoEscolarID', 'DESC'],
          ['lapso', 'ASC'],
          [{ model: Materias, as: 'Materia' }, 'asignatura', 'ASC']
        ]
      });
      
      res.json(notasLapso);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener notas definitivas
  getNotasDefinitivas: async (req, res) => {
    try {
      const { estudianteID, materiaID, annoEscolarID } = req.query;
      
      const whereClause = {};
      
      if (estudianteID) whereClause.estudianteID = estudianteID;
      if (materiaID) whereClause.materiaID = materiaID;
      if (annoEscolarID) whereClause.annoEscolarID = annoEscolarID;
      
      const notasDefinitivas = await NotasDefinitivas.findAll({
        where: whereClause,
        include: [
          { 
            model: Personas, 
            as: 'Personas',
            attributes: ['id', 'nombre', 'apellido', 'cedula']
          },
          { 
            model: Materias, 
            as: 'Materia'
          }
        ],
        order: [
          ['annoEscolarID', 'DESC'],
          [{ model: Materias, as: 'Materia' }, 'asignatura', 'ASC']
        ]
      });
      
      res.json(notasDefinitivas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Calcular y actualizar todas las notas definitivas para un año escolar
  calcularNotasDefinitivas: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { annoEscolarID, gradoID, seccionID } = req.body;
      
      if (!annoEscolarID) {
        await transaction.rollback();
        return res.status(400).json({ message: 'El año escolar es requerido' });
      }
      
      // Obtener la configuración de calificaciones
      const configuracion = await ConfiguracionCalificaciones.findOne({
        where: {
          annoEscolarID,
          ...(gradoID ? { gradoID } : {}),
          activo: true
        }
      });
      
      if (!configuracion) {
        await transaction.rollback();
        return res.status(404).json({ message: 'No se encontró configuración de calificaciones para este año escolar' });
      }
      
      // Obtener todos los estudiantes de la sección si se especifica
      let estudiantes = [];
      
      if (gradoID && seccionID) {
        const seccionPersonas = await db.Seccion_Personas.findAll({
          where: {
            seccionID,
            annoEscolarID
          }
        });
        
        estudiantes = seccionPersonas.map(sp => sp.personaID);
      } else {
        // Si no se especifica sección, obtener todos los estudiantes con notas en el año escolar
        const notasLapso = await NotasLapsos.findAll({
          where: { annoEscolarID },
          attributes: ['estudianteID'],
          group: ['estudianteID']
        });
        
        estudiantes = notasLapso.map(nl => nl.estudianteID);
      }
      
      if (estudiantes.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ message: 'No se encontraron estudiantes para calcular notas definitivas' });
      }
      
      // Obtener todas las materias para los estudiantes
      const materias = await db.sequelize.query(
        `SELECT DISTINCT materiaID FROM NotasLapsos 
         WHERE estudianteID IN (:estudiantes) AND annoEscolarID = :annoEscolarID`,
        {
          replacements: { estudiantes, annoEscolarID },
          type: db.sequelize.QueryTypes.SELECT
        }
      );
      
      const materiaIDs = materias.map(m => m.materiaID);
      
      if (materiaIDs.length === 0) {
        await transaction.rollback();
        return res.status(404).json({ message: 'No se encontraron materias para calcular notas definitivas' });
      }
      
      const resultados = [];
      
      // Calcular nota definitiva para cada estudiante y materia
      for (const estudianteID of estudiantes) {
        for (const materiaID of materiaIDs) {
          // Obtener notas de los tres lapsos
          const notasLapso = await NotasLapsos.findAll({
            where: {
              estudianteID,
              materiaID,
              annoEscolarID
            },
            order: [['lapso', 'ASC']]
          });
          
          if (notasLapso.length === 0) continue;
          
          // Calcular nota definitiva según la configuración
          let notaDefinitiva = 0;
          let aprobado = false;
          let recuperacion = false;
          let notaRecuperacion = null;
          let observaciones = '';
          
          // Verificar si hay notas para los tres lapsos
          const notasLapsoMap = {};
          notasLapso.forEach(nl => {
            notasLapsoMap[nl.lapso] = nl.nota;
          });
          
          // Calcular nota definitiva ponderada
          if (notasLapsoMap['1'] !== undefined && notasLapsoMap['2'] !== undefined && notasLapsoMap['3'] !== undefined) {
            notaDefinitiva = (
              (notasLapsoMap['1'] * configuracion.ponderacionLapso1 / 100) +
              (notasLapsoMap['2'] * configuracion.ponderacionLapso2 / 100) +
              (notasLapsoMap['3'] * configuracion.ponderacionLapso3 / 100)
            );
            
            // Redondear si está configurado
            if (configuracion.redondearNotas) {
              notaDefinitiva = Number(notaDefinitiva.toFixed(configuracion.decimalesRedondeo));
            }
            
            // Determinar si aprobó según la configuración
            if (configuracion.aprobarPorLapsos) {
              // Contar lapsos aprobados
              const lapsosAprobados = Object.values(notasLapsoMap).filter(nota => nota >= configuracion.notaMinima).length;
              aprobado = lapsosAprobados >= configuracion.minimoLapsosAprobados;
              
              if (!aprobado) {
                observaciones += `No aprobó el mínimo de ${configuracion.minimoLapsosAprobados} lapsos requeridos. `;
              }
            } else {
              // Aprobar por nota definitiva
              aprobado = notaDefinitiva >= configuracion.notaMinima;
            }
            
            // Determinar si necesita recuperación
            if (!aprobado && configuracion.permitirRecuperacion) {
              recuperacion = true;
              observaciones += 'Debe presentar recuperación. ';
            }
          } else {
            observaciones = 'Faltan notas de uno o más lapsos. ';
          }
          
          // Crear o actualizar la nota definitiva
          const [notaDefinitivaRecord, created] = await NotasDefinitivas.findOrCreate({
            where: {
              estudianteID,
              materiaID,
              annoEscolarID
            },
            defaults: {
              nota: notaDefinitiva,
              aprobado,
              recuperacion,
              notaRecuperacion,
              observaciones
            },
            transaction
          });
          
          if (!created) {
            await notaDefinitivaRecord.update({
              nota: notaDefinitiva,
              aprobado,
              recuperacion,
              notaRecuperacion,
              observaciones
            }, { transaction });
          }
          
          resultados.push({
            estudianteID,
            materiaID,
            notaDefinitiva,
            aprobado,
            recuperacion
          });
        }
      }
      
      await transaction.commit();

      res.json({
        message: 'Notas definitivas calculadas correctamente',
        resultados
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },

    // Registrar nota de recuperación
  registrarNotaRecuperacion: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    
    try {
      const { estudianteID, materiaID, annoEscolarID, notaRecuperacion } = req.body;
      
      if (!estudianteID || !materiaID || !annoEscolarID || notaRecuperacion === undefined) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
      }
      
      // Validar que la nota está en el rango correcto (0-20)
      if (notaRecuperacion < 0 || notaRecuperacion > 20) {
        await transaction.rollback();
        return res.status(400).json({ message: 'La nota de recuperación debe estar entre 0 y 20' });
      }
      
      // Buscar la nota definitiva
      const notaDefinitiva = await NotasDefinitivas.findOne({
        where: {
          estudianteID,
          materiaID,
          annoEscolarID
        }
      });
      
      if (!notaDefinitiva) {
        await transaction.rollback();
        return res.status(404).json({ message: 'No se encontró la nota definitiva para este estudiante y materia' });
      }
      
      // Verificar si el estudiante necesita recuperación
      if (!notaDefinitiva.recuperacion) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Este estudiante no necesita presentar recuperación en esta materia' });
      }
      
      // Obtener la configuración de calificaciones
      const configuracion = await ConfiguracionCalificaciones.findOne({
        where: {
          annoEscolarID,
          activo: true
        }
      });
      
      if (!configuracion) {
        await transaction.rollback();
        return res.status(404).json({ message: 'No se encontró configuración de calificaciones para este año escolar' });
      }
      
      // Determinar si aprobó con la nota de recuperación
      const aprobado = notaRecuperacion >= configuracion.notaMinima;
      
      // Actualizar la nota definitiva
      await notaDefinitiva.update({
        notaRecuperacion,
        aprobado,
        observaciones: `Presentó recuperación con nota ${notaRecuperacion}. ${aprobado ? 'Aprobado' : 'Reprobado'}.`
      }, { transaction });
      
      await transaction.commit();
      
      res.json({
        message: 'Nota de recuperación registrada correctamente',
        notaDefinitiva
      });
    } catch (err) {
      await transaction.rollback();
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },

  // Obtener estadísticas generales del profesor
getEstadisticasProfesor: async (req, res) => {
  try {
    const { profesorID } = req.params;
    const { annoEscolarID } = req.query;

    if (!profesorID) {
      return res.status(400).json({ message: 'Se requiere el ID del profesor' });
    }

    // Obtener el año escolar activo si no se proporciona
    let annoEscolar = annoEscolarID;
    if (!annoEscolar) {
      const annoEscolarActivo = await db.AnnoEscolar.findOne({
        where: { activo: true }
      });
      annoEscolar = annoEscolarActivo?.id;
    }

    // Obtener evaluaciones del profesor
    const evaluaciones = await Evaluaciones.findAll({
      where: { 
        profesorID,
        annoEscolarID: annoEscolar 
      },
      include: [
        {
          model: db.Materias,
          as: 'Materias',
          attributes: ['id', 'asignatura']
        }
      ]
    });

    // Obtener calificaciones de todas las evaluaciones del profesor
    const evaluacionesIds = evaluaciones.map(e => e.id);
    const calificaciones = await Calificaciones.findAll({
      where: {
        evaluacionID: evaluacionesIds
      },
      include: [
        {
          model: Evaluaciones,
          as: 'Evaluaciones',
          attributes: ['id', 'nombreEvaluacion', 'materiaID', 'tipoEvaluacion']
        }
      ]
    });

    // Calcular estadísticas por materia
    const estadisticasPorMateria = {};
    
    evaluaciones.forEach(evaluacion => {
      const materiaID = evaluacion.materiaID;
      const asignatura = evaluacion.Materias.asignatura;
      
      if (!estadisticasPorMateria[materiaID]) {
        estadisticasPorMateria[materiaID] = {
          materiaID,
          asignatura,
          totalEvaluaciones: 0,
          totalCalificaciones: 0,
          sumaCalificaciones: 0,
          promedioMateria: 0,
          evaluacionesPendientes: 0
        };
      }
      
      estadisticasPorMateria[materiaID].totalEvaluaciones++;
      
      // Contar calificaciones para esta evaluación
      const calificacionesEvaluacion = calificaciones.filter(c => c.evaluacionID === evaluacion.id);
      estadisticasPorMateria[materiaID].totalCalificaciones += calificacionesEvaluacion.length;
      
      // Sumar calificaciones
      const sumaEvaluacion = calificacionesEvaluacion.reduce((sum, c) => sum + c.calificacion, 0);
      estadisticasPorMateria[materiaID].sumaCalificaciones += sumaEvaluacion;
      
      // Verificar si tiene calificaciones pendientes
      if (calificacionesEvaluacion.length === 0) {
        estadisticasPorMateria[materiaID].evaluacionesPendientes++;
      }
    });

    // Calcular promedios por materia
    Object.keys(estadisticasPorMateria).forEach(materiaID => {
      const stats = estadisticasPorMateria[materiaID];
      if (stats.totalCalificaciones > 0) {
        stats.promedioMateria = (stats.sumaCalificaciones / stats.totalCalificaciones).toFixed(2);
      }
    });

    // Calcular estadísticas generales
    const totalEvaluaciones = evaluaciones.length;
    const totalCalificaciones = calificaciones.length;
    const promedioGeneral = totalCalificaciones > 0 
      ? (calificaciones.reduce((sum, c) => sum + c.calificacion, 0) / totalCalificaciones).toFixed(2)
      : 0;

    const totalEvaluacionesPendientes = Object.values(estadisticasPorMateria)
      .reduce((sum, stats) => sum + stats.evaluacionesPendientes, 0);

    res.status(200).json({
      estadisticasGenerales: {
        totalEvaluaciones,
        totalCalificaciones,
        promedioGeneral: parseFloat(promedioGeneral),
        evaluacionesPendientes: totalEvaluacionesPendientes
      },
      estadisticasPorMateria: Object.values(estadisticasPorMateria)
    });

  } catch (error) {
    console.error('Error al obtener estadísticas del profesor:', error);
    res.status(500).json({ message: error.message });
  }
},

// Obtener promedios por estudiante
getPromediosEstudiantes: async (req, res) => {
  try {
    const { profesorID } = req.params;
    const { annoEscolarID, materiaID, gradoID } = req.query;

    if (!profesorID) {
      return res.status(400).json({ message: 'Se requiere el ID del profesor' });
    }

    // Construir filtros para evaluaciones
    const filtrosEvaluacion = { profesorID };
    if (annoEscolarID) filtrosEvaluacion.annoEscolarID = annoEscolarID;
    if (materiaID) filtrosEvaluacion.materiaID = materiaID;
    if (gradoID) filtrosEvaluacion.gradoID = gradoID;

    // Obtener evaluaciones del profesor con filtros
    const evaluaciones = await Evaluaciones.findAll({
      where: filtrosEvaluacion,
      include: [
        {
          model: db.Materias,
          as: 'Materias',
          attributes: ['id', 'asignatura']
        },
        {
          model: db.Grados,
          as: 'Grado',
          attributes: ['id', 'nombre_grado']
        }
      ]
    });

    if (evaluaciones.length === 0) {
      return res.status(200).json([]);
    }

    const evaluacionesIds = evaluaciones.map(e => e.id);

    // Obtener todas las calificaciones de estas evaluaciones
    const calificaciones = await Calificaciones.findAll({
      where: {
        evaluacionID: evaluacionesIds
      },
      include: [
        {
          model: db.Personas,
          as: 'Personas',
          attributes: ['id', 'nombre', 'apellido', 'cedula']
        },
        {
          model: Evaluaciones,
          as: 'Evaluaciones',
          attributes: ['id', 'nombreEvaluacion', 'materiaID', 'tipoEvaluacion', 'lapso', 'porcentaje', 'fechaEvaluacion', 'gradoID', 'seccionID'],
          include: [
            {
              model: db.Materias,
              as: 'Materias',
              attributes: ['id', 'asignatura']
            },
            {
              model: db.Grados,
              as: 'Grado',
              attributes: ['id', 'nombre_grado']
            },
            {
              model: db.Secciones,
              as: 'Seccion',
              attributes: ['id', 'nombre_seccion']
            }
          ]
        }
      ]
    });

    // Agrupar por estudiante
    const estudiantesMap = {};
    
    calificaciones.forEach(calificacion => {
      const estudianteID = calificacion.personaID;
      const estudiante = calificacion.Personas;
      
      // Log temporal para depurar
      if (estudianteID === calificaciones[0].personaID) {
        console.log('DEBUG - Primera calificación:', {
          estudianteID,
          evaluacionID: calificacion.evaluacionID,
          gradoID: calificacion.Evaluaciones?.gradoID,
          grado: calificacion.Evaluaciones?.Grado,
          seccionID: calificacion.Evaluaciones?.seccionID,
          seccion: calificacion.Evaluaciones?.Seccion,
          evaluacionCompleta: JSON.stringify(calificacion.Evaluaciones, null, 2)
        });
      }
      
      if (!estudiantesMap[estudianteID]) {
        estudiantesMap[estudianteID] = {
          estudianteID,
          nombre: estudiante.nombre,
          apellido: estudiante.apellido,
          cedula: estudiante.cedula,
          calificaciones: [],
          totalCalificaciones: 0,
          sumaCalificaciones: 0,
          promedio: 0,
          materias: {},
          // Información de grado y sección (se toma de la primera evaluación)
          gradoID: calificacion.Evaluaciones?.gradoID,
          grado: calificacion.Evaluaciones?.Grado,
          seccionID: calificacion.Evaluaciones?.seccionID,
          seccion: calificacion.Evaluaciones?.Seccion
        };
      }
      
      // Mantener la estructura completa con asociaciones
      estudiantesMap[estudianteID].calificaciones.push({
        id: calificacion.id,
        calificacion: calificacion.calificacion,
        observaciones: calificacion.observaciones,
        fechaRegistro: calificacion.fechaRegistro,
        evaluacionID: calificacion.evaluacionID,
        personaID: calificacion.personaID,
        annoEscolarID: calificacion.annoEscolarID,
        // Mantener las asociaciones anidadas para el frontend
        Evaluaciones: calificacion.Evaluaciones
      });
      
      estudiantesMap[estudianteID].totalCalificaciones++;
      estudiantesMap[estudianteID].sumaCalificaciones += calificacion.calificacion;
      
      // Agrupar por materia
      const materia = calificacion.Evaluaciones.Materias.asignatura;
      if (!estudiantesMap[estudianteID].materias[materia]) {
        estudiantesMap[estudianteID].materias[materia] = {
          totalCalificaciones: 0,
          sumaCalificaciones: 0,
          promedio: 0
        };
      }
      
      estudiantesMap[estudianteID].materias[materia].totalCalificaciones++;
      estudiantesMap[estudianteID].materias[materia].sumaCalificaciones += calificacion.calificacion;
    });

    // Calcular promedios
    Object.keys(estudiantesMap).forEach(estudianteID => {
      const estudiante = estudiantesMap[estudianteID];
      
      // Promedio general del estudiante
      if (estudiante.totalCalificaciones > 0) {
        estudiante.promedio = parseFloat(
          (estudiante.sumaCalificaciones / estudiante.totalCalificaciones).toFixed(2)
        );
      }
      
      // Promedio por materia
      Object.keys(estudiante.materias).forEach(materia => {
        const materiaStats = estudiante.materias[materia];
        if (materiaStats.totalCalificaciones > 0) {
          materiaStats.promedio = parseFloat(
            (materiaStats.sumaCalificaciones / materiaStats.totalCalificaciones).toFixed(2)
          );
        }
      });
    });

    // Convertir a array y ordenar por promedio descendente
    const promediosEstudiantes = Object.values(estudiantesMap)
      .sort((a, b) => b.promedio - a.promedio);

    res.status(200).json(promediosEstudiantes);

  } catch (error) {
    console.error('Error al obtener promedios de estudiantes:', error);
    res.status(500).json({ message: error.message });
  }
}
};

// Función auxiliar para actualizar la nota del lapso
async function actualizarNotaLapso(estudianteID, materiaID, gradoID, seccionID, annoEscolarID, lapso, transaction) {
    try {
      // Obtener todas las evaluaciones para esta materia, grado, sección, año escolar y lapso
      const evaluaciones = await Evaluaciones.findAll({
        where: {
          materiaID,
          gradoID,
          seccionID,
          annoEscolarID,
          lapso
        }
      });
      
      if (evaluaciones.length === 0) {
        return;
      }
      
      // Obtener todas las calificaciones del estudiante para estas evaluaciones
      const calificaciones = await Calificaciones.findAll({
        where: {
          personaID: estudianteID,
          evaluacionID: evaluaciones.map(e => e.id)
        }
      });
      
      // Calcular la nota del lapso
      let notaLapso = 0;
      let sumaPorcentajes = 0;
      
      for (const evaluacion of evaluaciones) {
        const calificacion = calificaciones.find(c => c.evaluacionID === evaluacion.id);
        
        if (calificacion) {
          notaLapso += (calificacion.calificacion * evaluacion.porcentaje / 100);
          sumaPorcentajes += evaluacion.porcentaje;
        }
      }
      
      // Si no hay calificaciones o la suma de porcentajes es 0, no actualizar
      if (calificaciones.length === 0 || sumaPorcentajes === 0) {
        return;
      }
      
      // Ajustar la nota si no se han evaluado todos los porcentajes
      if (sumaPorcentajes < 100) {
        notaLapso = (notaLapso * 100) / sumaPorcentajes;
      }
      
      // Redondear a 2 decimales
      notaLapso = Number(notaLapso.toFixed(2));
      
      // Crear o actualizar la nota del lapso
      const [notaLapsoRecord, created] = await NotasLapsos.findOrCreate({
        where: {
          estudianteID,
          materiaID,
          gradoID,
          seccionID,
          annoEscolarID,
          lapso
        },
        defaults: {
          nota: notaLapso,
          notaFinal: notaLapso, // Agregar notaFinal que es requerido
          porcentajeEvaluado: sumaPorcentajes
        },
        transaction
      });
      
      if (!created) {
        await notaLapsoRecord.update({
          nota: notaLapso,
          notaFinal: notaLapso, // Agregar notaFinal en el update también
          porcentajeEvaluado: sumaPorcentajes
        }, { transaction });
      }
      
      return notaLapsoRecord;
    } catch (error) {
      console.error('Error al actualizar nota del lapso:', error);
      throw error;
    }
};
  
module.exports = calificacionesController;