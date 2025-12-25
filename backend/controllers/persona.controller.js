const db = require('../models');
const Personas = db.Personas;
const Roles = db.Roles;
const Persona_Roles = db.Persona_Roles;

// const getAllPersonas = async (req, res) => {
//   try {
//       const personas = await Personas.getAllPersonas();
//       res.json(personas);
//   } catch (err) {
//       console.error(err);
//       res.status(500).json({ message: err.message });
//   }
// };

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

const getPersonasByQuery = async (req, res) => {
  try {
    const { tipo, id } = req.query;
    
    // Construir condiciones de filtro
    const where = {};
    if (tipo) where.tipo = tipo;
    if (id) where.id = id;
    
    const personas = await Personas.findAll({ where });
    
    res.json(personas);
  } catch (err) {
    console.error('Error al obtener personas con filtros:', err);
    res.status(500).json({ message: err.message });
  }
};

// Obtener persona por criterio específico
const getPersonaByCriterio = async (req, res) => {
  const { field, value } = req.params;

  try {
    // Construir condición de filtro dinámica
    const where = {};
    where[field] = value;
    
    const persona = await Personas.findOne({ where });

    if (persona) {
      res.json(persona);
    } else {
      res.status(404).json({ message: `Persona no encontrada con ${field} = ${value}` });
    }
  } catch (err) {
    console.error('Error al buscar persona por criterio:', err);
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
    console.error('Error al obtener persona por ID:', err);
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


// Obtener estudiantes por profesor
const getEstudiantesByProfesor = async (req, res) => {
  try {
    const { id } = req.params;
    const { annoEscolarID } = req.query;
    
    if (!annoEscolarID) {
      return res.status(400).json({ message: 'Se requiere el ID del año escolar' });
    }
    
    // Verificar que el profesor existe
    const profesor = await db.Personas.findOne({
      where: { 
        id: id,
        tipo: 'profesor'
      }
    });
    
    if (!profesor) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }
    
    // Buscar las asignaciones del profesor (materias, grados) en el año escolar actual
    const asignacionesProfesor = await db.Profesor_Materia_Grados.findAll({
      where: { 
        profesorID: id,
        annoEscolarID: annoEscolarID
      },
      include: [
        {
          model: db.Grados,
          as: 'grado'
        },
        {
          model: db.Materias,
          as: 'materia'
        }
      ]
    });
    
    if (!asignacionesProfesor || asignacionesProfesor.length === 0) {
      return res.json([]);
    }
    
    // Obtener IDs de los grados donde enseña el profesor
    const gradoIDs = [...new Set(asignacionesProfesor.map(asig => asig.gradoID))];
    
    // Buscar estudiantes asignados a esos grados para el año escolar actual
    const estudiantesGrado = await db.Grado_Personas.findAll({
      where: { 
        gradoID: gradoIDs,
        annoEscolarID: annoEscolarID,
        tipo: 'estudiante'
      },
      include: [
        {
          model: db.Personas,
          as: 'persona',
          where: { tipo: 'estudiante' }  // Cambiado de 'personas' a 'persona' según la asociación
        },
        {
          model: db.Grados,
          as: 'grado'
        }
      ]
    });
    
    // Buscar las secciones de estos estudiantes
    const personaIDs = estudiantesGrado.map(eg => eg.personaID);
    
    const seccionesEstudiantes = await db.Seccion_Personas.findAll({
      where: {
        personaID: personaIDs,
        annoEscolarID: annoEscolarID,
        rol: 'estudiante'
      },
      include: [
        {
          model: db.Secciones,
          as: 'secciones'  // Asegúrate de que esta asociación esté definida correctamente
        }
      ]
    });
    
    // Crear un mapa para acceder rápidamente a la sección de cada estudiante
    const seccionPorEstudiante = {};
    seccionesEstudiantes.forEach(se => {
      seccionPorEstudiante[se.personaID] = {
        seccionID: se.seccionID,
        seccion: se.seccion
      };
    });
    
    // Formatear la respuesta
    const estudiantes = estudiantesGrado.map(eg => {
      const seccionInfo = seccionPorEstudiante[eg.personaID] || {};
      
      return {
        ...eg.persona.toJSON(),  // Cambiado de 'personas' a 'persona'
        gradoID: eg.gradoID,
        grado: eg.grado,
        seccionID: seccionInfo.seccionID,
        seccion: seccionInfo.secciones
      };
    });
    
    res.json(estudiantes);
  } catch (err) {
    console.error('Error al obtener estudiantes por profesor:', err);
    res.status(500).json({ message: err.message });
  }
};


// Obtener profesores por estudiante
const getProfesorByEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const { annoEscolarID, materiaID } = req.query;
    
    if (!annoEscolarID) {
      return res.status(400).json({ message: 'Se requiere el ID del año escolar' });
    }
    
    // Verificar que el estudiante existe
    const estudiante = await db.Personas.findOne({
      where: { 
        id: id,
        tipo: 'estudiante'
      }
    });
    
    if (!estudiante) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    
    // Buscar el grado del estudiante
    const gradoEstudiante = await db.Grado_Personas.findOne({
      where: {
        personaID: id,
        annoEscolarID: annoEscolarID,
        tipo: 'estudiante'
      }
    });
    
    if (!gradoEstudiante) {
      return res.status(404).json({ message: 'No se encontró asignación de grado para este estudiante' });
    }
    
    // Buscar la sección del estudiante
    const seccionEstudiante = await db.Seccion_Personas.findOne({
      where: {
        personaID: id,
        annoEscolarID: annoEscolarID,
        rol: 'estudiante'
      }
    });
    
    // Construir la consulta para encontrar profesores
    let whereClause = {
      gradoID: gradoEstudiante.gradoID,
      annoEscolarID: annoEscolarID
    };
    
    // Si se especifica una materia, filtrar por ella
    if (materiaID) {
      whereClause.materiaID = materiaID;
    }
    
    // Buscar profesores que enseñan en ese grado
    const profesoresAsignados = await db.Profesor_Materia_Grados.findAll({
      where: whereClause,
      include: [
        {
          model: db.Personas,
          as: 'profesor'
        },
        {
          model: db.Materias,
          as: 'materia'
        },
        {
          model: db.Grados,
          as: 'grado'
        }
      ]
    });
    
    if (!profesoresAsignados || profesoresAsignados.length === 0) {
      return res.json([]);
    }
    
    // Formatear la respuesta
    const profesores = profesoresAsignados.map(pa => ({
      ...pa.profesor.toJSON(),
      materia: pa.materia,
      grado: pa.grado
    }));
    
    res.json(profesores);
  } catch (err) {
    console.error('Error al obtener profesores por estudiante:', err);
    res.status(500).json({ message: err.message });
  }
};


// Obtener representante de un estudiante
const getRepresentanteByEstudiante = async (req, res) => {
  try {
    const { id } = req.params;
    const { annoEscolarID } = req.query;
    
    // Verificar que el estudiante existe
    const estudiante = await db.Personas.findOne({
      where: { 
        id: id,
        tipo: 'estudiante'
      }
    });
    
    if (!estudiante) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }
    
    // Buscar la inscripción del estudiante para el año escolar especificado
    let inscripcionQuery = {
      estudianteID: id
    };
    
    if (annoEscolarID) {
      inscripcionQuery.annoEscolarID = annoEscolarID;
    }
    
    const inscripcion = await db.Inscripciones.findOne({
      where: inscripcionQuery,
      order: [['createdAt', 'DESC']] // Obtener la inscripción más reciente
    });
    
    if (!inscripcion || !inscripcion.representanteID) {
      return res.status(404).json({ message: 'No se encontró representante para este estudiante' });
    }
    
    // Obtener los datos del representante
    const representante = await db.Personas.findOne({
      where: { 
        id: inscripcion.representanteID,
        tipo: 'representante'
      }
    });
    
    if (!representante) {
      return res.status(404).json({ message: 'Representante no encontrado' });
    }
    
    res.json(representante);
  } catch (err) {
    console.error('Error al obtener representante del estudiante:', err);
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
  const t = await db.sequelize.transaction();
  try {
    const { id } = req.params;

    // 1) Verificar que la persona exista
    const persona = await Personas.findByPk(id, { transaction: t });
    if (!persona) {
      await t.rollback();
      return res.status(404).json({ message: 'Persona no encontrada' });
    }

    // 2) Solo permitir eliminar representantes sin estudiantes/inscripciones
    if (persona.tipo === 'representante') {
      const inscripcionesCount = await db.Inscripciones.count({
        where: { representanteID: id },
        transaction: t
      });
      if (inscripcionesCount > 0) {
        await t.rollback();
        return res.status(400).json({
          message: 'No se puede eliminar el representante porque tiene estudiantes/inscripciones asociadas.'
        });
      }
    }

    // 3) Eliminar dependencias para evitar errores de clave foránea
    // Usuarios vinculados a la persona
    await db.Usuarios.destroy({ where: { personaID: id }, transaction: t });

    // Documentos vinculados a la persona
    await db.Documentos.destroy({ where: { personaID: id }, transaction: t });

    // Roles asociados (por si la FK no está en cascada en DB)
    await db.Persona_Roles.destroy({ where: { personaID: id }, transaction: t });

    // 4) Eliminar la persona
    const deletedPersona = await Personas.destroy({ where: { id }, transaction: t });

    if (!deletedPersona) {
      await t.rollback();
      return res.status(404).json({ message: 'Persona no encontrada' });
    }

    await t.commit();
    return res.json({ message: 'Persona eliminada' });
  } catch (err) {
    await t.rollback();
    console.error('Error al eliminar persona:', err);
    return res.status(500).json({ message: err.message });
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

// Obtener profesores asignados a una materia y grado específicos
const getProfesorByMateriaGrado = async (req, res) => {
  try {
    const { materiaID, gradoID } = req.query;
    
    if (!materiaID || !gradoID) {
      return res.status(400).json({ 
        message: 'Se requieren los parámetros materiaID y gradoID' 
      });
    }
    
    // Buscar asignaciones de profesor-materia-grado
    const asignaciones = await db.Profesor_Materia_Grados.findAll({
      where: { 
        materiaID: materiaID,
        gradoID: gradoID
      },
      include: [
        {
          model: db.Personas,
          as: 'profesor',
          where: { tipo: 'profesor' },
          attributes: ['id', 'nombre', 'apellido', 'cedula', 'email', 'tipo']
        }
      ],
      attributes: []  // No necesitamos los atributos de la tabla de unión
    });
    
    // Extraer solo los datos de profesores, sin duplicados
    const profesoresMap = new Map();
    asignaciones.forEach(asignacion => {
      if (asignacion.profesor && !profesoresMap.has(asignacion.profesor.id)) {
        profesoresMap.set(asignacion.profesor.id, asignacion.profesor);
      }
    });
    
    res.json(Array.from(profesoresMap.values()));
  } catch (err) {
    console.error('Error al obtener profesores por materia y grado:', err);
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

const getProfesionesAdministrativos = async (req, res) => {
  try {
    const profesiones = await Personas.findAll({
      where: { tipo: 'administrativo' },
      attributes: ['profesion'],
      raw: true,
      group: ['profesion']
    });
    
    const result = profesiones
      .map(p => p.profesion)
      .filter(p => p && p.trim() !== '')
      .sort();
    
    res.json(result);
  } catch (err) {
    console.error('Error al obtener profesiones:', err);
    res.status(500).json({ message: err.message });
  }
};



module.exports = { 
    getPersonasByQuery,
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
    getEstudiantesByRepresentante,
    getRepresentanteByEstudiante,
    getEstudiantesByProfesor,
    getProfesorByEstudiante,
    getProfesorByMateriaGrado,
    getProfesionesAdministrativos
}