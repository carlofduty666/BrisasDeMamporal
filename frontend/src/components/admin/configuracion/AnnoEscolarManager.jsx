import React, { useEffect, useMemo, useState } from 'react';
import { FaPlus, FaCheckCircle, FaSync, FaCalendar, FaToggleOn } from 'react-icons/fa';
import { annoEscolarService } from '../../../services/annoEscolar.service';

// Utilidades para meses
const MESES = [
  { value: 1, label: 'Enero' },{ value: 2, label: 'Febrero' },{ value: 3, label: 'Marzo' },{ value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },{ value: 6, label: 'Junio' },{ value: 7, label: 'Julio' },{ value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },{ value: 10, label: 'Octubre' },{ value: 11, label: 'Noviembre' },{ value: 12, label: 'Diciembre' },
];

export default function AnnoEscolarManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [activoId, setActivoId] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nombre: '', // Ej: 2024-2025
    inicioMes: 9,
    finMes: 7,
    activo: false,
  });

  const load = async () => {
    try {
      setLoading(true);
      const [list, actual] = await Promise.all([
        annoEscolarService.list(),
        annoEscolarService.getActual().catch(() => null),
      ]);
      
      // Cargar datos de meses desde localStorage
      let mesesData = {};
      try {
        mesesData = JSON.parse(localStorage.getItem('annoEscolarMeses') || '{}');
      } catch (e) {
        console.error('Error cargando datos de meses:', e);
      }
      
      // Enriquecer los items con los datos de meses
      const itemsWithMeses = (Array.isArray(list) ? list : []).map(item => {
        const periodo = item.periodo || item.nombre;
        const mesesInfo = mesesData[periodo] || {};
        return {
          ...item,
          inicioMes: mesesInfo.inicioMes || 9, // Valor por defecto: Septiembre
          finMes: mesesInfo.finMes || 7,       // Valor por defecto: Julio
        };
      });
      
      setItems(itemsWithMeses);
      setActivoId(actual?.id ?? actual?._id ?? null);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError('Error al cargar años escolares');
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ nombre: '', inicioMes: 9, finMes: 7, activo: false });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : (name.includes('Mes') ? Number(value) : value) }));
  };

  const create = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Solo enviamos los campos que el backend espera: periodo y activo
      const payload = {
        periodo: form.nombre?.trim(), // Cambiado de 'nombre' a 'periodo' para coincidir con el modelo
        activo: Boolean(form.activo),
      };
      
      // Guardamos los datos de meses en localStorage para uso en la interfaz
      // Esto es solo para la interfaz y no se envía al backend
      try {
        const mesData = {
          [payload.periodo]: {
            inicioMes: Number(form.inicioMes),
            finMes: Number(form.finMes)
          }
        };
        const existingData = JSON.parse(localStorage.getItem('annoEscolarMeses') || '{}');
        localStorage.setItem('annoEscolarMeses', JSON.stringify({...existingData, ...mesData}));
      } catch (storageError) {
        console.error('Error guardando datos de meses en localStorage:', storageError);
      }
      
      const created = await annoEscolarService.create(payload);
      if (payload.activo && created?.id) {
        await annoEscolarService.activate(created.id);
      }
      await load();
      resetForm();
    } catch (e) {
      console.error(e);
      // Mostrar el error al usuario
      setError(e.response?.data?.message || 'Error al crear año escolar');
      setTimeout(() => setError(''), 5000); // Limpiar el error después de 5 segundos
    } finally {
      setSaving(false);
    }
  };

  const setActivo = async (id) => {
    try {
      setSaving(true);
      await annoEscolarService.activate(id);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const rangePreview = useMemo(() => {
    const i = MESES.find((m) => m.value === Number(form.inicioMes))?.label;
    const f = MESES.find((m) => m.value === Number(form.finMes))?.label;
    return i && f ? `${i} → ${f}` : '';
  }, [form.inicioMes, form.finMes]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header acorde al tema de Configuración */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <FaCalendar className="text-gray-500" /> Años Escolares
        </h3>
        {activoId && (
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <FaCheckCircle className="text-emerald-600" /> Activo: {items.find(i => (i.id||i._id) === activoId)?.periodo || items.find(i => (i.id||i._id) === activoId)?.nombre || '—'}
          </p>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Formulario de creación */}
        <form onSubmit={create} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600">Nombre del año escolar</label>
              <input
                type="text"
                className="mt-1 w-full border rounded px-3 py-2"
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                placeholder="2024-2025"
                required
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600">Mes inicio</label>
              <select name="inicioMes" className="mt-1 w-full border rounded px-3 py-2" value={form.inicioMes} onChange={onChange} disabled={saving}>
                {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600">Mes fin</label>
              <select name="finMes" className="mt-1 w-full border rounded px-3 py-2" value={form.finMes} onChange={onChange} disabled={saving}>
                {MESES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" name="activo" checked={form.activo} onChange={onChange} disabled={saving} />
              Establecer como activo
            </label>
            <div className="text-xs text-slate-500">Rango: <span className="font-medium text-slate-700">{rangePreview}</span></div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-800">
              <FaPlus /> Crear año escolar
            </button>
          </div>
        </form>

        {/* Lista de años escolares */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Listado</h4>
          {loading ? (
            <div className="p-6 text-slate-500">Cargando...</div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-slate-500">No hay años escolares</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((it) => {
                const id = it.id || it._id;
                const isActive = activoId && id === activoId || it.activo;
                return (
                  <div key={id} className={`rounded-2xl border ${isActive ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'} p-4 shadow-sm`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs text-slate-500">Año escolar</div>
                        <div className="text-lg font-semibold text-slate-800">{it.periodo || it.nombre}</div>
                        <div className="mt-1 text-xs text-slate-500">Rango de meses</div>
                        <div className="text-sm font-medium text-slate-800">
                          {MESES.find(m=>m.value===Number(it.inicioMes))?.label || it.inicioMes} → {MESES.find(m=>m.value===Number(it.finMes))?.label || it.finMes}
                        </div>
                      </div>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 text-xs bg-emerald-100 px-2 py-1 rounded-full">
                          <FaToggleOn /> Activo
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-slate-500">ID: <span className="font-mono">{id}</span></div>
                      {!isActive && (
                        <button onClick={() => setActivo(id)} disabled={saving} className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 inline-flex items-center gap-2">
                          <FaSync /> Activar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}