const db = require('../models');
const { Sequelize } = db;

// Helper: calcular total aprobado por mes usando la mensualidad (obligacion)
function calcTotalPagoUSD(p) {
  const monto = Number(p.monto || 0);
  const mora = Number(p.montoMora || 0);
  const desc = Number(p.descuento || 0);
  return monto + mora - desc;
}

module.exports = {
  // GET /contabilidad/totales-mes?mes=&anio=&annoEscolarID=&criterio=obligacion
  async totalesMensuales(req, res) {
    try {
      const { mes, anio, annoEscolarID, criterio = 'obligacion' } = req.query;
      if (!mes) return res.status(400).json({ message: 'mes es requerido' });

      // Query base: solo pagos aprobados
      const wherePago = { estado: 'pagado' };
      if (annoEscolarID) wherePago.annoEscolarID = Number(annoEscolarID);

      // Cargar pagos con joins minimos y mensualidad vinculada
      const pagos = await db.PagoEstudiantes.findAll({
        where: wherePago,
        include: [
          { model: db.AnnoEscolar, as: 'annoEscolar', attributes: ['id', 'periodo'] }
        ]
      });

      // Totalizar con criterio
      let totalUSD = 0;
      let cantidad = 0;
      for (const p of pagos) {
        let mesNum = null;
        let anioNum = null;

        if (criterio === 'obligacion') {
          // Preferir mensualidad vinculada (snapshot de objetivo)
          const m = await db.Mensualidades.findOne({ where: { pagoID: p.id } });
          if (m) {
            mesNum = Number(m.mes);
            anioNum = Number(m.anio);

            // Si no hay anio en mensualidad, derivar por periodo
            if (!anioNum && p.annoEscolar?.periodo) {
              const [ini, fin] = String(p.annoEscolar.periodo).split('-').map(Number);
              anioNum = mesNum >= 9 ? ini : fin;
            }
          } else {
            // fallback: derivar por mesPago + periodo
            const normalizeMes = (valor) => {
              if (valor == null) return null;
              const m = String(valor).trim().toLowerCase();
              const mapa = { '1':1,'01':1,'enero':1,'2':2,'02':2,'febrero':2,'3':3,'03':3,'marzo':3,'4':4,'04':4,'abril':4,'5':5,'05':5,'mayo':5,'6':6,'06':6,'junio':6,'7':7,'07':7,'julio':7,'8':8,'08':8,'agosto':8,'9':9,'09':9,'septiembre':9,'setiembre':9,'10':10,'octubre':10,'11':11,'noviembre':11,'12':12,'diciembre':12 };
              return mapa[m] ?? (Number.isFinite(Number(m)) ? Number(m) : null);
            };
            mesNum = normalizeMes(p.mesPago);
            if (mesNum && p.annoEscolar?.periodo) {
              const [ini, fin] = String(p.annoEscolar.periodo).split('-').map(Number);
              anioNum = mesNum >= 9 ? ini : fin;
            }
          }
        } else {
          // criterio === 'reporte' -> usar fechaPago
          const d = p.fechaPago ? new Date(p.fechaPago) : null;
          if (d && !isNaN(d)) {
            mesNum = d.getMonth() + 1;
            anioNum = d.getFullYear();
          }
        }

        if (!mesNum || !anioNum) continue;
        if (Number(mesNum) !== Number(mes)) continue;
        if (anio && Number(anioNum) !== Number(anio)) continue;

        totalUSD += calcTotalPagoUSD(p);
        cantidad += 1;
      }

      return res.json({ mes: Number(mes), anio: anio ? Number(anio) : null, totalUSD, cantidad });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Error al obtener totales mensuales' });
    }
  },

  // GET /contabilidad/totales-anio?annoEscolarID=&criterio=obligacion
  async totalesAnuales(req, res) {
    try {
      const { annoEscolarID, criterio = 'obligacion' } = req.query;
      if (!annoEscolarID) return res.status(400).json({ message: 'annoEscolarID es requerido' });

      // Obtener periodo para derivar años y meses del rango
      const ae = await db.AnnoEscolar.findByPk(annoEscolarID);
      if (!ae) return res.status(404).json({ message: 'Año escolar no encontrado' });
      const [ini, fin] = String(ae.periodo).split('-').map(Number);

      // Secuencia de meses del año escolar
      const start = Number(ae.startMonth ?? 9);
      const end = Number(ae.endMonth ?? 7);
      const mesesSecuencia = [];
      let m = start;
      while (true) {
        mesesSecuencia.push(m);
        if (m === end) break;
        m = m === 12 ? 1 : m + 1;
      }

      // Cargar pagos aprobados del annoEscolar
      const pagos = await db.PagoEstudiantes.findAll({ where: { estado: 'pagado', annoEscolarID }, include: [{ model: db.AnnoEscolar, as: 'annoEscolar', attributes: ['id','periodo'] }] });

      const result = [];
      for (const mesNum of mesesSecuencia) {
        let totalUSD = 0;
        let cantidad = 0;
        for (const p of pagos) {
          let targetMes = null;
          let targetAnio = null;
          if (criterio === 'obligacion') {
            const mm = await db.Mensualidades.findOne({ where: { pagoID: p.id } });
            if (mm) {
              targetMes = Number(mm.mes);
              targetAnio = Number(mm.anio) || (targetMes >= 9 ? ini : fin);
            } else {
              const normalizeMes = (valor) => {
                if (valor == null) return null;
                const s = String(valor).trim().toLowerCase();
                const mapa = { '1':1,'01':1,'enero':1,'2':2,'02':2,'febrero':2,'3':3,'03':3,'marzo':3,'4':4,'04':4,'abril':4,'5':5,'05':5,'mayo':5,'6':6,'06':6,'junio':6,'7':7,'07':7,'julio':7,'8':8,'08':8,'agosto':8,'9':9,'09':9,'septiembre':9,'setiembre':9,'10':10,'octubre':10,'11':11,'noviembre':11,'12':12,'diciembre':12 };
                return mapa[s] ?? (Number.isFinite(Number(s)) ? Number(s) : null);
              };
              targetMes = normalizeMes(p.mesPago);
              targetAnio = targetMes ? (targetMes >= 9 ? ini : fin) : null;
            }
          } else {
            const d = p.fechaPago ? new Date(p.fechaPago) : null;
            if (d && !isNaN(d)) {
              targetMes = d.getMonth() + 1;
              targetAnio = d.getFullYear();
            }
          }
          if (!targetMes || !targetAnio) continue;
          if (targetMes !== mesNum) continue;
          totalUSD += calcTotalPagoUSD(p);
          cantidad += 1;
        }
        result.push({ mes: mesNum, anio: mesNum >= 9 ? ini : fin, totalUSD, cantidad });
      }

      return res.json({ annoEscolarID: Number(annoEscolarID), criterio, meses: result });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: 'Error al obtener totales anuales' });
    }
  }
};