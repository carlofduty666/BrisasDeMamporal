const db = require('../models');
const Personas = db.Personas;
const Roles = db.Roles;
const Persona_Roles = db.Persona_Roles;

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
      const personas = await Personas.findAll({ where: filter });
      res.json(personas);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
  }
};


const getPersonaTipoById = async (req, res) => {
  const { tipo, id } = req.params;
  try {
      const filter = { tipo: tipo, id: id };
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

  const getPersonaById = async (req, res) => {
    try {
      const persona = await Personas.findByPk(req.params.id);
      
      if (persona) {
        res.json(persona);
      } else {
        res.status(404).json({ message: 'Persona no encontrada' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
};

// Obtener estudiantes por representante
const getEstudiantesByRepresentante = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el representante existe
    const representante = await db.Personas.findOne({
      where: { 
        id: id,
        tipo: 'representante'
      }
    });
    
    if (!representante) {
      return res.status(404).json({ message: 'Representante no encontrado' });
    }
    
    // Buscar estudiantes asociados a este representante
    const estudiantes = await db.Personas.findAll({
      where: { 
        tipo: 'estudiante'
      },
      include: [
        {
          model: db.Inscripciones,
          as: 'inscripciones',
          where: { representanteID: id },
          required: true,
          include: [
            {
              model: db.Grados,
              as: 'grado'
            },
            {
              model: db.Secciones,
              as: 'Secciones'
            },
            {
              model: db.AnnoEscolar,
              as: 'annoEscolar'
            }
          ]
        },
        {
          model: db.Documentos,
          as: 'documentos',
          required: false
        }
      ]
    });
    
    res.json(estudiantes);
  } catch (err) {
    console.error('Error al obtener estudiantes por representante:', err);
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

const asignarRolAPersona = async (req, res) => {
  try {
    const { personaID, rolID } = req.body;
    
    // Verificar que la persona existe
    const persona = await db.Personas.findByPk(personaID);
    if (!persona) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }
    
    // Verificar que el rol existe
    const rol = await db.Roles.findByPk(rolID);
    if (!rol) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    // Verificar si ya tiene asignado ese rol
    const existingAssignment = await db.Persona_Roles.findOne({
      where: { personaID, rolID }
    });
    
    if (existingAssignment) {
      return res.status(400).json({ message: 'La persona ya tiene asignado este rol' });
    }
    
    // Asignar el rol
    await db.Persona_Roles.create({ personaID, rolID });
    
    res.status(201).json({ message: 'Rol asignado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Eliminar rol de persona
const eliminarRolDePersona = async (req, res) => {
  try {
    const { personaID, rolID } = req.params;
    
    const deleted = await db.Persona_Roles.destroy({
      where: { personaID, rolID }
    });
    
    if (deleted === 0) {
      return res.status(404).json({ message: 'Asignación no encontrada' });
    }
    
    res.json({ message: 'Rol eliminado de la persona correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Obtener roles de una persona
const getRolesDePersona = async (req, res) => {
  try {
    const { id } = req.params;
    
    const persona = await db.Personas.findByPk(id, {
      include: [{
        model: db.Roles,
        as: 'roles',
        through: { attributes: [] }
      }]
    });
    
    if (!persona) {
      return res.status(404).json({ message: 'Persona no encontrada' });
    }
    
    res.json(persona.roles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



module.exports = { 
    getAllPersonas,
    getPersonasByTipo,
    getPersonaByCriterio,
    createPersona,
    deletePersona,
    updatePersona,
    asignarRolAPersona,
    eliminarRolDePersona,
    getRolesDePersona,
    getPersonaById,
    getPersonaTipoById,
    getEstudiantesByRepresentante
}