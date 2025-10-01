import React, { useEffect, useState } from 'react';
import { pagosConfigService } from '../../../../services/pagosConfigService';
import { annoEscolarService } from '../../../../services/annoEscolar.service';

export default function ConfiguracionPagosPanel({ embedded = false, onSaved }) {
  const [config, setConfig] = useState({
    precioMensualidadUSD: '',
    precioMensualidadVES: '',
    porcentajeMora: 5, // porcentaje fijo (%)
    fechaCorte: 15, // día del mes para aplicar mora a partir del siguiente día
    politicaPrecio: 'retroactivo', // 'retroactivo' | 'congelado'
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
      // Avisar al contenedor que se guardó exitosamente (para refrescar tarjetas y mostrar toast)
      onSaved?.();
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
            <label className="block text-sm text-slate-600">Mora (%)</label>
            <input
              type="number"
              className="mt-1 w-full border rounded px-3 py-2"
              name="porcentajeMora"
              value={config.porcentajeMora ?? 0}
              onChange={(e) => setConfig((p) => ({ ...p, porcentajeMora: Number(e.target.value) }))}
              step="0.01"
              disabled={mode==='view' || saving}
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500">Fecha de corte (día del mes)</label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  className="mt-1 w-full border rounded px-3 py-2"
                  name="fechaCorte"
                  value={config.fechaCorte ?? 15}
                  onChange={(e) => setConfig((p) => ({ ...p, fechaCorte: Number(e.target.value) }))}
                  disabled={mode==='view' || saving}
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
        {/* Nota explicativa sobre la mora */}
        <div className="mt-4 p-3 rounded bg-slate-50 text-xs text-slate-600 border border-slate-200">
          <p>
            Nota: La mora no es diaria. Se aplica una sola vez como porcentaje fijo sobre el monto base (VES)
            a partir del día siguiente a la fecha de corte. La fecha de vencimiento por mensualidad se deriva
            como: día = min(fecha de corte, 28). Ejemplo: si la fecha de corte es 15, la mora aplica desde el día 16.
          </p>
        </div>
        {/* Información: Al guardar, la configuración se aplicará automáticamente a mensualidades no confirmadas (pasadas y futuras). */}

        <div className="mt-8 flex justify-end">
          <button onClick={toggleOrSave} disabled={saving} className="px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700">
            {mode === 'view' ? 'Actualizar' : 'Guardar configuración'}
          </button>
        </div>
      </div>
    </div>
  );
}