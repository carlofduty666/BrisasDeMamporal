import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUser, 
  FaGraduationCap, 
  FaChartBar, 
  FaTasks, 
  FaFileAlt, 
  FaChalkboardTeacher, 
  FaBookOpen, 
  FaIdCard,
  FaCalendarAlt,
  FaBirthdayCake,
  FaVenusMars,
  FaHome,
  FaEye,
  FaUserGraduate,
  FaClipboardList,
  FaDownload
} from 'react-icons/fa';
import { tipoDocumentoFormateado, formatearNombreGrado, formatearFecha, calcularEdad } from '../../utils/formatters.js';


const DetallesEstudiante = () => {
  const { estudianteId } = useParams();
  const [estudiante, setEstudiante] = useState(null);
  const [inscripciones, setInscripciones] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [calificaciones, setCalificaciones] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [estadoInscripcion, setEstadoInscripcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('informacion');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Obtener datos del estudiante
        const estudianteResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/${estudianteId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setEstudiante(estudianteResponse.data);
        
        // Obtener año escolar actual
        let annoEscolarID = null;
        try {
          const annoEscolarResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (annoEscolarResponse.data?.id) {
            annoEscolarID = annoEscolarResponse.data.id;
          }
        } catch (annoError) {
          console.log('Error al obtener año escolar:', annoError);
        }

        // Obtener inscripciones del estudiante (filtradas por año escolar actual si existe)
        const inscripcionesUrl = annoEscolarID 
          ? `${import.meta.env.VITE_API_URL}/inscripciones?estudianteID=${estudianteId}&annoEscolarID=${annoEscolarID}`
          : `${import.meta.env.VITE_API_URL}/inscripciones?estudianteID=${estudianteId}`;
          
        const inscripcionesResponse = await axios.get(
          inscripcionesUrl,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setInscripciones(inscripcionesResponse.data);
        
        // Obtener documentos del estudiante
        const documentosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/documentos/persona/${estudianteId}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setDocumentos(documentosResponse.data);
        
        // Obtener estado de inscripción actual
        try {
          const inscripcionActualResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/inscripciones/estudiante/${estudianteId}/actual`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          setEstadoInscripcion(inscripcionActualResponse.data);
        } catch (inscripcionError) {
          console.log('No se encontró inscripción actual:', inscripcionError);
        }

        // Obtener calificaciones del estudiante
        try {
          const calificacionesResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/calificaciones/estudiante/${estudianteId}`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          setCalificaciones(calificacionesResponse.data);
        } catch (califError) {
          console.log('Error al cargar calificaciones:', califError);
        }

        // Obtener evaluaciones del estudiante
        try {
          const evaluacionesResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/evaluaciones/estudiante/${estudianteId}`,
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          setEvaluaciones(evaluacionesResponse.data);
        } catch (evalError) {
          console.log('Error al cargar evaluaciones:', evalError);
        }

        // Obtener profesores del estudiante
        try {
          const annoEscolarResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          if (annoEscolarResponse.data?.id) {
            const profesoresResponse = await axios.get(
              `${import.meta.env.VITE_API_URL}/personas/estudiante/${estudianteId}/profesores?annoEscolarID=${annoEscolarResponse.data.id}`,
              {
                headers: { 'Authorization': `Bearer ${token}` }
              }
            );
            setProfesores(profesoresResponse.data);
            
            // Extraer materias de los profesores
            const materiasUnicas = profesoresResponse.data.reduce((acc, profesor) => {
              if (profesor.materia && !acc.find(m => m.id === profesor.materia.id)) {
                acc.push(profesor.materia);
              }
              return acc;
            }, []);
            setMaterias(materiasUnicas);
          }
        } catch (profError) {
          console.log('Error al cargar profesores:', profError);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos del estudiante. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [estudianteId]);

  // Añade este objeto de mapeo al inicio de tu componente
  const tipoDocumentoFormateado = {
    'cedula': 'Cédula de Identidad',
    'partidaNacimiento': 'Partida de Nacimiento',
    'boletin': 'Boletín de Calificaciones',
    'notasCertificadas': 'Notas Certificadas',
    'fotoCarnet': 'Foto Carnet',
    'fotoCarta': 'Foto Tamaño Carta',
    'boletaRetiroPlantel': 'Boleta de Retiro del Plantel',
    'constanciaTrabajo': 'Constancia de Trabajo',
    'solvenciaPago': 'Solvencia de Pago',
    'foniatrico': 'Informe Foniátrico',
    'psicomental': 'Evaluación Psicomental',
    'certificadoSalud': 'Certificado de Salud',
    'curriculumVitae': 'Curriculum Vitae',
    'constanciaEstudio6toSemestre': 'Constancia de Estudio 6to Semestre',
    'titulo': 'Título Académico'
  };

  // Función para formatear nombres de grados
  const formatearNombreGrado = (nombreGrado) => {
    return nombreGrado.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-600 border-t-transparent border-r-transparent absolute top-0 left-0"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Cargando información del estudiante</h3>
              <p className="text-gray-600">Por favor espere...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 max-w-md">
          <div className="text-center">
            <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar datos</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              to="/dashboard/representante" 
              className="bg-slate-600 hover:bg-slate-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 hover:scale-105"
            >
              Volver al Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!estudiante) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="relative bg-slate-800 shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-full">
                <FaUserGraduate className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  {estudiante.nombre} {estudiante.apellido}
                </h1>
                <p className="text-gray-200 text-sm mt-1">Información detallada del estudiante</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {estadoInscripcion && (
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <p className="text-sm text-gray-200">Estado de Inscripción</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    estadoInscripcion.estado === 'aprobado' || estadoInscripcion.estado === 'inscrito' 
                      ? 'bg-green-500/80 text-white' :
                    estadoInscripcion.estado === 'rechazado' || estadoInscripcion.estado === 'retirado' 
                      ? 'bg-red-500/80 text-white' :
                      'bg-yellow-500/80 text-white'
                  }`}>
                    {estadoInscripcion.estado?.toUpperCase() || 'NO INSCRITO'}
                  </span>
                </div>
              )}
              <Link
                to="/dashboard/representante"
                className="bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105"
              >
                Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'informacion', label: 'Información Personal', icon: FaUser },
              { key: 'materias', label: 'Materias y Profesores', icon: FaBookOpen },
              { key: 'calificaciones', label: 'Calificaciones', icon: FaChartBar },
              { key: 'evaluaciones', label: 'Evaluaciones', icon: FaTasks },
              { key: 'documentos', label: 'Documentos', icon: FaFileAlt }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'border-slate-600 text-slate-700 bg-gray-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center space-x-2`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {/* Tab Content */}
        <div className="mt-6">
          {/* Pestaña de Información Personal */}
          {activeTab === 'informacion' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información Personal */}
              <div className="bg-white shadow-lg rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl">
                <div className="bg-slate-700 px-6 py-4 rounded-t-xl">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <FaUser className="mr-2 h-5 w-5" />
                    Datos Personales
                  </h2>
                </div>
                <div className="px-6 py-6">
                  <div className="space-y-4">
                    {[
                      { label: 'Nombre completo', value: `${estudiante.nombre} ${estudiante.apellido}`, icon: FaUser },
                      { label: 'Cédula/Documento', value: estudiante.cedula, icon: FaIdCard },
                      { label: 'Fecha de nacimiento', value: formatearFecha(estudiante?.fechaNacimiento), icon: FaCalendarAlt },
                      { label: 'Edad', value: estudiante?.fechaNacimiento ? `${calcularEdad(estudiante.fechaNacimiento)} años` : 'No disponible', icon: FaBirthdayCake },
                      { label: 'Género', value: estudiante.genero === 'M' ? 'Masculino' : 'Femenino', icon: FaVenusMars },
                      { label: 'Dirección', value: estudiante.direccion, icon: FaHome }
                    ].map((item, index) => (
                      <div 
                        key={index} 
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300"
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards'
                        }}
                      >
                        <item.icon className="h-6 w-6 text-gray-600" />
                        <div className="flex-1">
                          <dt className="text-sm font-medium text-gray-600">{item.label}</dt>
                          <dd className="text-base font-semibold text-gray-900 mt-1">{item.value}</dd>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estado Académico */}
              <div className="bg-white shadow-lg rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl">
                <div className="bg-slate-700 px-6 py-4 rounded-t-xl">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <FaGraduationCap className="mr-2 h-5 w-5" />
                    Estado Académico
                  </h2>
                </div>
                <div className="px-6 py-6">
                  <div className="space-y-4">
                    {estadoInscripcion ? (
                      <>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Grado Actual</span>
                            <span className="text-lg font-bold text-gray-700">
                              {estadoInscripcion.grado?.nombre_grado || 'No asignado'}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Sección</span>
                            <span className="text-lg font-bold text-gray-700">
                              {estadoInscripcion.Secciones?.nombre_seccion || 'No asignada'}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Año Escolar</span>
                            <span className="text-lg font-bold text-gray-700">
                              {estadoInscripcion.annoEscolar?.periodo || 'No disponible'}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                          <FaEye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 text-lg font-medium">No hay inscripción activa</p>
                          <p className="text-gray-500 mt-2">El estudiante no está inscrito en el año escolar actual</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Historial de Inscripciones */}
              <div className="md:col-span-2 bg-white shadow-lg rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl">
                <div className="bg-slate-700 px-6 py-4 rounded-t-xl">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <FaClipboardList className="mr-2 h-5 w-5" />
                    Historial de Inscripciones
                  </h2>
                </div>
                <div className="px-6 py-6">
                  {inscripciones.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <FaClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg font-medium">No hay inscripciones registradas</p>
                        <p className="text-gray-500 mt-2">Las inscripciones aparecerán aquí cuando se procesen</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inscripciones.map((inscripcion, index) => (
                        <div 
                          key={inscripcion.id}
                          className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                          style={{
                            animationDelay: `${index * 150}ms`,
                            animation: 'fadeInUp 0.6s ease-out forwards'
                          }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {inscripcion.annoEscolar?.periodo || 'Año no especificado'}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="text-xs font-medium text-gray-600 mb-1">Grado</div>
                                  <div className="text-sm font-bold text-gray-700">
                                    {inscripcion.grado ? formatearNombreGrado(inscripcion.grado.nombre_grado) : 'No asignado'}
                                  </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="text-xs font-medium text-gray-600 mb-1">Sección</div>
                                  <div className="text-sm font-bold text-gray-700">
                                    {inscripcion.Secciones?.nombre_seccion || 'No asignada'}
                                  </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="text-xs font-medium text-gray-600 mb-1">Fecha</div>
                                  <div className="text-sm font-bold text-gray-700">
                                    {formatearFecha(inscripcion.createdAt)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4 text-right">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                inscripcion.estado === 'aprobado' || inscripcion.estado === 'inscrito' 
                                  ? 'bg-green-100 text-green-800 border border-green-200' :
                                inscripcion.estado === 'rechazado' || inscripcion.estado === 'retirado' 
                                  ? 'bg-red-100 text-red-800 border border-red-200' :
                                  'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              } mb-2`}>
                                {inscripcion.estado?.toUpperCase() || 'PENDIENTE'}
                              </span>
                              <Link 
                                to={`/inscripcion/comprobante/${inscripcion.id}`} 
                                className="block bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg text-center text-xs font-medium transition-all duration-300 hover:scale-105"
                              >
                                Ver Comprobante
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pestaña de Materias y Profesores */}
          {activeTab === 'materias' && (
            <div className="space-y-6">
              <div className="bg-white shadow-lg rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl">
                <div className="bg-slate-700 px-6 py-4 rounded-t-xl">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <FaBookOpen className="mr-2 h-5 w-5" />
                    Materias y Profesores
                  </h2>
                </div>
                <div className="px-6 py-6">
                  {profesores.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <FaBookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg font-medium">No hay profesores asignados</p>
                        <p className="text-gray-500 mt-2">Los profesores aparecerán aquí cuando se asignen las materias</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profesores.map((profesor, index) => (
                        <div 
                          key={`${profesor.id}-${profesor.materia?.id}`}
                          className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                          style={{
                            animationDelay: `${index * 150}ms`,
                            animation: 'fadeInUp 0.6s ease-out forwards'
                          }}
                        >
                          <div className="bg-slate-600 px-4 py-3">
                            <h3 className="text-lg font-bold text-white truncate">
                              {profesor.materia?.asignatura || 'Materia no especificada'}
                            </h3>
                          </div>
                          <div className="p-6">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="p-3 bg-gray-100 rounded-full">
                                <FaChalkboardTeacher className="h-6 w-6 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-900">
                                  {profesor.nombre} {profesor.apellido}
                                </h4>
                                <p className="text-sm text-gray-500">Profesor(a)</p>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="text-xs font-medium text-gray-600 mb-1">Cédula</div>
                                <div className="text-sm font-semibold text-gray-900">{profesor.cedula}</div>
                              </div>
                              
                              {profesor.materia?.descripcion && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <div className="text-xs font-medium text-gray-600 mb-1">Descripción</div>
                                  <div className="text-sm text-gray-900">{profesor.materia.descripcion}</div>
                                </div>
                              )}
                              
                              <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                                <div className="text-xs font-medium text-gray-600 mb-1">Código de Materia</div>
                                <div className="text-sm font-bold text-gray-700">
                                  {profesor.materia?.codigo || 'No especificado'}
                                </div>
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
          )}

          {/* Pestaña de Calificaciones */}
          {activeTab === 'calificaciones' && (
            <div className="space-y-6">
              <div className="bg-white shadow-lg rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl">
                <div className="bg-slate-700 px-6 py-4 rounded-t-xl">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <FaChartBar className="mr-2 h-5 w-5" />
                    Calificaciones
                  </h2>
                </div>
                <div className="px-6 py-6">
                  {calificaciones.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <FaChartBar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg font-medium">No hay calificaciones registradas</p>
                        <p className="text-gray-500 mt-2">Las calificaciones aparecerán aquí cuando se evalúen</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {calificaciones.map((calificacion, index) => (
                        <div 
                          key={calificacion.id}
                          className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                          style={{
                            animationDelay: `${index * 100}ms`,
                            animation: 'fadeInUp 0.6s ease-out forwards'
                          }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {calificacion.Evaluaciones?.nombreEvaluacion || 'Evaluación sin nombre'}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                  <div className="text-xs font-medium text-gray-600 mb-1">Materia</div>
                                  <div className="text-sm font-bold text-gray-700">
                                    {calificacion.Evaluaciones?.Materias?.asignatura || 'No especificada'}
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                  <div className="text-xs font-medium text-gray-600 mb-1">Tipo</div>
                                  <div className="text-sm font-bold text-gray-700">
                                    {calificacion.Evaluaciones?.tipoEvaluacion || 'No especificado'}
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                  <div className="text-xs font-medium text-gray-600 mb-1">Fecha</div>
                                  <div className="text-sm font-bold text-gray-700">
                                    {formatearFecha(calificacion.Evaluaciones?.fechaEvaluacion)}
                                  </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                  <div className="text-xs font-medium text-gray-600 mb-1">Ponderación</div>
                                  <div className="text-sm font-bold text-gray-700">
                                    {calificacion.Evaluaciones?.ponderacion || 0}%
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="ml-4 text-center">
                              <div className="text-xs font-medium text-gray-600 mb-1">Calificación</div>
                              <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${
                                calificacion.calificacion >= 16 ? 'bg-green-100 text-green-700 border border-green-200' :
                                calificacion.calificacion >= 10 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                'bg-red-100 text-red-700 border border-red-200'
                              }`}>
                                {calificacion.calificacion}/20
                              </div>
                            </div>
                          </div>
                          
                          {calificacion.observaciones && (
                            <div className="mt-4 bg-white rounded-lg p-3 border border-gray-200">
                              <div className="text-xs font-medium text-gray-600 mb-1">Observaciones</div>
                              <div className="text-sm text-gray-700">{calificacion.observaciones}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pestaña de Evaluaciones */}
          {activeTab === 'evaluaciones' && (
            <div className="space-y-6">
              <div className="bg-white shadow-lg rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl">
                <div className="bg-slate-700 px-6 py-4 rounded-t-xl">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <FaTasks className="mr-2 h-5 w-5" />
                    Evaluaciones Programadas
                  </h2>
                </div>
                <div className="px-6 py-6">
                  {evaluaciones.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <FaTasks className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg font-medium">No hay evaluaciones programadas</p>
                        <p className="text-gray-500 mt-2">Las evaluaciones aparecerán aquí cuando se programen</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {evaluaciones.map((evaluacion, index) => (
                        <div 
                          key={evaluacion.id}
                          className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300"
                          style={{
                            animationDelay: `${index * 150}ms`,
                            animation: 'fadeInUp 0.6s ease-out forwards'
                          }}
                        >
                          <div className="bg-slate-600 px-4 py-3 rounded-t-xl">
                            <h3 className="text-lg font-bold text-white">
                              {evaluacion.nombreEvaluacion}
                            </h3>
                          </div>
                          <div className="p-6">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="text-xs font-medium text-gray-600 mb-1">Materia</div>
                                  <div className="text-sm font-bold text-gray-700">
                                    {evaluacion.Materias?.asignatura || 'No especificada'}
                                  </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="text-xs font-medium text-gray-600 mb-1">Tipo</div>
                                  <div className="text-sm font-bold text-gray-700">
                                    {evaluacion.tipoEvaluacion || 'No especificado'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="text-xs font-medium text-gray-600 mb-1">Fecha de Evaluación</div>
                                <div className="text-sm font-bold text-gray-700">
                                  {formatearFecha(evaluacion.fechaEvaluacion)}
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="text-xs font-medium text-gray-600 mb-1">Ponderación</div>
                                <div className="text-sm font-bold text-gray-700">
                                  {evaluacion.ponderacion || 0}% del lapso
                                </div>
                              </div>
                              
                              {evaluacion.descripcion && (
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="text-xs font-medium text-gray-600 mb-1">Descripción</div>
                                  <div className="text-sm text-gray-700">{evaluacion.descripcion}</div>
                                </div>
                              )}
                              
                              {/* Estado de la evaluación */}
                              <div className="pt-2">
                                {calificaciones.find(c => c.evaluacionID === evaluacion.id) ? (
                                  <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-green-700">Evaluada</span>
                                      <span className="text-lg font-bold text-green-800">
                                        {calificaciones.find(c => c.evaluacionID === evaluacion.id)?.calificacion}/20
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3">
                                    <span className="text-sm font-medium text-yellow-700">Pendiente por evaluar</span>
                                  </div>
                                )}
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
          )}

          {/* Pestaña de Documentos */}
          {activeTab === 'documentos' && (
            <div className="space-y-6">
              <div className="bg-white shadow-lg rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-xl">
                <div className="bg-slate-700 px-6 py-4 rounded-t-xl">
                  <h2 className="text-xl font-bold text-white flex items-center">
                    <FaFileAlt className="mr-2 h-5 w-5" />
                    Documentos del Estudiante
                  </h2>
                </div>
                <div className="px-6 py-6">
                  {documentos.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <FaFileAlt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg font-medium">No hay documentos registrados</p>
                        <p className="text-gray-500 mt-2">Los documentos aparecerán aquí cuando se suban</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {documentos.map((documento, index) => (
                        <div 
                          key={documento.id}
                          className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                          style={{
                            animationDelay: `${index * 150}ms`,
                            animation: 'fadeInUp 0.6s ease-out forwards'
                          }}
                        >
                          {/* Preview del documento */}
                          <div className="bg-gray-100 h-40 flex items-center justify-center border-b border-gray-200">
                            {documento.urlDocumento && documento.urlDocumento.toLowerCase().includes('.pdf') ? (
                              <div className="text-center">
                                <FaFileAlt className="h-16 w-16 text-gray-500 mx-auto mb-2" />
                                <div className="text-xs text-gray-600 font-medium">PDF</div>
                              </div>
                            ) : documento.urlDocumento && (documento.urlDocumento.toLowerCase().includes('.jpg') || 
                                     documento.urlDocumento.toLowerCase().includes('.jpeg') || 
                                     documento.urlDocumento.toLowerCase().includes('.png')) ? (
                              <img 
                                src={`${import.meta.env.VITE_API_URL}${documento.urlDocumento}`}
                                alt="Preview del documento"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                            ) : (
                              <div className="text-center">
                                <FaFileAlt className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                                <div className="text-xs text-gray-600 font-medium">ARCHIVO</div>
                              </div>
                            )}
                            {/* Fallback si la imagen no carga */}
                            <div className="text-center" style={{display: 'none'}}>
                              <FaFileAlt className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                              <div className="text-xs text-gray-600 font-medium">ARCHIVO</div>
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                              {documento.tipoDocumento ? tipoDocumentoFormateado[documento.tipoDocumento] || documento.tipoDocumento : 'Documento sin tipo'}
                            </h3>
                            
                            <div className="space-y-3 mb-4">
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="text-xs font-medium text-gray-600 mb-1">Fecha de subida</div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {formatearFecha(documento.createdAt)}
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <div className="text-xs font-medium text-gray-600 mb-1">Estado</div>
                                <div className="text-sm font-bold text-gray-700">
                                  {documento.verificado ? 'Verificado' : 'Pendiente de verificación'}
                                </div>
                              </div>
                              
                              {documento.observaciones && (
                                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                                  <div className="text-xs font-medium text-yellow-600 mb-1">Observaciones</div>
                                  <div className="text-sm text-yellow-800">{documento.observaciones}</div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-2">
                              <a 
                                href={`${import.meta.env.VITE_API_URL}${documento.urlDocumento}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-3 rounded-lg text-center text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center"
                              >
                                <FaEye className="h-4 w-4 mr-1" />
                                Ver
                              </a>
                              <a 
                                href={`${import.meta.env.VITE_API_URL}/documentos/download/${documento.id}`}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-center text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center"
                              >
                                <FaDownload className="h-4 w-4 mr-1" />
                                Descargar
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Añadir las animaciones CSS
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

if (!document.head.querySelector('#estudiante-animations')) {
  styleSheet.id = 'estudiante-animations';
  document.head.appendChild(styleSheet);
}

export default DetallesEstudiante;
