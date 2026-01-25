import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaSpinner, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';

const ModalSeleccionarEvaluacion = ({
  isOpen,
  onClose,
  profesor,
  onEditarEvaluacion,
  onCalificarEvaluacion,
  onVerEntregas,
  onEliminarEvaluacion
}) => {
  const [evaluacionesModal, setEvaluacionesModal] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarEvaluaciones();
    }
  }, [isOpen]);

  const cargarEvaluaciones = async () => {
    setLoadingModal(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const evaluacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesor.id}`,
        config
      );
      
      setEvaluacionesModal(evaluacionesResponse.data);
    } catch (err) {
      console.error('Error al cargar evaluaciones:', err);
    }
    
    setLoadingModal(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto animate-scaleIn transition-all duration-300 ease-in-out">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Seleccionar Evaluación para Calificar
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {loadingModal ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin h-8 w-8 text-slate-600" />
            </div>
          ) : evaluacionesModal.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay evaluaciones para calificar</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluacionesModal.map((evaluacion) => (
                <div key={evaluacion.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-900">{evaluacion.nombreEvaluacion}</h3>
                    <p className="text-sm text-gray-500">
                      {evaluacion.Materias?.asignatura} • Lapso {evaluacion.lapso}
                    </p>
                    <p className="text-sm text-gray-500">
                      {evaluacion.tipoEvaluacion} • {evaluacion.porcentaje}%
                    </p>
                    <p className="text-sm text-gray-500">
                      Fecha: {new Date(evaluacion.fechaEvaluacion).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditarEvaluacion(evaluacion)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center"
                      >
                        <FaEdit className="h-3 w-3 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => onCalificarEvaluacion(evaluacion)}
                        className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded text-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5"
                      >
                        Calificar
                      </button>
                    </div>
                    {evaluacion.requiereEntrega && (
                      <button
                        onClick={() => onVerEntregas(evaluacion)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center"
                      >
                        <FaUpload className="h-3 w-3 mr-1" />
                        Ver Entregas
                      </button>
                    )}
                    <button
                      onClick={() => onEliminarEvaluacion(evaluacion)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center"
                    >
                      <FaTrash className="h-3 w-3 mr-1" />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalSeleccionarEvaluacion;
