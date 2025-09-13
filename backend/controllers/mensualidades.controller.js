const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');
const { Mensualidades, Personas, Inscripciones, AnnoEscolar, Aranceles, PagoEstudiantes, ConfiguracionPagos, MetodoPagos } = require('../models');

const mensualidadesController = {
  // Listado general / filtrado
  async list(req, res) {
    try {
      const { estado, estudianteID, representanteID, annoEscolarID } = req.query;
      const where = {};
      if (estado) where.estado = estado;
      if (estudianteID) where.estudianteID = estudianteID;
      if (representanteID) where.representanteID = representanteID;
      if (annoEscolarID) where.annoEscolarID = annoEscolarID;

      const items = await Mensualidades.findAll({ where, order: [['mes','ASC']] });
      res.json(items);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al listar mensualidades' });
    }
  },

  // Por estudiante
  async listByEstudiante(req, res) {
    try {
      const { estudianteID } = req.params;
      const { annoEscolarID } = req.query;
      const where = { estudianteID };
      if (annoEscolarID) where.annoEscolarID = annoEscolarID;
      const items = await Mensualidades.findAll({ where, order: [['mes','ASC']] });
      res.json(items);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al listar mensualidades del estudiante' });
    }
  },

  // Generar mensualidades por inscripción
  async generarPorInscripcion(req, res) {
    try {
      const { inscripcionID } = req.params;
      const insc = await Inscripciones.findByPk(inscripcionID);
      if (!insc) return res.status(404).json({ message: 'Inscripción no encontrada' });

      const estudianteID = insc.estudianteID;
      const representanteID = insc.representanteID;
      const annoEscolarID = insc.annoEscolarID;

      const config = await ConfiguracionPagos.findOne({ where: { activo: true } });
      const precio = Number(config?.precioMensualidad || 0);

      // Por simplicidad: 10 meses (Sep-Jun) o ajusta a tu calendario
      const meses = [1,2,3,4,5,6,7,8,9,10];
      const created = [];
      for (const mes of meses) {
        const [item] = await Mensualidades.findOrCreate({
          where: { estudianteID, annoEscolarID, mes },
          defaults: {
            estudianteID,
            representanteID,
            inscripcionID,
            annoEscolarID,
            arancelID: null,
            mes,
            anio: null,
            montoBase: precio,
            moraAcumulada: 0,
            estado: 'pendiente',
          }
        });
        created.push(item);
      }
      res.json({ message: 'Mensualidades generadas', count: created.length });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al generar mensualidades' });
    }
  },

  // Aprobar
  async aprobar(req, res) {
    try {
      const { id } = req.params;
      const m = await Mensualidades.findByPk(id);
      if (!m) return res.status(404).json({ message: 'Mensualidad no encontrada' });
      await m.update({ estado: 'pagado' });
      if (m.pagoID) {
        const p = await PagoEstudiantes.findByPk(m.pagoID);
        if (p) await p.update({ estado: 'pagado' });
      }
      res.json({ message: 'Mensualidad aprobada' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al aprobar mensualidad' });
    }
  },

  // Rechazar
  async rechazar(req, res) {
    try {
      const { id } = req.params;
      const { observacionAdmin } = req.body;
      const m = await Mensualidades.findByPk(id);
      if (!m) return res.status(404).json({ message: 'Mensualidad no encontrada' });
      await m.update({ estado: 'anulado', observacionAdmin: observacionAdmin || null });
      if (m.pagoID) {
        const p = await PagoEstudiantes.findByPk(m.pagoID);
        if (p) await p.update({ estado: 'anulado' });
      }
      res.json({ message: 'Mensualidad rechazada' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al rechazar mensualidad' });
    }
  },

  // Enviar recordatorio (one-off)
  async recordatorio(req, res) {
    try {
      const { id } = req.params;
      const m = await Mensualidades.findByPk(id);
      if (!m) return res.status(404).json({ message: 'Mensualidad no encontrada' });
      // Aquí integrar email/SMS según m.representanteID
      // TODO: usar utils/email y datos del representante
      res.json({ message: 'Recordatorio enviado (placeholder)' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al enviar recordatorio' });
    }
  },

  // Reportar pago con comprobante (crea PagoEstudiantes pendiente y asocia a mensualidad)
  async reportar(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const { id } = req.params; // mensualidadID
      const { metodoPagoID, referencia, observaciones } = req.body;

      const mensualidad = await Mensualidades.findByPk(id, { transaction });
      if (!mensualidad) { await transaction.rollback(); return res.status(404).json({ message: 'Mensualidad no encontrada' }); }
      if (mensualidad.estado === 'pagado') { await transaction.rollback(); return res.status(400).json({ message: 'Mensualidad ya pagada' }); }

      const metodo = await MetodoPagos.findOne({ where: { id: metodoPagoID, activo: true }, transaction });
      if (!metodo) { await transaction.rollback(); return res.status(400).json({ message: 'Método de pago inválido o inactivo' }); }

      // Manejo de archivo opcional
      let urlComprobante = null, nombreArchivo = null, tipoArchivo = null, tamanoArchivo = null;
      if (req.files && req.files.comprobante) {
        const comprobante = req.files.comprobante;
        const uploadDir = path.join(__dirname, '../uploads/comprobantes');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        const uniqueFilename = `${Date.now()}-${uuidv4()}${path.extname(comprobante.name)}`;
        const filePath = path.join(uploadDir, uniqueFilename);
        await comprobante.mv(filePath);
        urlComprobante = `/uploads/comprobantes/${uniqueFilename}`;
        nombreArchivo = comprobante.name;
        tipoArchivo = comprobante.mimetype;
        tamanoArchivo = comprobante.size;
      }

      const montoFinal = Number(mensualidad.montoBase || 0) + Number(mensualidad.moraAcumulada || 0);

      // Crear pago pendiente
      const pago = await PagoEstudiantes.create({
        estudianteID: mensualidad.estudianteID,
        representanteID: mensualidad.representanteID,
        metodoPagoID,
        arancelID: mensualidad.arancelID || null,
        inscripcionID: mensualidad.inscripcionID || null,
        annoEscolarID: mensualidad.annoEscolarID,
        monto: montoFinal,
        montoMora: mensualidad.moraAcumulada || 0,
        descuento: 0,
        montoTotal: montoFinal,
        mesPago: String(mensualidad.mes),
        fechaPago: new Date(),
        referencia: referencia || null,
        estado: 'pendiente',
        urlComprobante,
        nombreArchivo,
        tipoArchivo,
        tamanoArchivo,
        observaciones: observaciones || null
      }, { transaction });

      await mensualidad.update({ estado: 'reportado', pagoID: pago.id }, { transaction });

      await transaction.commit();
      res.status(201).json({ message: 'Pago reportado', pagoID: pago.id });
    } catch (e) {
      await transaction.rollback();
      console.error(e);
      res.status(500).json({ message: 'Error al reportar pago', error: e.message });
    }
  },
};

module.exports = mensualidadesController;