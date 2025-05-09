const db = require('../models');
const Niveles = db.Niveles;
const Grados = db.Grados;
const Materias = db.Materias;
const Personas = db.Personas;
const Grado_Personas = db.Grado_Personas;
const Profesor_Materia_Grados = db.Profesor_Materia_Grados;
const Secciones = db.Secciones;
const AnnoEscolar = db.AnnoEscolar;

const gradosController = {
    getAllGrados: async (req, res) => {
      try {
        const grados = await db.Grados.findAll({
          include: [
            {
              model: db.Niveles,
              as: 'Niveles', // Este alias debe coincidir con el definido en el modelo
              attributes: ['id', 'nombre_nivel']
            }
          ],
          order: [['nombre_grado', 'ASC']]
        });
        
        res.json(grados);
      } catch (err) {
        console.error('Error al obtener grados:', err);
        res.status(500).json({ message: err.message });
      }
    },
    getGradoById: async (req, res) => {
        try {
            const grado = await Grados.findByPk(req.params.id);
            if (grado) {
                res.json(grado);
            } else {
                res.status(404).json({ message: 'Grado no encontrado' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },
    getGradosByNivel: async (req, res) => {
        try {
            const nivel = await Niveles.findOne({ where: { nombre_nivel: req.params.nombre_nivel } }); // se necesita un registro de la tabla niveles usando findOne
            if (!nivel) {
                return res.status(404).json({ message: 'Nivel no encontrado' });
            }
            const grados = await Grados.findAll({ where: { nivelID: nivel.id } }); // se necesitan todos los grados de un nivel
            if (grados.length > 0) {
                res.json(grados);
            } else {
                res.status(404).json({ message: 'No se encontraron grados para este nivel' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },
    getMateriasByGrado: async (req, res) => {
        try {
          const { id } = req.params;
          const { annoEscolarID } = req.query;
          
          if (!annoEscolarID) {
            return res.status(400).json({ message: 'Se requiere el ID del año escolar' });
          }
          
          const grado = await Grados.findByPk(id, {
            include: [{
              model: db.Materias,
              as: 'Materias',
              through: {
                where: { annoEscolarID },
                attributes: []
              }
            }]
          });
          
          if (!grado) {
            return res.status(404).json({ message: 'Grado no encontrado' });
          }
          
          res.json(grado.Materias);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
    },
    getProfesoresByGrado: async (req, res) => {
        try {
            const { id } = req.params;
            const { annoEscolarID } = req.query;
          
          if (!annoEscolarID) {
                return res.status(400).json({ message: 'Se requiere el ID del año escolar' });
            }
          
          // Buscar todas las asignaciones de profesores a materias en este grado
          const asignaciones = await db.Profesor_Materia_Grados.findAll({
            where: { gradoID: id, annoEscolarID },
            include: [
              {
                model: db.Personas,
                as: 'profesor',
                attributes: ['id', 'nombre', 'apellido', 'cedula', 'email', 'telefono']
              },
              {
                model: db.Materias,
                as: 'materia'
              }
            ]
          });
          
          // Transformar los resultados para agrupar por profesor
          const profesores = {};
          asignaciones.forEach(asignacion => {
            const profesor = asignacion.profesor;
            if (!profesores[profesor.id]) {
              profesores[profesor.id] = {
                ...profesor.dataValues,
                materias: []
              };
            }
            profesores[profesor.id].materias.push(asignacion.materia);
          });
          
          res.json(Object.values(profesores));
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
    },
    // Obtener grados por profesor
    getGradosByProfesor: async (req, res) => {
      try {
        const { profesorID } = req.params;
        const { annoEscolarID } = req.query;
        
        if (!profesorID) {
          return res.status(400).json({ message: 'Se requiere el ID del profesor' });
        }
        
        // Verificar si el profesor existe
        const profesor = await db.Personas.findOne({
          where: { id: profesorID, tipo: 'profesor' }
        });
        
        if (!profesor) {
          return res.status(404).json({ message: 'Profesor no encontrado' });
        }
        
        // Usar el año escolar de la consulta o el activo
        const annoEscolar = annoEscolarID 
          ? await db.AnnoEscolar.findByPk(annoEscolarID)
          : await db.AnnoEscolar.findOne({ where: { activo: true } });
        
        if (!annoEscolar) {
          return res.status(404).json({ message: 'Año escolar no encontrado' });
        }
        
        // Obtener los grados asignados al profesor para el año escolar especificado
        const grados = await db.Grados.findAll({
          include: [
            {
              model: db.Niveles,
              as: 'Niveles',
              attributes: ['id', 'nombre_nivel']
            }
          ],
          where: {
            id: {
              [db.Sequelize.Op.in]: db.Sequelize.literal(`
                (SELECT DISTINCT gradoID FROM Profesor_Materia_Grados 
                 WHERE profesorID = ${profesorID} AND annoEscolarID = ${annoEscolar.id})
              `)
            }
          }
        });
        
        // Para cada grado, obtener las materias que imparte el profesor
        const gradosConMaterias = await Promise.all(
          grados.map(async (grado) => {
            // Obtener las materias que el profesor imparte en este grado
            const materiasQuery = await db.Profesor_Materia_Grados.findAll({
              where: { 
                profesorID: profesorID,
                gradoID: grado.id,
                annoEscolarID: annoEscolar.id
              },
              include: [
                {
                  model: db.Materias,
                  as: 'materia',
                  attributes: ['id', 'asignatura']
                }
              ]
            });
            
            const materias = materiasQuery.map(item => item.materia);
            
            return {
              ...grado.get({ plain: true }),
              materiasImpartidas: materias
            };
          })
        );
        
        res.status(200).json(gradosConMaterias);
      } catch (error) {
        console.error('Error al obtener grados por profesor:', error);
        res.status(500).json({ message: error.message });
      }
    },
    getEstudiantesByGrado: async (req, res) => {
      try {
        const { id } = req.params;
        const { annoEscolarID } = req.query;
        
        if (!annoEscolarID) {
          return res.status(400).json({ message: 'Se requiere el ID del año escolar' });
        }
        
        // Verificar que el grado existe
        const grado = await db.Grados.findByPk(id);
        if (!grado) {
          return res.status(404).json({ message: 'Grado no encontrado' });
        }
        
        // Obtener estudiantes asignados al grado en el año escolar especificado
        const estudiantes = await db.Personas.findAll({
          attributes: ['id', 'nombre', 'apellido', 'cedula', 'fechaNacimiento', 'genero'],
          where: { tipo: 'estudiante' }, // Añadir esta línea para filtrar solo estudiantes
          include: [
            {
              model: db.Grados,
              as: 'grados',
              where: { id },
              through: {
                model: db.Grado_Personas,
                where: { annoEscolarID },
                attributes: []
              }
            }
          ]
        });
        
        res.json(estudiantes);
      } catch (err) {
        console.error('Error al obtener estudiantes por grado:', err);
        res.status(500).json({ message: err.message });
      }
    },
    // Obtener grados por estudiante
    getGradosByEstudiante: async (req, res) => {
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
        
        // Obtener los grados del estudiante para el año escolar especificado
        const grados = await db.Grados.findAll({
          include: [
            {
              model: db.Personas,
              as: 'personas',
              where: { id },
              through: {
                model: db.Grado_Personas,
                where: { annoEscolarID },
                attributes: []
              },
              attributes: []
            },
            {
              model: db.Niveles,
              as: 'Niveles',
              attributes: ['id', 'nombre_nivel']
            }
          ]
        });
        
        res.json(grados);
      } catch (err) {
        console.error('Error al obtener grados por estudiante:', err);
        res.status(500).json({ message: err.message });
      }
    },
    asignarEstudianteAGrado: async (req, res) => {
        try {
          const { estudianteID, gradoID, annoEscolarID } = req.body;
          
          // Verificar que el estudiante existe y es de tipo estudiante
          const estudiante = await db.Personas.findByPk(estudianteID);
          if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
          }
          
          if (estudiante.tipo !== 'estudiante') {
            return res.status(400).json({ message: 'La persona seleccionada no es un estudiante' });
          }
          
          // Verificar que el grado existe
          const grado = await Grados.findByPk(gradoID);
          if (!grado) {
            return res.status(404).json({ message: 'Grado no encontrado' });
          }
          
          // Verificar si ya existe la asignación
          const existingAssignment = await db.Grado_Personas.findOne({
            where: { personaID: estudianteID, gradoID, annoEscolarID }
          });
          
          if (existingAssignment) {
            return res.status(400).json({ message: 'Este estudiante ya está asignado a este grado para este año escolar' });
          }
          
          // Crear la asignación
          const newAssignment = await db.Grado_Personas.create({
            personaID: estudianteID,
            gradoID,
            annoEscolarID
          });
          
          res.status(201).json(newAssignment);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
    },
    // Asignar profesor a un grado
    asignarProfesor: async (req, res) => {
      const { gradoID } = req.params;
      const { profesorID, annoEscolarID } = req.body;
      
      if (!gradoID || !profesorID || !annoEscolarID) {
        return res.status(400).json({ message: 'Faltan datos requeridos' });
      }
      
      try {
        // Verificar que el grado existe
        const grado = await Grados.findByPk(gradoID);
        if (!grado) {
          return res.status(404).json({ message: 'Grado no encontrado' });
        }
        
        // Verificar que el profesor existe
        const profesor = await Personas.findOne({
          where: { id: profesorID, tipo: 'profesor' }
        });
        if (!profesor) {
          return res.status(404).json({ message: 'Profesor no encontrado' });
        }
        
        // Verificar que el año escolar existe
        const annoEscolar = await AnnoEscolar.findByPk(annoEscolarID);
        if (!annoEscolar) {
          return res.status(404).json({ message: 'Año escolar no encontrado' });
        }
        
        // Verificar si ya existe una asignación
        const asignacionExistente = await Grado_Personas.findOne({
          where: {
            gradoID,
            personaID: profesorID,
            annoEscolarID
          }
        });
        
        if (asignacionExistente) {
          return res.status(400).json({ message: 'El profesor ya está asignado a este grado' });
        }
        
        // Crear la asignación
        await Grado_Personas.create({
          gradoID,
          personaID: profesorID,
          annoEscolarID
        });
        
        res.status(201).json({ message: 'Profesor asignado correctamente al grado' });
      } catch (err) {
        console.error('Error al asignar profesor a grado:', err);
        res.status(500).json({ message: err.message });
      }
    },
    createGrado: async (req, res) => {
        try {
            const newGrado = await Grados.create(req.body);
            res.status(201).json(newGrado);
        } catch (err) {
            console.error(err);
            res.status(400).json({ message: err.message });
        }
    },
    deleteGrado: async (req, res) => {
        try {
            const deletedGrado = await Grados.destroy({ where: { id: req.params.id } });
            if (deletedGrado) {
                res.json({ message: 'Grado eliminado' });
            } else {
                res.status(404).json({ message: 'Grado no encontrado' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },
    // Eliminar estudiante de grado
    eliminarEstudianteDeGrado: async (req, res) => {
        try {
        const { gradoID, estudianteID, annoEscolarID } = req.params;
        
        const deleted = await db.Grado_Personas.destroy({
            where: { gradoID, personaID: estudianteID, annoEscolarID }
        });
        
        if (deleted === 0) {
            return res.status(404).json({ message: 'Asignación no encontrada' });
        }
        
        res.json({ message: 'Estudiante eliminado del grado correctamente' });
        } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
        }
    },
    // Transferir estudiante a otro grado
    transferirEstudianteDeGrado: async (req, res) => {
      try {
        const { estudianteID, gradoOrigenID, gradoDestinoID, annoEscolarID, seccionOrigenID, seccionDestinoID } = req.body;
        
        // Verificar que el estudiante existe y es de tipo estudiante
        const estudiante = await db.Personas.findByPk(estudianteID);
        if (!estudiante) {
          return res.status(404).json({ message: 'Estudiante no encontrado' });
        }
        
        if (estudiante.tipo !== 'estudiante') {
          return res.status(400).json({ message: 'La persona seleccionada no es un estudiante' });
        }
        
        // Verificar que el grado destino existe
        const gradoDestino = await Grados.findByPk(gradoDestinoID);
        if (!gradoDestino) {
          return res.status(404).json({ message: 'Grado destino no encontrado' });
        }
        
        // Verificar si el estudiante está asignado al grado origen
        const asignacionOrigen = await db.Grado_Personas.findOne({
          where: { personaID: estudianteID, gradoID: gradoOrigenID, annoEscolarID }
        });
        
        if (!asignacionOrigen) {
          return res.status(404).json({ message: 'El estudiante no está asignado al grado origen' });
        }
        
        // Verificar si ya existe la asignación en el grado destino
        const existingAssignment = await db.Grado_Personas.findOne({
          where: { personaID: estudianteID, gradoID: gradoDestinoID, annoEscolarID }
        });
        
        if (existingAssignment) {
          return res.status(400).json({ message: 'Este estudiante ya está asignado al grado destino para este año escolar' });
        }
        
        // Usar una transacción para asegurar que todas las operaciones se completen o ninguna
        const t = await db.sequelize.transaction();
        
        try {
          // 1. Eliminar del grado origen
          await db.Grado_Personas.destroy({
            where: { personaID: estudianteID, gradoID: gradoOrigenID, annoEscolarID },
            transaction: t
          });
          
          // 2. Asignar al grado destino
          const newAssignment = await db.Grado_Personas.create({
            personaID: estudianteID,
            gradoID: gradoDestinoID,
            annoEscolarID,
            fechaTransferencia: new Date() // Registrar la fecha de transferencia
          }, { transaction: t });
          
          // 3. Si se proporcionaron IDs de sección, manejar la transferencia de sección
          if (seccionOrigenID) {
            // Verificar si el estudiante está en la sección origen
            const seccionAsignacionOrigen = await db.Seccion_Personas.findOne({
              where: { 
                personaID: estudianteID, 
                seccionID: seccionOrigenID, 
                annoEscolarID 
              },
              transaction: t
            });
            
            if (seccionAsignacionOrigen) {
              // Eliminar de la sección origen
              await db.Seccion_Personas.destroy({
                where: { 
                  personaID: estudianteID, 
                  seccionID: seccionOrigenID, 
                  annoEscolarID 
                },
                transaction: t
              });
              
              // Actualizar cupo de la sección origen (disminuir ocupados, aumentar disponibles)
              const cupoOrigen = await db.Cupos.findOne({
                where: {
                  seccionID: seccionOrigenID,
                  annoEscolarID
                },
                transaction: t
              });
              
              if (cupoOrigen) {
                await cupoOrigen.update({
                  ocupados: Math.max(0, cupoOrigen.ocupados - 1),
                  disponibles: Math.min(cupoOrigen.capacidad, cupoOrigen.disponibles + 1)
                }, { transaction: t });
              }
            }
          }
          
          // 4. Si se proporcionó una sección destino, asignar al estudiante
          if (seccionDestinoID) {
            // Verificar si ya existe la asignación en la sección destino
            const existingSeccionAssignment = await db.Seccion_Personas.findOne({
              where: { 
                personaID: estudianteID, 
                seccionID: seccionDestinoID, 
                annoEscolarID 
              },
              transaction: t
            });
            
            if (!existingSeccionAssignment) {
              // Asignar a la sección destino
              await db.Seccion_Personas.create({
                personaID: estudianteID,
                seccionID: seccionDestinoID,
                annoEscolarID,
                fechaAsignacion: new Date()
              }, { transaction: t });
              
              // Actualizar cupo de la sección destino (aumentar ocupados, disminuir disponibles)
              const cupoDestino = await db.Cupos.findOne({
                where: {
                  seccionID: seccionDestinoID,
                  annoEscolarID
                },
                transaction: t
              });
              
              if (cupoDestino) {
                await cupoDestino.update({
                  ocupados: cupoDestino.ocupados + 1,
                  disponibles: Math.max(0, cupoDestino.disponibles - 1)
                }, { transaction: t });
              } else {
                // Si no existe un registro de cupo para esta sección, crear uno
                const seccion = await db.Secciones.findByPk(seccionDestinoID, { transaction: t });
                if (seccion) {
                  const capacidad = seccion.capacidad || 30;
                  await db.Cupos.create({
                    gradoID: gradoDestinoID,
                    seccionID: seccionDestinoID,
                    annoEscolarID,
                    capacidad,
                    ocupados: 1,
                    disponibles: capacidad - 1
                  }, { transaction: t });
                }
              }
            }
          }
          
          // 5. Actualizar la inscripción del estudiante si existe
          const inscripcion = await db.Inscripciones.findOne({
            where: {
              estudianteID,
              annoEscolarID
            },
            transaction: t
          });
          
          if (inscripcion) {
            await inscripcion.update({
              gradoID: gradoDestinoID,
              seccionID: seccionDestinoID || null
            }, { transaction: t });
          }
          
          // Si todo va bien, confirmar la transacción
          await t.commit();
          
          res.status(200).json({ 
            message: 'Estudiante transferido correctamente',
            asignacion: newAssignment,
            inscripcionID: inscripcion ? inscripcion.id : null
          });
        } catch (error) {
          // Si hay un error, revertir la transacción
          await t.rollback();
          throw error;
        }
      } catch (err) {
        console.error('Error al transferir estudiante:', err);
        res.status(500).json({ message: err.message });
      }
    },
    
    updateGrado: async (req, res) => {
        try {
            const updated = await Grados.update(req.body, { where: { id: req.params.id } });
            if (updated) {
                const updatedGrado = await Grados.findByPk(req.params.id);
                res.json({ message: 'Grado actualizado', grado: updatedGrado });
            } else {
                res.status(404).json({ message: 'Grado no encontrado' });
            }
        } catch (err) {
            console.error(err);
            res.status(400).json({ message: err.message });
        }
    }
};

module.exports = gradosController;