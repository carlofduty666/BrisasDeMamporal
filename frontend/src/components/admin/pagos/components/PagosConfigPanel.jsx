import React, { useEffect, useState } from 'react';
import { pagosConfigService } from '../../../../services/pagosConfigService';

export default function ConfiguracionPagosPanel() {
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
    <div className="bg-white border border-slate-200 rounded-xl">
      <div className="px-4 py-3 border-b">
        <h3 className="font-semibold text-slate-800">Configuración de Pagos</h3>
        {config?.updatedAt && (
          <p className="text-xs text-slate-500 mt-1">Última actualización: {new Date(config.updatedAt).toLocaleString('es-VE')}</p>
        )}
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="px-4 py-3 border-t flex justify-end">
        <button onClick={toggleOrSave} disabled={saving} className="px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700">
          {mode === 'view' ? 'Actualizar' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  );
}