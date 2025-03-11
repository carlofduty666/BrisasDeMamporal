const db = require('../models');
const Niveles = db.Niveles;

const getAllNiveles = async (req, res) => {
    try {
        const niveles = await Niveles.findAll();
        res.json(niveles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const getNivelById = async (req, res) => {
    const { id } = req.params;
    try {
        const nivel = await Niveles.findByPk(id);
        if (nivel) {
            res.json(nivel);
        } else {
            res.status(404).json({ message: 'Nivel no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const createNivel = async (req, res) => {
    try {
        const newNivel = await Niveles.create(req.body);
        res.status(201).json(newNivel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const deleteNivel = async (req, res) => {
    try {
        const deletedNivel = await Niveles.destroy({
            where: { id: req.params.id }
        });
        if (deletedNivel) {
            res.json({ message: 'Nivel eliminado' });
        } else {
            res.status(404).json({ message: 'Nivel no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const updateNivel = async (req, res) => {
    try {
        const nivel = await Niveles.findByPk(req.params.id);
        if (nivel) {
            await nivel.update(req.body);
            res.json(nivel);
        } else {
            res.status(404).json({ message: 'Nivel no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllNiveles,
    getNivelById,
    createNivel,
    deleteNivel,
    updateNivel
}