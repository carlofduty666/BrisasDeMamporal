import React, { useState, useEffect } from 'react';
import { FaTimes, FaChalkboardTeacher, FaCheck, FaIdCard, FaBook, FaArrowRight, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { formatearCedula } from '../../../../utils/formatters';

/**
 * Modal para asignar profesor a materia (sin seleccionar grado/sección)
 * Permite múltiples asignaciones
 * Luego de éxito, permite continuar a asignar profesor a grado
 */
const AsignarProfesorMateria = ({ 
  isOpen, 
  onClose, 
  materia, 
  profesores,
  annoEscolar,
  loading,
  onSubmit,
  profesoresYaAsignados = [],
  onSuccessAndContinue = null // Callback cuando se asigna y el usuario quiere continuar a grados
}) => {
  const [selectedProfesores, setSelectedProfesores] = useState([]);
  const [annoEscolarID, setAnnoEscolarID] = useState(annoEscolar?.id || '');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    if (isOpen) {
      setSelectedProfesores([]);
      setAnnoEscolarID(annoEscolar?.id || '');
      setSuccessMessage('');
      setErrorMessage('');
      setIsSubmitting(false);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedProfesores.length === 0) return;

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      // Enviar múltiples asignaciones
      let allSuccess = true;
      for (const profesorID of selectedProfesores) {
        try {
          await onSubmit({
            profesorID,
            annoEscolarID
          });
        } catch (err) {
          allSuccess = false;
          console.error('Error en asignación:', err);
        }
      }

      if (allSuccess) {
        setSuccessMessage(`✓ ${selectedProfesores.length} profesor(es) asignado(s) correctamente`);
        setSelectedProfesores([]);
      } else {
        setErrorMessage('Algunos profesores no pudieron ser asignados');
      }
      
      setIsSubmitting(false);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error al asignar profesor');
      setIsSubmitting(false);
    }
  };

  // Filtrar profesores ya asignados
  const profesoresDisponibles = profesores.filter(
    p => !profesoresYaAsignados.includes(p.id)
  );

  // Profesores ya asignados a esta materia
  const profesoresAsignados = profesoresYaAsignados
    .map(id => profesores.find(p => p.id === id))
    .filter(Boolean);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 cursor-pointer fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 fade-in">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border-2 border-blue-200 slide-up flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FaChalkboardTeacher className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Asignar Profesor a Materia
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

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-8 relative">
            {/* Notificación de Éxito */}
            {successMessage && (
              <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border-2 border-green-200 p-8 max-w-md mx-4 slide-up">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <FaCheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{successMessage}</h3>
                    <p className="text-sm text-gray-600">¿Desea asignar ahora estos profesores a grados y secciones?</p>
                    <div className="flex gap-3 pt-4 w-full">
                      <button
                        onClick={() => {
                          setSuccessMessage('');
                          onClose();
                        }}
                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300"
                      >
                        No, Cerrar
                      </button>
                      <button
                        onClick={() => {
                          setSuccessMessage('');
                          if (onSuccessAndContinue) {
                            onSuccessAndContinue();
                          }
                        }}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        Sí, Continuar <FaArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notificación de Error */}
            {errorMessage && (
              <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border-2 border-red-200 p-6 max-w-md mx-4 slide-up">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                      <FaExclamationCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">Error</h3>
                      <p className="text-sm text-gray-600 mt-1">{errorMessage}</p>
                    </div>
                    <button
                      onClick={() => setErrorMessage('')}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-gray-600 mb-6">
              Asignando: <span className="font-semibold text-blue-700">{materia?.asignatura}</span>
            </p>

            {/* Profesores ya asignados */}
            {profesoresAsignados.length > 0 && (
              <div className="mb-8 p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <FaCheck className="text-green-600" />
                  Profesores Ya Asignados
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {profesoresAsignados.map(profesor => (
                    <div key={profesor.id} className="flex items-start gap-2 text-sm text-green-700 p-2 bg-white rounded border border-green-100">
                      <FaCheck className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{profesor.nombre} {profesor.apellido}</p>
                        {profesor.cedula && (
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <FaIdCard className="w-3 h-3" />
                            {formatearCedula(profesor.cedula)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selección de Profesores */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FaChalkboardTeacher className="text-blue-600" />
                    Seleccionar Profesores <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-medium"
                  >
                    {selectedProfesores.length === profesoresDisponibles.length ? 'Desmarcar Todo' : 'Marcar Todo'}
                  </button>
                </div>

                {/* Tarjetas de Profesores */}
                <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50 space-y-3">
                  {profesoresDisponibles.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Todos los profesores ya tienen esta materia asignada
                    </p>
                  ) : (
                    profesoresDisponibles.map((profesor) => (
                      <label 
                        key={profesor.id} 
                        className="flex items-start gap-3 p-4 bg-white hover:bg-blue-50 rounded-lg cursor-pointer border border-blue-100 hover:border-blue-300"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProfesores.includes(profesor.id)}
                          onChange={() => handleToggleProfesor(profesor.id)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-0.5 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          {/* Nombre y Cédula */}
                          <div className="flex items-center gap-3 mb-2">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {profesor.nombre} {profesor.apellido}
                              </p>
                              {profesor.cedula && (
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <FaIdCard className="w-3 h-3" />
                                  <span>Cédula: {formatearCedula(profesor.cedula)}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Otras Materias Asignadas */}
                          {profesor.materiasAsignadas && profesor.materiasAsignadas.length > 0 && (
                            <div className="text-xs bg-blue-50 rounded p-2 border border-blue-200">
                              <p className="font-semibold text-blue-700 mb-1 flex items-center gap-1">
                                <FaBook className="w-3 h-3" />
                                Otras Materias:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {profesor.materiasAsignadas.map((mat, idx) => (
                                  <span key={idx} className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                                    {mat}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || selectedProfesores.length === 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Asignando...' : `Asignar a ${selectedProfesores.length} Profesor(es)`}
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

export default AsignarProfesorMateria;