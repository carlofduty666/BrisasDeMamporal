import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaSpinner, FaSave, FaTrash } from 'react-icons/fa';

const CalificacionRow = ({ estudiante, onGuardar, onEliminar }) => {
  const [calificacion, setCalificacion] = useState(estudiante.calificacion || '');
  const [observaciones, setObservaciones] = useState(estudiante.observaciones || '');
  const [guardando, setGuardando] = useState(false);

  const handleGuardar = async () => {
    if (!calificacion || calificacion < 0 || calificacion > 20) {
      alert('La calificación debe estar entre 0 y 20');
      return;
    }
    
    setGuardando(true);
    await onGuardar(estudiante, parseFloat(calificacion), observaciones);
    setGuardando(false);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div className="md:col-span-1">
          <p className="font-medium text-gray-900">
            {estudiante.nombre} {estudiante.apellido}
          </p>
          <p className="text-sm text-gray-500">C.I: {estudiante.cedula}</p>
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Calificación (0-20)
          </label>
          <input
            type="number"
            min="0"
            max="20"
            step="0.01"
            value={calificacion}
            onChange={(e) => setCalificacion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
            placeholder="0.00"
          />
        </div>
        
        <div className="md:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observaciones
          </label>
          <input
            type="text"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
            placeholder="Opcional..."
          />
        </div>
        
        <div className="md:col-span-1 text-right">
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={handleGuardar}
              disabled={guardando || !calificacion}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              {guardando ? (
                <>
                  <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </button>
            
            {estudiante.calificacion && (
              <button
                onClick={() => onEliminar(estudiante.id, `${estudiante.nombre} ${estudiante.apellido}`)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center"
                title="Eliminar calificación"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ModalCalificaciones = ({
  isOpen,
  onClose,
  selectedEvaluacion,
  annoEscolar,
  onGuardarCalificacion,
  onEliminarCalificacion
}) => {
  const [calificacionesModal, setCalificacionesModal] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  useEffect(() => {
    if (isOpen && selectedEvaluacion) {
      cargarCalificaciones();
    }
  }, [isOpen, selectedEvaluacion]);

  const cargarCalificaciones = async () => {
    setLoadingModal(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const estudiantesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/grados/${selectedEvaluacion.gradoID}/estudiantes?annoEscolarID=${annoEscolar.id}`,
        config
      );
      
      const calificacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/calificaciones/evaluacion/${selectedEvaluacion.id}`,
        config
      );
      
      const estudiantes = estudiantesResponse.data;
      const calificaciones = calificacionesResponse.data;
      
      const estudiantesConCalificaciones = estudiantes.map(estudiante => {
        const calificacion = calificaciones.find(c => c.personaID === estudiante.id);
        return {
          ...estudiante,
          calificacion: calificacion ? calificacion.calificacion : null,
          observaciones: calificacion ? calificacion.observaciones : '',
          calificacionID: calificacion ? calificacion.id : null
        };
      });
      
      setCalificacionesModal(estudiantesConCalificaciones);
    } catch (err) {
      console.error('Error al cargar datos para calificar:', err);
    }
    
    setLoadingModal(false);
  };

  if (!isOpen || !selectedEvaluacion) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto animate-scaleIn transition-all duration-300 ease-in-out">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Calificar: {selectedEvaluacion.nombreEvaluacion}
              </h2>
              <p className="text-sm text-gray-600">
                {selectedEvaluacion.Materias?.asignatura} • Lapso {selectedEvaluacion.lapso} • {selectedEvaluacion.porcentaje}%
              </p>
            </div>
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
          ) : calificacionesModal.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay estudiantes para calificar</p>
          ) : (
            <div className="space-y-4">
              {calificacionesModal.map((estudiante, index) => (
                <div
                  key={estudiante.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CalificacionRow
                    estudiante={estudiante}
                    onGuardar={onGuardarCalificacion}
                    onEliminar={onEliminarCalificacion}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalCalificaciones;
