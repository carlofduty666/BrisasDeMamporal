import React, { useState, useEffect, useCallback } from 'react';
import {
  FaTimes,
  FaTrash,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaChalkboardTeacher
} from 'react-icons/fa';
import axios from 'axios';
import { formatearNombreGrado, formatearCedula } from '../../../../utils/formatters';

/**
 * Modal para quitar asignación de un profesor a un grado
 * Requiere confirmación y valida que no haya restricciones
 */
const QuitarProfesorGrado = ({
  isOpen,
  onClose,
  profesor,
  grado,
  annoEscolar,
  onRefresh = null
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: null, text: null });
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  // Limpiar estados al cerrar
  useEffect(() => {
    if (!isOpen) {
      setShowConfirmation(false);
      setMessage({ type: null, text: null });
      setLoading(false);
    }
  }, [isOpen]);

  // Manejar tecla ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !profesor || !grado) return null;

  // Pantalla de confirmación
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage({ type: null, text: null });

      // Realizar la eliminación
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${grado.id}/profesores/${profesor.id}/${annoEscolar.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setLoading(false);

      if (response.data?.deleted || response.status === 200) {
        setMessage({
          type: 'success',
          text: `✓ ${profesor.nombre} ${profesor.apellido} ha sido removido del grado`
        });

        // Llamar refresh después de 1.5s
        if (onRefresh) {
          setTimeout(() => {
            onRefresh();
            onClose();
          }, 1500);
        }
      }
    } catch (error) {
      setLoading(false);
      
      if (error.response?.status === 409) {
        setMessage({
          type: 'error',
          text: error.response.data?.message || 'No se puede eliminar esta asignación. El profesor tiene evaluaciones o calificaciones registradas.',
          details: error.response.data?.details
        });
      } else {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Error al quitar la asignación del profesor'
        });
      }
    }
  };

  const profesorNombre = `${profesor.nombre} ${profesor.apellido || ''}`;
  const gradoNombre = grado.nombre_grado || `Grado ${grado.id}`;

  // Pantalla inicial de confirmación
  if (!showConfirmation) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 z-40 cursor-pointer"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-indigo-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <FaTrash className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Quitar Profesor
                  </h3>
                  <p className="text-xs text-indigo-100 mt-1">
                    {gradoNombre}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-150"
                aria-label="Cerrar"
              >
                <FaTimes className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Información del profesor */}
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {profesor.nombre?.charAt(0)}{profesor.apellido?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-indigo-900">
                      {profesorNombre}
                    </p>
                    <p className="text-xs text-indigo-600">
                      C.I: V-{formatearCedula(profesor.cedula)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mensaje de advertencia */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                <div className="flex items-start">
                  <FaExclamationTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">
                      ¿Estás seguro?
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      {profesorNombre} será removido del grado <strong>{gradoNombre}</strong>. Si esta asignación tiene evaluaciones o calificaciones registradas, no podrá eliminarse.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mensaje de estado */}
              {message.text && (
                <div className={`p-4 rounded-lg border-l-4 ${
                  message.type === 'error' 
                    ? 'bg-red-50 border-red-400 text-red-800' 
                    : message.type === 'success'
                    ? 'bg-green-50 border-green-400 text-green-800'
                    : 'bg-yellow-50 border-yellow-400 text-yellow-800'
                }`}>
                  <div className="flex items-start">
                    {message.type === 'success' && (
                      <FaCheckCircle className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
                    )}
                    {message.type === 'error' && (
                      <FaExclamationTriangle className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{message.text}</p>
                      {message.details && (
                        <p className="text-xs mt-1">{message.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-150"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setShowConfirmation(true)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg hover:shadow-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <FaTrash className="w-4 h-4" />
                      Confirmar Eliminación
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Pantalla de confirmación final
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 cursor-pointer"
        onClick={onClose}
      />

      {/* Modal de confirmación final */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-200 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FaExclamationTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Confirmar Eliminación
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-150"
              aria-label="Cerrar"
            >
              <FaTimes className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Icono de advertencia */}
            <div className="flex justify-center">
              <div className="p-4 bg-red-100 rounded-full">
                <FaExclamationTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Mensaje */}
            <div className="text-center space-y-2">
              <p className="text-lg font-bold text-gray-900">
                ¿Confirmar eliminación?
              </p>
              <p className="text-sm text-gray-600">
                Se eliminará a <strong className="text-red-600">{profesorNombre}</strong> del grado <strong className="text-indigo-600">{gradoNombre}</strong>. Esta acción es irreversible.
              </p>
            </div>

            {/* Mensaje de estado */}
            {message.text && (
              <div className={`p-4 rounded-lg border-l-4 ${
                message.type === 'error' 
                  ? 'bg-red-50 border-red-400 text-red-800' 
                  : message.type === 'success'
                  ? 'bg-green-50 border-green-400 text-green-800'
                  : 'bg-yellow-50 border-yellow-400 text-yellow-800'
              }`}>
                <div className="flex items-start">
                  {message.type === 'success' && (
                    <FaCheckCircle className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
                  )}
                  {message.type === 'error' && (
                    <FaExclamationTriangle className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{message.text}</p>
                    {message.details && (
                      <p className="text-xs mt-1">{message.details}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors duration-150 disabled:opacity-50"
              >
                Atrás
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      </div>
    </>
  );
};

export default QuitarProfesorGrado;