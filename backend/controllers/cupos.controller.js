const db = require('../models');
const Cupo = db.Cupo;
const Grados = db.Grados;
const Secciones = db.Secciones;
const AnnoEscolar = db.AnnoEscolar;
const Seccion_Personas = db.Seccion_Personas;
const { Op } = require('sequelize');

const cupoController = {
  // Obtener todos los cupos
  getAllCupos: async (req, res) => {
    try {
      const { annoEscolarID } = req.query;
      
      const whereClause = {};
      if (annoEscolarID) whereClause.annoEscolarID = annoEscolarID;
      
      const cupos = await Cupo.findAll({
        where: whereClause,
        include: [
          {
            model: Grados,
            as: 'grado'
          },
          {
            model: Secciones,
            as: 'seccion'
          },
          {
            model: AnnoEscolar,
            as: 'annoEscolar'
          }
        ],
        order: [
          [{ model: Grados, as: 'grado' }, 'nombre_grado', 'ASC'],
          [{ model: Secciones, as: 'seccion' }, 'nombre_seccion', 'ASC']
        ]
      });
      
      res.json(cupos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener cupos por grado
  getCuposByGrado: async (req, res) => {
    try {
      const { gradoID } = req.params;
      const { annoEscolarID } = req.query;
      
      // Validar que el grado existe
      const grado = await Grados.findByPk(gradoID);
      if (!grado) {
        return res.status(404).json({ message: 'Grado no encontrado' });
      }
      
      // Obtener año escolar activo si no se especifica
      let annoEscolarActivo = annoEscolarID;
      if (!annoEscolarActivo) {
        const annoEscolar = await AnnoEscolar.findOne({
          where: { activo: true }
        });
        
        if (annoEscolar) {
          annoEscolarActivo = annoEscolar.id;
        } else {
          return res.status(404).json({ message: 'No hay un año escolar activo' });
        }
      }
      
      // Buscar cupos en la tabla Cupo
      const cuposRegistrados = await Cupo.findAll({
        where: {
          gradoID,
          annoEscolarID: annoEscolarActivo
        },
        include: [
          {
            model: Secciones,
            as: 'seccion'
          }
        ]
      });
      
      // Si hay cupos registrados, devolverlos
      if (cuposRegistrados.length > 0) {
        return res.json(cuposRegistrados);
      }
      
      // Si no hay cupos registrados, calcularlos dinámicamente
      const secciones = await Secciones.findAll({
        where: { gradoID }
      });
      
      const cuposCalculados = [];
      
      for (const seccion of secciones) {
        // Contar estudiantes inscritos en esta sección para el año escolar
        const estudiantesInscritos = await Seccion_Personas.count({
          where: {
            seccionID: seccion.id,
            annoEscolarID: annoEscolarActivo
          }
        });
        
        const capacidad = seccion.capacidad || 30;
        const disponibles = capacidad - estudiantesInscritos;
        
        cuposCalculados.push({
          gradoID,
          seccionID: seccion.id,
          annoEscolarID: annoEscolarActivo,
          capacidad,
          ocupados: estudiantesInscritos,
          disponibles,
          seccion: seccion
        });
      }
      
      res.json(cuposCalculados);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener resumen de cupos por grado
  getResumenCupos: async (req, res) => {
    try {
      const { annoEscolarID } = req.query;
      
      // Obtener año escolar activo si no se especifica
      let annoEscolarActivo = annoEscolarID;
      if (!annoEscolarActivo) {
        const annoEscolar = await AnnoEscolar.findOne({
          where: { activo: true }
        });
        
        if (annoEscolar) {
          annoEscolarActivo = annoEscolar.id;
        } else {
          return res.status(404).json({ message: 'No hay un año escolar activo' });
        }
      }
      
      // Obtener todos los grados
      const grados = await Grados.findAll({
        include: [
          {
            model: Secciones,
            as: 'secciones'
          }
        ],
        order: [['nombre_grado', 'ASC']]
      });
      
      const resumenCupos = [];
      
      for (const grado of grados) {
        let totalCapacidad = 0;
        let totalOcupados = 0;
        let totalDisponibles = 0;
        
        // Buscar cupos registrados para este grado
        const cuposRegistrados = await Cupo.findAll({
          where: {
            gradoID: grado.id,
            annoEscolarID: annoEscolarActivo
          }
        });
        
        if (cuposRegistrados.length > 0) {
          // Usar cupos registrados
          for (const cupo of cuposRegistrados) {
            totalCapacidad += cupo.capacidad;
            totalOcupados += cupo.ocupados;
            totalDisponibles += cupo.disponibles;
          }
        } else {
          // Calcular dinámicamente
          for (const seccion of grado.secciones) {
            const capacidad = seccion.capacidad || 30;
            
            // Contar estudiantes inscritos
            const estudiantesInscritos = await Seccion_Personas.count({
              where: {
                seccionID: seccion.id,
                annoEscolarID: annoEscolarActivo
              }
            });
            
            totalCapacidad += capacidad;
            totalOcupados += estudiantesInscritos;
            totalDisponibles += (capacidad - estudiantesInscritos);
          }
        }
        
        resumenCupos.push({
          gradoID: grado.id,
          nombre_grado: grado.nombre_grado,
          totalCapacidad,
          totalOcupados,
          totalDisponibles,
          porcentajeOcupacion: totalCapacidad > 0 ? Math.round((totalOcupados / totalCapacidad) * 100) : 0
        });
      }
      
      res.json({
        annoEscolarID: annoEscolarActivo,
        resumenCupos
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Crear o actualizar cupo
  createOrUpdateCupo: async (req, res) => {
    try {
      const { gradoID, seccionID, annoEscolarID, capacidad } = req.body;
      
      // Validar datos
      if (!gradoID || !seccionID || !annoEscolarID || capacidad === undefined) {
        return res.status(400).json({ message: 'Todos los campos son requeridos' });
      }
      
      // Validar que el grado existe
      const grado = await Grados.findByPk(gradoID);
      if (!grado) {
        return res.status(404).json({ message: 'Grado no encontrado' });
      }
      
      // Validar que la sección existe
      const seccion = await Secciones.findByPk(seccionID);
      if (!seccion) {
        return res.status(404).json({ message: 'Sección no encontrada' });
      }
      
      // Validar que el año escolar existe
      const annoEscolar = await AnnoEscolar.findByPk(annoEscolarID);
      if (!annoEscolar) {
        return res.status(404).json({ message: 'Año escolar no encontrado' });
      }
      
      // Contar estudiantes inscritos
      const estudiantesInscritos = await Seccion_Personas.count({
        where: {
          seccionID,
          annoEscolarID
        }
      });
      
      // Validar que la capacidad no sea menor que los estudiantes inscritos
      if (capacidad < estudiantesInscritos) {
        return res.status(400).json({ 
          message: `La capacidad no puede ser menor que el número de estudiantes inscritos (${estudiantesInscritos})` 
        });
      }
      
      // Buscar si ya existe un cupo para esta combinación
      const [cupo, created] = await Cupo.findOrCreate({
        where: {
          gradoID,
          seccionID,
          annoEscolarID
        },
        defaults: {
          capacidad,
          ocupados: estudiantesInscritos,
          disponibles: capacidad - estudiantesInscritos
        }
      });
      
      if (!created) {
        // Actualizar cupo existente
        await cupo.update({
          capacidad,
          ocupados: estudiantesInscritos,
          disponibles: capacidad - estudiantesInscritos
        });
      }
      
      res.status(created ? 201 : 200).json({
        message: created ? 'Cupo creado correctamente' : 'Cupo actualizado correctamente',
        cupo
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Actualizar capacidad de cupo
  updateCapacidadCupo: async (req, res) => {
    try {
      const { id } = req.params;
      const { capacidad } = req.body;
      
      if (capacidad === undefined) {
        return res.status(400).json({ message: 'La capacidad es requerida' });
      }
      
      const cupo = await Cupo.findByPk(id);
      
      if (!cupo) {
        return res.status(404).json({ message: 'Cupo no encontrado' });
      }
      
      // Validar que la capacidad no sea menor que los ocupados
      if (capacidad < cupo.ocupados) {
        return res.status(400).json({ 
          message: `La capacidad no puede ser menor que el número de estudiantes inscritos (${cupo.ocupados})` 
        });
      }
      
      await cupo.update({
        capacidad,
        disponibles: capacidad - cupo.ocupados
      });
      
      res.json({
        message: 'Capacidad actualizada correctamente',
        cupo
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Eliminar cupo
  deleteCupo: async (req, res) => {
    try {
      const { id } = req.params;
      
      const cupo = await Cupo.findByPk(id);
      
      if (!cupo) {
        return res.status(404).json({ message: 'Cupo no encontrado' });
      }
      
      // Verificar si hay estudiantes inscritos
      if (cupo.ocupados > 0) {
        return res.status(400).json({ 
          message: 'No se puede eliminar el cupo porque hay estudiantes inscritos' 
        });
      }
      
      await cupo.destroy();
      
      res.json({ message: 'Cupo eliminado correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = cupoController;