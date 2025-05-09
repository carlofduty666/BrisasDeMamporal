import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaBook, FaGraduationCap, FaClipboardList } from 'react-icons/fa';

const EstudianteProgresoModal = ({ isOpen, onClose, estudianteID }) => {
  const [activeTab, setActiveTab] = useState('materias');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [estudiante, setEstudiante] = useState(null);
  const [profesores, setProfesores] = useState([]);
  const [grado, setGrado] = useState(null);
  const [seccion, setSeccion] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [annoEscolar, setAnnoEscolar] = useState(null);

  useEffect(() => {
    if (isOpen && estudianteID) {
      fetchEstudianteData();
    }
  }, [isOpen, estudianteID]);

  const fetchEstudianteData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No se encontró token de autenticación');
        setLoading(false);
        return;
      }
      
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      // Obtener datos del estudiante
      const estudianteResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/personas/${estudianteID}`,
        config
      );
      
      setEstudiante(estudianteResponse.data);
      
      // Obtener año escolar activo
      const annoResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
        config
      );
      
      setAnnoEscolar(annoResponse.data);
      
      // Obtener información académica del estudiante
      let gradoData = null;
      try {
        // Obtener el grado del estudiante directamente
        const gradoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/grados/estudiante/${estudianteID}`,
          {
            ...config,
            params: { annoEscolarID: annoResponse.data.id }
          }
        );
        
        if (gradoResponse.data && gradoResponse.data.length > 0) {
          // Tomamos el primer grado (asumiendo que un estudiante está en un solo grado por año escolar)
          gradoData = gradoResponse.data[0];
          setGrado(gradoData);
          
          // Obtener materias del estudiante inmediatamente después de tener el grado
          try {
            const materiasResponse = await axios.get(
              `${import.meta.env.VITE_API_URL}/grados/${gradoData.id}/materias`,
              {
                ...config,
                params: { annoEscolarID: annoResponse.data.id }
              }
            );
            setMaterias(materiasResponse.data);
          } catch (materiasError) {
            console.error('Error al obtener materias:', materiasError);
            setMaterias([]);
          }
          
          // Obtener información de la sección usando la ruta directa de secciones
          try {
            const seccionResponse = await axios.get(
              `${import.meta.env.VITE_API_URL}/secciones/estudiante/${estudianteID}`,
              {
                ...config,
                params: { annoEscolarID: annoResponse.data.id }
              }
            );
            
            if (seccionResponse.data && seccionResponse.data.length > 0) {
              setSeccion(seccionResponse.data[0]);
            }
          } catch (seccionError) {
            console.error('Error al obtener sección:', seccionError);
          }
        }
      } catch (gradoError) {
        console.error('Error al obtener grado:', gradoError);
      }
      
      // Obtener evaluaciones del estudiante
      try {
        const evaluacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/evaluaciones/estudiante/${estudianteID}`,
          {
            ...config,
            params: { annoEscolarID: annoResponse.data?.id }
          }
        );
        setEvaluaciones(evaluacionesResponse.data);
      } catch (evaluacionesError) {
        console.error('Error al obtener evaluaciones:', evaluacionesError);
        setEvaluaciones([]);
      }
      
      // Obtener calificaciones del estudiante - Enfoque directo sin resumen
      try {
        const annoEscolarId = annoResponse.data.id;
        
        // Primero intentamos obtener calificaciones directamente del estudiante
        const calificacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/calificaciones/estudiante/${estudianteID}`,
          {
            ...config,
            params: { annoEscolarID: annoEscolarId }
          }
        );
        
        console.log("Respuesta de calificaciones (directa):", calificacionesResponse.data);
        
        if (Array.isArray(calificacionesResponse.data) && calificacionesResponse.data.length > 0) {
          // Si encontramos calificaciones directamente, las usamos
          setCalificaciones(calificacionesResponse.data);
        } else if (materias && materias.length > 0) {
          // Si no hay calificaciones directas pero hay materias, intentamos por materia
          console.log("Obteniendo calificaciones por materias:", materias);
          
          // Array para almacenar todas las calificaciones encontradas
          let todasLasCalificaciones = [];
          
          // Para cada materia, intentamos obtener sus calificaciones
          for (const materia of materias) {
            try {
              const materiaCalificacionesResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/calificaciones/materia/${materia.id}`,
                {
                  ...config,
                  params: {
                    estudianteID: estudianteID,
                    annoEscolarID: annoEscolarId
                  }
                }
              );
              
              console.log(`Calificaciones para materia ${materia.asignatura}:`, 
                          materiaCalificacionesResponse.data);
              
              if (materiaCalificacionesResponse.data &&
                  Array.isArray(materiaCalificacionesResponse.data) &&
                  materiaCalificacionesResponse.data.length > 0) {
                
                // Añadimos información de la materia a cada calificación
                const calificacionesConMateria = materiaCalificacionesResponse.data.map(cal => ({
                  ...cal,
                  materiaID: materia.id,
                  nombreMateria: materia.asignatura
                }));
                
                todasLasCalificaciones = [...todasLasCalificaciones, ...calificacionesConMateria];
              }
            } catch (error) {
              console.error(`Error al obtener calificaciones para materia ${materia.id}:`, error);
            }
          }
          
          // Si encontramos calificaciones por materias, las usamos
          if (todasLasCalificaciones.length > 0) {
            console.log("Calificaciones encontradas por materias:", todasLasCalificaciones);
            setCalificaciones(todasLasCalificaciones);
          } else {
            // Si no hay calificaciones en ninguna parte, usamos un array vacío
            setCalificaciones([]);
          }
        } else {
          // Si no hay materias ni calificaciones directas, usamos un array vacío
          setCalificaciones([]);
        }
      } catch (calificacionesError) {
        console.error('Error al obtener calificaciones:', calificacionesError);
        
        // Si falla la obtención directa, intentamos por materias si están disponibles
        if (materias && materias.length > 0) {
          try {
            const annoEscolarId = annoResponse.data.id;
            let todasLasCalificaciones = [];
            
            for (const materia of materias) {
              try {
                const materiaCalificacionesResponse = await axios.get(
                  `${import.meta.env.VITE_API_URL}/calificaciones/materia/${materia.id}`,
                  {
                    ...config,
                    params: {
                      estudianteID: estudianteID,
                      annoEscolarID: annoEscolarId
                    }
                  }
                );
                
                if (materiaCalificacionesResponse.data &&
                    Array.isArray(materiaCalificacionesResponse.data) &&
                    materiaCalificacionesResponse.data.length > 0) {
                  
                  const calificacionesConMateria = materiaCalificacionesResponse.data.map(cal => ({
                    ...cal,
                    materiaID: materia.id,
                    nombreMateria: materia.asignatura
                  }));
                  
                  todasLasCalificaciones = [...todasLasCalificaciones, ...calificacionesConMateria];
                }
              } catch (error) {
                console.error(`Error al obtener calificaciones para materia ${materia.id}:`, error);
              }
            }
            
            if (todasLasCalificaciones.length > 0) {
              setCalificaciones(todasLasCalificaciones);
            } else {
              setCalificaciones([]);
            }
          } catch (error) {
            console.error('Error al obtener calificaciones por materias:', error);
            setCalificaciones([]);
          }
        } else {
          setCalificaciones([]);
        }
      }
      
      // Obtener lista de profesores
      try {
        const profesoresResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/tipo/profesor`,
          config
        );
        setProfesores(profesoresResponse.data);
      } catch (profesoresError) {
        console.error('Error al obtener profesores:', profesoresError);
        setProfesores([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos del estudiante:', error);
      setError('Error al cargar los datos del estudiante. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };

  // Función para calcular el progreso por materia
  const calcularProgresoMateria = (materiaId) => {
    // Verificar si estamos trabajando con el formato de resumen o el tradicional
    if (calificaciones.length > 0 && calificaciones[0].hasOwnProperty('asignatura')) {
      // Formato de resumen
      const materia = calificaciones.find(mat => mat.id === materiaId);
      
      if (!materia) {
        return {
          promedio: 0,
          porcentajeCompletado: 0,
          calificaciones: []
        };
      }
      
      // Calcular promedio basado en notas de lapsos o definitiva
      let promedio = 0;
      let totalLapsos = 0;
      
      if (materia.lapsos) {
        Object.keys(materia.lapsos).forEach(lapso => {
          if (materia.lapsos[lapso] && materia.lapsos[lapso].nota) {
            promedio += parseFloat(materia.lapsos[lapso].nota);
            totalLapsos++;
          }
        });
        
        promedio = totalLapsos > 0 ? promedio / totalLapsos : 0;
      } else if (materia.definitiva) {
        promedio = parseFloat(materia.definitiva);
      }
      
      // Calcular porcentaje completado (basado en lapsos evaluados)
      const porcentajeCompletado = totalLapsos > 0 ? (totalLapsos / 3) * 100 : 0;
      
      return {
        promedio: promedio.toFixed(2),
        porcentajeCompletado: Math.round(porcentajeCompletado),
        calificaciones: materia.lapsos ? Object.keys(materia.lapsos).map(lapso => ({
          lapso,
          valor: materia.lapsos[lapso].nota,
          porcentajeEvaluado: materia.lapsos[lapso].porcentajeEvaluado
        })) : []
      };
    } else {
      // Formato tradicional
      const calificacionesMateria = calificaciones.filter(cal => 
        (cal.Evaluacion && cal.Evaluacion.materiaID === materiaId) || cal.materiaID === materiaId
      );
      
      if (calificacionesMateria.length === 0) {
        return {
          promedio: 0,
          porcentajeCompletado: 0,
          calificaciones: []
        };
      }
      
      const suma = calificacionesMateria.reduce((acc, cal) => acc + parseFloat(cal.calificacion || cal.valor || 0), 0);
      const promedio = suma / calificacionesMateria.length;
      
      // Calcular porcentaje de evaluaciones completadas
      const evaluacionesMateria = evaluaciones.filter(ev => ev.materiaID === materiaId);
      const porcentajeCompletado = evaluacionesMateria.length > 0 
        ? (calificacionesMateria.length / evaluacionesMateria.length) * 100 
        : 0;
      
      return {
        promedio: promedio.toFixed(2),
        porcentajeCompletado: Math.round(porcentajeCompletado),
        calificaciones: calificacionesMateria
      };
    }
  };

  // Función para formatear fechas
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'No disponible';
    
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return 'Fecha inválida';
    
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        {/* Encabezado del modal */}
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {loading ? 'Cargando información académica...' : 
             estudiante ? `Progreso Académico de ${estudiante.nombre} ${estudiante.apellido}` : 
             'Información Académica'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Contenido principal */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-700">
            {error}
          </div>
        ) : (
          <>
            {/* Información básica */}
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Año Escolar</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {annoEscolar ? annoEscolar.periodo : 'No disponible'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Grado</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {grado ? grado.nombre_grado : 'No asignado'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Sección</h3>
                  <p className="mt-1 text-sm text-gray-900">
                    {seccion ? seccion.nombre_seccion : 'No asignada'}
                  </p>
                </div>
              </div>
            </div>

            {/* Pestañas de navegación */}
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('materias')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'materias'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaBook className="mr-2" /> Materias y Progreso
                </button>
                <button
                  onClick={() => setActiveTab('calificaciones')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'calificaciones'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaGraduationCap className="mr-2" /> Calificaciones
                </button>
                <button
                  onClick={() => setActiveTab('evaluaciones')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center ${
                    activeTab === 'evaluaciones'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FaClipboardList className="mr-2" /> Evaluaciones
                </button>
              </nav>
            </div>

            {/* Contenido de las pestañas */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Materias y progreso */}
              {activeTab === 'materias' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Materias y Progreso Académico</h2>
                  
                  {materias.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      {materias.map(materia => {
                        const progreso = calcularProgresoMateria(materia.id);
                        
                        return (
                          <div key={materia.id} className="bg-gray-50 p-4 rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{materia.asignatura}</h3>
                                <p className="text-sm text-gray-500 mt-1">{materia.descripcion || 'Sin descripción'}</p>
                              </div>
                              
                              <div className="text-right">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Promedio: {progreso.promedio}
                                </span>
                              </div>
                            </div>
                            
                            {/* Barra de progreso */}
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-500">Progreso del curso</span>
                                <span className="text-xs font-medium text-gray-500">{progreso.porcentajeCompletado}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full" 
                                  style={{ width: `${progreso.porcentajeCompletado}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Calificaciones de la materia */}
                            {progreso.calificaciones.length > 0 ? (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Calificaciones</h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Evaluación
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Tipo
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Fecha
                                        </th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Calificación
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {progreso.calificaciones.map(calificacion => {
                                        const evaluacion = evaluaciones.find(ev => ev.id === calificacion.evaluacionID);
                                        
                                        return (
                                          <tr key={calificacion.id}>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                              {evaluacion ? evaluacion.titulo : 'No disponible'}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                              {evaluacion ? evaluacion.tipo : 'No disponible'}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                              {calificacion.fecha ? formatearFecha(calificacion.fecha) : 'No disponible'}
                                            </td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                parseFloat(calificacion.valor) >= 10 
                                                  ? 'bg-green-100 text-green-800' 
                                                  : 'bg-red-100 text-red-800'
                                              }`}>
                                                {calificacion.valor}
                                              </span>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-4 text-sm text-gray-500">
                                No hay calificaciones registradas para esta materia.
                              </div>
                            )}
                            
                            {/* Próximas evaluaciones */}
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Próximas Evaluaciones</h4>
                              {evaluaciones.filter(ev => 
                                ev.materiaID === materia.id && 
                                new Date(ev.fecha) > new Date() && 
                                !progreso.calificaciones.some(cal => cal.evaluacionID === ev.id)
                              ).length > 0 ? (
                                <ul className="space-y-2">
                                  {evaluaciones
                                    .filter(ev => 
                                      ev.materiaID === materia.id && 
                                      new Date(ev.fecha) > new Date() && 
                                      !progreso.calificaciones.some(cal => cal.evaluacionID === ev.id)
                                    )
                                    .map(ev => (
                                      <li key={ev.id} className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                                        <div>
                                          <span className="font-medium text-sm">{ev.titulo}</span>
                                          <p className="text-xs text-gray-500">{ev.tipo}</p>
                                        </div>
                                        <span className="text-xs text-gray-500">{formatearFecha(ev.fecha)}</span>
                                      </li>
                                    ))
                                  }
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500">No hay evaluaciones pendientes.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 p-4 rounded-md">
                      <p className="text-yellow-700">No hay materias asignadas para este estudiante.</p>
                    </div>
                  )}
                </div>
              )}
              
            {/* Calificaciones */}
            {activeTab === 'calificaciones' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Calificaciones</h2>
                
                {calificaciones && calificaciones.length > 0 ? (
                  <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Materia
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {calificaciones[0] && calificaciones[0].hasOwnProperty('asignatura') ? 'Lapso' : 'Evaluación'}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Calificación
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {calificaciones[0] && calificaciones[0].hasOwnProperty('asignatura') ? 'Progreso' : 'Tipo'}
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {calificaciones[0] && calificaciones[0].hasOwnProperty('asignatura') ? (
                          // Formato de resumen
                          calificaciones.flatMap(materia => {
                            if (!materia.lapsos) return [];
                            
                            return Object.keys(materia.lapsos).map(lapso => (
                              <tr key={`${materia.id}-${lapso}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {materia.asignatura}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    Lapso {lapso}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className={`text-sm font-medium ${
                                    parseFloat(materia.lapsos[lapso].nota) >= 10 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {materia.lapsos[lapso].nota}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">
                                    {materia.lapsos[lapso].porcentajeEvaluado ? `${materia.lapsos[lapso].porcentajeEvaluado}% evaluado` : 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">
                                    {materia.lapsos[lapso].fecha ? formatearFecha(materia.lapsos[lapso].fecha) : 'N/A'}
                                  </div>
                                </td>
                              </tr>
                            ));
                          })
                        ) : (
                          // Formato tradicional
                          calificaciones.map((calificacion, index) => {
                            const evaluacion = evaluaciones.find(ev => ev.id === calificacion.evaluacionID);
                            var materia = materias.find(m => m.id === (evaluacion?.materiaID || calificacion.materiaID));
                            
                            return (
                              <tr key={calificacion.id || `cal-${index}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {materia?.asignatura || calificacion.nombreMateria || 'No disponible'}
                                </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">
                                    {evaluacion ? (evaluacion.tipoEvaluacion || evaluacion.tipo || 'No especificado') : 
                                    calificacion.tipoEvaluacion || calificacion.tipo || 'No especificado'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className={`text-sm font-medium ${
                                    parseFloat(calificacion.calificacion || calificacion.valor || 0) >= 10 ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {calificacion.calificacion || calificacion.valor || 'N/A'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">
                                    {evaluacion ? (evaluacion.tipoEvaluacion || evaluacion.tipo || 'No especificado') : 
                                    calificacion.tipoEvaluacion || calificacion.tipo || 'No especificado'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">
                                    {calificacion.fecha || calificacion.fechaRegistro || calificacion.createdAt 
                                      ? formatearFecha(calificacion.fecha || calificacion.fechaRegistro || calificacion.createdAt)
                                      : 'N/A'}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-md">
                    {materias && materias.length > 0 ? (
                      <div>
                        <p className="text-gray-500 mb-2">No hay calificaciones registradas para este estudiante.</p>
                        <p className="text-gray-500">El estudiante está inscrito en {materias.length} materia(s), pero aún no tiene evaluaciones calificadas.</p>
                        <div className="mt-4">
                          <h3 className="text-md font-medium text-gray-700 mb-2">Materias del grado {grado?.nombre_grado}:</h3>
                          <ul className="list-disc pl-5">
                            {materias.map(materia => (
                              <li key={materia.id} className="text-gray-600">{materia.asignatura}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : grado ? (
                      <div>
                        <p className="text-gray-500 mb-2">No hay calificaciones ni materias registradas para este estudiante.</p>
                        <p className="text-gray-500">El estudiante está asignado al grado {grado.nombre_grado}, pero no tiene materias asignadas.</p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No hay calificaciones ni información académica registrada para este estudiante.</p>
                    )}
                  </div>
                )}
              </div>
            )}


  
              {/* Evaluaciones */}
              {activeTab === 'evaluaciones' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Evaluaciones</h2>
                  
                  {evaluaciones.length > 0 ? (
                    <div className="bg-gray-50 p-4 rounded-md overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Materia
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Título
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Profesor
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tipo
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Lapso
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Porcentaje
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Estado
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {evaluaciones.map(evaluacion => {
                          const materia = materias.find(m => m.id === evaluacion.materiaID);
                          const calificacion = calificaciones.find(c => c.evaluacionID === evaluacion.id);
                          const fechaEvaluacion = new Date(evaluacion.fechaEvaluacion || evaluacion.fecha);
                          const hoy = new Date();

                          // Buscar información del profesor
                          const profesor = profesores.find(p => p.id === evaluacion.profesorID);

                          let estado = 'Pendiente';
                          let estadoClase = 'bg-yellow-100 text-yellow-800';

                          if (calificacion) {
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
                                <div className="text-sm font-medium text-gray-900">
                                  {materia?.asignatura || 'No disponible'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {evaluacion.nombreEvaluacion || evaluacion.titulo}
                                </div>
                                {evaluacion.descripcion && (
                                  <div className="text-xs text-gray-500">
                                    {evaluacion.descripcion}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {profesor ? `${profesor.nombre} ${profesor.apellido}` : 'No asignado'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {evaluacion.tipoEvaluacion || evaluacion.tipo}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {evaluacion.lapso || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {evaluacion.porcentaje ? `${evaluacion.porcentaje}%` : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {formatearFecha(evaluacion.fechaEvaluacion || evaluacion.fecha)}
                                </div>
                                {evaluacion.requiereEntrega && evaluacion.fechaLimiteEntrega && (
                                  <div className="text-xs text-gray-500">
                                    Entrega: {formatearFecha(evaluacion.fechaLimiteEntrega)}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${estadoClase}`}>
                                  {estado}
                                </span>
                                {calificacion && (
                                  <div className="text-sm font-medium mt-1">
                                    Nota: {calificacion.valor}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-gray-500">No hay evaluaciones registradas para este estudiante.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Pie del modal */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EstudianteProgresoModal;
