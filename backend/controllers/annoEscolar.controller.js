const db = require('../models');
const AnnoEscolar = db.AnnoEscolar;

const annoEscolarController = {
  // Obtener todos los años escolares
  getAllAnnoEscolares: async (req, res) => {
    try {
      const annoEscolares = await AnnoEscolar.findAll();
      res.json(annoEscolares);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener año escolar por ID
  getAnnoEscolarById: async (req, res) => {
    try {
      const annoEscolar = await AnnoEscolar.findByPk(req.params.id);
      if (annoEscolar) {
        res.json(annoEscolar);
      } else {
        res.status(404).json({ message: 'Año escolar no encontrado' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener año escolar actual (activo)
  getAnnoEscolarActual: async (req, res) => {
    try {
      const annoEscolar = await AnnoEscolar.findOne({
        where: { activo: true }
      });
      
      if (annoEscolar) {
        res.json(annoEscolar);
      } else {
        res.status(404).json({ message: 'No hay un año escolar activo' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },

  // Obtener meses del año escolar (Sep-Jun) con precio vigente de ConfiguracionPagos
  getMesesAnnoEscolar: async (req, res) => {
    try {
      const { id } = req.params;
      const anno = await AnnoEscolar.findByPk(id);
      if (!anno) {
        return res.status(404).json({ message: 'Año escolar no encontrado' });
      }

      // Cargar configuración de pagos activa para obtener precio mensual
      const { ConfiguracionPagos } = db;
      const cfg = await ConfiguracionPagos.findOne({ where: { activo: true }, order: [['updatedAt','DESC']] });
      const precioUSD = Number(cfg?.precioMensualidadUSD ?? cfg?.precioMensualidad ?? 0);

      // Meses típicos del ciclo escolar: Sep(9) .. Jun(6)
      const mesesNombres = [
        { mes: 9, nombre: 'Septiembre' },
        { mes: 10, nombre: 'Octubre' },
        { mes: 11, nombre: 'Noviembre' },
        { mes: 12, nombre: 'Diciembre' },
        { mes: 1, nombre: 'Enero' },
        { mes: 2, nombre: 'Febrero' },
        { mes: 3, nombre: 'Marzo' },
        { mes: 4, nombre: 'Abril' },
        { mes: 5, nombre: 'Mayo' },
        { mes: 6, nombre: 'Junio' }
      ];

      // Derivar años desde el periodo YYYY-YYYY
      const [yStartStr, yEndStr] = String(anno.periodo).split('-');
      const yStart = Number(yStartStr);
      const yEnd = Number(yEndStr);

      const meses = mesesNombres.map((m, idx) => {
        const anio = m.mes >= 9 ? yStart : yEnd; // Sep-Dic usan yStart; Ene-Jun usan yEnd
        return {
          id: `${id}-${idx+1}`,
          nombre: m.nombre,
          mesNumero: m.mes,
          anio,
          montoPago: precioUSD
        };
      });

      return res.json(meses);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error al obtener meses del año escolar' });
    }
  },
  
  // Crear nuevo año escolar
  createAnnoEscolar: async (req, res) => {
    try {
      const { periodo, activo } = req.body;
      
      // Validar formato del período (YYYY-YYYY)
      if (!periodo || !periodo.match(/^\d{4}-\d{4}$/)) {
        return res.status(400).json({ 
          message: 'El período debe tener el formato YYYY-YYYY (ejemplo: 2024-2025)' 
        });
      }
      
      // Validar que el año inicial sea menor que el final
      const [yearStart, yearEnd] = periodo.split('-').map(Number);
      if (yearStart >= yearEnd) {
        return res.status(400).json({ 
          message: 'El año inicial debe ser menor que el año final' 
        });
      }
      
      // Verificar si ya existe un período con el mismo nombre
      const existingPeriodo = await AnnoEscolar.findOne({ where: { periodo } });
      if (existingPeriodo) {
        return res.status(400).json({ message: 'Ya existe un año escolar con este período' });
      }
      
      // Si el nuevo año escolar será activo, desactivamos los demás
      if (activo) {
        await AnnoEscolar.update({ activo: false }, { where: {} });
      }
      
      const newAnnoEscolar = await AnnoEscolar.create({ periodo, activo });
      res.status(201).json(newAnnoEscolar);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  },
  
  // Actualizar año escolar
  updateAnnoEscolar: async (req, res) => {
    try {
      const { id } = req.params;
      const { periodo, activo } = req.body;
      
      // Buscar el año escolar
      const annoEscolar = await AnnoEscolar.findByPk(id);
      if (!annoEscolar) {
        return res.status(404).json({ message: 'Año escolar no encontrado' });
      }
      
      // Validar formato del período si se está actualizando
      if (periodo && !periodo.match(/^\d{4}-\d{4}$/)) {
        return res.status(400).json({ 
          message: 'El período debe tener el formato YYYY-YYYY (ejemplo: 2024-2025)' 
        });
      }
      
      // Validar que el año inicial sea menor que el final
      if (periodo) {
        const [yearStart, yearEnd] = periodo.split('-').map(Number);
        if (yearStart >= yearEnd) {
          return res.status(400).json({ 
            message: 'El año inicial debe ser menor que el año final' 
          });
        }
        
        // Verificar si ya existe otro período con el mismo nombre
        const existingPeriodo = await AnnoEscolar.findOne({ 
          where: { periodo, id: { [db.Sequelize.Op.ne]: id } } 
        });
        
        if (existingPeriodo) {
          return res.status(400).json({ message: 'Ya existe otro año escolar con este período' });
        }
      }
      
      // Si se está activando este año escolar, desactivamos los demás
      if (activo) {
        await AnnoEscolar.update({ activo: false }, { where: {} });
      }
      
      // Actualizar el año escolar
      await annoEscolar.update({ periodo, activo });
      
      res.json(annoEscolar);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  },
  
  // Eliminar año escolar
  deleteAnnoEscolar: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar si hay registros relacionados
      const hasRelatedRecords = await checkRelatedRecords(id);
      if (hasRelatedRecords) {
        return res.status(400).json({ 
          message: 'No se puede eliminar este año escolar porque tiene registros asociados' 
        });
      }
      
      const annoEscolar = await AnnoEscolar.findByPk(id);
      if (!annoEscolar) {
        return res.status(404).json({ message: 'Año escolar no encontrado' });
      }
      
      await annoEscolar.destroy();
      
      res.json({ message: 'Año escolar eliminado correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Establecer año escolar como activo
  setAnnoEscolarActivo: async (req, res) => {
    try {
      const { id } = req.params;
      
      const annoEscolar = await AnnoEscolar.findByPk(id);
      if (!annoEscolar) {
        return res.status(404).json({ message: 'Año escolar no encontrado' });
      }
      
      // Desactivar todos los años escolares
      await AnnoEscolar.update({ activo: false }, { where: {} });
      
      // Activar el año escolar seleccionado
      await annoEscolar.update({ activo: true });
      
      res.json({ 
        message: 'Año escolar establecido como activo correctamente',
        annoEscolar
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
};

// Función auxiliar para verificar si hay registros relacionados
async function checkRelatedRecords(annoEscolarID) {
  const gradoPersonasCount = await db.Grado_Personas.count({ where: { annoEscolarID } });
  const gradoMateriasCount = await db.Grado_Materia.count({ where: { annoEscolarID } });
  const profesorMateriaGradosCount = await db.Profesor_Materia_Grado.count({ where: { annoEscolarID } });
  const calificacionesCount = await db.Calificaciones.count({ where: { annoEscolarID } });
  
  return gradoPersonasCount > 0 || gradoMateriasCount > 0 || 
         profesorMateriaGradosCount > 0 || calificacionesCount > 0;
}

module.exports = annoEscolarController;
