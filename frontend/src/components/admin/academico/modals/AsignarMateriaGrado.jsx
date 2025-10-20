import React, { useState, useEffect } from 'react';
import { FaTimes, FaLayerGroup, FaCheck, FaTrash } from 'react-icons/fa';

const AsignarMateriaGrado = ({ 
  isOpen, 
  onClose, 
  materia, 
  grados, 
  annoEscolar,
  loading,
  onSubmit,
  gradosYaAsignados = [] // Nuevos props para asignaciones existentes
}) => {
  const [selectedGrados, setSelectedGrados] = useState([]);
  const [annoEscolarID, setAnnoEscolarID] = useState(annoEscolar?.id || '');

  useEffect(() => {
    setSelectedGrados([]);
    setAnnoEscolarID(annoEscolar?.id || '');
  }, [annoEscolar, isOpen]);

  // Manejar tecla ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleGrado = (gradoID) => {
    setSelectedGrados(prev =>
      prev.includes(gradoID)
        ? prev.filter(id => id !== gradoID)
        : [...prev, gradoID]
    );
  };

  const handleSelectAll = () => {
    if (selectedGrados.length === grados.length) {
      setSelectedGrados([]);
    } else {
      setSelectedGrados(grados.map(g => g.id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedGrados.length === 0) return;
    
    // Enviar múltiples asignaciones
    selectedGrados.forEach(gradoID => {
      onSubmit({
        gradoID,
        annoEscolarID
      });
    });
    
    setSelectedGrados([]);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Filtrar grados ya asignados
  const gradosDisponibles = grados.filter(
    g => !gradosYaAsignados.includes(g.id)
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 fade-in"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 fade-in">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-orange-200 slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FaLayerGroup className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Asignar a Grado
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg"
              aria-label="Cerrar"
            >
              <FaTimes className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-600 mb-6">
              Asignando: <span className="font-semibold text-orange-700">{materia?.asignatura}</span>
            </p>

            {/* Asignaciones ya hechas */}
            {gradosYaAsignados.length > 0 && (
              <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="text-sm font-semibold text-orange-800 mb-3">Ya Asignado a:</h4>
                <div className="space-y-2">
                  {gradosYaAsignados.map(gradoID => {
                    const grado = grados.find(g => g.id === gradoID);
                    return (
                      <div key={gradoID} className="flex items-center gap-2 text-sm text-orange-700">
                        <FaCheck className="text-orange-600" />
                        <span>{grado?.nombre_grado} {grado?.Niveles?.nombre_nivel ? `(${grado.Niveles.nombre_nivel})` : ''}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Header de selección */}
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-700">
                  Seleccionar Grados <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                >
                  {selectedGrados.length === gradosDisponibles.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                </button>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {gradosDisponibles.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Todos los grados ya han sido asignados
                  </p>
                ) : (
                  gradosDisponibles.map((grado) => (
                    <label key={grado.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedGrados.includes(grado.id)}
                        onChange={() => handleToggleGrado(grado.id)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-2 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">
                        {grado.nombre_grado} {grado.Niveles?.nombre_nivel ? `(${grado.Niveles.nombre_nivel})` : ''}
                      </span>
                    </label>
                  ))
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedGrados.length === 0}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Asignando...' : `Asignar (${selectedGrados.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .fade-in {
          animation: fadeIn 0.15s ease-in-out forwards;
        }

        .slide-up {
          animation: slideUp 0.2s ease-out forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default AsignarMateriaGrado;