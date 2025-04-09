import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaEdit, FaDownload, FaTrash, FaGraduationCap, FaBook, FaCalendarAlt, FaPercentage, FaClipboardList } from 'react-icons/fa';
import ProfesorLayout from '../layout/ProfesorLayout';

const EvaluacionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [evaluacion, setEvaluacion] = useState(null);
  const [materia, setMateria] = useState(null);
  const [grado, setGrado] = useState(null);
  const [seccion, setSeccion] = useState(null);
  const [calificaciones, setCalificaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Cargar datos de la evaluación
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
          `${import.meta.env.VITE_API_URL}/evaluaciones/${id}`,
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
        
        // Obtener calificaciones de la evaluación
        const calificacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/calificaciones/evaluacion/${id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setCalificaciones(calificacionesResponse.data);
        
        // Obtener estudiantes del grado y sección
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/estudiantes/grado/${evaluacionResponse.data.gradoID}/seccion/${evaluacionResponse.data.seccionID}`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { annoEscolarID: evaluacionResponse.data.annoEscolarID }
          }
        );
        
        setEstudiantes(estudiantesResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);
  
  // Eliminar evaluación
  const handleDeleteEvaluacion = async () => {
    if (!confirm('¿Está seguro de eliminar esta evaluación? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/evaluaciones/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccess('Evaluación eliminada correctamente');
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/profesor/evaluaciones');
      }, 2000);
      
    } catch (error) {
      console.error('Error al eliminar evaluación:', error);
      setError(error.response?.data?.message || 'Error al eliminar la evaluación. Por favor, intente nuevamente.');
      setLoading(false);
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
  
  // Calcular estadísticas de calificaciones
  const calcularEstadisticas = () => {
    if (calificaciones.length === 0) {
      return {
        promedio: 0,
        aprobados: 0,
        reprobados: 0,
        porcentajeAprobados: 0,
        porcentajeReprobados: 0,
        calificacionMaxima: 0,
        calificacionMinima: 0
      };
    }
    
    const valores = calificaciones.map(cal => parseFloat(cal.valor));
    const suma = valores.reduce((acc, val) => acc + val, 0);
    const promedio = suma / valores.length;
    
    const aprobados = valores.filter(val => val >= 10).length;
    const reprobados = valores.filter(val => val < 10).length;
    
    const porcentajeAprobados = (aprobados / valores.length) * 100;
    const porcentajeReprobados = (reprobados / valores.length) * 100;
    
    const calificacionMaxima = Math.max(...valores);
    const calificacionMinima = Math.min(...valores);
    
    return {
      promedio: promedio.toFixed(2),
      aprobados,
      reprobados,
      porcentajeAprobados: porcentajeAprobados.toFixed(2),
      porcentajeReprobados: porcentajeReprobados.toFixed(2),
      calificacionMaxima,
      calificacionMinima
    };
  };
  
  const estadisticas = calcularEstadisticas();
  
  if (loading && !evaluacion) {
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
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/profesor/evaluaciones')}
            className="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <FaArrowLeft className="mr-2" /> Volver a evaluaciones
          </button>
          
          {evaluacion && (
            <div className="flex space-x-2">
              <Link
                to={`/profesor/evaluaciones/${id}/editar`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <FaEdit className="mr-2" /> Editar
              </Link>
              <button
                onClick={handleDeleteEvaluacion}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <FaTrash className="mr-2" /> Eliminar
              </button>
            </div>
          )}
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
              <h1 className="text-2xl font-bold">{evaluacion.nombreEvaluacion}</h1>
              <p className="text-indigo-100">{evaluacion.tipoEvaluacion}</p>
            </div>
            
            {/* Información principal */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Detalles de la Evaluación</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <FaBook className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Materia</h3>
                        <p className="mt-1 text-sm text-gray-900">{materia?.asignatura || 'No disponible'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaGraduationCap className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Grado y Sección</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {grado?.nombre_grado || 'No disponible'} - {seccion?.nombre_seccion || 'No disponible'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaCalendarAlt className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Fecha de Evaluación</h3>
                        <p className="mt-1 text-sm text-gray-900">{formatearFecha(evaluacion.fechaEvaluacion)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaPercentage className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Porcentaje</h3>
                        <p className="mt-1 text-sm text-gray-900">{evaluacion.porcentaje}%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaClipboardList className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Lapso</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {evaluacion.lapso === 1 ? 'Primer Lapso' : 
                           evaluacion.lapso === 2 ? 'Segundo Lapso' : 
                           evaluacion.lapso === 3 ? 'Tercer Lapso' : 
                           `Lapso ${evaluacion.lapso}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {evaluacion.descripcion && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Descripción</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-900 whitespace-pre-line">{evaluacion.descripcion}</p>
                      </div>
                    </div>
                  )}
                  
                  {evaluacion.archivoURL && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Archivo Adjunto</h3>
                      <div className="bg-gray-50 p-4 rounded-md flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{evaluacion.nombreArchivo || 'Archivo adjunto'}</p>
                          <p className="text-xs text-gray-500">
                            {evaluacion.tipoArchivo?.includes('pdf') ? 'Documento PDF' : 
                             evaluacion.tipoArchivo?.includes('image') ? 'Imagen' : 
                             evaluacion.tipoArchivo?.includes('word') ? 'Documento Word' : 
                             evaluacion.tipoArchivo?.includes('excel') ? 'Hoja de cálculo Excel' : 
                             'Archivo'}
                          </p>
                        </div>
                        <a
                          href={`${import.meta.env.VITE_API_URL}${evaluacion.archivoURL}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                          <FaDownload className="mr-1" /> Descargar
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {evaluacion.requiereEntrega && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Entrega de Trabajo</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-900">
                          Esta evaluación requiere entrega de trabajo por parte de los estudiantes.
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          Fecha límite: {formatearFecha(evaluacion.fechaLimiteEntrega)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Estadísticas</h2>
                  
                  {calificaciones.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-indigo-50 p-4 rounded-md">
                          <h3 className="text-sm font-medium text-indigo-800">Promedio</h3>
                          <p className="mt-1 text-2xl font-bold text-indigo-600">{estadisticas.promedio}</p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-md">
                          <h3 className="text-sm font-medium text-green-800">Calificación Máxima</h3>
                          <p className="mt-1 text-2xl font-bold text-green-600">{estadisticas.calificacionMaxima}</p>
                        </div>
                        
                        <div className="bg-red-50 p-4 rounded-md">
                          <h3 className="text-sm font-medium text-red-800">Calificación Mínima</h3>
                          <p className="mt-1 text-2xl font-bold text-red-600">{estadisticas.calificacionMinima}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h3 className="text-sm font-medium text-gray-800">Evaluados</h3>
                          <p className="mt-1 text-2xl font-bold text-gray-600">
                            {calificaciones.length} / {estudiantes.length}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Aprobados vs. Reprobados</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium text-green-700">Aprobados: {estadisticas.aprobados} ({estadisticas.porcentajeAprobados}%)</span>
                            <span className="text-xs font-medium text-red-700">Reprobados: {estadisticas.reprobados} ({estadisticas.porcentajeReprobados}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: `${estadisticas.porcentajeAprobados}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Distribución de Calificaciones</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="space-y-2">
                            {[
                              { rango: '19-20', color: 'bg-green-600' },
                              { rango: '16-18', color: 'bg-green-500' },
                              { rango: '13-15', color: 'bg-green-400' },
                              { rango: '10-12', color: 'bg-yellow-400' },
                              { rango: '7-9', color: 'bg-red-400' },
                              { rango: '1-6', color: 'bg-red-600' }
                            ].map(item => {
                              const count = calificaciones.filter(cal => {
                                const valor = parseFloat(cal.valor);
                                const [min, max] = item.rango.split('-').map(Number);
                                return valor >= min && valor <= max;
                              }).length;
                              
                              const porcentaje = (count / calificaciones.length) * 100;
                              
                              return (
                                <div key={item.rango}>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-700">{item.rango}</span>
                                    <span className="text-xs font-medium text-gray-700">{count} ({porcentaje.toFixed(1)}%)</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`${item.color} h-2 rounded-full`} 
                                      style={{ width: `${porcentaje}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded-md">
                      <p className="text-yellow-700">
                        No hay calificaciones registradas para esta evaluación.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Lista de calificaciones */}
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Calificaciones</h2>
                
                {calificaciones.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estudiante
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Calificación
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha de Registro
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Observaciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {calificaciones.map((calificacion) => {
                          const estudiante = estudiantes.find(est => est.id === calificacion.estudianteID);
                          
                          return (
                            <tr key={calificacion.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {estudiante ? `${estudiante.nombre} ${estudiante.apellido}` : `Estudiante ID: ${calificacion.estudianteID}`}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  parseFloat(calificacion.valor) >= 10 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {calificacion.valor}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatearFecha(calificacion.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {calificacion.observaciones || 'Sin observaciones'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700">
                      No hay calificaciones registradas para esta evaluación.
                    </p>
                    <div className="mt-4">
                    <Link
                        to={`/profesor/calificaciones/evaluacion/${id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Registrar Calificaciones
                      </Link>
                    </div>
                  </div>
                )}
                
                {calificaciones.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Link
                      to={`/profesor/calificaciones/evaluacion/${id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Gestionar Calificaciones
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Estudiantes sin calificar */}
              {calificaciones.length > 0 && calificaciones.length < estudiantes.length && (
                <div className="mt-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Estudiantes sin Calificar</h2>
                  
                  <div className="bg-yellow-50 p-4 rounded-md">
                    <p className="text-yellow-700 mb-2">
                      Hay {estudiantes.length - calificaciones.length} estudiantes sin calificación en esta evaluación.
                    </p>
                    
                    <div className="mt-2 overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Estudiante
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cédula
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {estudiantes
                            .filter(est => !calificaciones.some(cal => cal.estudianteID === est.id))
                            .map((estudiante) => (
                              <tr key={estudiante.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {estudiante.nombre} {estudiante.apellido}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {estudiante.cedula}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProfesorLayout>
  );
};

export default EvaluacionDetail;