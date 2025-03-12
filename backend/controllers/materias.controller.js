const db = require('../models');
const Personas = db.Personas;
const Materias = db.Materias;
const Grados = db.Grados;
const Calificaciones = db.Calificaciones


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
    getMateriasByGrado: async (req, res) => {
        try {
            const materias = await Materias.findAll();
            if (materias) {
                res.json(materias);
            } else {
                res.status(404).json({message: 'No se encontraron materias para este grado'});
            }
        } catch (err) {
            console.error(err);
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
    }.
    deleteMateria: async (req, res) => {
        try {
            const deletedMateria = await Materias.destroy({ where: { id: req.params.id } })
            if (deletedMateria) {
                console.log()
                res.status(200).json({message: 'Materia eliminada'})
            } else {
                res.status(404).json({message: 'No se encuentró materia'})
            } catch (err) {
                console.error(err)
                res.status(500).json({message: err.message})
            }
        }
    }
}