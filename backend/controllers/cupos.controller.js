const db = require('../models');
const Cupo = db.Cupos;
const Grados = db.Grados;
const Secciones = db.Secciones;
const AnnoEscolar = db.AnnoEscolar;
const Seccion_Personas = db.Seccion_Personas;
const { Op } = require('sequelize');

console.log('Modelos disponibles:', Object.keys(db));

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
            as: 'Secciones'
          },
          {
            model: AnnoEscolar,
            as: 'annoEscolar'
          }
        ],
        order: [
          [{ model: Grados, as: 'grado' }, 'nombre_grado', 'ASC'],
          [{ model: Secciones, as: 'Secciones' }, 'nombre_seccion', 'ASC']
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
            as: 'Secciones'
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
  // Obtener resumen de cupos por grado
// Obtener resumen de cupos por grado
getResumenCupos: async (req, res) => {
  try {
    const { annoEscolarID } = req.query;
    
    // Verificar que los modelos necesarios existen
    if (!db || !db.Grados || !db.Secciones || !db.AnnoEscolar || !db.Seccion_Personas) {
      console.error('Error: Uno o más modelos no están definidos correctamente');
      return res.status(500).json({ 
        message: 'Error interno del servidor: modelos no definidos correctamente',
        details: {
          dbExists: !!db,
          gradosExists: !!(db && db.Grados),
          seccionesExists: !!(db && db.Secciones),
          annoEscolarExists: !!(db && db.AnnoEscolar),
          seccionPersonasExists: !!(db && db.Seccion_Personas)
        }
      });
    }
    
    // Obtener año escolar activo si no se especifica
    let annoEscolarActivo = annoEscolarID;
    if (!annoEscolarActivo) {
      const annoEscolar = await db.AnnoEscolar.findOne({
        where: { activo: true }
      });
      
      if (annoEscolar) {
        annoEscolarActivo = annoEscolar.id;
      } else {
        return res.status(404).json({ message: 'No hay un año escolar activo' });
      }
    }
    
    // Obtener todos los grados
    const grados = await db.Grados.findAll({
      order: [['nombre_grado', 'ASC']]
    });
    
    if (!grados || grados.length === 0) {
      return res.json({
        annoEscolarID: annoEscolarActivo,
        resumenCupos: []
      });
    }
    
    const resumenCupos = [];
    
    for (const grado of grados) {
      let totalCapacidad = 0;
      let totalOcupados = 0;
      let totalDisponibles = 0;
      
      // Buscar cupos registrados para este grado
      let cuposRegistrados = [];
      try {
        if (db.Cupos) {
          cuposRegistrados = await db.Cupos.findAll({
            where: {
              gradoID: grado.id,
              annoEscolarID: annoEscolarActivo
            }
          });
        }
      } catch (error) {
        console.error(`Error al buscar cupos registrados para grado ${grado.id}:`, error);
      }
      
      if (cuposRegistrados && cuposRegistrados.length > 0) {
        // Usar cupos registrados
        for (const cupo of cuposRegistrados) {
          totalCapacidad += cupo.capacidad || 0;
          totalOcupados += cupo.ocupados || 0;
          totalDisponibles += cupo.disponibles || 0;
        }
      } else {
        // Obtener secciones directamente
        let secciones = [];
        try {
          secciones = await db.Secciones.findAll({
            where: { gradoID: grado.id }
          });
        } catch (error) {
          console.error(`Error al buscar secciones para grado ${grado.id}:`, error);
        }
        
        if (secciones && secciones.length > 0) {
          for (const seccion of secciones) {
            const capacidad = seccion.capacidad || 30;
            
            // Contar estudiantes inscritos
            let estudiantesInscritos = 0;
            try {
              estudiantesInscritos = await db.Seccion_Personas.count({
                where: {
                  seccionID: seccion.id,
                  annoEscolarID: annoEscolarActivo
                }
              });
            } catch (error) {
              console.error(`Error al contar estudiantes para sección ${seccion.id}:`, error);
            }
            
            totalCapacidad += capacidad;
            totalOcupados += estudiantesInscritos;
            totalDisponibles += Math.max(0, capacidad - estudiantesInscritos);
          }
        } else {
          // Si no hay secciones, asignar valores predeterminados
          totalCapacidad = 30;
          totalOcupados = 0;
          totalDisponibles = 30;
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
    console.error('Error en getResumenCupos:', err);
    res.status(500).json({ 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
},

  
  // // Crear o actualizar cupo
  // createOrUpdateCupo: async (req, res) => {
  //   try {
  //     const { gradoID, seccionID, annoEscolarID, capacidad } = req.body;
      
  //     // Validar datos
  //     if (!gradoID || !seccionID || !annoEscolarID || capacidad === undefined) {
  //       return res.status(400).json({ message: 'Todos los campos son requeridos' });
  //     }
      
  //     // Validar que el grado existe
  //     const grado = await Grados.findByPk(gradoID);
  //     if (!grado) {
  //       return res.status(404).json({ message: 'Grado no encontrado' });
  //     }
      
  //     // Validar que la sección existe
  //     const seccion = await Secciones.findByPk(seccionID);
  //     if (!seccion) {
  //       return res.status(404).json({ message: 'Sección no encontrada' });
  //     }
      
  //     // Validar que el año escolar existe
  //     const annoEscolar = await AnnoEscolar.findByPk(annoEscolarID);
  //     if (!annoEscolar) {
  //       return res.status(404).json({ message: 'Año escolar no encontrado' });
  //     }
      
  //     // Contar estudiantes inscritos
  //     const estudiantesInscritos = await Seccion_Personas.count({
  //       where: {
  //         seccionID,
  //         annoEscolarID
  //       }
  //     });
      
  //     // Validar que la capacidad no sea menor que los estudiantes inscritos
  //     if (capacidad < estudiantesInscritos) {
  //       return res.status(400).json({ 
  //         message: `La capacidad no puede ser menor que el número de estudiantes inscritos (${estudiantesInscritos})` 
  //       });
  //     }
      
  //     // Buscar si ya existe un cupo para esta combinación
  //     const [cupo, created] = await Cupo.findOrCreate({
  //       where: {
  //         gradoID,
  //         seccionID,
  //         annoEscolarID
  //       },
  //       defaults: {
  //         capacidad,
  //         ocupados: estudiantesInscritos,
  //         disponibles: capacidad - estudiantesInscritos
  //       }
  //     });
      
  //     if (!created) {
  //       // Actualizar cupo existente
  //       await cupo.update({
  //         capacidad,
  //         ocupados: estudiantesInscritos,
  //         disponibles: capacidad - estudiantesInscritos
  //       });
  //     }
      
  //     res.status(created ? 201 : 200).json({
  //       message: created ? 'Cupo creado correctamente' : 'Cupo actualizado correctamente',
  //       cupo
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ message: err.message });
  //   }
  // },

  // En cupos.controller.js
// Crear cupo
createCupo: async (req, res) => {
  try {
    const { gradoID, seccionID, annoEscolarID, capacidad, ocupados, disponibles } = req.body;
    
    // Validar datos - Corregido para manejar el valor 0
    if (!gradoID || !seccionID || !annoEscolarID || capacidad === undefined || ocupados === undefined || disponibles === undefined) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    
    // Verificar que los modelos necesarios existen
    if (!db || !db.Cupos) {
      console.error('Error: El modelo Cupos no está definido correctamente');
      return res.status(500).json({ 
        message: 'Error interno del servidor: modelo Cupos no definido correctamente',
        details: {
          dbExists: !!db,
          cuposExists: !!(db && db.Cupos)
        }
      });
    }
    
    // Verificar si ya existe un registro para este grado, sección y año escolar
    let cupoExistente = null;
    try {
      cupoExistente = await db.Cupos.findOne({
        where: { gradoID, seccionID, annoEscolarID }
      });
    } catch (error) {
      console.error('Error al buscar cupo existente:', error);
      return res.status(500).json({ 
        message: 'Error al buscar cupo existente',
        error: error.message
      });
    }
    
    if (cupoExistente) {
      // Actualizar el registro existente
      try {
        await cupoExistente.update({
          capacidad,
          ocupados,
          disponibles
        });
        
        return res.json({
          message: 'Cupos actualizados correctamente',
          cupo: cupoExistente
        });
      } catch (error) {
        console.error('Error al actualizar cupo existente:', error);
        return res.status(500).json({ 
          message: 'Error al actualizar cupo existente',
          error: error.message
        });
      }
    }
    
    // Crear nuevo registro de cupos
    try {
      const nuevoCupo = await db.Cupos.create({
        gradoID,
        seccionID,
        annoEscolarID,
        capacidad,
        ocupados,
        disponibles
      });
      
      res.status(201).json({
        message: 'Cupos creados correctamente',
        cupo: nuevoCupo
      });
    } catch (error) {
      console.error('Error al crear nuevo cupo:', error);
      return res.status(500).json({ 
        message: 'Error al crear nuevo cupo',
        error: error.message
      });
    }
  } catch (err) {
    console.error('Error en createCupo:', err);
    res.status(500).json({ 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
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