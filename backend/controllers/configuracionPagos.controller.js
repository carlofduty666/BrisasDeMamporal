const { ConfiguracionPagos, Mensualidades, AnnoEscolar } = require('../models');

function construirMesesPermitidos(anno) {
  if (!anno) return [];
  const [yStartStr, yEndStr] = String(anno.periodo).split('-');
  const yStart = Number(yStartStr);
  const yEnd = Number(yEndStr);
  const start = Number(anno.startMonth ?? 9);
  const end = Number(anno.endMonth ?? 7);

  const meses = [];
  let m = start;
  const wrap = end < start;
  while (true) {
    const anio = wrap ? (m >= start ? yStart : yEnd) : yStart;
    meses.push({ mes: m, anio });
    if (m === end) break;
    m = m === 12 ? 1 : m + 1;
  }
  return meses;
}

const configuracionPagosController = {
  // Obtener configuración normalizada para el frontend (mora anidada)
  async getConfig(req, res) {
    try {
      const cfg = await ConfiguracionPagos.findOne({ where: { activo: true }, order: [['updatedAt','DESC']] });
      const normalized = cfg ? {
        ...cfg.toJSON(),
        mora: {
          tasa: Number(cfg.porcentajeMora ?? 0) / 100,
          diasGracia: Number(cfg.diasGracia ?? 0),
          topePorcentaje: Number(cfg.topeMoraPorcentaje ?? 0) / 100,
        }
      } : {};
      res.json(normalized);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al obtener configuración de pagos' });
    }
  },

  // Guardar configuración global sin efectos colaterales sobre mensualidades
  async updateConfig(req, res) {
    try {
      const payload = req.body || {};
      const update = { ...payload };

      // Transformar estructura anidada de mora { tasa 0-1, diasGracia, topePorcentaje 0-1 }
      if (payload.mora) {
        update.porcentajeMora = Number(payload.mora.tasa ?? 0) * 100;
        update.diasGracia = Number(payload.mora.diasGracia ?? 0);
        update.topeMoraPorcentaje = Number(payload.mora.topePorcentaje ?? 0) * 100;
        delete update.mora;
      }

      let cfg = await ConfiguracionPagos.findOne({ where: { activo: true } });
      if (!cfg) cfg = await ConfiguracionPagos.create({ ...update, activo: true });
      else await cfg.update(update);

      // No tocar mensualidades aquí. Para aplicar al mes, usar actualizar-precios.
      res.json({ message: 'Configuración actualizada', config: cfg });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al actualizar configuración' });
    }
  },

  // Opción B: Actualizar precios/params del mes SIN resetear moraAcumulada ni fechaVencimiento
  async actualizarPrecios(req, res) {
    try {
      const { mes, anio, annoEscolarID, actualizarParametrosMora = true } = req.body || {};
      const cfg = await ConfiguracionPagos.findOne({ where: { activo: true } });
      if (!cfg) return res.status(400).json({ message: 'Config de pagos no encontrada' });

      // Validación: si se especifica mes/anio, se requiere annoEscolarID y debe estar permitido
      if (mes != null || anio != null) {
        if (annoEscolarID == null) {
          return res.status(400).json({ message: 'annoEscolarID es requerido cuando se especifica mes/anio' });
        }
        const anno = await AnnoEscolar.findByPk(Number(annoEscolarID));
        if (!anno) return res.status(400).json({ message: 'Año escolar no válido' });
        const permitidos = construirMesesPermitidos(anno);
        const ok = permitidos.some(p => p.mes === Number(mes) && p.anio === Number(anio));
        if (!ok) {
          return res.status(400).json({ message: 'Mes/Año no pertenece al rango configurado del año escolar' });
        }
      }

      const where = { estado: ['pendiente','reportado'] };
      if (mes != null) where.mes = Number(mes);
      if (anio != null) where.anio = Number(anio);
      if (annoEscolarID != null) where.annoEscolarID = Number(annoEscolarID);

      const precioUSD = Number(cfg.precioMensualidadUSD ?? cfg.precioMensualidad ?? 0);
      const precioVES = Number(cfg.precioMensualidadVES ?? 0);
      const tasa = precioUSD > 0 ? (precioVES / precioUSD) : null;

      const pendientes = await Mensualidades.findAll({ where });
      let afectados = 0;
      for (const m of pendientes) {
        const data = { montoBase: precioUSD };
        if (actualizarParametrosMora && m.configCongelada) {
          // Si está congelado, sincronizamos el snapshot con la config vigente
          data.precioAplicadoUSD = precioUSD;
          if (tasa) {
            data.precioAplicadoVES = precioVES;
            data.tasaAplicadaMes = tasa;
          }
          data.porcentajeMoraAplicado = cfg.porcentajeMora;
          data.diasGraciaAplicados = cfg.diasGracia;
          data.topeMoraAplicado = cfg.topeMoraPorcentaje;
          data.fechaCorteAplicada = cfg.fechaCorte;
        }
        await m.update(data);
        afectados++;
      }

      res.json({ message: 'Precios del mes actual actualizados', afectados, precioUSD, precioVES });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al aplicar precios' });
    }
  },

  // Opción A: Congelar mes (snapshot) copiando precios y parámetros de mora aplicados
  async congelarMes(req, res) {
    try {
      const { mes, anio, annoEscolarID } = req.body || {};
      if (mes == null || anio == null || annoEscolarID == null) {
        return res.status(400).json({ message: 'mes, anio y annoEscolarID son requeridos' });
      }

      // Validación: mes/año deben pertenecer al rango configurado
      const anno = await AnnoEscolar.findByPk(Number(annoEscolarID));
      if (!anno) return res.status(400).json({ message: 'Año escolar no válido' });
      const permitidos = construirMesesPermitidos(anno);
      const ok = permitidos.some(p => p.mes === Number(mes) && p.anio === Number(anio));
      if (!ok) {
        return res.status(400).json({ message: 'Mes/Año no pertenece al rango configurado del año escolar' });
      }

      const cfg = await ConfiguracionPagos.findOne({ where: { activo: true } });
      if (!cfg) return res.status(400).json({ message: 'Config de pagos no encontrada' });

      const precioUSD = Number(cfg.precioMensualidadUSD ?? cfg.precioMensualidad ?? 0);
      const precioVES = Number(cfg.precioMensualidadVES ?? 0);
      const tasa = precioUSD > 0 ? (precioVES / precioUSD) : null;

      const mensualidades = await Mensualidades.findAll({ where: { mes: Number(mes), anio: Number(anio), annoEscolarID: Number(annoEscolarID) } });
      let afectados = 0;

      for (const m of mensualidades) {
        const data = {
          configCongelada: true,
          precioAplicadoUSD: precioUSD,
          precioAplicadoVES: tasa ? precioVES : null,
          tasaAplicadaMes: tasa,
          porcentajeMoraAplicado: cfg.porcentajeMora,
          diasGraciaAplicados: cfg.diasGracia,
          topeMoraAplicado: cfg.topeMoraPorcentaje,
          fechaCorteAplicada: cfg.fechaCorte,
        };

        // Si no tiene montoBase, tomar el precio aplicado congelado
        if (m.montoBase == null || Number.isNaN(Number(m.montoBase))) {
          data.montoBase = precioUSD;
        }

        await m.update(data);
        afectados++;
      }

      return res.json({ message: 'Mes congelado', afectados, mes: Number(mes), anio: Number(anio) });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Error al congelar mes' });
    }
  }
};

module.exports = configuracionPagosController;