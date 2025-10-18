import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { FaX } from "react-icons/fa6";
import axios from 'axios';
import { toast } from 'react-toastify';

const CrearSeccion = ({ isOpen, onClose, gradoId, gradoNombre, nivelNombre, onSectionCreated }) => {
  const [nombreSeccion, setNombreSeccion] = useState('');
  const [capacidad, setCapacidad] = useState(30);
  const [activo, setActivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Manejar tecla ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, loading, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nombreSeccion.trim()) {
      setError('El nombre de la sección es requerido');
      return;
    }

    if (capacidad <= 0) {
      setError('La capacidad debe ser mayor a 0');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/secciones`,
        {
          nombre_seccion: nombreSeccion.toUpperCase(),
          capacidad: parseInt(capacidad),
          activo,
          gradoID: gradoId
        },
        config
      );

      toast.success(`Sección ${nombreSeccion} creada correctamente`);
      
      // Resetear formulario
      setNombreSeccion('');
      setCapacidad(30);
      setActivo(true);
      
      // Callback para actualizar lista
      onSectionCreated(response.data);
      onClose();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al crear la sección';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Manejar click fuera del modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
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

      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FaPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Nueva Sección</h2>
              <p className="text-purple-100 text-sm mt-1">
                {nivelNombre} • {gradoNombre}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <FaX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Nombre Sección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Sección *
            </label>
            <input
              type="text"
              value={nombreSeccion}
              onChange={(e) => setNombreSeccion(e.target.value)}
              placeholder="Ej: A, B, C"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
              disabled={loading}
              maxLength="2"
            />
            <p className="text-xs text-gray-500 mt-1">Máximo 2 caracteres</p>
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacidad de Estudiantes *
            </label>
            <input
              type="number"
              value={capacidad}
              onChange={(e) => setCapacidad(e.target.value)}
              min="1"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
              disabled={loading}
            />
          </div>

          {/* Estado */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="activo"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              disabled={loading}
            />
            <label htmlFor="activo" className="text-sm font-medium text-gray-700">
              Sección Activa
            </label>
          </div>

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
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <FaPlus className="w-4 h-4" />
                  <span>Crear</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearSeccion;