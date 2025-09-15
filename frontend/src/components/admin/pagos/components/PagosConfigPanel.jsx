import React, { useEffect, useState } from 'react';
import { pagosConfigService } from '../../../../services/pagosConfigService';

export default function ConfiguracionPagosPanel({ onVerPendientesMes, embedded = false }) {
  const [config, setConfig] = useState({
    precioMensualidad: '', // base
    politicaPrecio: 'retroactivo', // 'retroactivo' | 'congelado'
    mora: { tipo: 'porcentaje-diario', tasa: 0.001, diasGracia: 0, topePorcentaje: 0.2 },
    vigenciaDesde: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState('view'); // 'view' | 'edit'

  const load = async () => {
    try {
      setLoading(true);
      const data = await pagosConfigService.getConfig();
      if (data) setConfig(data);
      setLoading(false);
      setMode('view');
    } catch (e) {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
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





  if (loading) return <div className="p-6 text-slate-500">Cargando configuración...</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b bg-gradient-to-r from-pink-50 to-white">
        <h3 className="font-semibold text-slate-800">Configuración de Pagos</h3>
        {config?.updatedAt && (
          <p className="text-xs text-slate-500 mt-1">Última actualización: {new Date(config.updatedAt).toLocaleString('es-VE')}</p>
        )}
      </div>

      {/* Tarjetas por mes configurado */}
      {/* <div className="p-6">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Resumen por mes</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(config?.meses || []).map((m, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-500">Mes</div>
                  <div className="text-lg font-semibold text-slate-800">{m.nombreMes || m.mesNombre || m.mes}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Vence</div>
                  <div className="text-sm font-medium text-slate-800">{m.fechaVencimiento ? new Date(m.fechaVencimiento).toLocaleDateString('es-VE') : '-'}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500">Monto USD</div>
                  <div className="font-semibold text-slate-800">${Number(m.montoUSD ?? m.montoBaseUSD ?? config.precioMensualidadUSD ?? 0).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Monto VES</div>
                  <div className="font-semibold text-slate-800">Bs {Number(m.montoVES ?? m.montoBaseVES ?? config.precioMensualidadVES ?? 0).toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Mora</div>
                  <div className="font-semibold text-slate-800">{((m.mora?.tasa ?? config.mora?.tasa ?? 0) * 100).toFixed(2)}% día</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Recaudado</div>
                  <div className="font-semibold text-slate-800">${Number(m.recaudadoUSD ?? 0).toFixed(2)}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-slate-500">Pendientes: <span className="font-semibold text-slate-800">{m.pendientes ?? 0}</span></div>
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
      </div> */}

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
            <label className="block text-sm text-slate-600">Política de precio</label>
            <select
              className="mt-1 w-full border rounded px-3 py-2"
              name="politicaPrecio"
              value={config.politicaPrecio}
              onChange={onChange}
              disabled={mode==='view' || saving}
            >
              <option value="retroactivo">Retroactivo (B)</option>
              <option value="congelado">Congelado por creación (A)</option>
            </select>
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
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={toggleOrSave} disabled={saving} className="px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700">
            {mode === 'view' ? 'Actualizar' : 'Guardar configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}