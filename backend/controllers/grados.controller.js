const db = require('../models');
const Niveles = db.Niveles
const Grados = db.Grados;

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