import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaSave, FaCheck, FaTimes } from 'react-icons/fa';
import ProfesorLayout from '../layout/ProfesorLayout';

const CalificacionesForm = () => {
  const { evaluacionId } = useParams();
  const navigate = useNavigate();
  
  const [evaluacion, setEvaluacion] = useState(null);
  const [materia, setMateria] = useState(null);
  const [grado, setGrado] = useState(null);
  const [seccion, setSeccion] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Obtener datos de la evaluación
        const evaluacionResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/evaluaciones/${evaluacionId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setEvaluacion(evaluacionResponse.data);
        
        // Obtener datos de la materia
        const materiaResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/materias/${evaluacionResponse.data.materiaID}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setMateria(materiaResponse.data);
        
        // Obtener datos del grado
        const gradoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/grados/${evaluacionResponse.data.gradoID}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setGrado(gradoResponse.data);
        
        // Obtener datos de la sección
        const seccionResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/secciones/${evaluacionResponse.data.seccionID}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setSeccion(seccionResponse.data);
        
        // Obtener estudiantes del grado y sección
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/estudiantes/grado/${evaluacionResponse.data.gradoID}/seccion/${evaluacionResponse.data.seccionID}`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { annoEscolarID: evaluacionResponse.data.annoEscolarID }
          }
        );
        
        setEstudiantes(estudiantesResponse.data);
        
        // Obtener calificaciones existentes
        const calificacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/calificaciones/evaluacion/${evaluacionId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        // Preparar array de calificaciones para todos los estudiantes
        const calificacionesMap = {};
        calificacionesResponse.data.forEach(cal => {
          calificacionesMap[cal.estudianteID] = cal;
        });
        
        const calificacionesIniciales = estudiantesResponse.data.map(estudiante => {
          const calExistente = calificacionesMap[estudiante.id];
          
          return {
            id: calExistente?.id || null,
            estudianteID: estudiante.id,
            evaluacionID: parseInt(evaluacionId),
            valor: calExistente?.valor || '',
            observaciones: calExistente?.observaciones || '',
            existe: !!calExistente
          };
        });
        
        setCalificaciones(calificacionesIniciales);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [evaluacionId, navigate]);
  
  // Manejar cambio en calificación
  const handleCalificacionChange = (estudianteID, field, value) => {
    setCalificaciones(prevCalificaciones => 
      prevCalificaciones.map(cal => 
        cal.estudianteID === estudianteID 
          ? { ...cal, [field]: value } 
          : cal
      )
    );
  };
  
  // Guardar calificaciones
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar calificaciones
    const calificacionesInvalidas = calificaciones.filter(cal => 
      cal.valor !== '' && (isNaN(parseFloat(cal.valor)) || parseFloat(cal.valor) < 0 || parseFloat(cal.valor) > 20)
    );
    
    if (calificacionesInvalidas.length > 0) {
      setError('Hay calificaciones inválidas. Las calificaciones deben ser números entre 0 y 20.');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      const token = localStorage.getItem('token');
      
      // Filtrar solo calificaciones con valor
      const calificacionesConValor = calificaciones.filter(cal => cal.valor !== '');
      
      // Crear o actualizar calificaciones
      const promises = calificacionesConValor.map(cal => {
        if (cal.existe) {
          // Actualizar calificación existente
          return axios.put(
            `${import.meta.env.VITE_API_URL}/calificaciones/${cal.id}`,
            {
              valor: cal.valor,
              observaciones: cal.observaciones
            },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        } else {
          // Crear nueva calificación
          return axios.post(
            `${import.meta.env.VITE_API_URL}/calificaciones`,
            {
              estudianteID: cal.estudianteID,
              evaluacionID: cal.evaluacionID,
              valor: cal.valor,
              observaciones: cal.observaciones
            },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        }
      });
      
      await Promise.all(promises);
      
      setSuccess('Calificaciones guardadas correctamente');
      
      // Actualizar estado de calificaciones (marcar como existentes)
      setCalificaciones(prevCalificaciones => 
        prevCalificaciones.map(cal => 
          cal.valor !== '' ? { ...cal, existe: true } : cal
        )
      );
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setSaving(false);
    } catch (error) {
      console.error('Error al guardar calificaciones:', error);
      setError(error.response?.data?.message || 'Error al guardar las calificaciones. Por favor, intente nuevamente.');
      setSaving(false);
    }
  };
  
  // Formatear fecha
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'No especificada';
    
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <ProfesorLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </ProfesorLayout>
    );
  }
  
  return (
    <ProfesorLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(`/profesor/evaluaciones/${evaluacionId}`)}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <FaArrowLeft className="mr-2" /> Volver a detalles de evaluación
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        {evaluacion && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* Encabezado */}
            <div className="bg-indigo-600 text-white px-6 py-4">
              <h1 className="text-2xl font-bold">Registrar Calificaciones</h1>
              <p className="text-indigo-100">{evaluacion.nombreEvaluacion} - {evaluacion.tipoEvaluacion}</p>
            </div>
            
            {/* Información de la evaluación */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Materia</h3>
                  <p className="mt-1 text-sm text-gray-900">{materia?.asignatura || 'No disponible'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Grado y Sección</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {grado?.nombre_grado || 'No disponible'} - {seccion?.nombre_seccion || 'No disponible'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha de Evaluación</h3>
                  <p className="mt-1 text-sm text-gray-900">{formatearFecha(evaluacion.fechaEvaluacion)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Porcentaje</h3>
                  <p className="mt-1 text-sm text-gray-900">{evaluacion.porcentaje}%</p>
                </div>
              </div>
            </div>
            
            {/* Formulario de calificaciones */}
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estudiante
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cédula
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Calificación (0-20)
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Observaciones
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {estudiantes.map((estudiante, index) => {
                        const calificacion = calificaciones.find(cal => cal.estudianteID === estudiante.id);
                        
                        if (!calificacion) return null;
                        
                        return (
                          <tr key={estudiante.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {estudiante.nombre} {estudiante.apellido}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {estudiante.cedula}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={calificacion.valor}
                                onChange={(e) => handleCalificacionChange(estudiante.id, 'valor', e.target.value)}
                                className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-20 sm:text-sm border-gray-300 rounded-md ${
                                  calificacion.valor !== '' && 
                                  (isNaN(parseFloat(calificacion.valor)) || 
                                   parseFloat(calificacion.valor) < 0 || 
                                   parseFloat(calificacion.valor) > 20) 
                                    ? 'border-red-300 bg-red-50' 
                                    : ''
                                }`}
                                placeholder="0-20"
                              />
                              {calificacion.valor !== '' && 
                               (isNaN(parseFloat(calificacion.valor)) || 
                                parseFloat(calificacion.valor) < 0 || 
                                parseFloat(calificacion.valor) > 20) && (
                                <p className="mt-1 text-xs text-red-600">
                                  Valor inválido
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="text"
                                value={calificacion.observaciones}
                                onChange={(e) => handleCalificacionChange(estudiante.id, 'observaciones', e.target.value)}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="Opcional"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {calificacion.existe ? (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  <FaCheck className="mr-1" /> Registrada
                                </span>
                              ) : calificacion.valor ? (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  Sin guardar
                                </span>
                              ) : (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  <FaTimes className="mr-1" /> Pendiente
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(`/profesor/evaluaciones/${evaluacionId}`)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                  >
                    {saving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" /> Guardar Calificaciones
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </ProfesorLayout>
  );
};

export default CalificacionesForm;
