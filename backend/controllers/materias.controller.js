const db = require('../models');
const Personas = db.Personas;
const Materias = db.Materias;
const Grados = db.Grados;
const Calificaciones = db.Calificaciones;
const Grado_Materia = db.Grado_Materia;
const Profesor_Materia_Grados = db.Profesor_Materia_Grados;
const AnnoEscolar = db.AnnoEscolar;


const materiasController = {
    getAllMaterias: async (req, res) => {
        try {
            const materias = await Materias.findAll();
            if (materias) {
                res.json(materias);
            } else {
                res.status(404).json({message: 'No se encontraron materias'})
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({message: err.message})
        }
    },
    getMateriaByID: async (req, res) => {
        try {
            const materia = await Materias.findByPk(req.params.id);
            if (materia) {
                res.json(materia);
            } else {
                res.status(404).json({message: 'Materia no encontrada'});
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({message: err.message})
        }
    },
    getMateriasByProfesor: async (req, res) => {
      try {
        const { id } = req.params; // ID del profesor
        
        if (!id) {
          return res.status(400).json({ message: 'Se requiere el ID del profesor' });
        }
        
        console.log('Buscando materias para el profesor ID:', id);
        
        // Verificar que el profesor existe
        const profesor = await db.Personas.findOne({
          where: { id: id, tipo: 'profesor' }
        });
        
        if (!profesor) {
          return res.status(404).json({ message: 'Profesor no encontrado' });
        }
        
        // Obtener el año escolar activo o el especificado en la consulta
        const annoEscolarID = req.query.annoEscolarID || (await db.AnnoEscolar.findOne({ where: { activo: true } }))?.id;
        
        if (!annoEscolarID) {
          return res.status(404).json({ message: 'No se encontró un año escolar activo' });
        }
        
        // Obtener materias asignadas al profesor de forma más robusta
        // Primero obtener los registros de asignación profesor-materia-grado
        const asignaciones = await db.Profesor_Materia_Grados.findAll({
          attributes: ['profesorID', 'materiaID', 'gradoID', 'annoEscolarID'],
          where: {
            profesorID: id,
            annoEscolarID: annoEscolarID
          },
          include: [
            {
              model: db.Materias,
              as: 'materia',
              attributes: ['id', 'asignatura']
            },
            {
              model: db.Grados,
              as: 'grado',
              attributes: ['id', 'nombre_grado', 'nivelID'],
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
        
        // Si no hay asignaciones, devolver array vacío
        if (asignaciones.length === 0) {
          return res.status(200).json([]);
        }
        
        // Agrupar por materia y recolectar grados
        const materiasMap = {};
        
        asignaciones.forEach(asignacion => {
          const materia = asignacion.materia;
          if (!materiasMap[materia.id]) {
            materiasMap[materia.id] = {
              ...materia.get({ plain: true }),
              gradosImpartidos: []
            };
          }
          
          // Agregar el grado si no está duplicado
          const gradoExistente = materiasMap[materia.id].gradosImpartidos.some(g => g.id === asignacion.grado.id);
          if (!gradoExistente) {
            materiasMap[materia.id].gradosImpartidos.push(asignacion.grado.get({ plain: true }));
          }
        });
        
        const materiasConGrados = Object.values(materiasMap);
        
        res.status(200).json(materiasConGrados);
      } catch (error) {
        console.error('Error al obtener materias por profesor:', error);
        res.status(500).json({ message: error.message });
      }
    },
    
    // Obtener grados asignados a una materia
    getGradosByMateria: async (req, res) => {
      try {
        const { id } = req.params; // ID de la materia
        const { annoEscolarID } = req.query;
        
        // Validar que la materia existe
        const materia = await db.Materias.findByPk(id);
        if (!materia) {
          return res.status(404).json({ message: 'Materia no encontrada' });
        }
        
        // Obtener el año escolar actual o el especificado
        let idAnnoEscolar = annoEscolarID;
        if (!idAnnoEscolar) {
          const annoEscolarActivo = await db.AnnoEscolar.findOne({ 
            where: { activo: true } 
          });
          if (annoEscolarActivo) {
            idAnnoEscolar = annoEscolarActivo.id;
          }
        }
        
        // Obtener los grados asignados a esta materia
        const grados = await db.Grados.findAll({
          attributes: ['id', 'nombre_grado', 'nivelID'],
          include: [
            {
              model: db.Materias,
              as: 'Materias',
              where: { id },
              through: {
                model: db.Grado_Materia,
                where: idAnnoEscolar ? { annoEscolarID: idAnnoEscolar } : {},
                attributes: []
              },
              attributes: []
            },
            {
              model: db.Niveles,
              as: 'Niveles',
              attributes: ['id', 'nombre_nivel']
            }
          ],
          order: [['nombre_grado', 'ASC']]
        });
        
        res.json(grados);
      } catch (err) {
        console.error('Error al obtener grados por materia:', err);
        res.status(500).json({ message: err.message });
      }
    },

    // Obtener materias de un grado (por ruta /grado/:gradoID/materias)
    getMateriasByGrado: async (req, res) => {
      try {
        const { gradoID } = req.params; // ID del grado
        const { annoEscolarID, limit } = req.query;
        
        // Validar que el grado existe
        const grado = await db.Grados.findByPk(gradoID);
        if (!grado) {
          return res.status(404).json({ message: 'Grado no encontrado' });
        }
        
        // Obtener el año escolar actual o el especificado
        let idAnnoEscolar = annoEscolarID;
        if (!idAnnoEscolar) {
          const annoEscolarActivo = await db.AnnoEscolar.findOne({ 
            where: { activo: true } 
          });
          if (annoEscolarActivo) {
            idAnnoEscolar = annoEscolarActivo.id;
          }
        }
        
        // Construir las opciones de consulta
        const options = {
          include: [
            {
              model: db.Grados,
              as: 'Grados',
              where: { id: gradoID },
              through: { 
                model: db.Grado_Materia,
                where: idAnnoEscolar ? { annoEscolarID: idAnnoEscolar } : {},
                attributes: [] 
              }
            }
          ],
          order: [['asignatura', 'ASC']]
        };
        
        // Si se especifica un límite y es mayor que 0, aplicarlo
        if (limit && parseInt(limit) > 0) {
          options.limit = parseInt(limit);
        }
        
        // Obtener las materias
        const materias = await db.Materias.findAll(options);
        
        // Para cada materia, obtener los profesores asignados
        const materiasConProfesores = await Promise.all(
          materias.map(async (materia) => {
            const profesores = await db.Personas.findAll({
              attributes: ['id', 'nombre', 'apellido', 'cedula', 'email', 'telefono'],
              include: [
                {
                  model: db.Materias,
                  as: 'materiasImpartidas',
                  where: { id: materia.id },
                  through: {
                    model: db.Profesor_Materia_Grados,
                    where: { gradoID: gradoID, annoEscolarID: idAnnoEscolar }
                  }
                }
              ]
            });
            
            return {
              ...materia.get({ plain: true }),
              profesoresAsignados: profesores
            };
          })
        );
        
        res.json(materiasConProfesores);
      } catch (err) {
        console.error('Error al obtener materias por grado:', err);
        res.status(500).json({ message: err.message });
      }
    },
    
    // Obtener materias que un profesor imparte en un grado específico
    getMateriasByProfesorEnGrado: async (req, res) => {
      try {
        const { profesorID, gradoID } = req.params;
        const { annoEscolarID } = req.query;
        
        if (!profesorID || !gradoID) {
          return res.status(400).json({ message: 'Se requieren los IDs de profesor y grado' });
        }
        
        // Usar el año escolar de la consulta o el activo
        let idAnnoEscolar = annoEscolarID;
        if (!idAnnoEscolar) {
          const annoEscolarActivo = await db.AnnoEscolar.findOne({ where: { activo: true } });
          if (annoEscolarActivo) {
            idAnnoEscolar = annoEscolarActivo.id;
          }
        }
        
        if (!idAnnoEscolar) {
          return res.status(404).json({ message: 'No se encontró un año escolar activo' });
        }
        
        // Obtener las materias que el profesor imparte en el grado específico
        const materias = await db.Materias.findAll({
          include: [
            {
              model: db.Personas,
              as: 'profesores',
              where: { 
                id: profesorID,
                tipo: 'profesor'
              },
              through: { 
                model: db.Profesor_Materia_Grados,
                where: { 
                  gradoID: gradoID,
                  annoEscolarID: idAnnoEscolar 
                },
                attributes: []
              },
              attributes: []
            }
          ],
          order: [['asignatura', 'ASC']]
        });
        
        res.status(200).json(materias);
      } catch (error) {
        console.error('Error al obtener materias por profesor en grado:', error);
        res.status(500).json({ message: error.message });
      }
    },
    
    getMateriasByEstudiante: async (req, res) => {
        try {
            const personaID = req.params.id;
            const estudiante = await Personas.findByPk(personaID, {
                include: {
                    model: Grados,
                    as: 'grados',
                    include: {
                        model: Materias,
                        as: 'materias',
                        include: {
                            model: Calificaciones,
                            as: 'calificaciones',
                            where: { personaID },
                            required: false
                        }
                    }
                }
            });
            if (!estudiante) {
                return res.status(404).json({message: 'Estudiante no encontrado'});
            }
            const materias = estudiante.grados.flatMap(grados => { grados.materias});
            const materiasConCalificaciones = materias.map(materias)
        } catch (err) {
            console.error(err);
            res.status(500).json({message: err.message});
        }
    },
    createMateria: async (req, res) => {
        try {
            const newMateria = await Materias.create(req.body);
            res.status(201).json(newMateria);
        } catch (err) {
            console.error(err);
            res.status(500).json({message: err.message});
        }
    },
    asignarMateriaAGrado: async (req, res) => {
        try {
          const { gradoID, materiaID, annoEscolarID } = req.body;
          
          // Verificar que el grado existe
          const grado = await db.Grados.findByPk(gradoID);
          if (!grado) {
            return res.status(404).json({ message: 'Grado no encontrado' });
          }
          
          // Verificar que la materia existe
          const materia = await Materias.findByPk(materiaID);
          if (!materia) {
            return res.status(404).json({ message: 'Materia no encontrada' });
          }
          
          // Verificar si ya existe la asignación
          const existingAssignment = await db.Grado_Materia.findOne({
            where: { gradoID, materiaID, annoEscolarID }
          });
          
          if (existingAssignment) {
            return res.status(400).json({ message: 'Esta materia ya está asignada a este grado para este año escolar' });
          }
          
          // Crear la asignación
          const newAssignment = await db.Grado_Materia.create({
            gradoID,
            materiaID,
            annoEscolarID
          });
          
          res.status(201).json(newAssignment);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
    },
      // Asignar profesor a materia en grado
        asignarProfesorAMateria: async (req, res) => {
        try {
          const { profesorID, materiaID, gradoID, seccionID, annoEscolarID } = req.body;
          
          // Verificar que el profesor existe y es de tipo profesor
          const profesor = await db.Personas.findByPk(profesorID);
          if (!profesor) {
            return res.status(404).json({ message: 'Profesor no encontrado' });
          }
          
          if (profesor.tipo !== 'profesor') {
            return res.status(400).json({ message: 'La persona seleccionada no es un profesor' });
          }
          
          // Verificar que la materia está asignada al grado
          const gradoMateria = await db.Grado_Materia.findOne({
            where: { gradoID, materiaID, annoEscolarID }
          });
          
          if (!gradoMateria) {
            return res.status(400).json({ 
              message: 'Esta materia no está asignada a este grado. Primero debe asignar la materia al grado.' 
            });
          }

          // Si se proporciona seccionID, validar que la sección pertenece al grado
          if (seccionID) {
            const seccion = await db.Secciones.findByPk(seccionID);
            if (!seccion || seccion.gradoID !== parseInt(gradoID)) {
              return res.status(400).json({ 
                message: 'La sección seleccionada no pertenece al grado especificado.' 
              });
            }
          }
          
          // Verificar si ya existe la asignación
          const whereClause = { profesorID, materiaID, gradoID, annoEscolarID };
          if (seccionID) {
            whereClause.seccionID = seccionID;
          }
          
          const existingAssignment = await db.Profesor_Materia_Grados.findOne({
            where: whereClause
          });
          
          if (existingAssignment) {
            return res.status(400).json({ 
              message: 'Este profesor ya está asignado a esta materia en este grado' + (seccionID ? ' y sección' : '') + ' para este año escolar' 
            });
          }
          
          // Crear la asignación
          const newAssignment = await db.Profesor_Materia_Grados.create({
            profesorID,
            materiaID,
            gradoID,
            seccionID: seccionID || null,
            annoEscolarID
          });
          
          res.status(201).json(newAssignment);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
      },
    deleteMateria: async (req, res) => {
        try {
            const deletedMateria = await Materias.destroy({ where: { id: req.params.id } })
            if (deletedMateria) {
                console.log()
                res.status(200).json({message: 'Materia eliminada'})
            } else {
                res.status(404).json({message: 'No se encuentró materia'})
            }
        } catch (err) {
            console.error(err)
            res.status(500).json({message: err.message})
        }
    },
    eliminarMateriaDeGrado: async (req, res) => {
        try {
          const { gradoID, materiaID, annoEscolarID } = req.params;
          
          const deleted = await db.Grado_Materia.destroy({
            where: { gradoID, materiaID, annoEscolarID }
          });
          
          if (deleted === 0) {
            return res.status(404).json({ message: 'Asignación no encontrada' });
          }
          
          res.json({ message: 'Materia eliminada del grado correctamente' });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
    },

    eliminarProfesorDeMateria: async (req, res) => {
        try {
          const { profesorID, materiaID, gradoID, annoEscolarID } = req.params;
          
          const deleted = await db.Profesor_Materia_Grados.destroy({
            where: { profesorID, materiaID, gradoID, annoEscolarID }
          });
          
          if (deleted === 0) {
            return res.status(404).json({ message: 'Asignación no encontrada' });
          }
          
          res.json({ message: 'Profesor eliminado de la materia correctamente' });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
    },
    updateMateria: async (req, res) => {
        try {
            const updatedMateria = await Materias.findByPk(req.params.id);
            if (updatedMateria) {
                await updatedMateria.update(req.body);
                res.json(updatedMateria);
            } else {
                res.status(404).
                json({message: 'Materia no encontrada'})
            }
        } catch (error) {
            console.error(err);
            res.status(500).json({message: err.message})
        }
    },

// Asignar materia a sección específica
asignarMateriaASeccion: async (req, res) => {
    try {
      const { materiaID, seccionID, annoEscolarID } = req.body;
      
      // Verificar que la materia existe
      const materia = await db.Materias.findByPk(materiaID);
      if (!materia) {
        return res.status(404).json({ message: 'Materia no encontrada' });
      }
      
      // Verificar que la sección existe
      const seccion = await db.Secciones.findByPk(seccionID);
      if (!seccion) {
        return res.status(404).json({ message: 'Sección no encontrada' });
      }
      
      // Verificar que el año escolar existe
      const annoEscolar = await db.AnnoEscolar.findByPk(annoEscolarID);
      if (!annoEscolar) {
        return res.status(404).json({ message: 'Año escolar no encontrado' });
      }
      
      // Obtener el grado de la sección
      const gradoID = seccion.gradoID;
      
      // Verificar que la materia está asignada al grado
      const gradoMateria = await db.Grado_Materia.findOne({
        where: { gradoID, materiaID, annoEscolarID }
      });
      
      if (!gradoMateria) {
        // Si la materia no está asignada al grado, la asignamos
        await db.Grado_Materia.create({
          gradoID,
          materiaID,
          annoEscolarID
        });
      }
      
      // Crear una entrada en una tabla de relación Seccion_Materia si es necesario
      // O simplemente devolver éxito si no se requiere una tabla adicional
      
      res.status(201).json({ 
        message: 'Materia asignada a la sección correctamente' 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener materias por sección
  getMateriasBySeccion: async (req, res) => {
    try {
      const { seccionID } = req.params;
      const { annoEscolarID } = req.query;
      
      if (!annoEscolarID) {
        return res.status(400).json({ message: 'Se requiere el ID del año escolar' });
      }
      
      const seccion = await db.Secciones.findByPk(seccionID);
      if (!seccion) {
        return res.status(404).json({ message: 'Sección no encontrada' });
      }
      
      const gradoID = seccion.gradoID;
      
      // Obtener las materias asignadas al grado de esta sección
      const materias = await db.Materias.findAll({
        include: [{
          model: db.Grados,
          as: 'Grados',
          through: {
            where: { annoEscolarID },
            attributes: []
          },
          where: { id: gradoID },
          required: true
        }]
      });
      
      res.json(materias);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
  
}

module.exports = materiasController;