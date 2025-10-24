import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaChalkboardTeacher, 
  FaTimes, 
  FaClipboardList, 
  FaCalendarAlt,
  FaPercentage,
  FaFileAlt,
  FaUserGraduate,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaChartLine,
  FaBook,
  FaDownload,
  FaEye,
  FaClock,
  FaHistory,
  FaArrowRight,
  FaInfoCircle,
  FaFilter,
  FaList,
  FaThLarge,
  FaIdCard
} from 'react-icons/fa';
import { getMateriaStyles } from '../../../utils/materiaStyles';
import { formatearNombreGrado, formatearCedula } from '../../../utils/formatters'

const MateriaDetailModal = ({ materia, grado, annoEscolar, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [calificaciones, setCalificaciones] = useState({});
  const [secciones, setSecciones] = useState([]);
  const [selectedSeccion, setSelectedSeccion] = useState('');
  const [selectedLapso, setSelectedLapso] = useState('');
  const [selectedProfesor, setSelectedProfesor] = useState('');
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);
  const [activeView, setActiveView] = useState('evaluaciones'); // 'evaluaciones', 'estadisticas', o 'historico' (transferencia de secciones)
  const [historicalCalificaciones, setHistoricalCalificaciones] = useState({});
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [seccionesEstudiantes, setSeccionesEstudiantes] = useState({});
  const [loadingSeccionesEstudiantes, setLoadingSeccionesEstudiantes] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState('tarjetas'); // 'tarjetas' o 'lista'
  const [profesoresData, setProfesoresData] = useState({}); // Para almacenar datos de profesores
  
  const token = localStorage.getItem('token');
  const { bgColor, textColor, iconColor, Icon } = getMateriaStyles(materia.asignatura, 'full');

  useEffect(() => {
    if (materia && grado && annoEscolar) {
      fetchData();
    }
  }, [materia, grado, annoEscolar, selectedSeccion, selectedLapso]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // Obtener secciones del grado
      const seccionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/grado/${grado.id}`,
        config
      );
      setSecciones(seccionesResponse.data);

      // Obtener evaluaciones de la materia
      const evaluacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/evaluaciones/filtradas`,
        {
          ...config,
          params: {
            materiaID: materia.id,
            gradoID: grado.id,
            annoEscolarID: annoEscolar.id,
            ...(selectedSeccion && { seccionID: selectedSeccion }),
            ...(selectedLapso && { lapso: selectedLapso })
          }
        }
      );
      setEvaluaciones(evaluacionesResponse.data);

      // Cargar calificaciones para todas las evaluaciones automáticamente
      for (const evaluacion of evaluacionesResponse.data) {
        await fetchCalificacionesByEvaluacion(evaluacion.id);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoading(false);
    }
  };

  const fetchCalificacionesByEvaluacion = async (evaluacionID) => {
    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/calificaciones/evaluacion/${evaluacionID}`,
        config
      );
      
      console.log(`Calificaciones para evaluación ${evaluacionID}:`, response.data);
      
      setCalificaciones(prev => ({
        ...prev,
        [evaluacionID]: response.data
      }));

      // Cargar las secciones de los estudiantes
      if (response.data && response.data.length > 0) {
        cargarSeccionesEstudiantes(response.data);
      }
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
      console.error('Detalles del error:', error.response?.data);
    }
  };

  const handleEvaluacionClick = (evaluacion) => {
    setSelectedEvaluacion(evaluacion);
    if (!calificaciones[evaluacion.id]) {
      fetchCalificacionesByEvaluacion(evaluacion.id);
    } else {
      // Si ya tenemos las calificaciones, cargar las secciones de los estudiantes
      cargarSeccionesEstudiantes(calificaciones[evaluacion.id]);
    }
  };

  const fetchSeccionEstudiante = async (estudianteID) => {
    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/estudiante/${estudianteID}`,
        {
          ...config,
          params: { annoEscolarID: annoEscolar.id }
        }
      );
      
      // Obtener la primera sección (la actual)
      if (response.data && response.data.length > 0) {
        setSeccionesEstudiantes(prev => ({
          ...prev,
          [estudianteID]: response.data[0]
        }));
      } else {
        setSeccionesEstudiantes(prev => ({
          ...prev,
          [estudianteID]: null
        }));
      }
    } catch (error) {
      console.error(`Error al obtener sección del estudiante ${estudianteID}:`, error);
      setSeccionesEstudiantes(prev => ({
        ...prev,
        [estudianteID]: null
      }));
    }
  };

  const cargarSeccionesEstudiantes = async (calificacionesData) => {
    try {
      setLoadingSeccionesEstudiantes(true);
      // Obtener las secciones de todos los estudiantes en paralelo
      await Promise.all(
        calificacionesData.map(calificacion => 
          fetchSeccionEstudiante(calificacion.personaID)
        )
      );
    } catch (error) {
      console.error('Error al cargar secciones de estudiantes:', error);
    } finally {
      setLoadingSeccionesEstudiantes(false);
    }
  };

  const fetchCalificacionesConHistorial = async (estudianteID) => {
    try {
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/calificaciones/historialseccion/${estudianteID}/${annoEscolar.id}`,
        config
      );
      
      setHistoricalCalificaciones(prev => ({
        ...prev,
        [estudianteID]: response.data
      }));
    } catch (error) {
      console.error('Error al cargar histórico de calificaciones:', error);
      setHistoricalCalificaciones(prev => ({
        ...prev,
        [estudianteID]: null
      }));
    }
  };

  const cargarHistoricoCompleto = async () => {
    try {
      setLoadingHistorico(true);
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // Obtener todos los estudiantes del grado
      const estudiantesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${grado.id}/estudiantes`,
        { 
          ...config,
          params: { 
            annoEscolarID: annoEscolar.id,
            tipo: 'estudiante'
          }
        }
      );

      // Obtener histórico para cada estudiante
      await Promise.all(
        estudiantesResponse.data.map(estudiante => 
          fetchCalificacionesConHistorial(estudiante.id)
        )
      );
    } catch (error) {
      console.error('Error al cargar histórico completo:', error);
    } finally {
      setLoadingHistorico(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-VE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calcularEstadisticas = (evaluacionID) => {
    const califs = calificaciones[evaluacionID] || [];
    console.log(`Calculando estadísticas para evaluación ${evaluacionID}:`, califs);
    
    if (califs.length === 0) {
      console.log(`No hay calificaciones para evaluación ${evaluacionID}`);
      return null;
    }

    // Separar estudiantes que presentaron vs no presentaron
    const noPresentaron = califs.filter(c => {
      const nota = parseFloat(c.calificacion || c.nota);
      return isNaN(nota) || nota === 0;
    });
    
    const presentaron = califs.filter(c => {
      const nota = parseFloat(c.calificacion || c.nota);
      return !isNaN(nota) && nota > 0;
    });
    
    console.log(`No presentaron (${noPresentaron.length}):`, noPresentaron);
    console.log(`Presentaron (${presentaron.length}):`, presentaron);
    
    if (presentaron.length === 0) {
      console.log(`No hay calificaciones válidas para evaluación ${evaluacionID}`);
      return {
        promedio: '0.00',
        aprobados: 0,
        reprobados: 0,
        noPresentaron: noPresentaron.length,
        total: califs.length,
        porcentajeAprobados: '0.0'
      };
    }
    
    const notas = presentaron.map(c => parseFloat(c.calificacion || c.nota));
    const promedio = notas.reduce((a, b) => a + b, 0) / notas.length;
    const aprobados = notas.filter(n => n >= 10).length;
    const reprobados = notas.filter(n => n < 10 && n > 0).length;

    const stats = {
      promedio: promedio.toFixed(2),
      aprobados,
      reprobados,
      noPresentaron: noPresentaron.length,
      total: califs.length,
      porcentajeAprobados: ((aprobados / presentaron.length) * 100).toFixed(1)
    };
    
    console.log(`Estadísticas calculadas:`, stats);
    return stats;
  };

  // Función para obtener los colores según la calificación
  const getCalificacionColor = (nota) => {
    const notaNum = parseFloat(nota);
    
    if (isNaN(notaNum) || notaNum === 0) {
      // Rojo: No presentó
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-300',
        display: 'NP'
      };
    } else if (notaNum > 15) {
      // Verde: Excelente (> 15)
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-300',
        display: notaNum
      };
    } else if (notaNum >= 10 && notaNum <= 15) {
      // Amarillo: Bien (10-15)
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-300',
        display: notaNum
      };
    } else if (notaNum < 10) {
      // Naranja: Bajo (< 10)
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-300',
        display: notaNum
      };
    }
  };

  const lapsos = [1, 2, 3];

  // Filtrar evaluaciones por profesor seleccionado
  const evaluacionesFiltradas = selectedProfesor 
    ? evaluaciones.filter(ev => ev.Profesor && ev.Profesor.id == selectedProfesor)
    : evaluaciones;

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-center min-h-screen px-4 py-6">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
          aria-hidden="true" 
          onClick={onClose}
        ></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all w-full max-w-7xl max-h-[90vh] flex flex-col">
          {/* Header con tema de materia */}
          <div className={`${bgColor} px-6 py-6 border-b-4`} style={{ borderColor: iconColor }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/30 backdrop-blur-sm rounded-2xl">
                  <Icon className={`w-8 h-8 ${iconColor}`} />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${textColor}`}>
                    {materia.asignatura}
                  </h2>
                  <p className={`text-sm ${textColor} opacity-80 mt-1`}>
                    {formatearNombreGrado(grado.nombre_grado)} - {annoEscolar.periodo}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 ${textColor}`}
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            {/* Profesores asignados */}
            {materia.profesoresAsignados && materia.profesoresAsignados.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {materia.profesoresAsignados.map((profesor, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center ${textColor} bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2`}
                  >
                    <FaChalkboardTeacher className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      {profesor.nombre} {profesor.apellido}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tabs de navegación y Botón de Filtros */}
          <div className={`${bgColor} bg-opacity-10 border-b-2`} style={{ borderColor: iconColor }}>
            <div className="px-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <nav className="flex space-x-2 flex-wrap">
                  <button
                    onClick={() => setActiveView('evaluaciones')}
                    className={`py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 rounded-t-lg ${
                      activeView === 'evaluaciones'
                        ? `${bgColor} ${textColor} shadow-md transform -translate-y-0.5`
                        : 'bg-transparent text-gray-600 hover:bg-white/50'
                    }`}
                    style={activeView === 'evaluaciones' ? { borderBottom: `3px solid ${iconColor}` } : {}}
                  >
                    <FaClipboardList className="inline-block w-4 h-4 mr-2" />
                    Evaluaciones ({evaluacionesFiltradas.length}{selectedProfesor && evaluaciones.length !== evaluacionesFiltradas.length ? `/${evaluaciones.length}` : ''})
                  </button>
                  <button
                    onClick={() => setActiveView('estadisticas')}
                    className={`py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 rounded-t-lg ${
                      activeView === 'estadisticas'
                        ? `${bgColor} ${textColor} shadow-md transform -translate-y-0.5`
                        : 'bg-transparent text-gray-600 hover:bg-white/50'
                    }`}
                    style={activeView === 'estadisticas' ? { borderBottom: `3px solid ${iconColor}` } : {}}
                  >
                    <FaChartLine className="inline-block w-4 h-4 mr-2" />
                    Estadísticas
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('historico');
                      if (Object.keys(historicalCalificaciones).length === 0) {
                        cargarHistoricoCompleto();
                      }
                    }}
                    className={`py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 rounded-t-lg ${
                      activeView === 'historico'
                        ? `${bgColor} ${textColor} shadow-md transform -translate-y-0.5`
                        : 'bg-transparent text-gray-600 hover:bg-white/50'
                    }`}
                    style={activeView === 'historico' ? { borderBottom: `3px solid ${iconColor}` } : {}}
                  >
                    <FaHistory className="inline-block w-4 h-4 mr-2" />
                    Transf. de Secciones
                  </button>

                  {/* Separador visual */}
                  <div className="hidden md:block w-px h-8 bg-gray-300"></div>

                  {/* Botones de vista (solo en vista de evaluaciones) */}
                  {activeView === 'evaluaciones' && (
                    <>
                      <button
                        onClick={() => setViewType('tarjetas')}
                        className={`py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 rounded-t-lg flex items-center gap-2 ${
                          viewType === 'tarjetas'
                            ? `${bgColor} ${textColor} shadow-md transform -translate-y-0.5`
                            : 'bg-transparent text-gray-600 hover:bg-white/50'
                        }`}
                        style={viewType === 'tarjetas' ? { borderBottom: `3px solid ${iconColor}` } : {}}
                      >
                        <FaThLarge className="w-4 h-4" />
                        Tarjetas
                      </button>
                      <button
                        onClick={() => setViewType('lista')}
                        className={`py-4 px-6 border-b-3 font-semibold text-sm transition-all duration-200 rounded-t-lg flex items-center gap-2 ${
                          viewType === 'lista'
                            ? `${bgColor} ${textColor} shadow-md transform -translate-y-0.5`
                            : 'bg-transparent text-gray-600 hover:bg-white/50'
                        }`}
                        style={viewType === 'lista' ? { borderBottom: `3px solid ${iconColor}` } : {}}
                      >
                        <FaList className="w-4 h-4" />
                        Lista
                      </button>
                    </>
                  )}
                </nav>

                {/* Botón para mostrar/ocultar filtros */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                    showFilters
                      ? `${bgColor} ${textColor} shadow-md`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaFilter className="w-4 h-4" />
                  Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Filtros - Colapsable */}
          {showFilters && (
            <div className={`${bgColor} bg-opacity-5 px-6 py-4 border-b-2 animate-in fade-in slide-in-from-top-2 duration-200`} style={{ borderColor: iconColor }}>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-[200px]">
                  <label className={`block text-sm font-semibold mb-2 ${textColor}`}>
                    <FaUserGraduate className="inline-block w-4 h-4 mr-1" />
                    Sección
                  </label>
                  <select
                    value={selectedSeccion}
                    onChange={(e) => setSelectedSeccion(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2.5 text-base border-2 focus:outline-none rounded-xl font-medium transition-all duration-200 hover:shadow-md"
                    style={{ 
                      borderColor: selectedSeccion ? iconColor : '#d1d5db',
                      backgroundColor: selectedSeccion ? `${iconColor}10` : 'white'
                    }}
                  >
                    <option value="">Todas las secciones</option>
                    {secciones.map((seccion) => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.nombre_seccion}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className={`block text-sm font-semibold mb-2 ${textColor}`}>
                    <FaCalendarAlt className="inline-block w-4 h-4 mr-1" />
                    Lapso
                  </label>
                  <select
                    value={selectedLapso}
                    onChange={(e) => setSelectedLapso(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2.5 text-base border-2 focus:outline-none rounded-xl font-medium transition-all duration-200 hover:shadow-md"
                    style={{ 
                      borderColor: selectedLapso ? iconColor : '#d1d5db',
                      backgroundColor: selectedLapso ? `${iconColor}10` : 'white'
                    }}
                  >
                    <option value="">Todos los lapsos</option>
                    {lapsos.map((lapso) => (
                      <option key={lapso} value={lapso}>
                        Lapso {lapso}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Filtro de Profesor */}
              {materia.profesoresAsignados && materia.profesoresAsignados.length > 0 && (
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${textColor}`}>
                    <FaChalkboardTeacher className="inline-block w-4 h-4 mr-1" />
                    Filtrar por Profesor
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedProfesor('')}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                        !selectedProfesor
                          ? `${bgColor} ${textColor} shadow-md`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Todos
                    </button>
                    {materia.profesoresAsignados.map((profesor) => (
                      <button
                        key={profesor.id}
                        onClick={() => setSelectedProfesor(profesor.id.toString())}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                          selectedProfesor == profesor.id
                            ? `${bgColor} ${textColor} shadow-md`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {profesor.nombre} {profesor.apellido}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <>
                {/* Vista de Evaluaciones */}
                {activeView === 'evaluaciones' && (
                  <div className="space-y-4">
                    {evaluacionesFiltradas.length > 0 ? (
                      evaluacionesFiltradas.map((evaluacion) => {
                        const stats = calcularEstadisticas(evaluacion.id);
                        const isExpanded = selectedEvaluacion?.id === evaluacion.id;

                        return (
                          <div 
                            key={evaluacion.id}
                            className={`bg-white border-l-4 border-2 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-200 ${
                              isExpanded ? 'shadow-lg ring-2' : 'border-gray-200'
                            }`}
                            style={{ 
                              borderLeftColor: iconColor,
                              ...(isExpanded && { ringColor: iconColor })
                            }}
                          >
                            {/* Header de evaluación */}
                            <div 
                              onClick={() => handleEvaluacionClick(evaluacion)}
                              className={`p-5 cursor-pointer transition-all duration-200 ${
                                isExpanded ? bgColor + ' bg-opacity-5' : 'hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h4 className="text-lg font-bold text-gray-900">
                                      {evaluacion.nombreEvaluacion}
                                    </h4>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      evaluacion.lapso === 1 ? 'bg-blue-100 text-blue-700' :
                                      evaluacion.lapso === 2 ? 'bg-green-100 text-green-700' :
                                      'bg-purple-100 text-purple-700'
                                    }`}>
                                      Lapso {evaluacion.lapso}
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                                      {evaluacion.tipoEvaluacion}
                                    </span>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                      <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
                                      {formatDate(evaluacion.fechaEvaluacion)}
                                    </div>
                                    <div className="flex items-center">
                                      <FaPercentage className="w-4 h-4 mr-2 text-gray-400" />
                                      {evaluacion.porcentaje}% del lapso
                                    </div>
                                    {evaluacion.Seccion && (
                                      <div className="flex items-center">
                                        <FaUserGraduate className="w-4 h-4 mr-2 text-gray-400" />
                                        Sección {evaluacion.Seccion.nombre_seccion}
                                      </div>
                                    )}
                                    {evaluacion.Profesor && (
                                      <div className="flex items-center font-semibold" style={{ color: iconColor }}>
                                        <FaChalkboardTeacher className="w-4 h-4 mr-2" />
                                        {evaluacion.Profesor.nombre} {evaluacion.Profesor.apellido}
                                      </div>
                                    )}
                                  </div>

                                  {evaluacion.descripcion && (
                                    <p className="mt-2 text-sm text-gray-600">
                                      {evaluacion.descripcion}
                                    </p>
                                  )}

                                  {/* Archivo adjunto */}
                                  {evaluacion.archivoURL && (
                                    <div className="mt-3 flex items-center gap-2">
                                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                                        <FaFileAlt className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-900">
                                          {evaluacion.nombreArchivo || 'Archivo adjunto'}
                                        </span>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(evaluacion.archivoURL, '_blank');
                                        }}
                                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors duration-200"
                                        title="Ver archivo"
                                      >
                                        <FaEye className="w-4 h-4" />
                                      </button>
                                      <a
                                        href={evaluacion.archivoURL}
                                        download={evaluacion.nombreArchivo}
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors duration-200"
                                        title="Descargar archivo"
                                      >
                                        <FaDownload className="w-4 h-4" />
                                      </a>
                                    </div>
                                  )}

                                  {/* Estadísticas rápidas */}
                                  {stats && (
                                    <div className="mt-3 flex items-center flex-wrap gap-3">
                                      <div className="flex items-center text-sm">
                                        <FaCheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                        <span className="font-semibold text-green-700">{stats.aprobados}</span>
                                        <span className="text-gray-500 ml-1">aprobado{stats.aprobados !== 1 ? 's' : ''}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <FaTimesCircle className="w-4 h-4 mr-1 text-red-500" />
                                        <span className="font-semibold text-red-700">{stats.reprobados}</span>
                                        <span className="text-gray-500 ml-1">reprobado{stats.reprobados !== 1 ? 's' : ''}</span>
                                      </div>
                                      {stats.noPresentaron > 0 && (
                                        <div className="flex items-center text-sm">
                                          <FaExclamationTriangle className="w-4 h-4 mr-1 text-yellow-500" />
                                          <span className="font-semibold text-yellow-700">{stats.noPresentaron}</span>
                                          <span className="text-gray-500 ml-1">{stats.noPresentaron === 1 ? 'No presentó' : 'No presentaron'}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center text-sm">
                                        <FaChartLine className="w-4 h-4 mr-1 text-blue-500" />
                                        <span className="font-semibold text-blue-700">{stats.promedio}</span>
                                        <span className="text-gray-500 ml-1">promedio</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Indicador de expansión */}
                                <div className="ml-4">
                                  <div className={`p-2 rounded-full transition-all duration-200 ${
                                    isExpanded ? bgColor + ' bg-opacity-20' : 'bg-gray-100'
                                  }`}>
                                    <FaEye 
                                      className={`w-5 h-5 transition-transform duration-200 ${
                                        isExpanded ? textColor + ' transform scale-110' : 'text-gray-400'
                                      }`}
                                      style={isExpanded ? { color: iconColor } : {}}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Detalles expandidos - Calificaciones */}
                            {isExpanded && (
                              <div className={`border-t-2 p-5 ${bgColor} bg-opacity-5`} style={{ borderColor: iconColor }}>
                                <h5 className={`text-sm font-bold mb-4 flex items-center ${textColor}`}>
                                  <div className={`p-2 rounded-lg mr-2 ${bgColor} bg-opacity-20`}>
                                    <FaUserGraduate className="w-4 h-4" style={{ color: iconColor }} />
                                  </div>
                                  Calificaciones de Estudiantes
                                </h5>
                                
                                {calificaciones[evaluacion.id] ? (
                                  <>
                                  {/* VISTA EN TARJETAS */}
                                  {viewType === 'tarjetas' && (
                                  <div className="space-y-2">
                                    {calificaciones[evaluacion.id].length > 0 ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {calificaciones[evaluacion.id].map((calificacion) => {
                                          const nota = parseFloat(calificacion.calificacion || calificacion.nota);
                                          const noPresento = isNaN(nota) || nota === 0;
                                          const seccionActual = seccionesEstudiantes[calificacion.personaID];
                                          const fueTransferido = seccionActual && evaluacion.Seccion && 
                                                                seccionActual.id !== evaluacion.Seccion.id;
                                          
                                          // Determinar el color del borde basado en la calificación
                                          let borderColor = '#EF4444'; // Rojo por defecto (no presentó)
                                          if (!noPresento) {
                                            if (nota > 15) {
                                              borderColor = '#22C55E'; // Verde (excelente > 15)
                                            } else if (nota >= 10 && nota <= 15) {
                                              borderColor = '#EABB08'; // Amarillo (bien 10-15)
                                            } else if (nota < 10) {
                                              borderColor = '#F97316'; // Naranja (bajo < 10)
                                            }
                                          }
                                          
                                          return (
                                          <div 
                                            key={calificacion.id}
                                            className="bg-white rounded-xl p-3 border-2 hover:shadow-lg transition-all duration-200"
                                            style={{ 
                                              borderColor: borderColor
                                            }}
                                          >
                                        
                                            <div className="flex items-center justify-between">
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <FaUserGraduate className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                                    {calificacion.Personas?.nombre} {calificacion.Personas?.apellido}
                                                  </p>
                                                </div>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                  <FaIdCard className="w-3 h-3 flex-shrink-0" />
                                                  {formatearCedula(calificacion.Personas?.cedula)}
                                                </p>
                                              </div>
                                              <div className="ml-3">
                                                {(() => {
                                                  const colorInfo = getCalificacionColor(calificacion.calificacion || calificacion.nota);
                                                  // Mapear colores consistentes: fondo, texto y borde
                                                  const colorMap = {
                                                    'bg-red-100': {
                                                      bg: '#FEE2E2',      // Rojo muy claro
                                                      text: '#B91C1C',    // Rojo oscuro
                                                      border: '#EF4444'   // Rojo medio
                                                    },
                                                    'bg-green-100': {
                                                      bg: '#DCFCE7',      // Verde muy claro
                                                      text: '#166534',    // Verde oscuro
                                                      border: '#22C55E'   // Verde medio
                                                    },
                                                    'bg-yellow-100': {
                                                      bg: '#FEFCE8',      // Amarillo muy claro
                                                      text: '#713F12',    // Amarillo oscuro
                                                      border: '#EABB08'   // Amarillo medio
                                                    },
                                                    'bg-orange-100': {
                                                      bg: '#FFEDD5',      // Naranja muy claro
                                                      text: '#92400E',    // Naranja oscuro
                                                      border: '#F97316'   // Naranja medio
                                                    }
                                                  };
                                                  const colors = colorMap[colorInfo.bg];
                                                  return (
                                                    <span 
                                                      className="inline-flex items-center justify-center w-14 h-14 rounded-xl text-lg font-bold shadow-md border-2"
                                                      style={{
                                                        backgroundColor: colors.bg,
                                                        color: colors.text,
                                                        borderColor: colors.border
                                                      }}>
                                                      {colorInfo.display}
                                                    </span>
                                                  );
                                                })()}
                                              </div>
                                            </div>

                                            {/* Mostrar sección actual y aviso de transferencia */}
                                            {seccionActual && (
                                              <div className="mt-2 pt-2 border-t">
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                  <FaUserGraduate className="w-3 h-3" />
                                                  Sección actual: <span className="font-semibold text-gray-700">{seccionActual.nombre_seccion}</span>
                                                </p>
                                              </div>
                                            )}

                                            {fueTransferido && (
                                              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                                                <div className="flex-shrink-0">
                                                  <FaArrowRight className="w-4 h-4 text-orange-600 mt-0.5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <p className="text-xs font-semibold text-orange-800">
                                                    ⚠️ Este alumno fue transferido a la sección <span className="font-bold">{seccionActual?.nombre_seccion}</span>
                                                  </p>
                                                  <p className="text-xs text-orange-700 mt-0.5">
                                                    Esta calificación es de su sección anterior: <span className="font-semibold">{evaluacion.Seccion?.nombre_seccion}</span>
                                                  </p>
                                                </div>
                                              </div>
                                            )}
                                            
                                            {calificacion.observaciones && (
                                              <p className="mt-2 text-xs text-gray-600 italic border-t pt-2 flex items-start gap-1">
                                                <FaFileAlt className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                {calificacion.observaciones}
                                              </p>
                                            )}
                                          </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className="text-center py-8">
                                        <FaExclamationTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600">
                                          No hay calificaciones registradas para esta evaluación
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  )}

                                  {/* VISTA EN LISTA */}
                                  {viewType === 'lista' && (
                                    <div className="overflow-x-auto">
                                      {calificaciones[evaluacion.id].length > 0 ? (
                                        <div className="min-w-full">
                                          {/* Header de la tabla */}
                                          <div className="grid gap-3 mb-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2" style={{ borderColor: `${iconColor}40`, gridTemplateColumns: 'minmax(140px, 1fr) minmax(200px, 1.5fr) minmax(150px, 1fr) minmax(180px, 1.5fr) minmax(120px, 1fr) minmax(200px, 1.5fr)' }}>
                                            <div className="flex items-center font-bold text-gray-700 text-sm">
                                              <FaIdCard className="w-4 h-4 mr-2" style={{ color: iconColor }} />
                                              Cédula
                                            </div>
                                            <div className="flex items-center font-bold text-gray-700 text-sm">
                                              <FaUserGraduate className="w-4 h-4 mr-2" style={{ color: iconColor }} />
                                              Nombre
                                            </div>
                                            <div className="flex items-center font-bold text-gray-700 text-sm">
                                              <FaUserGraduate className="w-4 h-4 mr-2" style={{ color: iconColor }} />
                                              Sección
                                            </div>
                                            <div className="flex items-center font-bold text-gray-700 text-sm">
                                              <FaChalkboardTeacher className="w-4 h-4 mr-2" style={{ color: iconColor }} />
                                              Profesor
                                            </div>
                                            <div className="flex items-center font-bold text-gray-700 text-sm">
                                              <FaPercentage className="w-4 h-4 mr-2" style={{ color: iconColor }} />
                                              Calificación
                                            </div>
                                            <div className="flex items-center font-bold text-gray-700 text-sm">
                                              <FaFileAlt className="w-4 h-4 mr-2" style={{ color: iconColor }} />
                                              Observación
                                            </div>
                                          </div>

                                          {/* Filas de datos */}
                                          <div className="space-y-2 max-h-96 overflow-y-auto">
                                            {calificaciones[evaluacion.id].map((calificacion, idx) => {
                                              const nota = parseFloat(calificacion.calificacion || calificacion.nota);
                                              const noPresento = isNaN(nota) || nota === 0;
                                              const seccionActual = seccionesEstudiantes[calificacion.personaID];
                                              
                                              let borderColor = '#EF4444'; // Rojo por defecto (no presentó)
                                              if (!noPresento) {
                                                if (nota > 15) {
                                                  borderColor = '#22C55E'; // Verde (excelente > 15)
                                                } else if (nota >= 10 && nota <= 15) {
                                                  borderColor = '#EABB08'; // Amarillo (bien 10-15)
                                                } else if (nota < 10) {
                                                  borderColor = '#F97316'; // Naranja (bajo < 10)
                                                }
                                              }

                                              // Mapear colores consistentes
                                              const colorMap = {
                                                '#EF4444': { bg: '#FEE2E2', text: '#B91C1C', border: '#EF4444', display: 'NP' },
                                                '#22C55E': { bg: '#DCFCE7', text: '#166534', border: '#22C55E', display: nota },
                                                '#EABB08': { bg: '#FEFCE8', text: '#713F12', border: '#EABB08', display: nota },
                                                '#F97316': { bg: '#FFEDD5', text: '#92400E', border: '#F97316', display: nota }
                                              };
                                              
                                              const colorInfo = colorMap[borderColor] || colorMap['#EF4444'];

                                              return (
                                                <div 
                                                  key={calificacion.id}
                                                  className="grid gap-3 p-4 bg-white rounded-lg border-2 hover:shadow-lg transition-all duration-200"
                                                  style={{ borderColor: borderColor, gridTemplateColumns: 'minmax(140px, 1fr) minmax(200px, 1.5fr) minmax(150px, 1fr) minmax(180px, 1.5fr) minmax(120px, 1fr) minmax(200px, 1.5fr)' }}
                                                >
                                                  {/* Cédula */}
                                                  <div className="flex items-center text-sm">
                                                    <span className="font-semibold text-gray-900">
                                                      {formatearCedula(calificacion.Personas?.cedula)}
                                                    </span>
                                                  </div>

                                                  {/* Nombre y Apellido */}
                                                  <div className="flex items-center text-sm">
                                                    <span className="text-gray-900">
                                                      {calificacion.Personas?.nombre} {calificacion.Personas?.apellido}
                                                    </span>
                                                  </div>

                                                  {/* Sección */}
                                                  <div className="flex items-center text-sm">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                      seccionActual 
                                                        ? `${bgColor} ${textColor}` 
                                                        : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                      {seccionActual?.nombre_seccion || 'N/A'}
                                                    </span>
                                                  </div>

                                                  {/* Profesor */}
                                                  <div className="flex items-center text-sm">
                                                    <span className="text-gray-900">
                                                      {evaluacion.Profesor ? `${evaluacion.Profesor.nombre} ${evaluacion.Profesor.apellido}` : 'N/A'}
                                                    </span>
                                                  </div>

                                                  {/* Calificación */}
                                                  <div className="flex items-center justify-center">
                                                    <span 
                                                      className="inline-flex items-center justify-center w-12 h-12 rounded-lg text-sm font-bold border-2"
                                                      style={{
                                                        backgroundColor: colorInfo.bg,
                                                        color: colorInfo.text,
                                                        borderColor: colorInfo.border
                                                      }}
                                                    >
                                                      {colorInfo.display}
                                                    </span>
                                                  </div>

                                                  {/* Observación */}
                                                  <div className="flex items-center text-sm">
                                                    <span className="text-gray-600 italic truncate" title={calificacion.observaciones || 'Sin observaciones'}>
                                                      {calificacion.observaciones || '-'}
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-center py-8">
                                          <FaExclamationTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                                          <p className="text-sm text-gray-600">
                                            No hay calificaciones registradas para esta evaluación
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  </>
                                ) : (
                                  <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                  </div>
                                )}

                                {/* Información adicional de la evaluación */}
                                {evaluacion.requiereEntrega && (
                                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center text-sm text-blue-800">
                                      <FaFileAlt className="w-4 h-4 mr-2" />
                                      <span className="font-semibold">Requiere entrega de archivo</span>
                                    </div>
                                    {evaluacion.fechaLimiteEntrega && (
                                      <div className="flex items-center text-xs text-blue-600 mt-1 ml-6">
                                        <FaClock className="w-3 h-3 mr-1" />
                                        Fecha límite: {formatDate(evaluacion.fechaLimiteEntrega)}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12">
                        <FaClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          No hay evaluaciones registradas
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          {selectedLapso || selectedSeccion 
                            ? 'Intenta ajustar los filtros' 
                            : 'Aún no se han creado evaluaciones para esta materia'}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Vista de Estadísticas */}
                {activeView === 'estadisticas' && (
                  <div className="space-y-6">
                    {evaluaciones.length > 0 ? (
                      <>
                        {/* Resumen general */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div 
                            className={`bg-gradient-to-br rounded-2xl p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-200 ${bgColor} bg-opacity-20`}
                            style={{ borderColor: iconColor }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={`text-sm font-semibold ${textColor}`}>Total Evaluaciones</p>
                                <p className={`text-4xl font-bold mt-2 ${textColor}`}>{evaluaciones.length}</p>
                              </div>
                              <div className={`p-3 rounded-xl ${bgColor} bg-opacity-30`}>
                                <FaClipboardList className="w-10 h-10" style={{ color: iconColor }} />
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-300 shadow-lg hover:shadow-xl transition-all duration-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-green-700 text-sm font-semibold">Secciones</p>
                                <p className="text-4xl font-bold text-green-900 mt-2">
                                  {secciones.length}
                                </p>
                              </div>
                              <div className="p-3 rounded-xl bg-green-200">
                                <FaUserGraduate className="w-10 h-10 text-green-700" />
                              </div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-purple-700 text-sm font-semibold">Profesores</p>
                                <p className="text-4xl font-bold text-purple-900 mt-2">
                                  {materia.profesoresAsignados?.length || 0}
                                </p>
                              </div>
                              <div className="p-3 rounded-xl bg-purple-200">
                                <FaChalkboardTeacher className="w-10 h-10 text-purple-700" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Estadísticas por lapso */}
                        <div 
                          className={`rounded-2xl border-2 p-6 shadow-lg ${bgColor} bg-opacity-5`}
                          style={{ borderColor: iconColor }}
                        >
                          <h4 className={`text-lg font-bold mb-4 flex items-center ${textColor}`}>
                            <div className={`p-2 rounded-lg mr-2 ${bgColor} bg-opacity-20`}>
                              <FaChartLine className="w-5 h-5" style={{ color: iconColor }} />
                            </div>
                            Distribución por Lapso
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map((lapso) => {
                              const evalLapso = evaluaciones.filter(e => e.lapso === lapso);
                              const porcentajeTotal = evalLapso.reduce((sum, e) => sum + e.porcentaje, 0);
                              
                              return (
                                <div 
                                  key={lapso}
                                  className={`p-4 rounded-xl border-2 ${
                                    lapso === 1 ? 'bg-blue-50 border-blue-200' :
                                    lapso === 2 ? 'bg-green-50 border-green-200' :
                                    'bg-purple-50 border-purple-200'
                                  }`}
                                >
                                  <h5 className={`font-semibold mb-2 ${
                                    lapso === 1 ? 'text-blue-900' :
                                    lapso === 2 ? 'text-green-900' :
                                    'text-purple-900'
                                  }`}>
                                    Lapso {lapso}
                                  </h5>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Evaluaciones:</span>
                                      <span className="font-bold text-gray-900">{evalLapso.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">% Evaluado:</span>
                                      <span className="font-bold text-gray-900">{porcentajeTotal}%</span>
                                    </div>
                                    <div className="mt-2">
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full ${
                                            lapso === 1 ? 'bg-blue-500' :
                                            lapso === 2 ? 'bg-green-500' :
                                            'bg-purple-500'
                                          }`}
                                          style={{ width: `${porcentajeTotal}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Rendimiento por evaluación */}
                        <div 
                          className={`rounded-2xl border-2 p-6 shadow-lg ${bgColor} bg-opacity-5`}
                          style={{ borderColor: iconColor }}
                        >
                          <h4 className={`text-lg font-bold mb-4 flex items-center ${textColor}`}>
                            <div className={`p-2 rounded-lg mr-2 ${bgColor} bg-opacity-20`}>
                              <FaBook className="w-5 h-5" style={{ color: iconColor }} />
                            </div>
                            Rendimiento por Evaluación
                          </h4>
                          <div className="space-y-3">
                            {evaluaciones.map((evaluacion) => {
                              const stats = calcularEstadisticas(evaluacion.id);
                              if (!stats) return null;

                              return (
                                <div 
                                  key={evaluacion.id}
                                  className="p-4 bg-white rounded-xl border-2 shadow-md hover:shadow-lg transition-all duration-200"
                                  style={{ borderLeftWidth: '4px', borderLeftColor: iconColor }}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h5 className="font-semibold text-gray-900">
                                      {evaluacion.nombreEvaluacion}
                                    </h5>
                                    <span className="text-sm text-gray-500">
                                      Lapso {evaluacion.lapso}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-600">Promedio</p>
                                      <p className="text-lg font-bold text-blue-600">{stats.promedio}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Aprobados</p>
                                      <p className="text-lg font-bold text-green-600">{stats.aprobados}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Reprobados</p>
                                      <p className="text-lg font-bold text-red-600">{stats.reprobados}</p>
                                    </div>
                                    {stats.noPresentaron > 0 && (
                                      <div>
                                        <p className="text-gray-600">{stats.noPresentaron === 1 ? 'No presentó' : 'No presentaron'}</p>
                                        <p className="text-lg font-bold text-yellow-600">{stats.noPresentaron}</p>
                                      </div>
                                    )}
                                    <div>
                                      <p className="text-gray-600">% Aprobación</p>
                                      <p className="text-lg font-bold text-indigo-600">{stats.porcentajeAprobados}%</p>
                                    </div>
                                  </div>
                                  <div className="mt-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                                        style={{ width: `${stats.porcentajeAprobados}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <FaChartLine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">
                          No hay datos estadísticos disponibles
                        </p>
                        <p className="text-gray-400 text-sm mt-2">
                          Las estadísticas se mostrarán cuando haya evaluaciones registradas
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Vista de Histórico de Secciones */}
                {activeView === 'historico' && (
                  <div className="space-y-6">
                    {loadingHistorico ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : Object.keys(historicalCalificaciones).length > 0 ? (
                      <div className="space-y-4">
                        {/* Información instructiva */}
                        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
                          <div className="flex items-start">
                            <FaInfoCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                                Transferencia de Secciones
                              </h4>
                              <p className="text-sm text-blue-700">
                                Esta vista muestra los estudiantes que han sido transferidos a diferentes secciones en este año escolar, comparando sus calificaciones en la sección anterior vs. la sección actual.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Estudiantes con histórico */}
                        {Object.entries(historicalCalificaciones).map(([estudianteId, historico]) => {
                          if (!historico || !historico.calificaciones || historico.calificaciones.length === 0) {
                            return null;
                          }

                          const estudiante = historico.Personas;
                          const seccionActual = historico.seccionActual;
                          const calificacionesProcesadas = historico.calificaciones;

                          // Separar calificaciones actuales de históricas
                          const calificacionesActuales = calificacionesProcesadas.filter(c => !c.esDeSeccionAnterior);
                          const calificacionesHistoricas = calificacionesProcesadas.filter(c => c.esDeSeccionAnterior);

                          if (calificacionesHistoricas.length === 0) {
                            return null;
                          }

                          return (
                            <div 
                              key={estudianteId}
                              className={`rounded-2xl border-2 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 ${bgColor} bg-opacity-5`}
                              style={{ borderColor: iconColor }}
                            >
                              {/* Header del estudiante */}
                              <div className={`px-6 py-5 border-b-2 ${bgColor} bg-opacity-10`} style={{ borderColor: iconColor }}>
                                <div className="flex items-stretch gap-4">
                                  <div className="flex-shrink-0">
                                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg">
                                      <span className="text-white font-bold text-lg">
                                        {estudiante?.nombre?.charAt(0)}{estudiante?.apellido?.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900">
                                      {estudiante?.nombre} {estudiante?.apellido}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                                      <span className="flex items-center">
                                        <FaIdCard className="w-3.5 h-3.5 mr-1 text-blue-600" />
                                        {formatearCedula(estudiante?.cedula)}
                                      </span>
                                    </div>
                                  </div>
                                  {seccionActual && (
                                    <div className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-semibold ${bgColor} ${textColor} shadow-md whitespace-nowrap`}>
                                      <FaCheckCircle className="w-5 h-5 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs opacity-80 font-normal">Sección Actual</p>
                                        <p className="font-bold">{seccionActual.nombre}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Contenido de calificaciones */}
                              <div className="px-6 py-4">
                                {/* Calificaciones de Sección Anterior */}
                                {calificacionesHistoricas.length > 0 && (
                                  <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-yellow-300">
                                      <div className="flex items-center">
                                        <FaArrowRight className={`w-5 h-5 mr-2 text-yellow-600`} />
                                        <h5 className={`text-lg font-bold text-yellow-800`}>
                                          Calificaciones Previas (Sección Anterior)
                                        </h5>
                                      </div>
                                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                                        {calificacionesHistoricas.length} calificaciones
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-4 pl-4 border-l-4" style={{ borderColor: '#fbbf24' }}>
                                      {calificacionesHistoricas.map((calif, idx) => {
                                        const nota = parseFloat(calif.calificacion || 0);
                                        const noPresento = nota === 0;
                                        const esAprobado = nota >= 10;
                                        const colorBg = noPresento ? 'bg-yellow-50' : esAprobado ? 'bg-green-50' : 'bg-orange-50';
                                        const colorBorder = noPresento ? 'border-yellow-300' : esAprobado ? 'border-green-300' : 'border-orange-300';
                                        const colorBadge = noPresento ? 'bg-yellow-100 text-yellow-700' : esAprobado ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700';
                                        
                                        return (
                                          <div 
                                            key={idx}
                                            className={`${colorBg} rounded-xl p-4 border-2 ${colorBorder} hover:shadow-lg transition-all duration-200`}
                                          >
                                            <p className="text-xs font-bold text-gray-700 mb-2 truncate">
                                              {calif.Evaluaciones?.Materias?.asignatura || 'Materia'}
                                            </p>
                                            <p className="text-xs text-gray-600 mb-3 truncate">
                                              {calif.Evaluaciones?.nombreEvaluacion}
                                            </p>
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs font-semibold text-gray-600">
                                                Lapso {calif.Evaluaciones?.lapso}
                                              </span>
                                              <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${colorBadge}`}>
                                                {noPresento ? 'NP' : nota}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Calificaciones Actuales */}
                                {calificacionesActuales.length > 0 && (
                                  <div>
                                    <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-green-300">
                                      <div className="flex items-center">
                                        <FaCheckCircle className={`w-5 h-5 mr-2 text-green-600`} />
                                        <h5 className={`text-lg font-bold text-green-800`}>
                                          Calificaciones Actuales (Sección Actual)
                                        </h5>
                                      </div>
                                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                                        {calificacionesActuales.length} calificaciones
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-4 pl-4 border-l-4 border-green-500">
                                      {calificacionesActuales.map((calif, idx) => {
                                        const nota = parseFloat(calif.calificacion || 0);
                                        const noPresento = nota === 0;
                                        const esAprobado = nota >= 10;
                                        const colorBg = noPresento ? 'bg-yellow-50' : esAprobado ? 'bg-green-50' : 'bg-orange-50';
                                        const colorBorder = noPresento ? 'border-yellow-300' : esAprobado ? 'border-green-300' : 'border-orange-300';
                                        const colorBadge = noPresento ? 'bg-yellow-100 text-yellow-700' : esAprobado ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700';
                                        
                                        return (
                                          <div 
                                            key={idx}
                                            className={`${colorBg} rounded-xl p-4 border-2 ${colorBorder} hover:shadow-lg transition-all duration-200`}
                                          >
                                            <p className="text-xs font-bold text-gray-700 mb-2 truncate">
                                              {calif.Evaluaciones?.Materias?.asignatura || 'Materia'}
                                            </p>
                                            <p className="text-xs text-gray-600 mb-3 truncate">
                                              {calif.Evaluaciones?.nombreEvaluacion}
                                            </p>
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs font-semibold text-gray-600">
                                                Lapso {calif.Evaluaciones?.lapso}
                                              </span>
                                              <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold ${colorBadge}`}>
                                                {noPresento ? 'NP' : nota}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Si no hay datos */}
                        {Object.entries(historicalCalificaciones).filter(([_, h]) => 
                          h && h.calificaciones && h.calificaciones.some(c => c.esDeSeccionAnterior)
                        ).length === 0 && (
                          <div className="text-center py-12">
                            <FaCheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg font-medium">
                              No hay registros de transferencia de secciones
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                              Todos los estudiantes han permanecido en la misma sección desde el inicio del año escolar
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-500 text-lg font-medium">
                          Cargando transferencias de secciones...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className={`flex-shrink-0 px-6 py-4 border-t-2 ${bgColor} bg-opacity-10`} style={{ borderColor: iconColor }}>
            <div className="flex justify-between items-center">
              <p className={`text-sm font-medium ${textColor}`}>
                <Icon className="inline-block w-4 h-4 mr-2" style={{ color: iconColor }} />
                {materia.asignatura}
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-white"
                style={{ 
                  backgroundColor: iconColor,
                  filter: 'brightness(0.95) saturate(1.1)'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MateriaDetailModal;