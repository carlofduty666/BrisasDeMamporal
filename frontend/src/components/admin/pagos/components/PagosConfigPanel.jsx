import React, { useEffect, useState } from 'react';
import { pagosConfigService } from '../../../../services/pagosConfigService';
import { annoEscolarService } from '../../../../services/annoEscolar.service';

export default function ConfiguracionPagosPanel({ embedded = false }) {
  const [config, setConfig] = useState({
    precioMensualidad: '', // base
    politicaPrecio: 'retroactivo', // 'retroactivo' | 'congelado'
    mora: { tipo: 'porcentaje-diario', tasa: 0.001, diasGracia: 0, topePorcentaje: 0.2 },
    vigenciaDesde: '',
    instruccionesPago: '', // texto libre para cuentas/indicaciones
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('view'); // 'view' | 'edit'
  // Año escolar y meses del período (derivados de vigenciaDesde)
  const [annoEscolarTarget, setAnnoEscolarTarget] = useState(null);
  const [mesesPeriodo, setMesesPeriodo] = useState([]); // [{mes, nombre, anio}]
  const [seleccion, setSeleccion] = useState(null); // {mes, anio}
  const [actualizarParametrosMora, setActualizarParametrosMora] = useState(true);
  // NOTA: Este componente no renderiza tarjetas por mes. Esa UI vive en PagosConfigModal.

  const nombreMes = (m) => (
    ['','Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][m] || ''
  );

  // Dado un período "YYYY-YYYY" genera meses Sep..Jun del ciclo
  // Construcción de meses del período ahora se delega al backend según la configuración del año escolar
  const buildMesesPeriodo = async (annoEscolarID) => {
    if (!annoEscolarID) return [];
    try {
      const meses = await annoEscolarService.getMeses(annoEscolarID);
      // Backend devuelve: { nombre, mesNumero, anio, montoPagoUSD?, montoPagoVES? }
      return (meses || []).map(m => ({
        mes: Number(m.mesNumero),
        nombre: m.nombre ?? nombreMes(Number(m.mesNumero)),
        anio: Number(m.anio),
        montoUSDDefault: Number(m.montoPagoUSD ?? m.montoPago ?? 0),
        montoVESDefault: Number(m.montoPagoVES ?? 0),
      }));
    } catch {
      return [];
    }
  };

  const derivePeriodoFromVigencia = (vigencia) => {
    if (!vigencia) return null;
    const d = new Date(vigencia);
    if (isNaN(d)) return null;
    const y = d.getFullYear();
    // Regla de negocio solicitada: si la vigencia es 01/05/2025 -> objetivo Septiembre 2025 => período 2025-2026
    return `${y}-${y + 1}`;
  };

  const syncPeriodoByVigencia = async (vigencia) => {
    // Intenta encontrar el año escolar cuyo período coincide con la vigencia
    const periodoObj = derivePeriodoFromVigencia(vigencia);
    try {
      const lista = await annoEscolarService.list();
      let target = periodoObj ? lista.find((a) => a.periodo === periodoObj) : null;
      if (!target) {
        // Si no existe el período exacto, usar el activo como fallback
        try { target = await annoEscolarService.getActual(); } catch {}
      }
      setAnnoEscolarTarget(target || null);
      if (target?.id) {
        const meses = await buildMesesPeriodo(target.id);
        setMesesPeriodo(meses);
        // Selección por defecto: primer mes configurado del período
        const defaultSel = meses[0] || null;
        setSeleccion(defaultSel);
      } else {
        setMesesPeriodo([]);
        setSeleccion(null);
      }
    } catch (e) {
      setAnnoEscolarTarget(null);
      setMesesPeriodo([]);
      setSeleccion(null);
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const data = await pagosConfigService.getConfig();
      if (data) setConfig(data);
      await syncPeriodoByVigencia(data?.vigenciaDesde);
      setLoading(false);
      setMode('view');
    } catch (e) {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const onChange = async (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
    if (name === 'vigenciaDesde') {
      // Recalcular período/meses al cambiar vigencia
      await syncPeriodoByVigencia(value);
    }
  };

  const toggleOrSave = async () => {
    if (mode === 'view') { setMode('edit'); return; }
    try {
      setSaving(true);
      await pagosConfigService.updateConfig(config);
      await load();
      setMode('view');
    } finally {
      setSaving(false);
    }
  };

  const accionesDeshabilitadas = !annoEscolarTarget || !seleccion;

  if (loading) return <div className="p-6 text-slate-500">Cargando configuración...</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-pink-50 to-white">
        <h3 className="font-semibold text-slate-800">Configuración de Pagos</h3>
        {config?.updatedAt && (
          <p className="text-xs text-slate-500 mt-1">Última actualización: {new Date(config.updatedAt).toLocaleString('es-VE')}</p>
        )}
      </div>



      {/* Formulario de edición */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-600">Precio Mensualidad (USD)</label>
            <input
              type="number"
              className="mt-1 w-full border rounded px-3 py-2"
              name="precioMensualidadUSD"
              value={config.precioMensualidadUSD ?? ''}
              onChange={onChange}
              step="0.01"
              disabled={mode==='view' || saving}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Precio Mensualidad (VES)</label>
            <input
              type="number"
              className="mt-1 w-full border rounded px-3 py-2"
              name="precioMensualidadVES"
              value={config.precioMensualidadVES ?? ''}
              onChange={onChange}
              step="0.01"
              disabled={mode==='view' || saving}
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Vigencia desde</label>
            <input
              type="date"
              className="mt-1 w-full border rounded px-3 py-2"
              name="vigenciaDesde"
              value={config.vigenciaDesde || ''}
              onChange={onChange}
              disabled={mode==='view' || saving}
            />
          </div>

          <div>
            <label className="block text-sm text-slate-600">Mora (tasa diaria en %)</label>
            <input
              type="number"
              className="mt-1 w-full border rounded px-3 py-2"
              value={(config.mora?.tasa ?? 0) * 100}
              onChange={(e) => setConfig((p) => ({ ...p, mora: { ...p.mora, tasa: Number(e.target.value) / 100 } }))}
              step="0.01"
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500">Días de gracia</label>
                <input
                  type="number"
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={config.mora?.diasGracia ?? 0}
                  onChange={(e) => setConfig((p) => ({ ...p, mora: { ...p.mora, diasGracia: Number(e.target.value) } }))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500">Tope (% del monto)</label>
                <input
                  type="number"
                  className="mt-1 w-full border rounded px-3 py-2"
                  value={(config.mora?.topePorcentaje ?? 0) * 100}
                  onChange={(e) => setConfig((p) => ({ ...p, mora: { ...p.mora, topePorcentaje: Number(e.target.value) / 100 } }))}
                  step="0.1"
                />
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-600">Instrucciones de pago (visible para representantes/estudiantes)</label>
            <textarea
              className="mt-1 w-full border rounded px-3 py-2"
              name="instruccionesPago"
              value={config.instruccionesPago || ''}
              onChange={onChange}
              rows={5}
              placeholder="Ejemplo: Transferencia a Banco X, Cuenta: 0000-0000-00-0000000000, Titular: U.E. Brisas de Mamporal, RIF: J-00000000-0. Pago móvil: 0412-0000000 (Banco Y), CI: V-00000000. Indique referencia y nombre del estudiante."
              disabled={mode==='view' || saving}
            />
          </div>
        </div>
        {/* Acciones por mes */}
        <div className="mt-8 border-t pt-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-4">Acciones por mes</h4>

          {/* Info del período objetivo */}
          {annoEscolarTarget?.periodo ? (
            <p className="text-xs text-slate-500 mb-3">Período objetivo: <span className="font-medium text-slate-700">{annoEscolarTarget.periodo}</span></p>
          ) : (
            <p className="text-xs text-amber-600 mb-3">No se encontró un año escolar que coincida con la vigencia. Active o cree el período correspondiente para habilitar las acciones.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600">Mes</label>
              <select
                className="mt-1 w-full border rounded px-3 py-2"
                value={seleccion ? `${seleccion.mes}-${seleccion.anio}` : ''}
                onChange={(e) => {
                  const [mStr, aStr] = e.target.value.split('-');
                  setSeleccion({ mes: Number(mStr), anio: Number(aStr) });
                }}
                disabled={accionesDeshabilitadas}
              >
                {mesesPeriodo.map((m) => (
                  <option key={`${m.mes}-${m.anio}`} value={`${m.mes}-${m.anio}`}>
                    {m.nombre} {m.anio}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600">Año</label>
              <input
                type="text"
                className="mt-1 w-full border rounded px-3 py-2 bg-slate-50"
                value={seleccion?.anio ?? ''}
                disabled
              />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="h-4 w-4" checked={actualizarParametrosMora} onChange={(e)=>setActualizarParametrosMora(e.target.checked)} />
                <span>Actualizar parámetros de mora</span>
              </label>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={async()=>{
                if (accionesDeshabilitadas) return;
                await pagosConfigService.congelarMes({ mes: seleccion.mes, anio: seleccion.anio, annoEscolarID: annoEscolarTarget.id });
                alert('Mes congelado: snapshot aplicado');
              }}
              className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              disabled={accionesDeshabilitadas}
            >
              Congelar configuración del mes
            </button>
            <button
              onClick={async()=>{
                if (accionesDeshabilitadas) return;
                await pagosConfigService.actualizarPrecios({ mes: seleccion.mes, anio: seleccion.anio, annoEscolarID: annoEscolarTarget.id, actualizarParametrosMora });
                alert('Mes actualizado: precios ' + (actualizarParametrosMora ? 'y parámetros de mora sincronizados' : 'actualizados'));
              }}
              className="px-4 py-2 rounded border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50"
              disabled={accionesDeshabilitadas}
            >
              Actualizar mes actual
            </button>
            <button
              onClick={async()=>{
                if (accionesDeshabilitadas) return;
                await pagosConfigService.recalcularMoras({ annoEscolarID: annoEscolarTarget.id });
                alert('Moras recalculadas');
              }}
              className="px-4 py-2 rounded border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50"
              disabled={accionesDeshabilitadas}
            >
              Recalcular moras
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={toggleOrSave} disabled={saving} className="px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700">
            {mode === 'view' ? 'Actualizar' : 'Guardar configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}