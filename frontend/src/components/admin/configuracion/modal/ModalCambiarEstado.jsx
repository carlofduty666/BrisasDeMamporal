import React from 'react';
import {
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';

const ESTADO_COLORS = {
  'activo': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', label: 'Activo', badge: 'bg-green-100 text-green-800' },
  'suspendido': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', label: 'Suspendido', badge: 'bg-yellow-100 text-yellow-800' },
  'desactivado': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Desactivado', badge: 'bg-red-100 text-red-800' },
  'inactivo': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', label: 'Inactivo', badge: 'bg-gray-100 text-gray-800' }
};

const ESTADOS = ['activo', 'suspendido', 'desactivado', 'inactivo'];

const ModalCambiarEstado = ({
  isOpen,
  usuario,
  estadoActual,
  estadoNuevo,
  loading,
  onClose,
  onEstadoChange,
  onSubmit
}) => {
  if (!isOpen) return null;

  const estadoActualConfig = ESTADO_COLORS[estadoActual];
  const estadoNuevoConfig = ESTADO_COLORS[estadoNuevo];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-xl">
            <FaCheckCircle className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Cambiar Estado</h2>
        </div>

        {usuario && (
          <>
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Usuario:</p>
              <p className="font-semibold text-gray-900">
                {usuario.persona?.nombre} {usuario.persona?.apellido}
              </p>
              <p className="text-sm text-gray-600">{usuario.email}</p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Estado actual */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Estado Actual</p>
                <div className={`p-3 rounded-lg border-2 ${estadoActualConfig.border} ${estadoActualConfig.bg}`}>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${estadoActualConfig.badge}`}>
                    {estadoActualConfig.label}
                  </span>
                </div>
              </div>

              {/* Seleccionar nuevo estado */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Seleccionar Nuevo Estado</p>
                <select
                  value={estadoNuevo}
                  onChange={(e) => onEstadoChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 font-medium"
                >
                  {ESTADOS.map(estado => (
                    <option key={estado} value={estado}>
                      {ESTADO_COLORS[estado].label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vista previa del nuevo estado */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa</p>
                <div className={`p-3 rounded-lg border-2 ${estadoNuevoConfig.border} ${estadoNuevoConfig.bg}`}>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${estadoNuevoConfig.badge}`}>
                    {estadoNuevoConfig.label}
                  </span>
                </div>
              </div>
            </div>

            {estadoNuevo === estadoActual && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  El nuevo estado es igual al actual
                </p>
              </div>
            )}
          </>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onSubmit}
            disabled={loading || estadoNuevo === estadoActual}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <FaCheckCircle className="w-4 h-4" />
                Cambiar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCambiarEstado;