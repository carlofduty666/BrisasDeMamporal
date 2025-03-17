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
              as: 'Evaluacion',
              include: [
                { model: Materias, as: 'Materias' }
              ]
            },
            { 
              model: Personas, 
              as: 'Estudiante',
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
              as: 'Evaluacion',
              include: [
                { model: Materias, as: 'Materias' }
              ]
            },
            { 
              model: Personas, 
              as: 'Estudiante',
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
              as: 'Estudiante',
              attributes: ['id', 'nombre', 'apellido', 'cedula']
            }
          ],
          order: [
            [{ model: Personas, as: 'Estudiante' }, 'apellido', 'ASC'],
            [{ model: Personas, as: 'Estudiante' }, 'nombre', 'ASC']
          ]
        });
        
        res.json(calificaciones);
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
              as: 'Evaluacion',
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
            [{ model: Evaluaciones, as: 'Evaluacion' }, 'lapso', 'ASC'],
            [{ model: Evaluaciones, as: 'Evaluacion' }, { model: Materias, as: 'Materias' }, 'asignatura', 'ASC'],
            [{ model: Evaluaciones, as: 'Evaluacion' }, 'fechaEvaluacion', 'ASC']
          ]
        });
        
        res.json(calificaciones);
      } catch (err) {
        console.error(err);
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
            include: [{ model: Evaluaciones, as: 'Evaluacion' }]
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
        
        const evaluacion = calificacionExistente.Evaluacion;

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
            include: [{ model: Evaluaciones, as: 'Evaluacion' }]
        });
        
        if (!calificacion) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Calificación no encontrada' });
        }
        
        const evaluacion = calificacion.Evaluacion;
        
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
            as: 'Estudiante',
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
            as: 'Estudiante',
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
          porcentajeEvaluado: sumaPorcentajes
        },
        transaction
      });
      
      if (!created) {
        await notaLapsoRecord.update({
          nota: notaLapso,
          porcentajeEvaluado: sumaPorcentajes
        }, { transaction });
      }
      
      return notaLapsoRecord;
    } catch (error) {
      console.error('Error al actualizar nota del lapso:', error);
      throw error;
    }
}
  
module.exports = calificacionesController;