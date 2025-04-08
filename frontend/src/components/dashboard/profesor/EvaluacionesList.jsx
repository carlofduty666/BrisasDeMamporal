import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaDownload, FaUpload, FaClipboardCheck } from 'react-icons/fa';
import EvaluacionForm from './EvaluacionForm';

const EvaluacionesList = ({ profesorID, annoEscolarID, gradoID, seccionID, materiaID }) => {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEvaluacion, setEditingEvaluacion] = useState(null);
  const [porcentajesLapso, setPorcentajesLapso] = useState({});

  useEffect(() => {
    if (profesorID && annoEscolarID) {
      fetchEvaluaciones();
      verificarPorcentajes();
    }
  }, [profesorID, annoEscolarID, gradoID, seccionID, materiaID]);

  const fetchEvaluaciones = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = {
        annoEscolarID,
        profesorID
      };
      
      if (gradoID) params.gradoID = gradoID;
      if (seccionID) params.seccionID = seccionID;
      if (materiaID) params.materiaID = materiaID;
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluaciones/filtradas`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          params
        }
      );
      
      setEvaluaciones(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar evaluaciones:', err);
      setError('Error al cargar evaluaciones. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };

  const verificarPorcentajes = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const params = {
        annoEscolarID,
        profesorID
      };
      
      if (materiaID) params.materiaID = materiaID;
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluaciones/verificar-porcentajes`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          params
        }
      );
      
      setPorcentajesLapso(response.data);
    } catch (err) {
      console.error('Error al verificar porcentajes:', err);
    }
  };

  const handleCreateEvaluacion = () => {
    setEditingEvaluacion(null);
    setShowForm(true);
  };

  const handleEditEvaluacion = (evaluacion) => {
    setEditingEvaluacion(evaluacion);
    setShowForm(true);
  };

  const handleDeleteEvaluacion = async (evaluacionID) => {
    if (!confirm('¿Está seguro de eliminar esta evaluación? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/evaluaciones/${evaluacionID}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Actualizar lista de evaluaciones
      fetchEvaluaciones();
      verificarPorcentajes();
    } catch (err) {
      console.error('Error al eliminar evaluación:', err);
      setError('Error al eliminar la evaluación. Por favor, intente nuevamente.');
    }
  };

  const handleDownloadArchivo = async (evaluacionID) => {
    try {
      window.open(`${import.meta.env.VITE_API_URL}/evaluaciones/descargar/${evaluacionID}`, '_blank');
    } catch (err) {
      console.error('Error al descargar archivo:', err);
      setError('Error al descargar el archivo. Por favor, intente nuevamente.');
    }
  };

  const handleCalificarEvaluacion = (evaluacion) => {
    // Navegar a la página de calificaciones para esta evaluación
    window.location.href = `/profesor/calificaciones/evaluacion/${evaluacion.id}`;
  };

  const handleFormSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      
      // Agregar todos los campos del formulario al FormData
      Object.keys(formData).forEach(key => {
        if (key === 'archivo' && formData[key]) {
          data.append('archivo', formData[key]);
        } else if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      
      // Si estamos editando, actualizar la evaluación
      if (editingEvaluacion) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/evaluaciones/${editingEvaluacion.id}`,
          data,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        // Si estamos creando, crear nueva evaluación
        await axios.post(
          `${import.meta.env.VITE_API_URL}/evaluaciones`,
          data,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }
      
      // Actualizar lista de evaluaciones
      fetchEvaluaciones();
      verificarPorcentajes();
      setShowForm(false);
    } catch (err) {
      console.error('Error al guardar evaluación:', err);
      setError('Error al guardar la evaluación. Por favor, intente nuevamente.');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEvaluacion(null);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'No especificada';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getLapsoLabel = (lapso) => {
    switch (lapso) {
      case 1: return 'Primer Lapso';
      case 2: return 'Segundo Lapso';
      case 3: return 'Tercer Lapso';
      default: return `Lapso ${lapso}`;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Evaluaciones</h2>
        <button
          onClick={handleCreateEvaluacion}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
        >
          <FaPlus className="mr-2" /> Nueva Evaluación
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Resumen de porcentajes por lapso */}
      {Object.keys(porcentajesLapso).length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-2">Porcentajes por Lapso</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(porcentajesLapso).map(([lapso, info]) => (
              <div key={lapso} className="bg-white p-4 rounded-md shadow-sm border">
                <h4 className="text-sm font-medium text-gray-900">{getLapsoLabel(parseInt(lapso))}</h4>
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500">Porcentaje asignado</span>
                    <span className={`text-xs font-medium ${
                      info.porcentajeTotal === 100 
                        ? 'text-green-600' 
                        : info.porcentajeTotal > 100 
                          ? 'text-red-600' 
                          : 'text-yellow-600'
                    }`}>
                      {info.porcentajeTotal}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        info.porcentajeTotal === 100 
                          ? 'bg-green-600' 
                          : info.porcentajeTotal > 100 
                            ? 'bg-red-600' 
                            : 'bg-yellow-600'
                      }`} 
                      style={{ width: `${Math.min(info.porcentajeTotal, 100)}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {info.porcentajeTotal === 100 
                      ? 'Porcentaje completo' 
                      : info.porcentajeTotal > 100 
                        ? 'Excede el 100%' 
                        : `Falta ${100 - info.porcentajeTotal}%`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : evaluaciones.length === 0 ? (
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-yellow-700">
            {gradoID || seccionID || materiaID 
              ? 'No hay evaluaciones para los filtros seleccionados.' 
              : 'No ha creado evaluaciones aún.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materia / Grado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo / Lapso
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha / Porcentaje
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {evaluaciones.map((evaluacion) => {
                const fechaEvaluacion = new Date(evaluacion.fecha);
                const hoy = new Date();
                let estado = 'Pendiente';
                let estadoClase = 'bg-yellow-100 text-yellow-800';
                
                if (evaluacion.calificada) {
                  estado = 'Calificada';
                  estadoClase = 'bg-green-100 text-green-800';
                } else if (fechaEvaluacion < hoy) {
                  estado = 'Vencida';
                  estadoClase = 'bg-red-100 text-red-800';
                } else if (fechaEvaluacion > hoy) {
                  estado = 'Próxima';
                  estadoClase = 'bg-blue-100 text-blue-800';
                }
                
                return (
                  <tr key={evaluacion.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{evaluacion.titulo}</div>
                      {evaluacion.descripcion && (
                        <div className="text-xs text-gray-500">{evaluacion.descripcion}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{evaluacion.materia?.asignatura || 'No disponible'}</div>
                      <div className="text-xs text-gray-500">
                        {evaluacion.grado?.nombre_grado || 'No disponible'} - {evaluacion.seccion?.nombre_seccion || 'Todas'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{evaluacion.tipo}</div>
                      <div className="text-xs text-gray-500">{getLapsoLabel(evaluacion.lapso)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatearFecha(evaluacion.fecha)}</div>
                      <div className="text-xs text-gray-500">{evaluacion.porcentaje}% de la nota</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estadoClase}`}>
                        {estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleCalificarEvaluacion(evaluacion)}
                          className="text-green-600 hover:text-green-900"
                          title="Calificar"
                        >
                          <FaClipboardCheck />
                        </button>
                        
                        <button
                          onClick={() => handleEditEvaluacion(evaluacion)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        
                        {evaluacion.url_archivo && (
                          <button
                            onClick={() => handleDownloadArchivo(evaluacion.id)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Descargar archivo"
                          >
                            <FaDownload />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteEvaluacion(evaluacion.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Formulario para crear/editar evaluación */}
      {showForm && (
        <EvaluacionForm
          evaluacion={editingEvaluacion}
          profesorID={profesorID}
          annoEscolarID={annoEscolarID}
          gradoID={gradoID}
          seccionID={seccionID}
          materiaID={materiaID}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
};

export default EvaluacionesList;
