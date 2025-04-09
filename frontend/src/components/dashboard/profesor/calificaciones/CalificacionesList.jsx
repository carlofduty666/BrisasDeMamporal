import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaClipboardList, FaCalculator } from 'react-icons/fa';
import CalificacionForm from './CalificacionForm';
import CalificacionesLoteForm from './CalificacionesLoteForm';

const CalificacionesList = ({ profesorID, annoEscolarID, gradoID, seccionID, materiaID }) => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showLoteForm, setShowLoteForm] = useState(false);
  const [editingCalificacion, setEditingCalificacion] = useState(null);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);

  useEffect(() => {
    if (profesorID && annoEscolarID) {
      fetchData();
    }
  }, [profesorID, annoEscolarID, gradoID, seccionID, materiaID]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Construir parámetros de consulta
      const params = { annoEscolarID };
      if (gradoID) params.gradoID = gradoID;
      if (seccionID) params.seccionID = seccionID;
      if (materiaID) params.materiaID = materiaID;
      
      // Obtener evaluaciones del profesor
      const evaluacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesorID}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          params
        }
      );
      
      setEvaluaciones(evaluacionesResponse.data);
      
      // Obtener calificaciones
      let calificacionesData = [];
      
      if (gradoID && seccionID) {
        // Si tenemos grado y sección, obtenemos calificaciones por grado/sección
        const calificacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/calificaciones/grado/${gradoID}/seccion/${seccionID}`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            params: {
              ...params,
              profesorID
            }
          }
        );
        
        calificacionesData = calificacionesResponse.data;
      } else if (materiaID) {
        // Si solo tenemos materia, obtenemos calificaciones por materia
        const calificacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/calificaciones/materia/${materiaID}`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            params
          }
        );
        
        calificacionesData = calificacionesResponse.data;
      }
      
      setCalificaciones(calificacionesData);
      
      // Obtener estudiantes si tenemos grado y sección
      if (gradoID && seccionID) {
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/estudiantes/grado/${gradoID}/seccion/${seccionID}`,
          {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { annoEscolarID }
          }
        );
        
        setEstudiantes(estudiantesResponse.data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar datos. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };

  const handleCreateCalificacion = () => {
    setEditingCalificacion(null);
    setShowForm(true);
  };

  const handleEditCalificacion = (calificacion) => {
    setEditingCalificacion(calificacion);
    setShowForm(true);
  };

  const handleDeleteCalificacion = async (calificacionID) => {
    if (!confirm('¿Está seguro de eliminar esta calificación? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/calificaciones/${calificacionID}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Actualizar lista de calificaciones
      fetchData();
    } catch (err) {
      console.error('Error al eliminar calificación:', err);
      setError('Error al eliminar la calificación. Por favor, intente nuevamente.');
    }
  };

  const handleCalificarEvaluacion = (evaluacion) => {
    setSelectedEvaluacion(evaluacion);
    setShowLoteForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      
      // Si estamos editando, actualizar la calificación
      if (editingCalificacion) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/calificaciones/${editingCalificacion.id}`,
          formData,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
      } else {
        // Si estamos creando, crear nueva calificación
        await axios.post(
          `${import.meta.env.VITE_API_URL}/calificaciones`,
          formData,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
      }
      
      // Actualizar lista de calificaciones
      fetchData();
      setShowForm(false);
    } catch (err) {
      console.error('Error al guardar calificación:', err);
      setError('Error al guardar la calificación. Por favor, intente nuevamente.');
    }
  };

  const handleLoteFormSubmit = async (calificacionesLote) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/calificaciones/lote`,
        {
          calificaciones: calificacionesLote,
          evaluacionID: selectedEvaluacion.id
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      // Actualizar lista de calificaciones
      fetchData();
      setShowLoteForm(false);
    } catch (err) {
      console.error('Error al guardar calificaciones en lote:', err);
      setError('Error al guardar las calificaciones. Por favor, intente nuevamente.');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCalificacion(null);
  };

  const handleLoteFormCancel = () => {
    setShowLoteForm(false);
    setSelectedEvaluacion(null);
  };

  const handleCalcularNotasDefinitivas = async () => {
    if (!gradoID || !seccionID || !materiaID) {
      setError('Debe seleccionar un grado, sección y materia para calcular notas definitivas.');
      return;
    }
    
    if (!confirm('¿Está seguro de calcular las notas definitivas? Esto procesará todas las calificaciones registradas.')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/notas/definitivas/calcular`,
        {
          gradoID,
          seccionID,
          materiaID,
          annoEscolarID
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      alert('Notas definitivas calculadas correctamente.');
      fetchData();
    } catch (err) {
      console.error('Error al calcular notas definitivas:', err);
      setError('Error al calcular notas definitivas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
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

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Calificaciones</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleCreateCalificacion}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
            disabled={!gradoID || !seccionID || !materiaID}
          >
            <FaPlus className="mr-2" /> Nueva Calificación
          </button>
          
          <button
            onClick={handleCalcularNotasDefinitivas}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            disabled={!gradoID || !seccionID || !materiaID || loading}
          >
            <FaCalculator className="mr-2" /> Calcular Notas Definitivas
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {!gradoID || !seccionID || !materiaID ? (
        <div className="bg-yellow-50 p-4 rounded-md">
          <p className="text-yellow-700">
            Seleccione un grado, sección y materia para ver y gestionar calificaciones.
          </p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Sección de Evaluaciones */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Evaluaciones Disponibles</h3>
            
            {evaluaciones.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-yellow-700">
                  No hay evaluaciones disponibles para los filtros seleccionados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {evaluaciones.map((evaluacion) => {
                  const calificacionesEvaluacion = calificaciones.filter(c => c.evaluacionID === evaluacion.id);
                  const porcentajeCompletado = estudiantes.length > 0 
                    ? (calificacionesEvaluacion.length / estudiantes.length) * 100 
                    : 0;
                  
                  return (
                    <div key={evaluacion.id} className="border rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50">
                        <div className="flex justify-between items-start">
                          <h4 className="text-md font-medium text-gray-900">{evaluacion.titulo}</h4>
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            evaluacion.calificada ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {evaluacion.calificada ? 'Calificada' : 'Pendiente'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{evaluacion.tipo} - {formatearFecha(evaluacion.fecha)}</p>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-500">Progreso de calificación</span>
                          <span className="text-xs font-medium text-gray-500">{Math.round(porcentajeCompletado)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              porcentajeCompletado === 100 ? 'bg-green-600' : 'bg-blue-600'
                            }`} 
                            style={{ width: `${porcentajeCompletado}%` }}
                          ></div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => handleCalificarEvaluacion(evaluacion)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <FaClipboardList className="mr-1" /> Calificar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Sección de Calificaciones */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Calificaciones Registradas</h3>
            
            {calificaciones.length === 0 ? (
              <div className="bg-yellow-50 p-4 rounded-md">
                <p className="text-yellow-700">
                  No hay calificaciones registradas para los filtros seleccionados.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estudiante
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evaluación
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calificación
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {calificaciones.map((calificacion) => {
                      const evaluacion = evaluaciones.find(e => e.id === calificacion.evaluacionID);
                      
                      return (
                        <tr key={calificacion.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {calificacion.estudiante?.nombre} {calificacion.estudiante?.apellido}
                            </div>
                            <div className="text-xs text-gray-500">
                              {calificacion.estudiante?.cedula}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {evaluacion?.titulo || 'No disponible'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {evaluacion?.tipo || 'No disponible'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-medium ${
                              parseFloat(calificacion.valor) >= 10 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {calificacion.valor}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatearFecha(calificacion.fecha || calificacion.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditCalificacion(calificacion)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Editar"
                              >
                                <FaEdit />
                              </button>
                              
                              <button
                                onClick={() => handleDeleteCalificacion(calificacion.id)}
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
          </div>
        </>
      )}
      
      {/* Formulario para crear/editar calificación */}
      {showForm && (
        <CalificacionForm
          calificacion={editingCalificacion}
          profesorID={profesorID}
          annoEscolarID={annoEscolarID}
          gradoID={gradoID}
          seccionID={seccionID}
          materiaID={materiaID}
          evaluaciones={evaluaciones}
          estudiantes={estudiantes}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
      
      {/* Formulario para calificar en lote */}
      {showLoteForm && selectedEvaluacion && (
        <CalificacionesLoteForm
          evaluacion={selectedEvaluacion}
          estudiantes={estudiantes}
          calificacionesExistentes={calificaciones.filter(c => c.evaluacionID === selectedEvaluacion.id)}
          onSubmit={handleLoteFormSubmit}
          onCancel={handleLoteFormCancel}
        />
      )}
    </div>
  );
};

export default CalificacionesList;
