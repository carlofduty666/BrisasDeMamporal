const db = require('../models');
const Personas = db.Personas;

const getAllPersonas = async (req, res) => {
  try {
      const personas = await Personas.getAllPersonas();
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
      const personas = await Personas.getAllPersonas(filter);
      res.json(personas);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
  }
};

const getPersonaByCriterio = async (req, res) => {
    const { field, value } = req.params;
  
    try {
      const persona = await Personas.getPersonaBy(field, value);
  
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
        const newPersona = await Personas.create(req.body);
        res.status(201).json(newPersona);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
}

const deletePersona = async (req, res) => {
  try {
      const deletedPersona = await Personas.destroy({
          where: { id: req.params.id }
      });
      if (deletedPersona) {
          res.json({ message: 'Persona eliminada' });
      } else {
          res.status(404).json({ message: 'Persona no encontrada' });
      }
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
}

const updatePersona = async (req, res) => {
  try {
      const persona = await Personas.findByPk(req.params.id);
      if (!persona) {
          return res.status(404).json({ message: 'Persona no encontrada' });
      }

      await Personas.update(req.body, {
          where: { id: req.params.id }
      });

      const updatedPersona = await Personas.findByPk(req.params.id);
      res.json({ message: 'Persona actualizada', persona: updatedPersona });
  } catch (err) {
      res.status(400).json({ message: err.message });
  }
}



module.exports = { 
    getAllPersonas,
    getPersonasByTipo,
    getPersonaByCriterio,
    createPersona,
    deletePersona,
    updatePersona
}