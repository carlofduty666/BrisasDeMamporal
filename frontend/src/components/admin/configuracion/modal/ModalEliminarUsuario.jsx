import React from 'react';
import {
  FaExclamationCircle,
  FaTrash,
  FaSpinner
} from 'react-icons/fa';

const ModalEliminarUsuario = ({
  isOpen,
  usuario,
  loading,
  onClose,
  onSubmit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-50 rounded-xl">
            <FaExclamationCircle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Eliminar Usuario</h2>
        </div>

        {usuario && (
          <>
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Usuario a eliminar:</p>
              <p className="font-semibold text-gray-900">
                {usuario.persona?.nombre} {usuario.persona?.apellido}
              </p>
              <p className="text-sm text-gray-600">{usuario.email}</p>
            </div>

            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">
                Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.
              </p>
            </div>
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
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <FaTrash className="w-4 h-4" />
                Eliminar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEliminarUsuario;