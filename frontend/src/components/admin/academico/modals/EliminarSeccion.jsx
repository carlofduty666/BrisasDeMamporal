import { useState, useEffect } from 'react';
import { FaTrash, FaExclamationTriangle, FaUsers } from 'react-icons/fa';
import { FaX } from "react-icons/fa6";
import axios from 'axios';
import { toast } from 'react-toastify';

const CustomToast = ({ message, type = 'warning', duration = 7000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  const bgColor = type === 'warning' ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-300';
  const textColor = type === 'warning' ? 'text-yellow-800' : 'text-red-800';
  const iconColor = type === 'warning' ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className={`fixed bottom-8 right-8 ${bgColor} border rounded-lg p-4 shadow-lg z-[60] max-w-sm animate-slide-up`}>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>
      <div className="flex items-start space-x-3">
        {type === 'warning' ? (
          <FaExclamationTriangle className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        ) : (
          <FaTrash className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} />
        )}
        <div>
          <p className={`${textColor} text-sm font-medium`}>{message}</p>
        </div>
      </div>
    </div>
  );
};

const EliminarSeccion = ({ isOpen, onClose, seccion, onSectionDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [estudiantesCount, setEstudiantesCount] = useState(0);
  const [checkingEstudiantes, setCheckingEstudiantes] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isOpen && seccion) {
      verificarEstudiantes();
    }
  }, [isOpen, seccion]);

  // Manejar tecla ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading && !checkingEstudiantes) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, loading, checkingEstudiantes, onClose]);

  const verificarEstudiantes = async () => {
    try {
      setCheckingEstudiantes(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // Obtener estudiantes en la sección
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/secciones/${seccion.id}/estudiantes`,
        config
      );

      setEstudiantesCount(response.data?.length || 0);
    } catch (err) {
      console.error('Error al verificar estudiantes:', err);
      setEstudiantesCount(0);
    } finally {
      setCheckingEstudiantes(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/secciones/${seccion.id}`,
        config
      );

      setToast({
        message: `Sección ${seccion.nombre_seccion} eliminada correctamente`,
        type: 'success'
      });
      
      setTimeout(() => {
        onSectionDeleted(seccion.id);
        onClose();
        setToast(null);
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar la sección';
      setToast({
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const tieneEstudiantes = estudiantesCount > 0;

  if (!isOpen || !seccion) return null;

  // Manejar click fuera del modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading && !checkingEstudiantes) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-in-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }
      `}</style>

      {toast && <CustomToast message={toast.message} type={toast.type} duration={7000} />}

      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Rojo */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FaTrash className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Eliminar Sección</h2>
              <p className="text-red-100 text-sm mt-1">
                Sección {seccion.nombre_seccion}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
            disabled={loading}
          >
            <FaX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Advertencia General */}
          <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex items-start space-x-3">
            <FaExclamationTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">Acción Irreversible</p>
              <p className="text-sm text-red-800 mt-1">
                Estás a punto de eliminar permanentemente esta sección.
              </p>
            </div>
          </div>

          {/* Estado de Estudiantes */}
          {checkingEstudiantes ? (
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-600">Verificando estudiantes...</p>
            </div>
          ) : (
            <div className={`${tieneEstudiantes ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300'} border rounded-lg p-4`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${tieneEstudiantes ? 'bg-yellow-100' : 'bg-green-100'}`}>
                  <FaUsers className={`w-5 h-5 ${tieneEstudiantes ? 'text-yellow-600' : 'text-green-600'}`} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${tieneEstudiantes ? 'text-yellow-900' : 'text-green-900'}`}>
                    {tieneEstudiantes ? 'Estudiantes en esta sección' : 'Sin estudiantes'}
                  </p>
                  <p className={`text-sm ${tieneEstudiantes ? 'text-yellow-800' : 'text-green-800'}`}>
                    {tieneEstudiantes 
                      ? `Hay ${estudiantesCount} estudiante${estudiantesCount > 1 ? 's' : ''} asignado${estudiantesCount > 1 ? 's' : ''} a esta sección.`
                      : 'La sección no tiene estudiantes asignados.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recomendación */}
          {tieneEstudiantes && (
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Recomendación:</span> Transfiere todos los estudiantes a otra sección antes de proceder con la eliminación.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                tieneEstudiantes
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
              }`}
              disabled={loading || tieneEstudiantes || checkingEstudiantes}
              title={tieneEstudiantes ? 'No puedes eliminar una sección con estudiantes' : ''}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <FaTrash className="w-4 h-4" />
                  <span>{tieneEstudiantes ? 'No disponible' : 'Eliminar'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EliminarSeccion;