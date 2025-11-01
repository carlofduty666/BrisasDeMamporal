const { Horarios, Grados, Secciones, Materias, Personas, AnnoEscolar } = require('../models');
const { Op } = require('sequelize');

const horariosController = {
  // Obtener todos los horarios
  async getHorarios(req, res) {
    try {
      const horarios = await Horarios.findAll({
        include: [
          {
            model: Grados,
            as: 'grado',
            attributes: ['id', 'nombre_grado']
          },
          {
            model: Secciones,
            as: 'seccion',
            attributes: ['id', 'nombre_seccion']
          },
          {
            model: Materias,
            as: 'materia',
            attributes: ['id', 'asignatura']
          },
          {
            model: Personas,
            as: 'profesor',
            attributes: ['id', 'nombre', 'apellido']
          },
          {
            model: AnnoEscolar,
            as: 'annoEscolar',
            attributes: ['id', 'periodo']
          }
        ],
        order: [
          ['grado_id', 'ASC'],
          ['seccion_id', 'ASC'],
          ['dia_semana', 'ASC'],
          ['hora_inicio', 'ASC']
        ]
      });

      res.json(horarios);
    } catch (error) {
      console.error('Error al obtener horarios:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message 
      });
    }
  },

  // Obtener horario por ID
  async getHorarioById(req, res) {
    try {
      const { id } = req.params;
      
      const horario = await Horarios.findByPk(id, {
        include: [
          {
            model: Grados,
            as: 'grado',
            attributes: ['id', 'nombre_grado']
          },
          {
            model: Secciones,
            as: 'seccion',
            attributes: ['id', 'nombre_seccion']
          },
          {
            model: Materias,
            as: 'materia',
            attributes: ['id', 'asignatura']
          },
          {
            model: Personas,
            as: 'profesor',
            attributes: ['id', 'nombre', 'apellido']
          },
          {
            model: AnnoEscolar,
            as: 'annoEscolar',
            attributes: ['id', 'periodo']
          }
        ]
      });

      if (!horario) {
        return res.status(404).json({ message: 'Horario no encontrado' });
      }

      res.json(horario);
    } catch (error) {
      console.error('Error al obtener horario:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message 
      });
    }
  },

  // Crear nuevo horario
  async createHorario(req, res) {
    try {
      const {
        grado_id,
        seccion_id,
        materia_id,
        profesor_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        aula,
        activo = true
      } = req.body;

      // Obtener el año escolar actual si no se proporciona
      const annoEscolarActual = await AnnoEscolar.getAnnoEscolarActual();
      if (!annoEscolarActual) {
        return res.status(400).json({ 
          message: 'No hay un año escolar activo configurado' 
        });
      }

      // Verificar conflictos de horario para el profesor
      const conflictoProfesor = await Horarios.findOne({
        where: {
          profesor_id,
          dia_semana,
          anno_escolar_id: annoEscolarActual.id,
          activo: true,
          [Op.or]: [
            {
              hora_inicio: {
                [Op.between]: [hora_inicio, hora_fin]
              }
            },
            {
              hora_fin: {
                [Op.between]: [hora_inicio, hora_fin]
              }
            },
            {
              [Op.and]: [
                { hora_inicio: { [Op.lte]: hora_inicio } },
                { hora_fin: { [Op.gte]: hora_fin } }
              ]
            }
          ]
        }
      });

      if (conflictoProfesor) {
        return res.status(400).json({ 
          message: 'El profesor ya tiene una clase programada en ese horario' 
        });
      }

      // Verificar conflictos de horario para el grado y sección
      const conflictoGradoSeccion = await Horarios.findOne({
        where: {
          grado_id,
          seccion_id,
          dia_semana,
          anno_escolar_id: annoEscolarActual.id,
          activo: true,
          [Op.or]: [
            {
              hora_inicio: {
                [Op.between]: [hora_inicio, hora_fin]
              }
            },
            {
              hora_fin: {
                [Op.between]: [hora_inicio, hora_fin]
              }
            },
            {
              [Op.and]: [
                { hora_inicio: { [Op.lte]: hora_inicio } },
                { hora_fin: { [Op.gte]: hora_fin } }
              ]
            }
          ]
        }
      });

      if (conflictoGradoSeccion) {
        return res.status(400).json({ 
          message: 'Ya existe una clase programada para este grado y sección en ese horario' 
        });
      }

      const nuevoHorario = await Horarios.create({
        grado_id,
        seccion_id,
        materia_id,
        profesor_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        aula,
        anno_escolar_id: annoEscolarActual.id,
        activo
      });

      // Obtener el horario creado con las relaciones
      const horarioCompleto = await Horarios.findByPk(nuevoHorario.id, {
        include: [
          {
            model: Grados,
            as: 'grado',
            attributes: ['id', 'nombre_grado']
          },
          {
            model: Secciones,
            as: 'seccion',
            attributes: ['id', 'nombre_seccion']
          },
          {
            model: Materias,
            as: 'materia',
            attributes: ['id', 'asignatura']
          },
          {
            model: Personas,
            as: 'profesor',
            attributes: ['id', 'nombre', 'apellido']
          }
        ]
      });

      res.status(201).json({
        message: 'Horario creado exitosamente',
        horario: horarioCompleto
      });
    } catch (error) {
      console.error('Error al crear horario:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message 
      });
    }
  },

  // Actualizar horario
  async updateHorario(req, res) {
    try {
      const { id } = req.params;
      const {
        grado_id,
        seccion_id,
        materia_id,
        profesor_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        aula,
        activo
      } = req.body;

      const horario = await Horarios.findByPk(id);
      if (!horario) {
        return res.status(404).json({ message: 'Horario no encontrado' });
      }

      // Verificar conflictos solo si se cambian datos relevantes
      if (profesor_id !== horario.profesor_id || 
          dia_semana !== horario.dia_semana ||
          hora_inicio !== horario.hora_inicio ||
          hora_fin !== horario.hora_fin) {
        
        // Verificar conflictos de horario para el profesor
        const conflictoProfesor = await Horarios.findOne({
          where: {
            id: { [Op.ne]: id }, // Excluir el horario actual
            profesor_id,
            dia_semana,
            anno_escolar_id: horario.anno_escolar_id,
            activo: true,
            [Op.or]: [
              {
                hora_inicio: {
                  [Op.between]: [hora_inicio, hora_fin]
                }
              },
              {
                hora_fin: {
                  [Op.between]: [hora_inicio, hora_fin]
                }
              },
              {
                [Op.and]: [
                  { hora_inicio: { [Op.lte]: hora_inicio } },
                  { hora_fin: { [Op.gte]: hora_fin } }
                ]
              }
            ]
          }
        });

        if (conflictoProfesor) {
          return res.status(400).json({ 
            message: 'El profesor ya tiene una clase programada en ese horario' 
          });
        }
      }

      await horario.update({
        grado_id,
        seccion_id,
        materia_id,
        profesor_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        aula,
        activo
      });

      // Obtener el horario actualizado con las relaciones
      const horarioActualizado = await Horarios.findByPk(id, {
        include: [
          {
            model: Grados,
            as: 'grado',
            attributes: ['id', 'nombre_grado']
          },
          {
            model: Secciones,
            as: 'seccion',
            attributes: ['id', 'nombre_seccion']
          },
          {
            model: Materias,
            as: 'materia',
            attributes: ['id', 'asignatura']
          },
          {
            model: Personas,
            as: 'profesor',
            attributes: ['id', 'nombre', 'apellido']
          }
        ]
      });

      res.json({
        message: 'Horario actualizado exitosamente',
        horario: horarioActualizado
      });
    } catch (error) {
      console.error('Error al actualizar horario:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message 
      });
    }
  },

  // Eliminar horario
  async deleteHorario(req, res) {
    try {
      const { id } = req.params;
      
      const horario = await Horarios.findByPk(id);
      if (!horario) {
        return res.status(404).json({ message: 'Horario no encontrado' });
      }

      await horario.destroy();
      
      res.json({ message: 'Horario eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar horario:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message 
      });
    }
  },

  // Obtener horarios por grado y sección
  async getHorariosByGradoSeccion(req, res) {
    try {
      const { grado_id, seccion_id } = req.params;
      
      const annoEscolarActual = await AnnoEscolar.getAnnoEscolarActual();
      if (!annoEscolarActual) {
        return res.status(400).json({ 
          message: 'No hay un año escolar activo configurado' 
        });
      }

      const horarios = await Horarios.getHorariosByGradoSeccion(
        grado_id, 
        seccion_id, 
        annoEscolarActual.id
      );

      res.json({
        grado_id,
        seccion_id,
        anno_escolar: annoEscolarActual.periodo,
        horarios
      });
    } catch (error) {
      console.error('Error al obtener horarios por grado y sección:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message 
      });
    }
  },

  // Obtener clases actuales
  async getClasesActuales(req, res) {
    try {
      const clases = await Horarios.getClasesActuales();
      
      const now = new Date();
      const currentTime = now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      const currentDate = now.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      res.json({
        timestamp: now.toISOString(),
        currentTime,
        currentDate,
        totalClases: clases.length,
        clases
      });
    } catch (error) {
      console.error('Error al obtener clases actuales:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message 
      });
    }
  },

  // Obtener próximas clases
  async getProximasClases(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const clases = await Horarios.getProximasClases(limit);
      
      const now = new Date();
      const currentTime = now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      res.json({
        timestamp: now.toISOString(),
        currentTime,
        totalClases: clases.length,
        clases
      });
    } catch (error) {
      console.error('Error al obtener próximas clases:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message 
      });
    }
  },

  // Validar conflictos sin crear
  async validarConflictos(req, res) {
    try {
      const {
        grado_id,
        seccion_id,
        profesor_id,
        dia_semana,
        hora_inicio,
        hora_fin,
        horario_id // Para validar si es una actualización
      } = req.body;

      // Obtener el año escolar actual
      const annoEscolarActual = await AnnoEscolar.getAnnoEscolarActual();
      if (!annoEscolarActual) {
        return res.status(400).json({ 
          message: 'No hay un año escolar activo configurado',
          hasConflict: false,
          conflicts: []
        });
      }

      const conflicts = [];

      // Verificar conflictos de horario para el profesor
      const conflictoProfesor = await Horarios.findOne({
        where: {
          ...(horario_id && { id: { [Op.ne]: horario_id } }),
          profesor_id,
          dia_semana,
          anno_escolar_id: annoEscolarActual.id,
          activo: true,
          [Op.or]: [
            {
              hora_inicio: {
                [Op.between]: [hora_inicio, hora_fin]
              }
            },
            {
              hora_fin: {
                [Op.between]: [hora_inicio, hora_fin]
              }
            },
            {
              [Op.and]: [
                { hora_inicio: { [Op.lte]: hora_inicio } },
                { hora_fin: { [Op.gte]: hora_fin } }
              ]
            }
          ]
        },
        include: [
          {
            model: Personas,
            as: 'profesor',
            attributes: ['id', 'nombre', 'apellido']
          },
          {
            model: Materias,
            as: 'materia',
            attributes: ['id', 'asignatura']
          }
        ]
      });

      if (conflictoProfesor) {
        const horaInicio = conflictoProfesor.hora_inicio.substring(0, 5);
        const horaFin = conflictoProfesor.hora_fin.substring(0, 5);
        conflicts.push({
          type: 'profesor',
          message: `Profesor ${conflictoProfesor.profesor.nombre} ${conflictoProfesor.profesor.apellido} ya tiene ${conflictoProfesor.materia.asignatura} de ${horaInicio} a ${horaFin}`,
          profesor: `${conflictoProfesor.profesor.nombre} ${conflictoProfesor.profesor.apellido}`,
          materia: conflictoProfesor.materia.asignatura,
          horaInicio,
          horaFin,
          conflictingHorario: conflictoProfesor
        });
      }

      // Verificar conflictos de horario para el grado y sección
      const conflictoGradoSeccion = await Horarios.findOne({
        where: {
          ...(horario_id && { id: { [Op.ne]: horario_id } }),
          grado_id,
          seccion_id,
          dia_semana,
          anno_escolar_id: annoEscolarActual.id,
          activo: true,
          [Op.or]: [
            {
              hora_inicio: {
                [Op.between]: [hora_inicio, hora_fin]
              }
            },
            {
              hora_fin: {
                [Op.between]: [hora_inicio, hora_fin]
              }
            },
            {
              [Op.and]: [
                { hora_inicio: { [Op.lte]: hora_inicio } },
                { hora_fin: { [Op.gte]: hora_fin } }
              ]
            }
          ]
        },
        include: [
          {
            model: Materias,
            as: 'materia',
            attributes: ['id', 'asignatura']
          }
        ]
      });

      if (conflictoGradoSeccion) {
        const horaInicio = conflictoGradoSeccion.hora_inicio.substring(0, 5);
        const horaFin = conflictoGradoSeccion.hora_fin.substring(0, 5);
        conflicts.push({
          type: 'gradoSeccion',
          message: `Ya ${conflictoGradoSeccion.materia.asignatura} se imparte de ${horaInicio} a ${horaFin}`,
          materia: conflictoGradoSeccion.materia.asignatura,
          horaInicio,
          horaFin,
          conflictingHorario: conflictoGradoSeccion
        });
      }

      res.json({
        hasConflict: conflicts.length > 0,
        conflicts,
        message: conflicts.length > 0 ? 'Se encontraron conflictos' : 'Sin conflictos'
      });
    } catch (error) {
      console.error('Error al validar conflictos:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message,
        hasConflict: false,
        conflicts: []
      });
    }
  }
};

module.exports = horariosController;