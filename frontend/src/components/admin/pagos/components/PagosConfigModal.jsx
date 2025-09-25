import React, { useEffect, useMemo, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { mensualidadesService } from '../../../../services/mensualidadesService';
import { annoEscolarService } from '../../../../services/annoEscolar.service';
import ConfiguracionPagosPanel from './PagosConfigPanel.jsx';

function formatCurrency(value) {
  const n = parseFloat(value || 0);
  return n.toLocaleString('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

export default function PagosConfigModal({ onClose, onVerPendientesMes, annoEscolarID }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  // Resolver año escolar objetivo: usar prop si viene; si no, consultar el activo
  const [targetAnnoEscolarID, setTargetAnnoEscolarID] = useState(annoEscolarID || null);
  useEffect(() => {
    setTargetAnnoEscolarID(annoEscolarID || null);
  }, [annoEscolarID]);
  useEffect(() => {
    const ensureAnnoEscolar = async () => {
      if (targetAnnoEscolarID) return;
      try {
        const actual = await annoEscolarService.getActual();
        setTargetAnnoEscolarID(actual?.id || null);
      } catch {
        setTargetAnnoEscolarID(null);
      }
    };
    ensureAnnoEscolar();
  }, [targetAnnoEscolarID]);

  useEffect(() => {
    const load = async () => {
      try {
        if (!targetAnnoEscolarID) { setItems([]); return; }
        setLoading(true);
        const data = await mensualidadesService.list({ annoEscolarID: targetAnnoEscolarID });
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError('Error al cargar mensualidades');
        setLoading(false);
      }
    };
    load();
  }, [targetAnnoEscolarID]);

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const porMes = useMemo(() => {
    const map = new Map();
    for (const m of items) {
      const mes = m.mes || m.mesNumero;
      const anio = m.anio;
      if (!mes || !anio) continue;
      const key = `${anio}-${mes}`;
      if (!map.has(key)) map.set(key, { mes, anio, nombreMes: m.mesNombre || m.mes, fechaVencimiento: m.fechaVencimiento, montoUSD: 0, montoVES: 0, moraTasa: m.moraTasa || m.mora?.tasa || 0, recaudadoUSD: 0, pendientes: 0 });
      const agg = map.get(key);
      const base = Number(m.montoBase ?? m.monto ?? 0);
      const mora = Number(m.moraAcumulada ?? 0);
      const total = base + mora;
      if (m.estado === 'pagado') agg.recaudadoUSD += total;
      if (m.estado !== 'pagado') agg.pendientes += 1;
      agg.montoUSD = Math.max(agg.montoUSD, base);
      if (!agg.fechaVencimiento && m.fechaVencimiento) agg.fechaVencimiento = m.fechaVencimiento;
    }
    return Array.from(map.values()).sort((a, b) => (a.anio - b.anio) || (a.mes - b.mes));
  }, [items]);

  // Meses esperados ahora vienen del backend según el año escolar seleccionado
  const [mesesPeriodo, setMesesPeriodo] = useState([]); // [{ mesNumero, nombre, anio }]

  // Helper para nombre del mes
  const nombreMes = (m) => (
    ['', 'Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][Number(m)] || String(m)
  );

  useEffect(() => {
    const loadMeses = async () => {
      try {
        if (!targetAnnoEscolarID) { setMesesPeriodo([]); return; }
        const meses = await annoEscolarService.getMeses(targetAnnoEscolarID);
        setMesesPeriodo(Array.isArray(meses) ? meses : []);
      } catch {
        setMesesPeriodo([]);
      }
    };
    loadMeses();
  }, [targetAnnoEscolarID]);

  const mesesEsperados = useMemo(() => (
    (mesesPeriodo || []).map(m => Number(m.mesNumero ?? m.mes)).filter(Boolean)
  ), [mesesPeriodo]);

  const faltantes = useMemo(() => {
    // detectar meses del período que no llegaron desde backend
    const setMeses = new Set(porMes.map(m => m.mes));
    return mesesEsperados.filter(m => !setMeses.has(m));
  }, [porMes, mesesEsperados]);

  // Fusionar meses del período con el agregado real por mes para mostrar SIEMPRE todas las tarjetas
  const tarjetas = useMemo(() => {
    // Mapa de agregados reales por clave anio-mes
    const map = new Map();
    for (const m of porMes) {
      const key = `${m.anio}-${m.mes}`;
      map.set(key, m);
    }

    // Si no hay definición de meses de período, usa los reales tal cual
    if (!Array.isArray(mesesPeriodo) || mesesPeriodo.length === 0) {
      return porMes;
    }

    const out = [];
    for (const mp of mesesPeriodo) {
      const mes = Number(mp.mesNumero ?? mp.mes);
      const anio = Number(mp.anio);
      if (!mes || !anio) continue;
      const key = `${anio}-${mes}`;
      const real = map.get(key);
      out.push({
        mes,
        anio,
        nombreMes: real?.nombreMes || mp.nombre || nombreMes(mes),
        fechaVencimiento: real?.fechaVencimiento || null,
        // Preferir valores reales si existen; si no, usar defaults del backend de meses del período
        montoUSD: Number(real?.montoUSD ?? (mp.montoPagoUSD ?? mp.montoPago ?? 0)),
        montoVES: Number(real?.montoVES ?? (mp.montoPagoVES ?? 0)),
        moraTasa: Number(real?.moraTasa ?? 0),
        recaudadoUSD: Number(real?.recaudadoUSD ?? 0),
        pendientes: Number(real?.pendientes ?? 0),
      });
    }

    // Ordenar por año y mes
    return out.sort((a, b) => (a.anio - b.anio) || (a.mes - b.mes));
  }, [porMes, mesesPeriodo]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-700 to-pink-800 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div>
              <h3 className="text-lg font-semibold">Configuración de Pagos</h3>
              <p className="text-xs text-pink-100/90">Resumen por mes y edición de parámetros</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20"><FaTimes /></button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 overflow-y-auto flex-1 space-y-6">
            {/* Formulario de configuración embebido */}
            <ConfiguracionPagosPanel embedded />

            {/* Advertencia si faltan meses del período configurado */}
            {!loading && !error && faltantes.length > 0 && (
              <div className="p-3 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-800 text-sm">
                Aviso: No se encontraron mensualidades para los meses: {faltantes.map((m) => nombreMes(m)).join(', ')}.
                Esto puede indicar que aún no se han generado para el año escolar seleccionado.
              </div>
            )}

            {/* Tarjetas por mes */}
            {loading ? (
              <div className="p-6 text-center text-slate-500">Cargando...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-600">{error}</div>
            ) : tarjetas.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No hay mensualidades configuradas</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tarjetas.map((m, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs text-slate-500">Mes</div>
                        <div className="text-lg font-semibold text-slate-800">{m.nombreMes || m.mes}</div>
                        <div className="text-xs text-slate-500">Año</div>
                        <div className="text-sm font-medium text-slate-800">{m.anio}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Vence</div>
                        <div className="text-sm font-medium text-slate-800">{m.fechaVencimiento ? new Date(m.fechaVencimiento).toLocaleDateString('es-VE') : '-'}</div>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-slate-500">Monto USD</div>
                        <div className="font-semibold text-slate-800">{formatCurrency(m.montoUSD)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Monto VES</div>
                        <div className="font-semibold text-slate-800">Bs {Number(m.montoVES ?? 0).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Mora</div>
                        <div className="font-semibold text-slate-800">{Number((m.moraTasa ?? 0) * 100).toFixed(2)}% día</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Recaudado</div>
                        <div className="font-semibold text-slate-800">{formatCurrency(m.recaudadoUSD)}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-slate-500">Pendientes: <span className="font-semibold text-slate-800">{m.pendientes}</span></div>
                      <button
                        onClick={() => onVerPendientesMes?.(m)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100"
                      >
                        Ver pendientes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}


          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-white flex items-center justify-end gap-2">
            <button onClick={onClose} className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}