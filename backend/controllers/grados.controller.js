const db = require('../models');
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
    getGradoByNivel: async (req, res) => {
        try {
            const grado = await Grados.findOne({ where: { nivel: req.params.nivel } });
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
                const updatedGrado = await Grado.findByPk(req.params.id);
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