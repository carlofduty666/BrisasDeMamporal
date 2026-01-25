import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaTimes, 
  FaSpinner, 
  FaUpload, 
  FaPaperclip, 
  FaDownload 
} from 'react-icons/fa';

const ModalEntregas = ({
  isOpen,
  onClose,
  selectedEvaluacion,
  annoEscolar,
  onCalificarEntrega,
  onDescargarArchivo
}) => {
  const [entregasModal, setEntregasModal] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && selectedEvaluacion) {
      cargarEntregas();
    }
  }, [isOpen, selectedEvaluacion]);

  const cargarEntregas = async () => {
    setLoadingModal(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const entregasResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/archivos-evaluaciones/entregas/${selectedEvaluacion.id}`,
        config
      );
      
      setEntregasModal(entregasResponse.data);
    } catch (err) {
      console.error('Error al cargar entregas:', err);
      setError('Error al cargar entregas de estudiantes');
      setTimeout(() => setError(''), 3000);
    }
    
    setLoadingModal(false);
  };

  const handleCalificarEntrega = async (estudianteId, calificacion, observaciones) => {
    if (!calificacion || calificacion < 0 || calificacion > 20) {
      setError('La calificación debe estar entre 0 y 20');
      setTimeout(() => setError(''), 3000);
      return;
    }

    await onCalificarEntrega(estudianteId, calificacion, observaciones);
    await cargarEntregas();
  };

  if (!isOpen || !selectedEvaluacion) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto animate-scaleIn transition-all duration-300 ease-in-out">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Entregas: {selectedEvaluacion.nombreEvaluacion}
              </h2>
              <p className="text-sm text-gray-600">
                {selectedEvaluacion.Materias?.asignatura} • Lapso {selectedEvaluacion.lapso} • {selectedEvaluacion.porcentaje}%
              </p>
              {selectedEvaluacion.fechaLimiteEntrega && (
                <p className="text-sm text-orange-600">
                  Fecha límite: {new Date(selectedEvaluacion.fechaLimiteEntrega).toLocaleDateString()}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="p-6">
          {loadingModal ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin h-8 w-8 text-slate-600" />
            </div>
          ) : entregasModal.length === 0 ? (
            <div className="text-center py-8">
              <FaUpload className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay entregas registradas para esta evaluación</p>
            </div>
          ) : (
            <div className="space-y-6">
              {entregasModal.map((entrega, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {entrega.estudiante.nombre} {entrega.estudiante.apellido}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Cédula: {entrega.estudiante.cedula}
                      </p>
                    </div>
                    <div className="text-right">
                      {entrega.calificacion ? (
                        <div className="bg-green-100 px-3 py-1 rounded-full">
                          <span className={`font-semibold ${
                            entrega.calificacion.calificacion >= 14 ? 'text-green-700' :
                            entrega.calificacion.calificacion >= 10 ? 'text-yellow-700' : 'text-red-700'
                          }`}>
                            {entrega.calificacion.calificacion}/20
                          </span>
                        </div>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                          Sin calificar
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">Archivos entregados:</h4>
                    {entrega.archivos.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No ha entregado archivos</p>
                    ) : (
                      <div className="space-y-2">
                        {entrega.archivos.map((archivo) => (
                          <div key={archivo.id} className="flex items-center justify-between bg-white p-3 rounded border">
                            <div className="flex items-center">
                              <FaPaperclip className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {archivo.nombreArchivo}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Subido: {new Date(archivo.createdAt).toLocaleString()}
                                  {archivo.descripcion && ` • ${archivo.descripcion}`}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => onDescargarArchivo(archivo.id)}
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                              title="Descargar archivo"
                            >
                              <FaDownload className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Calificación (0-20)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.1"
                          defaultValue={entrega.calificacion?.calificacion || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                          onBlur={(e) => handleCalificarEntrega(entrega.estudiante.id, e.target.value, entrega.calificacion?.observaciones || '')}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Observaciones
                        </label>
                        <textarea
                          rows="3"
                          defaultValue={entrega.calificacion?.observaciones || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                          placeholder="Comentarios sobre la entrega..."
                          onBlur={(e) => handleCalificarEntrega(entrega.estudiante.id, entrega.calificacion?.calificacion || 0, e.target.value)}
                        />
                      </div>
                    </div>
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

export default ModalEntregas;
