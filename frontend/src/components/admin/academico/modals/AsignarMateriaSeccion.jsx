import React, { useState, useEffect } from 'react';
import { FaTimes, FaBook, FaCheck } from 'react-icons/fa';

const AsignarMateriaSeccion = ({ 
  isOpen, 
  onClose, 
  materia, 
  secciones,
  annoEscolar,
  loading,
  onSubmit,
  seccionesYaAsignadas = [] // Nuevos props para asignaciones existentes
}) => {
  const [selectedSecciones, setSelectedSecciones] = useState([]);
  const [annoEscolarID, setAnnoEscolarID] = useState(annoEscolar?.id || '');
  const [seccionesAsignadas, setSeccionesAsignadas] = useState(seccionesYaAsignadas);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    setSelectedSecciones([]);
    setAnnoEscolarID(annoEscolar?.id || '');
    setSeccionesAsignadas(seccionesYaAsignadas);
  }, [annoEscolar, isOpen, seccionesYaAsignadas]);

  // Cargar secciones asignadas desde el backend si no vienen del padre
  useEffect(() => {
    if (isOpen && materia?.id && seccionesYaAsignadas.length === 0 && token) {
      const cargarSeccionesAsignadas = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/${materia.id}/secciones`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (response.ok) {
            const data = await response.json();
            const seccionIds = Array.isArray(data) 
              ? data.map(s => s.id) 
              : (data.data ? data.data.map(s => s.id) : []);
            setSeccionesAsignadas(seccionIds);
          }
        } catch (err) {
          console.warn('Error cargando secciones asignadas:', err);
          setSeccionesAsignadas([]);
        }
      };
      cargarSeccionesAsignadas();
    }
  }, [isOpen, materia?.id, token, seccionesYaAsignadas]);

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

  const handleToggleSeccion = (seccionID) => {
    setSelectedSecciones(prev =>
      prev.includes(seccionID)
        ? prev.filter(id => id !== seccionID)
        : [...prev, seccionID]
    );
  };

  const handleSelectAll = () => {
    if (selectedSecciones.length === seccionesDisponibles.length) {
      setSelectedSecciones([]);
    } else {
      setSelectedSecciones(seccionesDisponibles.map(s => s.id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSecciones.length === 0) return;
    
    // Enviar múltiples asignaciones
    selectedSecciones.forEach(seccionID => {
      onSubmit({
        seccionID,
        annoEscolarID
      });
    });
    
    setSelectedSecciones([]);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Filtrar secciones ya asignadas
  const seccionesDisponibles = secciones.filter(
    s => !seccionesAsignadas.includes(s.id)
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
        onClick={handleBackdropClick}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-green-200 animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FaBook className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Asignar a Sección
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <FaTimes className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-600 mb-6">
              Asignando: <span className="font-semibold text-green-700">{materia?.asignatura}</span>
            </p>

            {/* Secciones ya asignadas */}
            {seccionesAsignadas.length > 0 && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-3">Ya Asignado a:</h4>
                <div className="space-y-2">
                  {seccionesAsignadas.map(seccionID => {
                    const seccion = secciones.find(s => s.id === seccionID);
                    return (
                      <div key={seccionID} className="flex items-center gap-2 text-sm text-green-700">
                        <FaCheck className="text-green-600" />
                        <span>{seccion?.nombre_seccion}</span>
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
                  Seleccionar Secciones <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                >
                  {selectedSecciones.length === seccionesDisponibles.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                </button>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {seccionesDisponibles.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Todas las secciones ya han sido asignadas
                  </p>
                ) : (
                  seccionesDisponibles.map((seccion) => (
                    <label key={seccion.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedSecciones.includes(seccion.id)}
                        onChange={() => handleToggleSeccion(seccion.id)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">
                        {seccion.nombre_seccion}
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
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || selectedSecciones.length === 0}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Asignando...' : `Asignar (${selectedSecciones.length})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default AsignarMateriaSeccion;