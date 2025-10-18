import React, { useState, useEffect } from 'react';
import { FaTimes, FaChalkboardTeacher, FaCheck } from 'react-icons/fa';

const AsignarProfesorMateria = ({ 
  isOpen, 
  onClose, 
  materia, 
  profesores,
  grados,
  annoEscolar,
  loading,
  onSubmit,
  profesoresYaAsignados = [] // Nuevos props para asignaciones existentes
}) => {
  const [selectedProfesores, setSelectedProfesores] = useState([]);
  const [gradoSeleccionado, setGradoSeleccionado] = useState('');
  const [annoEscolarID, setAnnoEscolarID] = useState(annoEscolar?.id || '');
  const [profesoresAsignados, setProfesoresAsignados] = useState(profesoresYaAsignados);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    setSelectedProfesores([]);
    setGradoSeleccionado('');
    setAnnoEscolarID(annoEscolar?.id || '');
    setProfesoresAsignados(profesoresYaAsignados);
  }, [annoEscolar, isOpen, profesoresYaAsignados]);

  // Cargar profesores asignados desde el backend si no vienen del padre
  useEffect(() => {
    if (isOpen && materia?.id && profesoresYaAsignados.length === 0 && token) {
      const cargarProfesoresAsignados = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/${materia.id}/profesores`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (response.ok) {
            const data = await response.json();
            setProfesoresAsignados(Array.isArray(data) ? data : data.data || []);
          }
        } catch (err) {
          console.warn('Error cargando profesores asignados:', err);
          setProfesoresAsignados([]);
        }
      };
      cargarProfesoresAsignados();
    }
  }, [isOpen, materia?.id, token, profesoresYaAsignados]);

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

  const handleToggleProfesor = (profesorID) => {
    setSelectedProfesores(prev =>
      prev.includes(profesorID)
        ? prev.filter(id => id !== profesorID)
        : [...prev, profesorID]
    );
  };

  const handleSelectAll = () => {
    if (selectedProfesores.length === profesoresDisponibles.length) {
      setSelectedProfesores([]);
    } else {
      setSelectedProfesores(profesoresDisponibles.map(p => p.id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedProfesores.length === 0 || !gradoSeleccionado) return;
    
    // Enviar múltiples asignaciones
    selectedProfesores.forEach(profesorID => {
      onSubmit({
        profesorID,
        gradoID: gradoSeleccionado,
        annoEscolarID
      });
    });
    
    setSelectedProfesores([]);
    setGradoSeleccionado('');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Filtrar profesores ya asignados para el grado seleccionado
  const profesoresDisponibles = gradoSeleccionado
    ? profesores.filter(p => 
        !profesoresAsignados.some(pa => 
          pa.profesorID === p.id && pa.gradoID === parseInt(gradoSeleccionado)
        )
      )
    : profesores;

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
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-blue-200 animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FaChalkboardTeacher className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Asignar Profesor
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
              Asignando: <span className="font-semibold text-blue-700">{materia?.asignatura}</span>
            </p>

            {/* Profesores ya asignados al grado seleccionado */}
            {gradoSeleccionado && profesoresAsignados.filter(pa => pa.gradoID === parseInt(gradoSeleccionado)).length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">Ya Asignados en este Grado:</h4>
                <div className="space-y-2">
                  {profesoresAsignados
                    .filter(pa => pa.gradoID === parseInt(gradoSeleccionado))
                    .map(pa => {
                      const profesor = profesores.find(p => p.id === pa.profesorID);
                      return (
                        <div key={`${pa.profesorID}-${pa.gradoID}`} className="flex items-center gap-2 text-sm text-blue-700">
                          <FaCheck className="text-blue-600" />
                          <span>{profesor?.nombre} {profesor?.apellido}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selector de Grado primero */}
              <div>
                <label htmlFor="gradoID" className="block text-sm font-semibold text-gray-700 mb-2">
                  Seleccionar Grado <span className="text-red-500">*</span>
                </label>
                <select
                  id="gradoID"
                  value={gradoSeleccionado}
                  onChange={(e) => {
                    setGradoSeleccionado(e.target.value);
                    setSelectedProfesores([]);
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700 transition-all duration-200 hover:border-blue-300"
                >
                  <option value="">-- Seleccionar Grado --</option>
                  {grados.map((grado) => (
                    <option key={grado.id} value={grado.id}>
                      {grado.nombre_grado} {grado.Niveles?.nombre_nivel ? `(${grado.Niveles.nombre_nivel})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {gradoSeleccionado && (
                <>
                  {/* Header de selección de profesores */}
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-semibold text-gray-700">
                      Seleccionar Profesores <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                    >
                      {selectedProfesores.length === profesoresDisponibles.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                    </button>
                  </div>

                  {/* Checkboxes de profesores */}
                  <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {profesoresDisponibles.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Todos los profesores ya han sido asignados
                      </p>
                    ) : (
                      profesoresDisponibles.map((profesor) => (
                        <label key={profesor.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedProfesores.includes(profesor.id)}
                            onChange={() => handleToggleProfesor(profesor.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {profesor.nombre} {profesor.apellido}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </>
              )}

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
                  disabled={loading || !gradoSeleccionado || selectedProfesores.length === 0}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Asignando...' : `Asignar (${selectedProfesores.length})`}
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

export default AsignarProfesorMateria;