import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaCheckCircle, FaSync, FaCalendar, FaToggleOn, FaTimes, FaArrowRight, FaSpinner, FaBook, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { annoEscolarService } from '../../../services/annoEscolar.service';

// Utilidades para meses
const MESES = [
  { value: 1, label: 'Enero' },{ value: 2, label: 'Febrero' },{ value: 3, label: 'Marzo' },{ value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },{ value: 6, label: 'Junio' },{ value: 7, label: 'Julio' },{ value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },{ value: 10, label: 'Octubre' },{ value: 11, label: 'Noviembre' },{ value: 12, label: 'Diciembre' },
];

const INITIAL_FORM = {
  nombre: '',
  inicioMes: 9,
  finMes: 7,
  activo: false,
};

export default function AnnoEscolarManager() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [activoId, setActivoId] = useState(null);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

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

  // Función para resetear el formulario
  const resetForm = () => setForm(INITIAL_FORM);

  // Detectar si el formulario ha sido modificado
  const hasChanges = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(INITIAL_FORM);
  }, [form]);

  // Función para cerrar el modal sin confirmación
  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setError('');
  };

  // Función para intentar cerrar el modal
  const handleCloseAttempt = () => {
    if (hasChanges) {
      setShowConfirmModal(true);
    } else {
      closeModal();
    }
  };

  // Función para descartar cambios y cerrar
  const discardChangesAndClose = () => {
    setShowConfirmModal(false);
    closeModal();
  };

  // Detectar ESC y clicks fuera del modal
  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCloseAttempt();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, handleCloseAttempt]);

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
      closeModal();
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

  // Calcular estadísticas
  const stats = {
    total: items.length,
    activos: items.filter(i => (i.id||i._id) === activoId || i.activo).length,
    inactivos: items.length - (items.filter(i => (i.id||i._id) === activoId || i.activo).length),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-gray-700 mx-auto"></div>
            <FaBook className="absolute inset-0 m-auto w-6 h-6 text-gray-600 animate-pulse" />
          </div>
          <p className="mt-4 text-gray-600 font-medium animate-pulse">Cargando años escolares...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-3xl mb-8">
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gray-700/40 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-40 h-40 bg-gray-600/30 rounded-full blur-3xl"></div>
        
        <div className="relative px-6 py-12 md:px-8 md:py-16">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-4 bg-gray-700/50 rounded-2xl border border-gray-600/50">
                  <FaCalendar className="w-8 h-8 text-gray-200" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    Años Escolares
                  </h1>
                  <p className="text-gray-300 text-lg">
                    Administra y configura los períodos académicos del año
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gray-700/40 border border-gray-600/50 rounded-xl p-3 transition-all duration-300 hover:bg-gray-700/60 hover:border-gray-500/70">
                  <p className="text-gray-300 text-xs font-medium mb-1">Total de Años</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                
                <div className="bg-gray-700/40 border border-gray-600/50 rounded-xl p-3 transition-all duration-300 hover:bg-gray-700/60 hover:border-gray-500/70">
                  <p className="text-gray-300 text-xs font-medium mb-1">Activos</p>
                  <p className="text-2xl font-bold text-white">{stats.activos}</p>
                </div>
                
                <div className="bg-gray-700/40 border border-gray-600/50 rounded-xl p-3 transition-all duration-300 hover:bg-gray-700/60 hover:border-gray-500/70">
                  <p className="text-gray-300 text-xs font-medium mb-1">Inactivos</p>
                  <p className="text-2xl font-bold text-white">{stats.inactivos}</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex flex-col gap-3 lg:mt-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/admin/configuracion')}
                  className="px-6 py-3 bg-gray-600/40 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-gray-600/60 transform hover:scale-105 border border-gray-500/30"
                >
                  <FaArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-semibold flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:from-gray-600 hover:to-gray-700 transform hover:scale-105"
                >
                  <FaPlus className="w-5 h-5" />
                  <span>Nuevo Año Escolar</span>
                </button>
              </div>
              {activoId && (
                <div className="flex items-center gap-2 text-sm text-gray-200 bg-gray-700/40 px-4 py-2 rounded-xl border border-gray-600/30">
                  <FaCheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Activo: <strong>{items.find(i => (i.id||i._id) === activoId)?.periodo || items.find(i => (i.id||i._id) === activoId)?.nombre || '—'}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3 animate-pulse">
          <FaTimes className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* List of Academic Years */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 md:px-8 py-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaBook className="w-6 h-6 text-gray-600" />
            Listado de Años Escolares
          </h2>
        </div>

        <div className="p-6 md:p-8">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <FaBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No hay años escolares registrados</p>
              <p className="text-gray-400 text-sm mt-2">Crea el primer año escolar para comenzar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((it) => {
                const id = it.id || it._id;
                const isActive = activoId && id === activoId || it.activo;
                return (
                  <div
                    key={id}
                    className={`rounded-2xl border-2 p-6 transition-all duration-300 transform hover:shadow-lg ${
                      isActive
                        ? 'border-emerald-400 bg-emerald-50 hover:border-emerald-500 hover:bg-emerald-100/50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Período Académico</div>
                        <div className="text-2xl font-bold text-gray-800">{it.periodo || it.nombre}</div>
                      </div>
                      {isActive && (
                        <span className="inline-flex items-center gap-2 text-emerald-700 text-xs font-bold bg-emerald-200 px-3 py-1 rounded-full animate-pulse">
                          <FaCheckCircle className="w-3 h-3" />
                          Activo
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 mb-5">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Período de Meses</p>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="font-medium">{MESES.find(m=>m.value===Number(it.inicioMes))?.label || it.inicioMes}</span>
                          <FaArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{MESES.find(m=>m.value===Number(it.finMes))?.label || it.finMes}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">ID del Período</p>
                        <p className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">{id}</p>
                      </div>
                    </div>

                    {!isActive && (
                      <button
                        onClick={() => setActivo(id)}
                        disabled={saving}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-300 hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? <FaSpinner className="w-4 h-4 animate-spin" /> : <FaSync className="w-4 h-4" />}
                        Establecer como Activo
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Creating Academic Year */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseAttempt();
            }
          }}
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full animate-scale-in overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 md:px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between rounded-t-3xl">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-3 bg-gray-700/10 rounded-xl">
                  <FaPlus className="w-5 h-5 text-gray-700" />
                </div>
                Crear Nuevo Año Escolar
              </h3>
              <button
                onClick={handleCloseAttempt}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                disabled={saving}
              >
                <FaTimes className="w-6 h-6 text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={create} className="p-6 md:p-8 space-y-6">
              {/* Nombre del Año */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Nombre del Año Escolar</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={onChange}
                  placeholder="Ej: 2024-2025"
                  required
                  disabled={saving}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-700/10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Formato sugerido: YYYY-YYYY (ej: 2024-2025)</p>
              </div>

              {/* Meses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Mes de Inicio</label>
                  <select
                    name="inicioMes"
                    value={form.inicioMes}
                    onChange={onChange}
                    disabled={saving}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 transition-all duration-300 focus:outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-700/10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    {MESES.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Mes de Fin</label>
                  <select
                    name="finMes"
                    value={form.finMes}
                    onChange={onChange}
                    disabled={saving}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 transition-all duration-300 focus:outline-none focus:border-gray-700 focus:ring-2 focus:ring-gray-700/10 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    {MESES.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preview de Rango */}
              {rangePreview && (
                <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Rango de Período</p>
                  <p className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    {rangePreview}
                  </p>
                </div>
              )}

              {/* Checkbox Activo */}
              <label className="inline-flex items-center gap-3 p-3 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:bg-gray-100 transition-all duration-300">
                <input
                  type="checkbox"
                  name="activo"
                  checked={form.activo}
                  onChange={onChange}
                  disabled={saving}
                  className="w-5 h-5 rounded border-gray-300 cursor-pointer"
                />
                <span className="text-sm font-semibold text-gray-700">Establecer como año escolar activo</span>
              </label>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseAttempt}
                  disabled={saving}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold transition-all duration-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FaPlus className="w-5 h-5" />
                      Crear Año Escolar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Discard Changes */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden">
            {/* Confirm Header */}
            <div className="px-6 md:px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-white flex items-center justify-between rounded-t-3xl">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <FaExclamationTriangle className="w-5 h-5 text-amber-700" />
                </div>
                Descartar cambios
              </h3>
            </div>

            {/* Confirm Body */}
            <div className="p-6 md:p-8">
              <p className="text-gray-700 font-medium mb-2">¿Estás seguro?</p>
              <p className="text-gray-500 text-sm">
                Tienes cambios sin guardar. Si cierras ahora, se perderán los cambios hechos en el formulario.
              </p>
            </div>

            {/* Confirm Footer */}
            <div className="flex gap-3 px-6 md:px-8 py-6 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl font-semibold transition-all duration-300 hover:from-gray-600 hover:to-gray-700 hover:shadow-lg"
              >
                Continuar editando
              </button>
              <button
                type="button"
                onClick={discardChangesAndClose}
                className="flex-1 px-6 py-3 border-2 border-red-300 text-red-700 rounded-xl font-semibold transition-all duration-300 hover:bg-red-50"
              >
                Descartar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}