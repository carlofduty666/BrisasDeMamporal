const { ConfiguracionPagos, Mensualidades } = require('../models');

const configuracionPagosController = {
  async getConfig(req, res) {
    try {
      const cfg = await ConfiguracionPagos.findOne({ where: { activo: true }, order: [['updatedAt','DESC']] });
      res.json(cfg || {});
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al obtener configuración de pagos' });
    }
  },

  async updateConfig(req, res) {
    try {
      const payload = req.body || {};
      let cfg = await ConfiguracionPagos.findOne({ where: { activo: true } });
      if (!cfg) cfg = await ConfiguracionPagos.create({ ...payload, activo: true });
      else await cfg.update(payload);

      // Aplicar nuevos precios a mensualidades pendientes/reportadas si política es retroactiva
      if (cfg.politicaPrecio === 'retroactivo') {
        const precio = Number(cfg.precioMensualidadUSD ?? cfg.precioMensualidad ?? 0);
        await Mensualidades.update(
          { montoBase: precio },
          { where: { estado: ['pendiente','reportado'] } }
        );
      }

      res.json({ message: 'Configuración actualizada', config: cfg });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al actualizar configuración' });
    }
  },

  async actualizarPrecios(req, res) {
    try {
      const { vigenciaDesde } = req.body;
      const cfg = await ConfiguracionPagos.findOne({ where: { activo: true } });
      if (!cfg) return res.status(400).json({ message: 'Config de pagos no encontrada' });
      if (cfg.politicaPrecio !== 'retroactivo') return res.json({ message: 'Política no es retroactiva. Sin cambios.' });

      const precio = Number(cfg.precioMensualidad || 0);
      // Actualizar precios en mensualidades pendientes (y opcionalmente reportadas)
      const [affected] = await Mensualidades.update(
        { montoBase: precio },
        { where: { estado: ['pendiente','reportado'] } }
      );
      res.json({ message: 'Precios aplicados', affected });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error al aplicar precios' });
    }
  }
};

module.exports = configuracionPagosController;