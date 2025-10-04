import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';
import { mensualidadesService } from '../../../../services/mensualidadesService';
import { annoEscolarService } from '../../../../services/annoEscolar.service';
import { pagosConfigService } from '../../../../services/pagosConfigService';
import { pagosService } from '../../../../services/pagos.service';
import ConfiguracionPagosPanel from './PagosConfigPanel.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function formatCurrency(value) {
  const n = parseFloat(value || 0);
  return n.toLocaleString('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

export default function PagosConfigModal({ onClose, onVerPendientesMes, annoEscolarID }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [configPagos, setConfigPagos] = useState(null);

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

  const loadMensualidades = useCallback(async () => {
    try {
      if (!targetAnnoEscolarID) { setItems([]); return; }
      setLoading(true);
      const [data, cfg, pagos] = await Promise.all([
        mensualidadesService.list({ annoEscolarID: targetAnnoEscolarID }),
        pagosConfigService.getConfig().catch(() => null),
        pagosService.list().catch(() => [])
      ]);
      setConfigPagos(cfg);

      // Construir mapa de "original por mes" tomando el primer pago del mes (createdAt más antiguo) por annoEscolar
      const originalesPorMes = new Map(); // key: `${anio}-${mes}` -> { usd, ves }
      try {
        // Filtrar pagos del anno escolar objetivo
        const pagosAE = (pagos || []).filter(p => Number(p.annoEscolar?.id ?? p.annoEscolarID) === Number(targetAnnoEscolarID));
        // Agrupar por estudiante+mes o solo por mes? Para el resumen mensual usamos el primer pago del mes (sin distinguir estudiante)
        const pagosPorClave = new Map(); // key: `${mes}-${createdAt}` temporal para ordenar
        for (const p of pagosAE) {
          const ms = p.mensualidadSnapshot;
          const mes = Number(ms?.mes);
          if (!mes) continue;
          const createdAt = new Date(p.createdAt);
          const key = `${mes}`;
          const arr = pagosPorClave.get(key) || [];
          arr.push({ createdAt, usd: Number(ms?.precioAplicadoUSD ?? 0), ves: Number(ms?.precioAplicadoVES ?? 0), anio: ms?.anio ?? null });
          pagosPorClave.set(key, arr);
        }
        for (const [k, arr] of pagosPorClave.entries()) {
          arr.sort((a,b) => a.createdAt - b.createdAt); // más antiguo primero
          const first = arr[0];
          // anio puede venir null en snapshot, usaremos anio derivado luego al fusionar con mensualidades
          originalesPorMes.set(Number(k), { usd: first?.usd ?? 0, ves: first?.ves ?? 0 });
        }
      } catch {}

      // Adjuntar data al estado original
      const dataWithOriginals = Array.isArray(data) ? data.map(m => ({ ...m })) : [];
      // Guardamos en state para usar dentro del useMemo de tarjetas
      dataWithOriginals.__originalesPorMes = originalesPorMes;

      setItems(dataWithOriginals);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError('Error al cargar mensualidades');
      setLoading(false);
    }
  }, [targetAnnoEscolarID]);

  useEffect(() => { loadMensualidades(); }, [loadMensualidades]);

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
      if (!map.has(key)) {
        map.set(key, {
          mes,
          anio,
          nombreMes: m.mesNombre || m.mes,
          fechaVencimiento: m.fechaVencimiento || null,
          baseUSDOriginal: 0,
          baseVESOriginal: 0,
          updatedBaseUSD: 0,
          updatedBaseVES: 0,
          hasUpdatedPrice: false,
          moraTasa: 0,
          recaudadoUSD: 0,
          pendientes: 0,
        });
      }
      const agg = map.get(key);

      // Original: si existe un "primer pago" de ese mes en el año escolar, úsalo; si no, usa precioUSD/precioVES del backend
      const originalesPorMes = items.__originalesPorMes instanceof Map ? items.__originalesPorMes : null;
      const overrideOriginal = originalesPorMes?.get(Number(mes));
      const baseUSD = Number((overrideOriginal?.usd != null ? overrideOriginal.usd : (m.precioUSD ?? m.precioAplicadoUSD ?? 0)));
      const baseVES = Number((overrideOriginal?.ves != null ? overrideOriginal.ves : (m.precioVES ?? m.precioAplicadoVES ?? 0)));
      // Actualizado al día: proviene de updatedBaseUSD/updatedBaseVES calculado en backend
      const updatedUSD = Number(m.updatedBaseUSD ?? 0);
      const updatedVES = Number(m.updatedBaseVES ?? 0);

      const moraUSD = Number(m.moraAplicadaUSD ?? m.moraAcumulada ?? 0);
      const totalUSD = baseUSD + moraUSD;

      if (m.estado === 'pagado') agg.recaudadoUSD += totalUSD;
      if (m.estado !== 'pagado') agg.pendientes += 1;

      agg.baseUSDOriginal = Math.max(agg.baseUSDOriginal, baseUSD);
      agg.baseVESOriginal = Math.max(agg.baseVESOriginal, baseVES);
      agg.updatedBaseUSD = Math.max(agg.updatedBaseUSD, updatedUSD);
      agg.updatedBaseVES = Math.max(agg.updatedBaseVES, updatedVES);

      const tasa0a1 = m.porcentajeMoraAplicado != null ? (Number(m.porcentajeMoraAplicado) / 100) : (m.mora?.tasa ?? 0);
      agg.moraTasa = Math.max(agg.moraTasa, Number(tasa0a1 || 0));

      if (!agg.fechaVencimiento && m.fechaVencimiento) agg.fechaVencimiento = m.fechaVencimiento;
      if (m.hasUpdatedPrice) agg.hasUpdatedPrice = true;
    }

    const arr = Array.from(map.values());
    for (const it of arr) {
      if (!it.fechaVencimiento && it.anio && it.mes) {
        // Fallback al día de corte de configuración si existe, de lo contrario usar 5
        const corte = Number(configPagos?.fechaCorte ?? 5);
        const dia = Math.min(isNaN(corte) ? 5 : corte, 28);
        it.fechaVencimiento = new Date(it.anio, it.mes - 1, dia);
      }
    }

    return arr.sort((a, b) => (a.anio - b.anio) || (a.mes - b.mes));
  }, [items, configPagos]);

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

      const baseUSDOriginal = Number(real?.baseUSDOriginal ?? (mp.montoPagoUSD ?? mp.montoPago ?? 0));
      const baseVESOriginal = Number(real?.baseVESOriginal ?? (mp.montoPagoVES ?? 0));
      const updatedBaseUSD = Number(real?.updatedBaseUSD ?? baseUSDOriginal);
      const updatedBaseVES = Number(real?.updatedBaseVES ?? baseVESOriginal);
      const hasUpdatedPrice = Boolean(real?.hasUpdatedPrice ?? (updatedBaseUSD !== baseUSDOriginal || updatedBaseVES !== baseVESOriginal));

      // Fecha de vencimiento: usa real si existe; si no, fallback por fechaCorte
      let fechaVencimiento = real?.fechaVencimiento || null;
      if (!fechaVencimiento && anio && mes) {
        const corte = Number(configPagos?.fechaCorte ?? 5);
        const dia = Math.min(isNaN(corte) ? 5 : corte, 28);
        fechaVencimiento = new Date(anio, mes - 1, dia);
      }
      const hoy = new Date();
      const vencido = fechaVencimiento ? (new Date(fechaVencimiento) < hoy) : false;

      // Porcentaje de mora: snapshot vs config actual
      const snapshotMoraTasa = Number(real?.moraTasa ?? 0);
      const currentMoraTasa = Number(configPagos?.porcentajeMora ?? 0) / 100;
      const moraPctChanged = Number.isFinite(snapshotMoraTasa) && Number.isFinite(currentMoraTasa)
        ? Math.round(snapshotMoraTasa * 10000) !== Math.round(currentMoraTasa * 10000)
        : false;

      // Totales actualizados (no se muestran como monto, pero útiles si se requiere)
      const updatedMoraUSD = vencido ? (updatedBaseUSD * currentMoraTasa) : 0;
      const updatedMoraVES = vencido ? (updatedBaseVES * currentMoraTasa) : 0;
      const updatedTotalUSD = updatedBaseUSD + updatedMoraUSD;
      const updatedTotalVES = updatedBaseVES + updatedMoraVES;

      out.push({
        mes,
        anio,
        nombreMes: real?.nombreMes || mp.nombre || nombreMes(mes),
        fechaVencimiento,
        baseUSDOriginal,
        baseVESOriginal,
        updatedBaseUSD,
        updatedBaseVES,
        updatedMoraUSD,
        updatedMoraVES,
        updatedTotalUSD,
        updatedTotalVES,
        hasUpdatedPrice,
        moraTasa: snapshotMoraTasa,
        moraTasaActual: currentMoraTasa,
        moraPctChanged,
        recaudadoUSD: Number(real?.recaudadoUSD ?? 0),
        pendientes: Number(real?.pendientes ?? 0),
        vencido,
      });
    }

    // Ordenar por año y mes
    return out.sort((a, b) => (a.anio - b.anio) || (a.mes - b.mes));
  }, [porMes, mesesPeriodo]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-700 to-pink-800 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10 rounded-t-2xl">
            <div>
              <h3 className="text-lg font-semibold">Configuración de Pagos</h3>
              <p className="text-xs text-pink-100/90">Resumen por mes y edición de parámetros</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20"><FaTimes /></button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 overflow-y-auto flex-1 space-y-6">
            {/* Formulario de configuración embebido */}
            <ConfiguracionPagosPanel embedded onSaved={() => { toast.success('Configuración guardada y aplicada', { position: 'top-center' }); loadMensualidades(); }} />

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
                      {/* Montos originales vs actualizados */}
                      <div>
                        <div className="text-xs text-slate-500">Monto USD</div>
                        <div className="space-y-1">
                          <div className="text-xs text-slate-500"></div>
                          <div className={`font-medium ${m.hasUpdatedPrice ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {formatCurrency(m.baseUSDOriginal)}
                          </div>
                          {m.hasUpdatedPrice && (
                            <>
                              <div className="text-xs text-slate-500">Actualizado</div>
                              <div className="font-semibold text-slate-800">{formatCurrency(m.updatedBaseUSD)}</div>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Monto VES</div>
                        <div className="space-y-1">
                          <div className="text-xs text-slate-500"></div>
                          <div className={`font-medium ${m.hasUpdatedPrice ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            Bs {Number(m.baseVESOriginal ?? 0).toFixed(2)}
                          </div>
                          {m.hasUpdatedPrice && (
                            <>
                              <div className="text-xs text-slate-500">Actualizado</div>
                              <div className="font-semibold text-slate-800">Bs {Number(m.updatedBaseVES ?? 0).toFixed(2)}</div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Mora: mostrar solo porcentaje; si cambió, indicar porcentaje actualizado */}
                      <div>
                        <div className="text-xs text-slate-500">Mora</div>
                        <div className="font-semibold text-slate-800">
                          {Number((m.moraTasa ?? 0) * 100).toFixed(2)}%
                          {m.moraPctChanged && (
                            <span className="ml-2 text-xs text-slate-500">
                              Actualizada: {Number((m.moraTasaActual ?? 0) * 100).toFixed(2)}%
                            </span>
                          )}
                        </div>
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
      {/* Toast fijo en viewport del modal */}
      <ToastContainer position="top-center" autoClose={2500} newestOnTop closeOnClick pauseOnHover theme="colored" />
    </div>
  );
}