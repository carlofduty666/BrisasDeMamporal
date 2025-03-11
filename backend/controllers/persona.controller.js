const db = require('../models');
const Persona = db.Persona;

const getAllPersonas = async (req, res) => {
  try {
      const personas = await Persona.getAllPersonas();
      res.json(personas);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
  }
};

const getPersonasByTipo = async (req, res) => {
  const { tipo } = req.params;
  try {
      const filter = { tipo: tipo };
      const personas = await Persona.getAllPersonas(filter);
      res.json(personas);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
  }
};

const getPersonaByCriterio = async (req, res) => {
    const { field, value } = req.params;
  
    try {
      const persona = await Persona.getPersonaBy(field, value);
  
      if (persona) {
        res.json(persona);
      } else {
        res.status(404).json({ message: `Persona no encontrada con ${field} = ${value}` });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  };

const createPersona = async (req, res) => {
    try {
        const newPersona = await Persona.create(req.body);
        res.status(201).json(newPersona);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
}


module.exports = { 
    getAllPersonas,
    getPersonasByTipo,
    getPersonaByCriterio,
    createPersona
}