const db = require('../models');
const Secciones = db.Secciones;
const Grados = db.Grados;
const Personas = db.Personas;
const AnnoEscolar = db.AnnoEscolar;
const Seccion_Personas = db.Seccion_Personas;

const seccionController = {
  // Obtener todas las secciones
  getAllSecciones: async (req, res) => {
    try {
      const secciones = await Secciones.findAll({
        include: [{
          model: Grados,
          as: 'Grados'
        }]
      });
      res.json(secciones);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener sección por ID
  getSeccionById: async (req, res) => {
    try {
      const seccion = await Secciones.findByPk(req.params.id, {
        include: [{
          model: Grados,
          as: 'Grados'
        }]
      });
      
      if (seccion) {
        res.json(seccion);
      } else {
        res.status(404).json({ message: 'Sección no encontrada' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener secciones por grado
  getSeccionesByGrado: async (req, res) => {
    try {
      const { gradoID } = req.params;
      
      const secciones = await Secciones.findAll({
        where: { gradoID },
        include: [{
          model: Grados,
          as: 'Grados'
        }]
      });
      
      if (secciones.length > 0) {
        res.json(secciones);
      } else {
        res.status(404).json({ message: 'No se encontraron secciones para este grado' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Crear sección
  createSeccion: async (req, res) => {
    try {
      const { nombre_seccion, gradoID } = req.body;
      
      // Verificar que el grado existe
      const grado = await Grados.findByPk(gradoID);
      if (!grado) {
        return res.status(404).json({ message: 'Grado no encontrado' });
      }
      
      // Verificar que no exista una sección con el mismo nombre en el mismo grado
      const existingSeccion = await Secciones.findOne({
        where: { nombre_seccion, gradoID }
      });
      
      if (existingSeccion) {
        return res.status(400).json({ 
          message: 'Ya existe una sección con este nombre en el grado especificado' 
        });
      }
      
      const newSeccion = await Secciones.create({ nombre_seccion, gradoID });
      
      res.status(201).json(newSeccion);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  },
  
  // Actualizar sección
  updateSeccion: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre_seccion, gradoID } = req.body;
      
      const seccion = await Secciones.findByPk(id);
      if (!seccion) {
        return res.status(404).json({ message: 'Sección no encontrada' });
      }
      
      if (gradoID) {
        // Verificar que el grado existe
        const grado = await Grados.findByPk(gradoID);
        if (!grado) {
          return res.status(404).json({ message: 'Grado no encontrado' });
        }
      }
      
      if (nombre_seccion && gradoID) {
        // Verificar que no exista otra sección con el mismo nombre en el mismo grado
        const existingSeccion = await Secciones.findOne({
          where: { 
            nombre_seccion, 
            gradoID,
            id: { [db.Sequelize.Op.ne]: id }
          }
        });
        
        if (existingSeccion) {
          return res.status(400).json({ 
            message: 'Ya existe otra sección con este nombre en el grado especificado' 
          });
        }
      }
      
      await seccion.update({ nombre_seccion, gradoID });
      
      res.json(seccion);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  },
  
  // Eliminar sección
  deleteSeccion: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si hay estudiantes asignados a esta sección
      const estudiantesCount = await Seccion_Personas.count({ where: { seccionID: id } });
      
      if (estudiantesCount > 0) {
        return res.status(400).json({ 
          message: 'No se puede eliminar esta sección porque tiene estudiantes asignados' 
        });
      }
      
      const seccion = await Secciones.findByPk(id);
      if (!seccion) {
        return res.status(404).json({ message: 'Sección no encontrada' });
      }
      
      await seccion.destroy();
      
      res.json({ message: 'Sección eliminada correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Asignar estudiante a sección
  asignarEstudianteASeccion: async (req, res) => {
    try {
      const { estudianteID, seccionID, annoEscolarID } = req.body;
      
      // Verificar que el estudiante existe y es de tipo estudiante
      const estudiante = await Personas.findByPk(estudianteID);
      if (!estudiante) {
        return res.status(404).json({ message: 'Estudiante no encontrado' });
      }
      
      if (estudiante.tipo !== 'estudiante') {
        return res.status(400).json({ message: 'La persona seleccionada no es un estudiante' });
      }
      
      // Verificar que la sección existe
      const seccion = await Secciones.findByPk(seccionID);
      if (!seccion) {
        return res.status(404).json({ message: 'Sección no encontrada' });
      }
      
      // Verificar que el año escolar existe
      const annoEscolar = await AnnoEscolar.findByPk(annoEscolarID);
      if (!annoEscolar) {
        return res.status(404).json({ message: 'Año escolar no encontrado' });
      }
      
      // Verificar si el estudiante ya está asignado a otra sección en el mismo año escolar
      const existingAssignment = await Seccion_Personas.findOne({
        where: { personaID: estudianteID, annoEscolarID }
      });
      
      if (existingAssignment) {
        return res.status(400).json({ 
          message: 'Este estudiante ya está asignado a una sección para este año escolar' 
        });
      }
      
      // Asignar el estudiante a la sección
      const newAssignment = await Seccion_Personas.create({
        personaID: estudianteID,
        seccionID,
        annoEscolarID
      });
      
      // También asignar el estudiante al grado correspondiente
      const gradoID = seccion.gradoID;
      
      // Verificar si el estudiante ya está asignado al grado
      const existingGradoAssignment = await db.Grado_Personas.findOne({
        where: { personaID: estudianteID, gradoID, annoEscolarID }
      });
      
      if (!existingGradoAssignment) {
        await db.Grado_Personas.create({
          personaID: estudianteID,
          gradoID,
          annoEscolarID
        });
      }
      
      res.status(201).json(newAssignment);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Eliminar estudiante de sección
  eliminarEstudianteDeSeccion: async (req, res) => {
    try {
      const { seccionID, estudianteID, annoEscolarID } = req.params;
      
      const deleted = await Seccion_Personas.destroy({
        where: { 
          seccionID, 
          personaID: estudianteID, 
          annoEscolarID 
        }
      });
      
      if (deleted === 0) {
        return res.status(404).json({ message: 'Asignación no encontrada' });
      }
      
      res.json({ message: 'Estudiante eliminado de la sección correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener estudiantes de una sección
  getEstudiantesBySeccion: async (req, res) => {
    try {
      const { seccionID } = req.params;
      const { annoEscolarID } = req.query;
      
      if (!annoEscolarID) {
        return res.status(400).json({ message: 'Se requiere el ID del año escolar' });
      }
      
      const seccion = await Secciones.findByPk(seccionID);
      if (!seccion) {
        return res.status(404).json({ message: 'Sección no encontrada' });
      }
      
      const estudiantes = await Personas.findAll({
        include: [{
          model: Secciones,
          as: 'secciones',
          through: {
            where: { annoEscolarID },
            attributes: []
          },
          where: { id: seccionID },
          required: true
        }],
        where: { tipo: 'estudiante' }
      });
      
      res.json(estudiantes);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Asignar profesor a sección para una materia
  asignarProfesorASeccionMateria: async (req, res) => {
    try {
      const { profesorID, seccionID, materiaID, annoEscolarID } = req.body;
      
      // Verificar que el profesor existe y es de tipo profesor
      const profesor = await Personas.findByPk(profesorID);
      if (!profesor) {
        return res.status(404).json({ message: 'Profesor no encontrado' });
      }
      
      if (profesor.tipo !== 'profesor') {
        return res.status(400).json({ message: 'La persona seleccionada no es un profesor' });
      }
      
      // Verificar que la sección existe
      const seccion = await Secciones.findByPk(seccionID);
      if (!seccion) {
        return res.status(404).json({ message: 'Sección no encontrada' });
      }
      
      // Verificar que la materia existe
      const materia = await db.Materias.findByPk(materiaID);
      if (!materia) {
        return res.status(404).json({ message: 'Materia no encontrada' });
      }
      
      // Verificar que el año escolar existe
      const annoEscolar = await AnnoEscolar.findByPk(annoEscolarID);
      if (!annoEscolar) {
        return res.status(404).json({ message: 'Año escolar no encontrado' });
      }
      
      // Obtener el grado de la sección
      const gradoID = seccion.gradoID;
      
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
      const existingAssignment = await db.Profesor_Materia_Grado.findOne({
        where: { profesorID, materiaID, gradoID, annoEscolarID }
      });
      
      if (!existingAssignment) {
        // Crear la asignación profesor-materia-grado
        await db.Profesor_Materia_Grado.create({
          profesorID,
          materiaID,
          gradoID,
          annoEscolarID
        });
      }
      
      // Crear o actualizar la asignación profesor-sección
      await Seccion_Personas.findOrCreate({
        where: { 
          personaID: profesorID, 
          seccionID, 
          annoEscolarID 
        }
      });
      
      res.status(201).json({ 
        message: 'Profesor asignado a la sección para la materia correctamente' 
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = seccionController;
