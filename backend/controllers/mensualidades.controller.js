const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const PDFDocument = require('pdfkit');
const XlsxPopulate = require('xlsx-populate');
const db = require('../models');
const { Mensualidades, Personas, Inscripciones, AnnoEscolar, Aranceles, PagoEstudiantes, ConfiguracionPagos, MetodoPagos, Grados, Secciones } = require('../models');

const mensualidadesController = {
  // Resumen mensual (por mes y año) con totales y detalles opcionales
  async resumenMensual(req, res) {
    try {
      const { mes, anio, annoEscolarID, detalle } = req.query;
      if (!mes || !anio) return res.status(400).json({ message: 'mes y anio son requeridos' });
      const where = { mes: Number(mes) };
      if (anio) where.anio = Number(anio);
      if (annoEscolarID) where.annoEscolarID = Number(annoEscolarID);

      const total = await Mensualidades.count({ where });
      const aprobadas = await Mensualidades.count({ where: { ...where, estado: 'pagado' } });
      const reportadas = await Mensualidades.count({ where: { ...where, estado: 'reportado' } });
      const pendientes = await Mensualidades.count({ where: { ...where, estado: 'pendiente' } });
      const rechazadas = await Mensualidades.count({ where: { ...where, estado: 'anulado' } });

      if (String(detalle) === 'true') {
        const items = await Mensualidades.findAll({
          where,
          include: [
            { model: Personas, as: 'estudiante', attributes: ['id','cedula','nombre','apellido'] },
            { model: Personas, as: 'representante', attributes: ['id','cedula','nombre','apellido','telefono','email'] },
            { model: Inscripciones, as: 'inscripcion', attributes: ['id','gradoID','seccionID'], include: [
              { model: Grados, as: 'grado', attributes: ['id','nombre_grado'] },
              { model: Secciones, as: 'Secciones', attributes: ['id','nombre_seccion'] },
            ] },
            { model: AnnoEscolar, as: 'annoEscolar', attributes: ['id','periodo'] },
            { model: Aranceles, as: 'arancel', attributes: ['id','nombre'] },
            { model: PagoEstudiantes, as: 'pago', attributes: ['id','estado','referencia','montoTotal','urlComprobante'] },
          ],
          order: [['estado','ASC'],['anio','ASC'],['mes','ASC']]
        });
        return res.json({ mes: Number(mes), anio: Number(anio), total, aprobadas, reportadas, pendientes, rechazadas, items });
      }

      res.json({ mes: Number(mes), anio: Number(anio), total, aprobadas, reportadas, pendientes, rechazadas });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al obtener resumen mensual' });
    }
  },

  // Resumen anual (por annoEscolarID o rango) con totales acumulados
  async resumenAnual(req, res) {
    try {
      const { annoEscolarID } = req.query;
      const where = {};
      if (annoEscolarID) where.annoEscolarID = Number(annoEscolarID);
      const total = await Mensualidades.count({ where });
      const aprobadas = await Mensualidades.count({ where: { ...where, estado: 'pagado' } });
      const reportadas = await Mensualidades.count({ where: { ...where, estado: 'reportado' } });
      const pendientes = await Mensualidades.count({ where: { ...where, estado: 'pendiente' } });
      const rechazadas = await Mensualidades.count({ where: { ...where, estado: 'anulado' } });

      // Totalizaciones por mes
      const byMes = await Mensualidades.findAll({
        where,
        attributes: ['mes', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'cantidad']],
        group: ['mes'],
        order: [['mes','ASC']]
      });

      res.json({ total, aprobadas, reportadas, pendientes, rechazadas, porMes: byMes });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al obtener resumen anual' });
    }
  },

  // Listado general / filtrado
  async list(req, res) {
    try {
      const { estado, estudianteID, representanteID, annoEscolarID } = req.query;
      const where = {};
      if (estado) where.estado = estado;
      if (estudianteID) where.estudianteID = estudianteID;
      if (representanteID) where.representanteID = representanteID;
      if (annoEscolarID) where.annoEscolarID = annoEscolarID;

      const items = await Mensualidades.findAll({ where, order: [["anio","ASC"],["mes","ASC"]] });
      const cfg = await ConfiguracionPagos.findOne({ where: { activo: true } });
      const nombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      const annoEscolares = await AnnoEscolar.findAll({ attributes: ['id','periodo'] });
      const mapPeriodo = new Map(annoEscolares.map(ae => [ae.id, ae.periodo]));
      const withNames = items.map(it => {
        const obj = it.toJSON();
        const periodo = mapPeriodo.get(obj.annoEscolarID) || null;
        let anio = obj.anio;
        if (!anio && periodo) {
          const [ini, fin] = String(periodo).split('-').map(Number);
          anio = (obj.mes >= 9) ? ini : fin;
        }
        let fechaVencimiento = obj.fechaVencimiento;
        if (!fechaVencimiento && anio) {
          const fechaCorte = Number(cfg?.fechaCorte || 5);
          fechaVencimiento = new Date(anio, (obj.mes ?? 1) - 1, Math.min(fechaCorte, 28));
        }
        // Calcular mora y total en VES (mora fija segun porcentajeMora si hoy > fechaVencimiento)
        const venc = fechaVencimiento ? new Date(fechaVencimiento) : null;
        const vencido = venc ? (new Date() > venc) : false;
        const baseVES = Number(cfg?.precioMensualidadVES ?? 0);
        const tasa = Number(cfg?.porcentajeMora ?? 0) / 100;
        const moraAcumuladaVES = vencido ? (baseVES * tasa) : 0;
        const totalVES = baseVES + moraAcumuladaVES;
        return {
          ...obj,
          periodo,
          anio,
          fechaVencimiento,
          mesNombre: nombres[(obj.mes ?? 1) - 1],
          precioUSD: Number(cfg?.precioMensualidadUSD ?? cfg?.precioMensualidad ?? 0),
          precioVES: baseVES,
          moraAcumuladaVES,
          totalVES
        };
      });
      res.json(withNames);
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
      const items = await Mensualidades.findAll({ where, order: [["anio","ASC"],["mes","ASC"]] });
      const cfg = await ConfiguracionPagos.findOne({ where: { activo: true } });
      const nombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      const annoEscolares = await AnnoEscolar.findAll({ attributes: ['id','periodo'] });
      const mapPeriodo = new Map(annoEscolares.map(ae => [ae.id, ae.periodo]));
      const withNames = items.map(it => {
        const obj = it.toJSON();
        const periodo = mapPeriodo.get(obj.annoEscolarID) || null;
        let anio = obj.anio;
        if (!anio && periodo) {
          const [ini, fin] = String(periodo).split('-').map(Number);
          anio = (obj.mes >= 9) ? ini : fin;
        }
        let fechaVencimiento = obj.fechaVencimiento;
        if (!fechaVencimiento && anio) {
          const fechaCorte = Number(cfg?.fechaCorte || 5);
          fechaVencimiento = new Date(anio, (obj.mes ?? 1) - 1, Math.min(fechaCorte, 28));
        }
        // Calcular mora y total en VES (mora fija segun porcentajeMora si hoy > fechaVencimiento)
        const venc = fechaVencimiento ? new Date(fechaVencimiento) : null;
        const vencido = venc ? (new Date() > venc) : false;
        const baseVES = Number(cfg?.precioMensualidadVES ?? 0);
        const tasa = Number(cfg?.porcentajeMora ?? 0) / 100;
        const moraAcumuladaVES = vencido ? (baseVES * tasa) : 0;
        const totalVES = baseVES + moraAcumuladaVES;
        return {
          ...obj,
          periodo,
          anio,
          fechaVencimiento,
          mesNombre: nombres[(obj.mes ?? 1) - 1],
          precioUSD: Number(cfg?.precioMensualidadUSD ?? cfg?.precioMensualidad ?? 0),
          precioVES: baseVES,
          moraAcumuladaVES,
          totalVES
        };
      });
      res.json(withNames);
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

      // Generar meses del período según startMonth/endMonth del año escolar
      const periodo = await AnnoEscolar.findByPk(annoEscolarID);
      const [anioInicioStr, anioFinStr] = (periodo?.periodo || '').split('-');
      const anioInicio = Number(anioInicioStr) || new Date().getFullYear();
      const anioFin = Number(anioFinStr) || anioInicio + 1;

      const startMonth = Number(periodo?.startMonth ?? 9);
      const endMonth = Number(periodo?.endMonth ?? 7);

      // Construir lista de meses respetando posible wrap del año (ej: 9..12,1..7)
      let mesesCiclo = [];
      if (
        Number.isFinite(startMonth) && Number.isFinite(endMonth) &&
        startMonth >= 1 && startMonth <= 12 && endMonth >= 1 && endMonth <= 12
      ) {
        let m = startMonth;
        mesesCiclo.push(m);
        // Incluir endMonth; detener como máximo tras 12 iteraciones para evitar bucles
        while (m !== endMonth && mesesCiclo.length < 12) {
          m = (m % 12) + 1;
          mesesCiclo.push(m);
        }
      } else {
        // Fallback a ciclo tradicional Sep–Jul
        mesesCiclo = [9,10,11,12,1,2,3,4,5,6,7];
      }

      const fechaCorte = Number((await ConfiguracionPagos.findOne({ where: { activo: true } }))?.fechaCorte || 5);

      const wraps = startMonth > endMonth; // true cuando el rango cruza el año
      const created = [];
      for (const mes of mesesCiclo) {
        // Si hay wrap, meses >= startMonth pertenecen a anioInicio; el resto a anioFin.
        // Si no hay wrap (start <= end), los meses del rango pertenecen a anioInicio.
        const anio = wraps ? (mes >= startMonth ? anioInicio : anioFin) : anioInicio;
        const fechaVencimiento = new Date(anio, mes - 1, Math.min(fechaCorte, 28)); // evitar meses más cortos

        const [item] = await Mensualidades.findOrCreate({
          where: { estudianteID, annoEscolarID, mes },
          defaults: {
            estudianteID,
            representanteID,
            inscripcionID,
            annoEscolarID,
            arancelID: null,
            mes,
            anio,
            montoBase: precio,
            moraAcumulada: 0,
            estado: 'pendiente',
            fechaVencimiento
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
      // Al rechazar, devolvemos la mensualidad a pendiente para que pueda ser reportada nuevamente
      if (m.pagoID) {
        const p = await PagoEstudiantes.findByPk(m.pagoID);
        if (p) await p.update({ estado: 'anulado' });
      }
      await m.update({ estado: 'pendiente', observacionAdmin: observacionAdmin || null, pagoID: null });
      res.json({ message: 'Mensualidad rechazada y devuelta a pendiente' });
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
      // TODO: integrar utils/email a representante y/o estudiante
      res.json({ message: 'Recordatorio enviado (placeholder)' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al enviar recordatorio' });
    }
  },

  // Enviar recordatorios para todos los pendientes
  async recordatorioMasivo(req, res) {
    try {
      const { annoEscolarID } = req.body || {};
      const where = { estado: 'pendiente' };
      if (annoEscolarID) where.annoEscolarID = annoEscolarID;
      const items = await Mensualidades.findAll({ where });
      // TODO: enviar email en lote a cada representante
      res.json({ message: 'Recordatorios encolados (placeholder)', total: items.length });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al enviar recordatorios' });
    }
  },

  // Recalcular moras de pendientes según configuración actual
  async recalcularMoras(req, res) {
    try {
      const config = await ConfiguracionPagos.findOne({ where: { activo: true } });
      if (!config) return res.status(400).json({ message: 'Configuración de pagos no encontrada' });
      const { porcentajeMora, fechaCorte } = config;
      const hoy = new Date();

      const pendientes = await Mensualidades.findAll({ where: { estado: 'pendiente' } });
      let actualizados = 0;

      for (const m of pendientes) {
        // Calcular/asegurar fechaVencimiento correcta (último día de pago = fechaCorte)
        let fv = m.fechaVencimiento ? new Date(m.fechaVencimiento) : null;
        if (!fv) {
          // Derivar año correcto. Si m.anio existe úsalo; si no, intenta derivar de annoEscolar.periodo
          let anio = m.anio;
          if (!anio && m.annoEscolarID) {
            const ae = await AnnoEscolar.findByPk(m.annoEscolarID);
            if (ae?.periodo) {
              const [ini, fin] = ae.periodo.split('-').map(Number);
              anio = (m.mes >= 9) ? ini : fin;
            }
          }
          if (!anio) {
            await m.update({ moraAcumulada: 0 });
            actualizados++;
            continue;
          }
          fv = new Date(anio, (m.mes ?? (hoy.getMonth()+1)) - 1, Math.min(Number(fechaCorte) || 5, 28));
        }

        // Mora fija: se aplica una sola vez a partir del día siguiente al fechaCorte
        let mora = 0;
        if (hoy > fv) {
          const base = Number(m.montoBase || 0);
          const tasaFija = Number(porcentajeMora || 0) / 100; // porcentaje fijo
          mora = base * tasaFija;
        }
        await m.update({ moraAcumulada: mora, fechaVencimiento: fv });
        actualizados++;
      }
      res.json({ message: 'Moras recalculadas', actualizados });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al recalcular moras' });
    }
  },

  // Exportación mensual detallada (Excel o PDF)
  async exportMensual(req, res) {
    try {
      const { mes, anio, annoEscolarID, formato } = req.query;
      if (!mes || !anio) return res.status(400).json({ message: 'mes y anio son requeridos' });
      const where = { mes: Number(mes), anio: Number(anio) };
      if (annoEscolarID) where.annoEscolarID = Number(annoEscolarID);

      const items = await Mensualidades.findAll({
        where,
        include: [
          { model: Personas, as: 'estudiante', attributes: ['cedula','nombre','apellido'] },
          { model: Personas, as: 'representante', attributes: ['cedula','nombre','apellido','telefono','email'] },
          { model: Inscripciones, as: 'inscripcion', attributes: ['gradoID','seccionID'], include: [
            { model: Grados, as: 'grado', attributes: ['nombre_grado'] },
            { model: Secciones, as: 'Secciones', attributes: ['nombre_seccion'] },
          ] },
          { model: AnnoEscolar, as: 'annoEscolar', attributes: ['periodo'] },
          { model: Aranceles, as: 'arancel', attributes: ['nombre'] },
          { model: PagoEstudiantes, as: 'pago', attributes: ['estado','referencia','montoTotal'] },
        ],
        order: [['estado','ASC'], ['id','ASC']]
      });

      if (formato === 'excel') {
        const workbook = await XlsxPopulate.fromBlankAsync();
        const sheet = workbook.sheet(0);
        sheet.name('Resumen');
        const headers = ['Periodo','Mes','Estado','Estudiante CI','Estudiante','Representante CI','Representante','Grado','Sección','Monto Base','Mora','Total','Referencia'];
        sheet.row(1).style({ bold: true });
        headers.forEach((h, i) => sheet.cell(1, i+1).value(h));
        items.forEach((m, idx) => {
          const row = idx + 2;
          sheet.cell(row, 1).value(m.annoEscolar?.periodo || '');
          sheet.cell(row, 2).value(m.mes);
          sheet.cell(row, 3).value(m.estado);
          sheet.cell(row, 4).value(m.estudiante?.cedula || '');
          sheet.cell(row, 5).value(`${m.estudiante?.nombre || ''} ${m.estudiante?.apellido || ''}`.trim());
          sheet.cell(row, 6).value(m.representante?.cedula || '');
          sheet.cell(row, 7).value(`${m.representante?.nombre || ''} ${m.representante?.apellido || ''}`.trim());
          sheet.cell(row, 8).value(m.inscripcion?.grado?.nombre_grado || '');
          sheet.cell(row, 9).value(m.inscripcion?.Secciones?.nombre_seccion || '');
          sheet.cell(row,10).value(Number(m.montoBase || 0));
          sheet.cell(row,11).value(Number(m.moraAcumulada || 0));
          sheet.cell(row,12).value(Number((m.pago?.montoTotal) || (Number(m.montoBase||0)+Number(m.moraAcumulada||0))));
          sheet.cell(row,13).value(m.pago?.referencia || '');
        });
        const buf = await workbook.outputAsync();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="resumen-${anio}-${String(mes).padStart(2,'0')}.xlsx"`);
        return res.end(buf);
      }

      // PDF básico (listado)
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="resumen-${anio}-${String(mes).padStart(2,'0')}.pdf"`);
      const doc = new PDFDocument({ margin: 36 });
      doc.pipe(res);
      doc.fontSize(14).text(`Resumen mensual ${String(mes).padStart(2,'0')}/${anio}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10);
      items.forEach((m) => {
        doc.text(`${m.annoEscolar?.periodo || ''} | ${m.estado.toUpperCase()} | ${m.estudiante?.cedula} - ${m.estudiante?.nombre} ${m.estudiante?.apellido} | ${m.inscripcion?.grado?.nombre_grado || ''} ${m.inscripcion?.Secciones?.nombre_seccion || ''} | Total: ${(m.pago?.montoTotal) || (Number(m.montoBase||0)+Number(m.moraAcumulada||0))}`);
      });
      doc.end();
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al exportar resumen mensual' });
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