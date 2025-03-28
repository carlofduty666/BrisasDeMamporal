const db = require('../models');
const Niveles = db.Niveles;
const Grados = db.Grados;
const Materias = db.Materias;
const Personas = db.Personas;
const Grado_Personas = db.Grado_Personas;
const Profesor_Materia_Grados = db.Profesor_Materia_Grados;
const AnnoEscolar = db.AnnoEscolar;

const gradosController = {
    getAllGrados: async (req, res) => {
        try {
            const grados = await Grados.findAll();
            res.json(grados);
        } catch (err) {
            console.error(err);
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
    getEstudiantesByGrado: async (req, res) => {
        try {
          const { id } = req.params;
          const { annoEscolarID } = req.query;
          
          if (!annoEscolarID) {
            return res.status(400).json({ message: 'Se requiere el ID del año escolar' });
          }
          
          const grado = await Grados.findByPk(id, {
            include: [{
              model: db.Personas,
              as: 'personas',
              through: {
                where: { annoEscolarID },
                attributes: []
              },
              where: { tipo: 'estudiante' },
              attributes: ['id', 'nombre', 'apellido', 'cedula', 'fechaNacimiento', 'email', 'telefono']
            }]
          });
          
          if (!grado) {
            return res.status(404).json({ message: 'Grado no encontrado' });
          }
          
          res.json(grado.personas);
        } catch (err) {
          console.error(err);
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