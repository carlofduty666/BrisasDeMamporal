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

  // Obtener meses del año escolar usando rango configurable (startMonth/endMonth) y precios vigentes
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
      const precioVES = Number(cfg?.precioMensualidadVES ?? 0);

      // Derivar años desde el periodo YYYY-YYYY
      const [yStartStr, yEndStr] = String(anno.periodo).split('-');
      const yStart = Number(yStartStr);
      const yEnd = Number(yEndStr);

      // Determinar rango de meses
      const start = Number(anno.startMonth ?? 9);
      const end = Number(anno.endMonth ?? 7);

      // Helper para nombre del mes
      const nombres = ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

      // Construir secuencia inclusiva desde start hasta end con wrap
      const mesesSecuencia = [];
      let m = start;
      while (true) {
        mesesSecuencia.push(m);
        if (m === end) break;
        m = m === 12 ? 1 : m + 1;
      }

      // Mapear meses a objetos con año correcto
      const wrap = end < start; // típico ciclo que cruza de dic->ene
      const meses = mesesSecuencia.map((mesNumero, idx) => {
        const anio = wrap ? (mesNumero >= start ? yStart : yEnd) : yStart;
        return {
          id: `${id}-${idx+1}`,
          nombre: nombres[mesNumero],
          mesNumero,
          anio,
          montoPago: precioUSD,
          montoPagoUSD: precioUSD,
          montoPagoVES: precioVES
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
      const { periodo, activo, startMonth, endMonth } = req.body;
      
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

      // Validar meses si vienen informados (1..12). Si no, usar defaults.
      const sMonth = startMonth != null ? Number(startMonth) : 9;
      const eMonth = endMonth != null ? Number(endMonth) : 7;
      if (sMonth < 1 || sMonth > 12 || eMonth < 1 || eMonth > 12) {
        return res.status(400).json({ message: 'startMonth y endMonth deben estar entre 1 y 12' });
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
      
      const newAnnoEscolar = await AnnoEscolar.create({ periodo, activo, startMonth: sMonth, endMonth: eMonth });
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
      const { periodo, activo, startMonth, endMonth } = req.body;
      
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

      // Validar meses si vienen informados (1..12)
      const updateData = {};
      if (periodo != null) updateData.periodo = periodo;
      if (typeof activo === 'boolean') updateData.activo = activo;
      if (startMonth != null) {
        const sMonth = Number(startMonth);
        if (sMonth < 1 || sMonth > 12) {
          return res.status(400).json({ message: 'startMonth debe estar entre 1 y 12' });
        }
        updateData.startMonth = sMonth;
      }
      if (endMonth != null) {
        const eMonth = Number(endMonth);
        if (eMonth < 1 || eMonth > 12) {
          return res.status(400).json({ message: 'endMonth debe estar entre 1 y 12' });
        }
        updateData.endMonth = eMonth;
      }
      
      // Si se está activando este año escolar, desactivamos los demás
      if (activo) {
        await AnnoEscolar.update({ activo: false }, { where: {} });
      }
      
      // Actualizar el año escolar
      await annoEscolar.update(updateData);
      
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
