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
            const materias = await Materias.findAll(req.params.id);
            if (!materias) {
                res.status (400).json({message: 'Parece que este profesor no imparte materias'})
            } else {
                res.json(materias);
            }
        } catch (err) {
            console.error(err)
            res.status(500).json({message: err.message})
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
          const { profesorID, materiaID, gradoID, annoEscolarID } = req.body;
          
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
          
          // Verificar si ya existe la asignación
          const existingAssignment = await db.Profesor_Materia_Grados.findOne({
            where: { profesorID, materiaID, gradoID, annoEscolarID }
          });
          
          if (existingAssignment) {
            return res.status(400).json({ 
              message: 'Este profesor ya está asignado a esta materia en este grado para este año escolar' 
            });
            }
          
          // Crear la asignación
          const newAssignment = await db.Profesor_Materia_Grados.create({
            profesorID,
            materiaID,
            gradoID,
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
    }
}

module.exports = materiasController;