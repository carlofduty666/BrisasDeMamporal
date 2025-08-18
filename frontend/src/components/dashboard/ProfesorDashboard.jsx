import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUsers, 
  FaClipboardList, 
  FaBook, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaGraduationCap,
  FaTasks,
  FaChartBar,
  FaTimes,
  FaSave,
  FaSpinner,
  FaFileAlt,
  FaUserCheck,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaUpload,
  FaComment,
  FaPaperclip,
  FaSearch,
  FaFilter
} from 'react-icons/fa';
import ClasesActuales from '../ClasesActuales';

const ProfesorDashboard = () => {
  const navigate = useNavigate();
  
  // Estilos de animación inline
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideInDown {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes scaleIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
      .animate-slideInDown { animation: slideInDown 0.3s ease-out; }
      .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Datos del profesor
  const [profesor, setProfesor] = useState(null);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  
  // Datos para resumen
  const [resumenData, setResumenData] = useState({
    totalEstudiantes: 0,
    totalEvaluaciones: 0,
    totalMaterias: 0,
    evaluacionesPendientes: 0
  });

  // Datos de estadísticas
  const [estadisticas, setEstadisticas] = useState({
    estadisticasGenerales: {
      totalEvaluaciones: 0,
      totalCalificaciones: 0,
      promedioGeneral: 0,
      evaluacionesPendientes: 0
    },
    estadisticasPorMateria: []
  });
  
  const [promediosEstudiantes, setPromediosEstudiantes] = useState([]);
  
  // Datos académicos
  const [grados, setGrados] = useState([]);
  const [materiasResumen, setMateriasResumen] = useState([]);
  const [estudiantesRecientes, setEstudiantesRecientes] = useState([]);
  const [evaluacionesRecientes, setEvaluacionesRecientes] = useState([]);
  
  // Estados para modales
  const [showEvaluacionModal, setShowEvaluacionModal] = useState(false);
  const [showCalificacionModal, setShowCalificacionModal] = useState(false);
  const [showEstudiantesModal, setShowEstudiantesModal] = useState(false);
  const [showEvaluacionesModal, setShowEvaluacionesModal] = useState(false);
  const [showCalificarModal, setShowCalificarModal] = useState(false);
  const [showEstadisticasModal, setShowEstadisticasModal] = useState(false);
  const [showPromediosModal, setShowPromediosModal] = useState(false);
  const [showEditarEvaluacionModal, setShowEditarEvaluacionModal] = useState(false);
  const [showEntregasModal, setShowEntregasModal] = useState(false);
  
  // Estados para selecciones
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [selectedGrado, setSelectedGrado] = useState(null);
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);
  
  // Estados para datos de modales
  const [estudiantesModal, setEstudiantesModal] = useState([]);
  const [evaluacionesModal, setEvaluacionesModal] = useState([]);
  const [materiasModal, setMateriasModal] = useState([]);
  const [seccionesModal, setSeccionesModal] = useState([]);
  const [calificacionesModal, setCalificacionesModal] = useState([]);
  const [gradosModal, setGradosModal] = useState([]);
  const [seccionesModalFiltro, setSeccionesModalFiltro] = useState([]);
  const [entregasModal, setEntregasModal] = useState([]);
  
  // Estados para filtros de modales
  const [filtroGradoEstudiantes, setFiltroGradoEstudiantes] = useState('');
  const [filtroSeccionEstudiantes, setFiltroSeccionEstudiantes] = useState('');
  const [filtroGradoEvaluaciones, setFiltroGradoEvaluaciones] = useState('');
  const [filtroMateriaEvaluaciones, setFiltroMateriaEvaluaciones] = useState('');
  const [filtroSeccionEvaluaciones, setFiltroSeccionEvaluaciones] = useState('');
  
  // Estados para filtros del modal de promedios
  const [filtroGradoPromedios, setFiltroGradoPromedios] = useState('');
  const [filtroSeccionPromedios, setFiltroSeccionPromedios] = useState('');
  const [filtroMateriaPromedios, setFiltroMateriaPromedios] = useState('');
  const [busquedaPromedios, setBusquedaPromedios] = useState('');
  const [seccionesPromedios, setSeccionesPromedios] = useState([]);
  const [promediosCompletos, setPromediosCompletos] = useState([]);
  const [promediosFiltrados, setPromediosFiltrados] = useState([]);
  
  // Estados para formularios
  const [evaluacionForm, setEvaluacionForm] = useState({
    nombreEvaluacion: '',
    descripcion: '',
    tipoEvaluacion: 'Examen',
    fechaEvaluacion: '',
    materiaID: '',
    gradoID: '',
    seccionID: '',
    porcentaje: '',
    lapso: '1',
    requiereEntrega: true, // Por defecto true
    fechaLimiteEntrega: ''
  });

  // Estado para archivos
  const [selectedFile, setSelectedFile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [evaluacionToEdit, setEvaluacionToEdit] = useState(null);
  
  // Estados de carga
  const [savingEvaluacion, setSavingEvaluacion] = useState(false);
  const [savingCalificacion, setSavingCalificacion] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  
  // Estado para expandir progreso de estudiantes
  const [estudianteExpandido, setEstudianteExpandido] = useState(null);
  const [progresoEstudiante, setProgresoEstudiante] = useState({});

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
        
        const userData = JSON.parse(atob(token.split('.')[1]));
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        // Cargar datos del profesor
        const profesorResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/${userData.personaID}`,
          config
        );
        setProfesor(profesorResponse.data);
        
        // Cargar año escolar activo
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          config
        );
        setAnnoEscolar(annoResponse.data);
        
        // Cargar datos de resumen
        await cargarResumenData(userData.personaID, annoResponse.data.id, config);
        
        // Cargar estadísticas
        await cargarEstadisticas(userData.personaID, annoResponse.data.id, config);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  const cargarResumenData = async (profesorID, annoEscolarID, config) => {
    try {
      // Cargar grados donde enseña el profesor
      const gradosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/grados/profesor/${profesorID}?annoEscolarID=${annoEscolarID}`,
        config
      );
      setGrados(gradosResponse.data);
      
      // Cargar materias del profesor
      const materiasResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/materias/profesor/${profesorID}?annoEscolarID=${annoEscolarID}`,
        config
      );
      setMateriasResumen(materiasResponse.data);
      
      // Cargar estudiantes recientes
      const estudiantesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/personas/profesor/${profesorID}/estudiantes?annoEscolarID=${annoEscolarID}`,
        config
      );
      setEstudiantesRecientes(estudiantesResponse.data.slice(0, 5));
      
      // Cargar evaluaciones del profesor
      const evaluacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesorID}`,
        config
      );
      
      // Ordenar por fecha de creación desc para mostrar las más recientes
      const evaluacionesOrdenadas = evaluacionesResponse.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setEvaluacionesRecientes(evaluacionesOrdenadas.slice(0, 5));
      
      // Calcular resumen
      const totalEstudiantes = estudiantesResponse.data.length;
      const totalEvaluaciones = evaluacionesResponse.data.length;
      const totalMaterias = materiasResponse.data.length;
      const evaluacionesPendientes = evaluacionesResponse.data.filter(e => {
        const fechaEval = new Date(e.fechaEvaluacion);
        const hoy = new Date();
        return fechaEval <= hoy && !e.calificada;
      }).length;
      
      setResumenData({
        totalEstudiantes,
        totalEvaluaciones,
        totalMaterias,
        evaluacionesPendientes
      });
      
    } catch (err) {
      console.error('Error al cargar resumen:', err);
    }
  };

  const cargarEstadisticas = async (profesorID, annoEscolarID, config) => {
    try {
      // Cargar estadísticas generales
      const estadisticasResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/estadisticas/profesor/${profesorID}?annoEscolarID=${annoEscolarID}`,
        config
      );
      setEstadisticas(estadisticasResponse.data);

      // Cargar promedios de estudiantes
      const promediosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/promedios/estudiantes/${profesorID}?annoEscolarID=${annoEscolarID}`,
        config
      );
      setPromediosEstudiantes(promediosResponse.data.slice(0, 10)); // Solo los primeros 10
      
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  // FUNCIONES PARA MODAL DE ESTUDIANTES

  // Mostrar todos los estudiantes con filtros
  const handleVerTodosEstudiantes = async () => {
    setLoadingModal(true);
    setShowEstudiantesModal(true);
    setSelectedMateria(null);
    setSelectedGrado(null);
    setFiltroGradoEstudiantes('');
    setFiltroSeccionEstudiantes('');
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // Cargar todos los estudiantes del profesor
      const estudiantesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/personas/profesor/${profesor.id}/estudiantes?annoEscolarID=${annoEscolar.id}`,
        config
      );
      
      setEstudiantesModal(estudiantesResponse.data);
      setGradosModal(grados);
      
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
      setError('Error al cargar estudiantes');
    }
    
    setLoadingModal(false);
  };

  // Mostrar estudiantes de una materia específica
  const handleVerEstudiantesMateria = async (materia) => {
    setLoadingModal(true);
    setShowEstudiantesModal(true);
    setSelectedMateria(materia);
    setFiltroGradoEstudiantes('');
    setFiltroSeccionEstudiantes('');
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // Cargar estudiantes que tienen esta materia
      const estudiantesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/personas/profesor/${profesor.id}/estudiantes?annoEscolarID=${annoEscolar.id}`,
        config
      );
      
      setEstudiantesModal(estudiantesResponse.data);
      setGradosModal(grados);
      
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
      setError('Error al cargar estudiantes');
    }
    
    setLoadingModal(false);
  };

  // Filtrar estudiantes por grado
  const handleFiltroGradoEstudiantes = async (gradoID) => {
    setFiltroGradoEstudiantes(gradoID);
    setFiltroSeccionEstudiantes('');
    
    if (gradoID) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        // Cargar secciones del grado
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/secciones/grado/${gradoID}`,
          config
        );
        setSeccionesModalFiltro(seccionesResponse.data);
        
        // Cargar estudiantes del grado
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/grados/${gradoID}/estudiantes?annoEscolarID=${annoEscolar.id}`,
          config
        );
        setEstudiantesModal(estudiantesResponse.data);
        
      } catch (err) {
        console.error('Error al filtrar estudiantes:', err);
        setError('Error al filtrar estudiantes');
      }
    } else {
      // Mostrar todos los estudiantes
      handleVerTodosEstudiantes();
    }
  };

  // Filtrar estudiantes por sección
  const handleFiltroSeccionEstudiantes = async (seccionID) => {
    setFiltroSeccionEstudiantes(seccionID);
    
    if (filtroGradoEstudiantes) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        let url = `${import.meta.env.VITE_API_URL}/grados/${filtroGradoEstudiantes}/estudiantes?annoEscolarID=${annoEscolar.id}`;
        
        // Si hay sección específica, agregarla a la URL
        if (seccionID) {
          url += `&seccionID=${seccionID}`;
        }
        
        // Cargar estudiantes
        const estudiantesResponse = await axios.get(url, config);
        setEstudiantesModal(estudiantesResponse.data);
        
      } catch (err) {
        console.error('Error al filtrar por sección:', err);
        setError('Error al filtrar por sección');
      }
    }
  };

  // Ver progreso de un estudiante
  const handleVerProgresoEstudiante = async (estudiante) => {
    if (estudianteExpandido === estudiante.id) {
      setEstudianteExpandido(null);
      return;
    }
    
    setEstudianteExpandido(estudiante.id);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // Cargar evaluaciones y calificaciones del estudiante
      const evaluacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesor.id}`,
        config
      );
      
      const calificacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/calificaciones/estudiante/${estudiante.id}?annoEscolarID=${annoEscolar.id}`,
        config
      );
      
      const evaluaciones = evaluacionesResponse.data;
      const calificaciones = calificacionesResponse.data;
      
      // Combinar evaluaciones con calificaciones
      const progreso = evaluaciones.map(evaluacion => {
        const calificacion = calificaciones.find(c => c.evaluacionID === evaluacion.id);
        return {
          ...evaluacion,
          calificacion: calificacion ? calificacion.calificacion : null,
          observaciones: calificacion ? calificacion.observaciones : '',
          calificacionID: calificacion ? calificacion.id : null
        };
      });
      
      setProgresoEstudiante(prev => ({
        ...prev,
        [estudiante.id]: progreso
      }));
      
    } catch (err) {
      console.error('Error al cargar progreso:', err);
      setError('Error al cargar el progreso del estudiante');
    }
  };

  // FUNCIONES PARA MODAL DE EVALUACIONES

  // Mostrar todas las evaluaciones con filtros
  const handleVerTodasEvaluaciones = async () => {
    setLoadingModal(true);
    setShowEvaluacionesModal(true);
    setSelectedMateria(null);
    setFiltroGradoEvaluaciones('');
    setFiltroMateriaEvaluaciones('');
    setFiltroSeccionEvaluaciones('');
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // Cargar todas las evaluaciones del profesor
      const evaluacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesor.id}`,
        config
      );
      
      setEvaluacionesModal(evaluacionesResponse.data);
      setMateriasModal(materiasResumen);
      setGradosModal(grados);
      
    } catch (err) {
      console.error('Error al cargar evaluaciones:', err);
      setError('Error al cargar evaluaciones');
    }
    
    setLoadingModal(false);
  };

  // Filtrar evaluaciones por grado
  const handleFiltroGradoEvaluaciones = async (gradoID) => {
    setFiltroGradoEvaluaciones(gradoID);
    setFiltroSeccionEvaluaciones('');
    
    if (gradoID) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        // Cargar secciones del grado
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/secciones/grado/${gradoID}`,
          config
        );
        setSeccionesModal(seccionesResponse.data);
        
        // Filtrar evaluaciones
        const evaluacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesor.id}`,
          config
        );
        
        let evaluacionesFiltradas = evaluacionesResponse.data.filter(e => e.gradoID == gradoID);
        
        // Si hay materia seleccionada, aplicar ese filtro también
        if (filtroMateriaEvaluaciones) {
          evaluacionesFiltradas = evaluacionesFiltradas.filter(e => e.materiaID == filtroMateriaEvaluaciones);
        }
        
        setEvaluacionesModal(evaluacionesFiltradas);
        
      } catch (err) {
        console.error('Error al filtrar evaluaciones por grado:', err);
        setError('Error al filtrar evaluaciones');
      }
    } else {
      // Resetear secciones y mostrar todas las evaluaciones
      setSeccionesModal([]);
      if (selectedMateria) {
        await handleVerEvaluacionesMateria(selectedMateria);
      } else {
        await handleVerTodasEvaluaciones();
      }
    }
  };

  // Filtrar evaluaciones por sección
  const handleFiltroSeccionEvaluaciones = async (seccionID) => {
    setFiltroSeccionEvaluaciones(seccionID);
    
    if (seccionID && filtroGradoEvaluaciones) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        const evaluacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesor.id}`,
          config
        );
        
        let evaluacionesFiltradas = evaluacionesResponse.data.filter(e => 
          e.gradoID == filtroGradoEvaluaciones && e.seccionID == seccionID
        );
        
        // Si hay materia seleccionada, aplicar ese filtro también
        if (filtroMateriaEvaluaciones) {
          evaluacionesFiltradas = evaluacionesFiltradas.filter(e => e.materiaID == filtroMateriaEvaluaciones);
        }
        
        setEvaluacionesModal(evaluacionesFiltradas);
        
      } catch (err) {
        console.error('Error al filtrar por sección:', err);
        setError('Error al filtrar por sección');
      }
    }
  };

  // Filtrar evaluaciones por materia
  const handleFiltroMateriaEvaluaciones = async (materiaID) => {
    setFiltroMateriaEvaluaciones(materiaID);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const evaluacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesor.id}`,
        config
      );
      
      let evaluacionesFiltradas = evaluacionesResponse.data;
      
      // Aplicar filtros
      if (materiaID) {
        evaluacionesFiltradas = evaluacionesFiltradas.filter(e => e.materiaID == materiaID);
      }
      if (filtroGradoEvaluaciones) {
        evaluacionesFiltradas = evaluacionesFiltradas.filter(e => e.gradoID == filtroGradoEvaluaciones);
      }
      if (filtroSeccionEvaluaciones) {
        evaluacionesFiltradas = evaluacionesFiltradas.filter(e => e.seccionID == filtroSeccionEvaluaciones);
      }
      
      setEvaluacionesModal(evaluacionesFiltradas);
      
    } catch (err) {
      console.error('Error al filtrar por materia:', err);
      setError('Error al filtrar por materia');
    }
  };

  // Mostrar evaluaciones de una materia
  const handleVerEvaluacionesMateria = async (materia) => {
    setLoadingModal(true);
    setShowEvaluacionesModal(true);
    setSelectedMateria(materia);
    setFiltroMateriaEvaluaciones(materia.id);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // Cargar evaluaciones de la materia
      const evaluacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluaciones/filtradas?profesorID=${profesor.id}&materiaID=${materia.id}`,
        config
      );
      
      setEvaluacionesModal(evaluacionesResponse.data);
      
    } catch (err) {
      console.error('Error al cargar evaluaciones:', err);
      setError('Error al cargar evaluaciones');
    }
    
    setLoadingModal(false);
  };

  // FUNCIONES PARA MODAL DE CALIFICAR

  // Mostrar modal para seleccionar evaluación a calificar
  const handleMostrarCalificar = async () => {
    setLoadingModal(true);
    setShowCalificarModal(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // Cargar evaluaciones pendientes de calificar
      const evaluacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesor.id}`,
        config
      );
      
      setEvaluacionesModal(evaluacionesResponse.data);
      
    } catch (err) {
      console.error('Error al cargar evaluaciones:', err);
      setError('Error al cargar evaluaciones para calificar');
    }
    
    setLoadingModal(false);
  };

  // Calificar una evaluación específica
  const handleCalificarEvaluacion = async (evaluacion) => {
    setLoadingModal(true);
    setSelectedEvaluacion(evaluacion);
    setShowCalificarModal(false);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // Cargar estudiantes del grado y sección
      const estudiantesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/grados/${evaluacion.gradoID}/estudiantes?annoEscolarID=${annoEscolar.id}`,
        config
      );
      
      // Cargar calificaciones existentes
      const calificacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/calificaciones/evaluacion/${evaluacion.id}`,
        config
      );
      
      const estudiantes = estudiantesResponse.data;
      const calificaciones = calificacionesResponse.data;
      
      // Combinar estudiantes con sus calificaciones
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
      setShowCalificacionModal(true);
      
    } catch (err) {
      console.error('Error al cargar datos para calificar:', err);
      setError('Error al cargar datos para calificar');
    }
    
    setLoadingModal(false);
  };

  // Guardar calificación individual
  const handleGuardarCalificacion = async (estudiante, calificacion, observaciones) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      if (estudiante.calificacionID) {
        // Actualizar calificación existente
        await axios.put(
          `${import.meta.env.VITE_API_URL}/calificaciones/${estudiante.calificacionID}`,
          { calificacion, observaciones },
          config
        );
      } else {
        // Crear nueva calificación
        await axios.post(
          `${import.meta.env.VITE_API_URL}/calificaciones`,
          {
            evaluacionID: selectedEvaluacion.id,
            personaID: estudiante.id,
            calificacion,
            observaciones,
            annoEscolarID: annoEscolar.id
          },
          config
        );
      }
      
      // Actualizar la lista local
      setCalificacionesModal(prev => prev.map(est => 
        est.id === estudiante.id 
          ? { ...est, calificacion, observaciones }
          : est
      ));
      
      setSuccess('Calificación guardada correctamente');
      setTimeout(() => setSuccess(''), 3000);
      
      // Recargar datos del resumen
      await cargarResumenData(profesor.id, annoEscolar.id, { headers: { 'Authorization': `Bearer ${token}` } });
      
    } catch (err) {
      console.error('Error al guardar calificación:', err);
      setError('Error al guardar la calificación');
      setTimeout(() => setError(''), 3000);
    }
  };

  // FUNCIONES PARA CREAR EVALUACIÓN

  // FUNCIONES PARA ESTADÍSTICAS Y PROMEDIOS

  // Mostrar modal de estadísticas
  const handleVerEstadisticas = () => {
    setShowEstadisticasModal(true);
  };

  // Mostrar modal de promedios
  const handleVerPromedios = async () => {
    // Validar que tengamos los datos necesarios
    if (!profesor || !annoEscolar) {
      setError('Datos del profesor o año escolar no disponibles');
      return;
    }

    setLoadingModal(true);
    setShowPromediosModal(true);
    
    // Resetear filtros
    setFiltroGradoPromedios('');
    setFiltroSeccionPromedios('');
    setFiltroMateriaPromedios('');
    setBusquedaPromedios('');
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // Cargar grados del profesor para los filtros
      const gradosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/grados/profesor/${profesor.id}?annoEscolarID=${annoEscolar.id}`,
        config
      );
      setGradosModal(gradosResponse.data);
      
      // Cargar materias del profesor para los filtros
      const materiasResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/materias/profesor/${profesor.id}?annoEscolarID=${annoEscolar.id}`,
        config
      );
      setMateriasModal(materiasResponse.data);
      
      // Cargar promedios de estudiantes (usando la ruta que funciona)
      const promediosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/promedios/estudiantes/${profesor.id}?annoEscolarID=${annoEscolar.id}`,
        config
      );
      
      const datosCompletos = promediosResponse.data;
      
      // Log temporal para verificar que llegue la información de grado/sección
      if (datosCompletos.length > 0) {
        console.log('Ejemplo de estudiante con grado/sección:', {
          nombre: datosCompletos[0].nombre,
          gradoID: datosCompletos[0].gradoID,
          grado: datosCompletos[0].grado,
          seccionID: datosCompletos[0].seccionID,
          seccion: datosCompletos[0].seccion
        });
      }
      
      setPromediosCompletos(datosCompletos);
      setPromediosFiltrados(datosCompletos); // Mostrar todos por defecto
      setPromediosEstudiantes(datosCompletos.slice(0, 10)); // Para la vista principal
      
    } catch (err) {
      console.error('Error al cargar promedios:', err);
      setError(`Error al cargar promedios: ${err.message}`);
    }
    
    setLoadingModal(false);
  };

  // Filtros del modal de promedios
  const handleFiltroGradoPromedios = async (gradoID) => {
    setFiltroGradoPromedios(gradoID);
    setFiltroSeccionPromedios('');
    
    if (gradoID) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        // Cargar secciones del grado seleccionado
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/secciones/grado/${gradoID}`,
          config
        );
        setSeccionesPromedios(seccionesResponse.data);
        
      } catch (err) {
        console.error('Error al cargar secciones:', err);
      }
    } else {
      setSeccionesPromedios([]);
    }
    
    aplicarFiltrosPromedios(gradoID, filtroSeccionPromedios, filtroMateriaPromedios, busquedaPromedios);
  };

  const handleFiltroSeccionPromedios = (seccionID) => {
    setFiltroSeccionPromedios(seccionID);
    aplicarFiltrosPromedios(filtroGradoPromedios, seccionID, filtroMateriaPromedios, busquedaPromedios);
  };

  const handleFiltroMateriaPromedios = (materiaID) => {
    setFiltroMateriaPromedios(materiaID);
    aplicarFiltrosPromedios(filtroGradoPromedios, filtroSeccionPromedios, materiaID, busquedaPromedios);
  };

  const handleBusquedaPromedios = (texto) => {
    setBusquedaPromedios(texto);
    aplicarFiltrosPromedios(filtroGradoPromedios, filtroSeccionPromedios, filtroMateriaPromedios, texto);
  };

  const aplicarFiltrosPromedios = (gradoID, seccionID, materiaID, busqueda) => {
    let datosFiltrados = [...promediosCompletos];
    
    console.log('Aplicando filtros:', { gradoID, seccionID, materiaID, busqueda });
    console.log('Total estudiantes iniciales:', datosFiltrados.length);
    
    // Filtrar por grado
    if (gradoID) {
      const antesGrado = datosFiltrados.length;
      datosFiltrados = datosFiltrados.filter(estudiante => 
        estudiante.gradoID === parseInt(gradoID)
      );
      console.log(`Filtro por grado ${gradoID}: ${antesGrado} → ${datosFiltrados.length}`);
    }
    
    // Filtrar por sección
    if (seccionID) {
      const antesSeccion = datosFiltrados.length;
      datosFiltrados = datosFiltrados.filter(estudiante => 
        estudiante.seccionID === parseInt(seccionID)
      );
      console.log(`Filtro por sección ${seccionID}: ${antesSeccion} → ${datosFiltrados.length}`);
    }
    
    // Filtrar por materia (usar el nombre de materia)
    if (materiaID) {
      // Buscar la materia por ID en materiasModal para obtener el nombre
      const materiaSeleccionada = materiasModal.find(m => m.id === parseInt(materiaID));
      const nombreMateria = materiaSeleccionada?.asignatura;
      
      if (nombreMateria) {
        datosFiltrados = datosFiltrados.filter(estudiante => {
          // Verificar si el estudiante tiene la materia en su objeto materias
          return estudiante.materias && estudiante.materias[nombreMateria];
        });
      }
    }
    
    // Filtrar por búsqueda (nombre, apellido, cédula)
    if (busqueda && busqueda.trim()) {
      const antesBusqueda = datosFiltrados.length;
      const busquedaLower = busqueda.toLowerCase().trim();
      datosFiltrados = datosFiltrados.filter(estudiante => 
        estudiante.nombre.toLowerCase().includes(busquedaLower) ||
        estudiante.apellido.toLowerCase().includes(busquedaLower) ||
        estudiante.cedula.toString().includes(busquedaLower)
      );
      console.log(`Filtro por búsqueda "${busqueda}": ${antesBusqueda} → ${datosFiltrados.length}`);
    }
    
    console.log('Resultado final de filtros:', datosFiltrados.length, 'estudiantes');
    setPromediosFiltrados(datosFiltrados);
  };

  // FUNCIONES PARA CREAR/EDITAR EVALUACIÓN

  // Cerrar modal de evaluación y resetear estado
  const handleCerrarModalEvaluacion = () => {
    setShowEvaluacionModal(false);
    setIsEditMode(false);
    setEvaluacionToEdit(null);
    setSelectedFile(null);
    setEvaluacionForm({
      nombreEvaluacion: '',
      descripcion: '',
      tipoEvaluacion: 'Examen',
      fechaEvaluacion: '',
      materiaID: '',
      gradoID: '',
      seccionID: '',
      porcentaje: '',
      lapso: '1',
      requiereEntrega: true,
      fechaLimiteEntrega: ''
    });
    setMateriasModal([]);
    setSeccionesModal([]);
  };

  // Crear nueva evaluación
  const handleNuevaEvaluacion = () => {
    setIsEditMode(false);
    setEvaluacionToEdit(null);
    setSelectedFile(null);
    setEvaluacionForm({
      nombreEvaluacion: '',
      descripcion: '',
      tipoEvaluacion: 'Examen',
      fechaEvaluacion: '',
      materiaID: '',
      gradoID: '',
      seccionID: '',
      porcentaje: '',
      lapso: '1',
      requiereEntrega: true,
      fechaLimiteEntrega: ''
    });
    setMateriasModal([]);
    setSeccionesModal([]);
    setShowEvaluacionModal(true);
  };

  // Editar evaluación existente
  const handleEditarEvaluacion = async (evaluacion) => {
    setIsEditMode(true);
    setEvaluacionToEdit(evaluacion);
    setSelectedFile(null);
    
    // Cargar materias del grado
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const materiasResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/materias/profesor/${profesor.id}/grado/${evaluacion.gradoID}?annoEscolarID=${annoEscolar.id}`,
        config
      );
      setMateriasModal(materiasResponse.data);
      
      const seccionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/secciones/grado/${evaluacion.gradoID}`,
        config
      );
      setSeccionesModal(seccionesResponse.data);
      
    } catch (err) {
      console.error('Error al cargar datos para editar:', err);
    }
    
    setEvaluacionForm({
      nombreEvaluacion: evaluacion.nombreEvaluacion,
      descripcion: evaluacion.descripcion || '',
      tipoEvaluacion: evaluacion.tipoEvaluacion,
      fechaEvaluacion: evaluacion.fechaEvaluacion ? evaluacion.fechaEvaluacion.split('T')[0] : '',
      materiaID: evaluacion.materiaID,
      gradoID: evaluacion.gradoID,
      seccionID: evaluacion.seccionID,
      porcentaje: evaluacion.porcentaje,
      lapso: evaluacion.lapso,
      requiereEntrega: evaluacion.requiereEntrega,
      fechaLimiteEntrega: evaluacion.fechaLimiteEntrega ? evaluacion.fechaLimiteEntrega.split('T')[0] : ''
    });
    
    setShowEvaluacionModal(true);
  };

  // Cargar materias cuando se selecciona un grado
  const handleGradoChangeEvaluacion = async (e) => {
    const gradoID = e.target.value;
    setEvaluacionForm({ ...evaluacionForm, gradoID, materiaID: '', seccionID: '' });
    
    if (gradoID) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        // Cargar materias que el profesor imparte en este grado
        const materiasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/materias/profesor/${profesor.id}/grado/${gradoID}?annoEscolarID=${annoEscolar.id}`,
          config
        );
        setMateriasModal(materiasResponse.data);
        
        // Cargar secciones del grado
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/secciones/grado/${gradoID}`,
          config
        );
        setSeccionesModal(seccionesResponse.data);
        
      } catch (err) {
        console.error('Error al cargar materias/secciones:', err);
        setError('Error al cargar las opciones disponibles');
      }
    } else {
      setMateriasModal([]);
      setSeccionesModal([]);
    }
  };

  // Descargar archivo de evaluación del profesor
  const handleDescargarArchivo = async (evaluacionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluaciones/descargar/${evaluacionId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener nombre del archivo del header
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'archivo';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error al descargar archivo:', err);
      setError('Error al descargar el archivo');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Ver entregas de estudiantes para una evaluación
  const handleVerEntregas = async (evaluacion) => {
    setLoadingModal(true);
    setShowEntregasModal(true);
    setSelectedEvaluacion(evaluacion);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const entregasResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/archivos-evaluaciones/entregas/${evaluacion.id}`,
        config
      );
      
      setEntregasModal(entregasResponse.data);
      
    } catch (err) {
      console.error('Error al cargar entregas:', err);
      setError('Error al cargar entregas de estudiantes');
    }
    
    setLoadingModal(false);
  };

  // Descargar archivo de entrega de estudiante
  const handleDescargarArchivoEntrega = async (archivoId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/archivos-evaluaciones/descargar/${archivoId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Obtener nombre del archivo del header
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'archivo_estudiante';
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error al descargar archivo:', err);
      setError('Error al descargar el archivo del estudiante');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Calificar entrega desde el modal de entregas
  const handleCalificarEntrega = async (estudianteId, calificacion, observaciones) => {
    if (!calificacion || calificacion < 0 || calificacion > 20) {
      setError('La calificación debe estar entre 0 y 20');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const calificacionData = {
        calificacion: parseFloat(calificacion),
        evaluacionID: selectedEvaluacion.id,
        personaID: estudianteId,
        annoEscolarID: annoEscolar.id,
        observaciones
      };

      // Verificar si ya existe una calificación
      const existingCalificacion = await axios.get(
        `${import.meta.env.VITE_API_URL}/calificaciones/estudiante/${estudianteId}/evaluacion/${selectedEvaluacion.id}`,
        config
      ).catch(() => null);

      if (existingCalificacion?.data) {
        // Actualizar calificación existente
        await axios.put(
          `${import.meta.env.VITE_API_URL}/calificaciones/${existingCalificacion.data.id}`,
          calificacionData,
          config
        );
      } else {
        // Crear nueva calificación
        await axios.post(
          `${import.meta.env.VITE_API_URL}/calificaciones`,
          calificacionData,
          config
        );
      }

      setSuccess('Calificación guardada correctamente');
      setTimeout(() => setSuccess(''), 3000);
      
      // Recargar las entregas para ver los cambios
      await handleVerEntregas(selectedEvaluacion);
      
    } catch (err) {
      console.error('Error al calificar entrega:', err);
      setError('Error al guardar la calificación');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Eliminar una evaluación
  const handleEliminarEvaluacion = async (evaluacion) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // Primero intentar eliminar directamente
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/evaluaciones/${evaluacion.id}`,
        config
      );
      
      setSuccess(`Evaluación "${evaluacion.nombreEvaluacion}" eliminada correctamente`);
      setTimeout(() => setSuccess(''), 3000);
      
      // Recargar datos
      const configJson = { headers: { 'Authorization': `Bearer ${token}` } };
      await cargarResumenData(profesor.id, annoEscolar.id, configJson);
      await cargarEstadisticas(profesor.id, annoEscolar.id, configJson);
      
      // Si hay modales abiertos, recargar sus datos también
      if (showEvaluacionesModal) {
        if (selectedMateria) {
          await handleVerEvaluacionesMateria(selectedMateria);
        } else {
          await handleVerTodasEvaluaciones();
        }
      }
      
      // Si el modal de calificar está abierto, actualizar sus datos
      if (showCalificarModal) {
        await handleMostrarCalificar();
      }
      
    } catch (err) {
      console.error('Error al eliminar evaluación:', err);
      if (err.response?.status === 400) {
        // Si hay calificaciones, preguntar si quiere eliminarlas
        const eliminarCalificaciones = confirm(
          `La evaluación "${evaluacion.nombreEvaluacion}" tiene calificaciones registradas.\n\n¿Desea eliminar primero todas las calificaciones y luego la evaluación?\n\nEsta acción no se puede deshacer.`
        );
        
        if (eliminarCalificaciones) {
          await handleEliminarEvaluacionConCalificaciones(evaluacion);
        }
      } else {
        const errorMessage = err.response?.data?.message || 'Error al eliminar la evaluación';
        setError(errorMessage);
        setTimeout(() => setError(''), 5000);
      }
    }
  };

  // Eliminar evaluación con sus calificaciones
  const handleEliminarEvaluacionConCalificaciones = async (evaluacion) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // Obtener todas las calificaciones de la evaluación
      const calificacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/calificaciones/evaluacion/${evaluacion.id}`,
        config
      );
      
      // Eliminar cada calificación
      for (const calificacion of calificacionesResponse.data) {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/calificaciones/${calificacion.id}`,
          config
        );
      }
      
      // Ahora eliminar la evaluación
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/evaluaciones/${evaluacion.id}`,
        config
      );
      
      setSuccess(`Evaluación "${evaluacion.nombreEvaluacion}" y sus calificaciones eliminadas correctamente`);
      setTimeout(() => setSuccess(''), 3000);
      
      // Recargar datos
      const configJson = { headers: { 'Authorization': `Bearer ${token}` } };
      await cargarResumenData(profesor.id, annoEscolar.id, configJson);
      await cargarEstadisticas(profesor.id, annoEscolar.id, configJson);
      
      // Si hay modales abiertos, recargar sus datos también
      if (showEvaluacionesModal) {
        if (selectedMateria) {
          await handleVerEvaluacionesMateria(selectedMateria);
        } else {
          await handleVerTodasEvaluaciones();
        }
      }
      
      // Si el modal de calificar está abierto, actualizar sus datos
      if (showCalificarModal) {
        await handleMostrarCalificar();
      }
      
    } catch (err) {
      console.error('Error al eliminar evaluación con calificaciones:', err);
      setError('Error al eliminar la evaluación y sus calificaciones');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Eliminar una calificación individual
  const handleEliminarCalificacion = async (estudianteId, nombreEstudiante) => {
    if (!confirm(`¿Está seguro de que desea eliminar la calificación de ${nombreEstudiante}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // Buscar la calificación específica
      const calificacionResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/calificaciones/estudiante/${estudianteId}/evaluacion/${selectedEvaluacion.id}`,
        config
      );
      
      if (calificacionResponse.data) {
        // Eliminar la calificación
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/calificaciones/${calificacionResponse.data.id}`,
          config
        );
        
        setSuccess(`Calificación de ${nombreEstudiante} eliminada correctamente`);
        setTimeout(() => setSuccess(''), 3000);
        
        // Recargar las calificaciones del modal actual
        if (showCalificacionModal && selectedEvaluacion) {
          await handleCalificarEvaluacion(selectedEvaluacion);
        }
        
        // Recargar datos generales
        const configJson = { headers: { 'Authorization': `Bearer ${token}` } };
        await cargarResumenData(profesor.id, annoEscolar.id, configJson);
        await cargarEstadisticas(profesor.id, annoEscolar.id, configJson);
      }
      
    } catch (err) {
      console.error('Error al eliminar calificación:', err);
      if (err.response?.status === 404) {
        setError(`No se encontró calificación para ${nombreEstudiante}`);
      } else {
        setError('Error al eliminar la calificación');
      }
      setTimeout(() => setError(''), 5000);
    }
  };

  // Guardar evaluación (crear o editar)
  const handleGuardarEvaluacion = async (e) => {
    e.preventDefault();
    setSavingEvaluacion(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Crear FormData para manejar archivos
      const formData = new FormData();
      
      // Agregar datos del formulario
      Object.keys(evaluacionForm).forEach(key => {
        if (evaluacionForm[key] !== null && evaluacionForm[key] !== '') {
          formData.append(key, evaluacionForm[key]);
        }
      });
      
      // Agregar datos adicionales
      formData.append('profesorID', profesor.id);
      formData.append('annoEscolarID', annoEscolar.id);
      
      // Agregar archivo si existe
      if (selectedFile) {
        formData.append('archivo', selectedFile);
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };
      
      if (isEditMode && evaluacionToEdit) {
        // Actualizar evaluación existente
        await axios.put(
          `${import.meta.env.VITE_API_URL}/evaluaciones/${evaluacionToEdit.id}`,
          formData,
          config
        );
        setSuccess(`Evaluación "${evaluacionForm.nombreEvaluacion}" actualizada correctamente`);
      } else {
        // Crear nueva evaluación
        await axios.post(
          `${import.meta.env.VITE_API_URL}/evaluaciones`,
          formData,
          config
        );
        setSuccess(`Evaluación "${evaluacionForm.nombreEvaluacion}" creada correctamente`);
      }
      
      setTimeout(() => setSuccess(''), 3000);
      
      handleCerrarModalEvaluacion();
      
      // Recargar datos
      const configJson = { headers: { 'Authorization': `Bearer ${token}` } };
      await cargarResumenData(profesor.id, annoEscolar.id, configJson);
      await cargarEstadisticas(profesor.id, annoEscolar.id, configJson);
      
      // Si el modal de evaluaciones está abierto, actualizar sus datos
      if (showEvaluacionesModal) {
        if (selectedMateria) {
          await handleVerEvaluacionesMateria(selectedMateria);
        } else {
          await handleVerTodasEvaluaciones();
        }
      }
      
      // Si el modal de calificar está abierto, actualizar sus datos
      if (showCalificarModal) {
        await handleMostrarCalificar();
      }
      
    } catch (err) {
      console.error('Error al guardar evaluación:', err);
      setError(err.response?.data?.message || 'Error al guardar la evaluación');
      setTimeout(() => setError(''), 3000);
    }
    
    setSavingEvaluacion(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando panel del profesor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Bienvenido(a)</h1>
              <p className="text-slate-300 mt-1">
                {profesor?.nombre} {profesor?.apellido} • {annoEscolar?.periodo} • Aquí puede gestionar su alumnado y evaluaciones.
              </p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Mensajes */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 animate-slideInDown">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded transition-all duration-300 ease-in-out">
            {error}
          </div>
        </div>
      )}
      
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 animate-slideInDown">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded transition-all duration-300 ease-in-out">
            {success}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6 animate-fadeIn">
        {/* Componente de Clases Actuales */}
        <ClasesActuales />
        
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 animate-scaleIn">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 transition-all duration-200 ease-in-out">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900 transition-all duration-200 ease-in-out">{resumenData.totalEstudiantes}</p>
              </div>
            </div>
            <button
              onClick={handleVerTodosEstudiantes}
              className="mt-4 w-full text-sm text-blue-600 hover:text-blue-800 font-medium transition-all duration-200 ease-in-out hover:bg-blue-50 py-2 rounded"
            >
              Ver todos los estudiantes
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 animate-scaleIn">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 transition-all duration-200 ease-in-out">
                <FaTasks className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Evaluaciones</p>
                <p className="text-2xl font-bold text-gray-900 transition-all duration-200 ease-in-out">{resumenData.totalEvaluaciones}</p>
              </div>
            </div>
            <button
              onClick={handleVerTodasEvaluaciones}
              className="mt-4 w-full text-sm text-green-600 hover:text-green-800 font-medium transition-all duration-200 ease-in-out hover:bg-green-50 py-2 rounded"
            >
              Ver todas las evaluaciones
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 animate-scaleIn">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 transition-all duration-200 ease-in-out">
                <FaBook className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Calificaciones</p>
                <p className="text-2xl font-bold text-gray-900 transition-all duration-200 ease-in-out">{estadisticas.estadisticasGenerales.promedioGeneral}</p>
              </div>
            </div>
            <button
              onClick={handleVerPromedios}
              className="mt-4 w-full text-sm text-purple-600 hover:text-purple-800 font-medium transition-all duration-200 ease-in-out hover:bg-purple-50 py-2 rounded"
            >
              Ver calificaciones detalladas
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 animate-scaleIn">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 transition-all duration-200 ease-in-out">
                <FaChartBar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 transition-all duration-200 ease-in-out">{resumenData.evaluacionesPendientes}</p>
              </div>
            </div>
            <button
              onClick={handleVerEstadisticas}
              className="mt-4 w-full text-sm text-yellow-600 hover:text-yellow-800 font-medium transition-all duration-200 ease-in-out hover:bg-yellow-50 py-2 rounded"
            >
              Ver estadísticas completas
            </button>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 animate-fadeIn transition-all duration-300 ease-in-out hover:shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={handleNuevaEvaluacion}
              className="flex items-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-gray-200 transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5"
            >
              <FaPlus className="h-5 w-5 text-slate-600 mr-3" />
              <span className="text-slate-700 font-medium">Nueva Evaluación</span>
            </button>
            
            <button
              onClick={handleVerTodosEstudiantes}
              className="flex items-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-gray-200 transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5"
            >
              <FaUsers className="h-5 w-5 text-slate-600 mr-3" />
              <span className="text-slate-700 font-medium">Ver Estudiantes</span>
            </button>
            
            <button
              onClick={handleMostrarCalificar}
              className="flex items-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-gray-200 transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5"
            >
              <FaUserCheck className="h-5 w-5 text-slate-600 mr-3" />
              <span className="text-slate-700 font-medium">Calificar</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Materias que imparte */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 animate-fadeIn transition-all duration-300 ease-in-out hover:shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Mis Materias</h2>
            </div>
            <div className="p-6">
              {materiasResumen.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay materias asignadas</p>
              ) : (
                <div className="space-y-3">
                  {materiasResumen.slice(0, 5).map((materia, index) => (
                    <div 
                      key={materia.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-all duration-300 ease-in-out hover:bg-gray-100 hover:shadow-md animate-fadeIn"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center">
                        <FaBook className="h-4 w-4 text-slate-600 mr-3" />
                        <span className="font-medium text-gray-900">{materia.asignatura}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVerEstudiantesMateria(materia)}
                          className="text-sm text-blue-600 hover:text-blue-800 transition-all duration-200 ease-in-out hover:bg-blue-50 px-2 py-1 rounded"
                        >
                          Estudiantes
                        </button>
                        <button
                          onClick={() => handleVerEvaluacionesMateria(materia)}
                          className="text-sm text-green-600 hover:text-green-800 transition-all duration-200 ease-in-out hover:bg-green-50 px-2 py-1 rounded"
                        >
                          Evaluaciones
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Evaluaciones recientes */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 animate-fadeIn transition-all duration-300 ease-in-out hover:shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Evaluaciones Recientes</h2>
            </div>
            <div className="p-6">
              {evaluacionesRecientes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay evaluaciones registradas</p>
              ) : (
                <div className="space-y-3">
                  {evaluacionesRecientes.map((evaluacion, index) => (
                    <div 
                      key={evaluacion.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg transition-all duration-300 ease-in-out hover:bg-gray-100 hover:shadow-md animate-fadeIn"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{evaluacion.nombreEvaluacion}</p>
                        <p className="text-sm text-gray-500">
                          {evaluacion.Materias?.asignatura} • Lapso {evaluacion.lapso}
                        </p>
                        {evaluacion.archivoURL && (
                          <div className="flex items-center text-sm text-green-600 mt-1">
                            <FaPaperclip className="h-3 w-3 mr-1" />
                            <span>Archivo adjunto</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDescargarArchivo(evaluacion.id);
                              }}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                              title="Descargar archivo"
                            >
                              <FaDownload className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {evaluacion.requiereEntrega && (
                          <button
                            onClick={() => handleVerEntregas(evaluacion)}
                            className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5"
                            title="Ver entregas de estudiantes"
                          >
                            <FaUpload className="h-3 w-3 mr-1" />
                            Entregas
                          </button>
                        )}
                        <button
                          onClick={() => handleCalificarEvaluacion(evaluacion)}
                          className="text-sm bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5"
                        >
                          Calificar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Evaluaciones */}
      {showEvaluacionesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto animate-scaleIn transition-all duration-300 ease-in-out">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Evaluaciones
                  {selectedMateria && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      - {selectedMateria.asignatura}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setShowEvaluacionesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Filtros del modal de evaluaciones */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por Materia
                  </label>
                  <select
                    value={filtroMateriaEvaluaciones}
                    onChange={(e) => handleFiltroMateriaEvaluaciones(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                  >
                    <option value="">Todas las materias</option>
                    {materiasModal.map((materia) => (
                      <option key={materia.id} value={materia.id}>
                        {materia.asignatura}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por Grado
                  </label>
                  <select
                    value={filtroGradoEvaluaciones}
                    onChange={(e) => handleFiltroGradoEvaluaciones(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                  >
                    <option value="">Todos los grados</option>
                    {gradosModal.map((grado) => (
                      <option key={grado.id} value={grado.id}>
                        {grado.nombre_grado || grado.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por Sección
                  </label>
                  <select
                    value={filtroSeccionEvaluaciones}
                    onChange={(e) => handleFiltroSeccionEvaluaciones(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                    disabled={!filtroGradoEvaluaciones}
                  >
                    <option value="">Todas las secciones</option>
                    {seccionesModal.map((seccion) => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.nombre_seccion || seccion.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {loadingModal ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="animate-spin h-8 w-8 text-slate-600" />
                </div>
              ) : evaluacionesModal.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay evaluaciones registradas</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {evaluacionesModal.map((evaluacion, index) => (
                    <div 
                      key={evaluacion.id} 
                      className="bg-gray-50 rounded-lg p-4 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 animate-fadeIn"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
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
                        {evaluacion.requiereEntrega && (
                          <p className="text-sm text-blue-600">
                            Requiere entrega • Límite: {evaluacion.fechaLimiteEntrega 
                              ? new Date(evaluacion.fechaLimiteEntrega).toLocaleDateString() 
                              : 'No especificado'}
                          </p>
                        )}
                        {evaluacion.archivoURL && (
                          <div className="flex items-center text-sm text-green-600">
                            <FaPaperclip className="h-3 w-3 mr-1" />
                            <span>Archivo adjunto</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDescargarArchivo(evaluacion.id);
                              }}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                              title="Descargar archivo"
                            >
                              <FaDownload className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditarEvaluacion(evaluacion)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center"
                          >
                            <FaEdit className="h-3 w-3 mr-1" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleCalificarEvaluacion(evaluacion)}
                            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded text-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5"
                          >
                            Calificar
                          </button>
                        </div>
                        {evaluacion.requiereEntrega && (
                          <button
                            onClick={() => handleVerEntregas(evaluacion)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center"
                          >
                            <FaUpload className="h-3 w-3 mr-1" />
                            Ver Entregas
                          </button>
                        )}
                        <button
                          onClick={() => handleEliminarEvaluacion(evaluacion)}
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
      )}

      {/* Modal de Nueva Evaluación */}
      {showEvaluacionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto animate-scaleIn transition-all duration-300 ease-in-out">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditMode ? 'Editar Evaluación' : 'Nueva Evaluación'}
                </h2>
                <button
                  onClick={handleCerrarModalEvaluacion}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleGuardarEvaluacion} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Evaluación *
                  </label>
                  <input
                    type="text"
                    required
                    value={evaluacionForm.nombreEvaluacion}
                    onChange={(e) => setEvaluacionForm({...evaluacionForm, nombreEvaluacion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Evaluación *
                  </label>
                  <select
                    required
                    value={evaluacionForm.tipoEvaluacion}
                    onChange={(e) => setEvaluacionForm({...evaluacionForm, tipoEvaluacion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                  >
                    <option value="Examen">Examen</option>
                    <option value="Prueba">Prueba</option>
                    <option value="Tarea">Tarea</option>
                    <option value="Proyecto">Proyecto</option>
                    <option value="Participación">Participación</option>
                    <option value="Quiz">Quiz</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grado *
                  </label>
                  <select
                    required
                    value={evaluacionForm.gradoID}
                    onChange={handleGradoChangeEvaluacion}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                  >
                    <option value="">Seleccionar grado</option>
                    {grados.map(grado => (
                      <option key={grado.id} value={grado.id}>
                        {grado.nombre_grado}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Materia *
                  </label>
                  <select
                    required
                    value={evaluacionForm.materiaID}
                    onChange={(e) => setEvaluacionForm({...evaluacionForm, materiaID: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                    disabled={!evaluacionForm.gradoID}
                  >
                    <option value="">Seleccionar materia</option>
                    {materiasModal.map(materia => (
                      <option key={materia.id} value={materia.id}>
                        {materia.asignatura}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sección *
                  </label>
                  <select
                    required
                    value={evaluacionForm.seccionID}
                    onChange={(e) => setEvaluacionForm({...evaluacionForm, seccionID: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                    disabled={!evaluacionForm.gradoID}
                  >
                    <option value="">Seleccionar sección</option>
                    {seccionesModal.map(seccion => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.nombre_seccion || seccion.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Evaluación *
                  </label>
                  <input
                    type="date"
                    required
                    value={evaluacionForm.fechaEvaluacion}
                    onChange={(e) => setEvaluacionForm({...evaluacionForm, fechaEvaluacion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porcentaje *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={evaluacionForm.porcentaje}
                    onChange={(e) => setEvaluacionForm({...evaluacionForm, porcentaje: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lapso *
                  </label>
                  <select
                    required
                    value={evaluacionForm.lapso}
                    onChange={(e) => setEvaluacionForm({...evaluacionForm, lapso: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                  >
                    <option value="1">Primer Lapso</option>
                    <option value="2">Segundo Lapso</option>
                    <option value="3">Tercer Lapso</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={evaluacionForm.descripcion}
                  onChange={(e) => setEvaluacionForm({...evaluacionForm, descripcion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Evaluación
                  </label>
                  <input
                    type="date"
                    value={evaluacionForm.fechaEvaluacion}
                    onChange={(e) => setEvaluacionForm({...evaluacionForm, fechaEvaluacion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                  />
                </div>

                {evaluacionForm.requiereEntrega && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Límite de Entrega *
                    </label>
                    <input
                      type="date"
                      required={evaluacionForm.requiereEntrega}
                      value={evaluacionForm.fechaLimiteEntrega}
                      onChange={(e) => setEvaluacionForm({...evaluacionForm, fechaLimiteEntrega: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requiereEntrega"
                  checked={evaluacionForm.requiereEntrega}
                  onChange={(e) => setEvaluacionForm({...evaluacionForm, requiereEntrega: e.target.checked})}
                  className="h-4 w-4 text-slate-600 focus:ring-slate-500 border-gray-300 rounded"
                />
                <label htmlFor="requiereEntrega" className="ml-2 text-sm font-medium text-gray-700">
                  Esta evaluación requiere entrega
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Archivo adjunto (opcional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                />
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-1">
                    📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                {isEditMode && evaluacionToEdit?.archivoURL && !selectedFile && (
                  <p className="text-sm text-blue-600 mt-1">
                    📎 Archivo actual: {evaluacionToEdit.nombreArchivo}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Formatos admitidos: PDF, Word, PowerPoint, Excel, Imágenes (máx. 10MB)
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCerrarModalEvaluacion}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEvaluacion}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 ease-in-out disabled:opacity-50 flex items-center hover:shadow-md hover:-translate-y-0.5"
                >
                  {savingEvaluacion ? (
                    <>
                      <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <FaSave className="h-4 w-4 mr-2" />
                      {isEditMode ? 'Actualizar Evaluación' : 'Crear Evaluación'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Estudiantes */}
      {showEstudiantesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto animate-scaleIn transition-all duration-300 ease-in-out">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Estudiantes
                  {selectedMateria && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      - {selectedMateria.asignatura}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setShowEstudiantesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              
              {/* Filtros */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por Grado
                  </label>
                  <select
                    value={filtroGradoEstudiantes}
                    onChange={(e) => handleFiltroGradoEstudiantes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                  >
                    <option value="">Todos los grados</option>
                    {gradosModal.map(grado => (
                      <option key={grado.id} value={grado.id}>
                        {grado.nombre_grado || grado.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filtrar por Sección
                  </label>
                  <select
                    value={filtroSeccionEstudiantes}
                    onChange={(e) => handleFiltroSeccionEstudiantes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                    disabled={!filtroGradoEstudiantes}
                  >
                    <option value="">Todas las secciones</option>
                    {seccionesModalFiltro.map(seccion => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.nombre_seccion || seccion.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {loadingModal ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="animate-spin h-8 w-8 text-slate-600" />
                </div>
              ) : estudiantesModal.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay estudiantes registrados</p>
              ) : (
                <div className="space-y-4">
                  {estudiantesModal.map((estudiante, index) => (
                    <div 
                      key={estudiante.id} 
                      className="bg-gray-50 rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1 animate-fadeIn"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div 
                        className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleVerProgresoEstudiante(estudiante)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-full mr-3">
                              <FaUsers className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {estudiante.nombre} {estudiante.apellido}
                              </p>
                              <p className="text-sm text-gray-500">C.I: {estudiante.cedula}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-2">Ver progreso</span>
                            {estudianteExpandido === estudiante.id ? (
                              <FaChevronUp className="h-4 w-4 text-gray-400" />
                            ) : (
                              <FaChevronDown className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Progreso expandido */}
                      {estudianteExpandido === estudiante.id && progresoEstudiante[estudiante.id] && (
                        <div className="px-4 pb-4 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-3 mt-3">
                            Evaluaciones y Calificaciones
                          </h4>
                          <div className="space-y-2">
                            {progresoEstudiante[estudiante.id].map((evaluacion) => (
                              <div key={evaluacion.id} className="flex justify-between items-center p-2 bg-white rounded">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {evaluacion.nombreEvaluacion}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {evaluacion.Materias?.asignatura} • Lapso {evaluacion.lapso}
                                  </p>
                                </div>
                                <div className="text-right">
                                  {evaluacion.calificacion !== null ? (
                                    <div>
                                      <p className="text-sm font-bold text-green-700">
                                        {evaluacion.calificacion}/20
                                      </p>
                                      {evaluacion.observaciones && (
                                        <p className="text-xs text-gray-500">
                                          {evaluacion.observaciones}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-red-600">Sin calificar</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
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

      {/* Modal de Seleccionar Evaluación para Calificar */}
      {showCalificarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto animate-scaleIn transition-all duration-300 ease-in-out">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Seleccionar Evaluación para Calificar
                </h2>
                <button
                  onClick={() => setShowCalificarModal(false)}
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
                            onClick={() => handleEditarEvaluacion(evaluacion)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center"
                          >
                            <FaEdit className="h-3 w-3 mr-1" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleCalificarEvaluacion(evaluacion)}
                            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded text-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5"
                          >
                            Calificar
                          </button>
                        </div>
                        {evaluacion.requiereEntrega && (
                          <button
                            onClick={() => handleVerEntregas(evaluacion)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-all duration-200 ease-in-out hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center"
                          >
                            <FaUpload className="h-3 w-3 mr-1" />
                            Ver Entregas
                          </button>
                        )}
                        <button
                          onClick={() => handleEliminarEvaluacion(evaluacion)}
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
      )}

      {/* Modal de Calificaciones */}
      {showCalificacionModal && selectedEvaluacion && (
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
                  onClick={() => setShowCalificacionModal(false)}
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
                        onGuardar={handleGuardarCalificacion}
                        onEliminar={handleEliminarCalificacion}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Estadísticas */}
      {showEstadisticasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto animate-scaleIn transition-all duration-300 ease-in-out">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Estadísticas Completas</h2>
                <button
                  onClick={() => setShowEstadisticasModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Estadísticas Generales */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen General</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{estadisticas.estadisticasGenerales.totalEvaluaciones}</p>
                    <p className="text-sm text-gray-600">Total Evaluaciones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{estadisticas.estadisticasGenerales.totalCalificaciones}</p>
                    <p className="text-sm text-gray-600">Total Calificaciones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{estadisticas.estadisticasGenerales.promedioGeneral}</p>
                    <p className="text-sm text-gray-600">Promedio General</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">{estadisticas.estadisticasGenerales.evaluacionesPendientes}</p>
                    <p className="text-sm text-gray-600">Pendientes</p>
                  </div>
                </div>
              </div>

              {/* Estadísticas por Materia */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas por Materia</h3>
                {estadisticas.estadisticasPorMateria.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay datos de materias disponibles</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Materia
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Evaluaciones
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Calificaciones
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Promedio
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Pendientes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {estadisticas.estadisticasPorMateria.map((materia) => (
                          <tr key={materia.materiaID}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {materia.asignatura}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {materia.totalEvaluaciones}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {materia.totalCalificaciones}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`font-medium ${
                                materia.promedioMateria >= 14 ? 'text-green-600' :
                                materia.promedioMateria >= 10 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {materia.promedioMateria}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {materia.evaluacionesPendientes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Promedios y Calificaciones de Estudiantes */}
      {showPromediosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-screen overflow-y-auto animate-scaleIn transition-all duration-300 ease-in-out">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Calificaciones y Promedios de Estudiantes</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Visualiza todas las calificaciones y promedios de tus estudiantes
                  </p>
                </div>
                <button
                  onClick={() => setShowPromediosModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Filtros y Búsqueda */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Búsqueda */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaSearch className="inline h-3 w-3 mr-1" />
                    Buscar Estudiante
                  </label>
                  <input
                    type="text"
                    value={busquedaPromedios}
                    onChange={(e) => handleBusquedaPromedios(e.target.value)}
                    placeholder="Nombre, apellido o cédula..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                  />
                </div>
                
                {/* Filtro por Grado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaFilter className="inline h-3 w-3 mr-1" />
                    Grado
                  </label>
                  <select
                    value={filtroGradoPromedios}
                    onChange={(e) => handleFiltroGradoPromedios(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                  >
                    <option value="">Todos los grados</option>
                    {gradosModal.map((grado) => (
                      <option key={grado.id} value={grado.id}>
                        {grado.nombre_grado}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Filtro por Sección */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sección
                  </label>
                  <select
                    value={filtroSeccionPromedios}
                    onChange={(e) => handleFiltroSeccionPromedios(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                    disabled={!filtroGradoPromedios}
                  >
                    <option value="">Todas las secciones</option>
                    {seccionesPromedios.map((seccion) => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.nombre_seccion || seccion.nombreSeccion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Filtro por Materia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Materia
                  </label>
                  <select
                    value={filtroMateriaPromedios}
                    onChange={(e) => handleFiltroMateriaPromedios(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-200 ease-in-out hover:border-slate-400"
                  >
                    <option value="">Todas las materias</option>
                    {materiasModal.map((materia) => (
                      <option key={materia.id} value={materia.id}>
                        {materia.asignatura}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Información de resultados */}
                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{promediosFiltrados.length}</span> estudiante{promediosFiltrados.length !== 1 ? 's' : ''} encontrado{promediosFiltrados.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {loadingModal ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="animate-spin h-8 w-8 text-slate-600" />
                </div>
              ) : promediosFiltrados.length === 0 ? (
                <div className="text-center py-8">
                  <FaUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron estudiantes con los filtros aplicados</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {promediosFiltrados.map((estudiante, index) => (
                    <div 
                      key={estudiante.estudianteID}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 animate-fadeIn"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Encabezado del estudiante */}
                      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                <FaUsers className="h-5 w-5 text-slate-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-lg font-semibold text-gray-900">
                                {estudiante.nombre} {estudiante.apellido}
                              </div>
                              <div className="text-sm text-gray-500">
                                C.I: {estudiante.cedula}
                                {estudiante.grado && ` • ${estudiante.grado.nombre_grado || estudiante.grado}`}
                                {estudiante.seccion && ` - ${estudiante.seccion.nombre_seccion || estudiante.seccion}`}
                              </div>
                            </div>
                          </div>
                          
                          {/* Promedio General - conservando el emoji */}
                          <div className="text-right">
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-2">Promedio General:</span>
                              <span className={`text-xl font-bold ${
                                estudiante.promedio >= 14 ? 'text-green-600' :
                                estudiante.promedio >= 10 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {parseFloat(estudiante.promedio || 0).toFixed(2)}
                              </span>
                              <span className="ml-2 text-lg">
                                {(estudiante.promedio || 0) >= 14 ? '😊' : 
                                 (estudiante.promedio || 0) >= 10 ? '😐' : '😟'}
                              </span>
                            </div>
                            {estudiante.evaluacionesPendientes > 0 && (
                              <div className="mt-1 text-sm text-orange-600">
                                <FaClipboardList className="inline h-3 w-3 mr-1" />
                                {estudiante.evaluacionesPendientes} por calificar
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contenido organizado por lapsos */}
                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Lapso 1, 2, 3 */}
                          {[1, 2, 3].map(lapso => {
                            const calificacionesLapso = estudiante.calificaciones?.filter(cal => 
                              cal.Evaluaciones?.lapso === lapso.toString()
                            ) || [];
                            
                            // Agrupar por materia dentro del lapso
                            const materiasPorLapso = {};
                            calificacionesLapso.forEach(cal => {
                              const materia = cal.Evaluaciones?.Materias?.asignatura;
                              if (materia) {
                                if (!materiasPorLapso[materia]) {
                                  materiasPorLapso[materia] = [];
                                }
                                materiasPorLapso[materia].push(cal);
                              }
                            });
                            
                            return (
                              <div key={lapso} className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                  <span className="bg-slate-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs mr-2">
                                    {lapso}
                                  </span>
                                  Lapso {lapso}
                                </h4>
                                
                                {Object.keys(materiasPorLapso).length > 0 ? (
                                  <div className="space-y-3">
                                    {Object.entries(materiasPorLapso).map(([materia, calificaciones]) => {
                                      const promedioMateria = calificaciones.reduce((sum, cal) => sum + cal.calificacion, 0) / calificaciones.length;
                                      
                                      return (
                                        <div key={materia} className="bg-white rounded p-3 border border-gray-200">
                                          <div className="font-medium text-sm text-gray-800 mb-2 flex justify-between items-center">
                                            <span>{materia}</span>
                                            <span className={`text-sm font-bold ${
                                              promedioMateria >= 14 ? 'text-green-600' :
                                              promedioMateria >= 10 ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                              {promedioMateria.toFixed(2)}
                                            </span>
                                          </div>
                                          
                                          <div className="space-y-2">
                                            {calificaciones.map((cal, idx) => (
                                              <div key={idx} className="border-l-2 border-gray-100 pl-2">
                                                <div className="flex justify-between items-center text-xs">
                                                  <span className="text-gray-600 truncate flex-1 mr-2">
                                                    {cal.Evaluaciones?.nombreEvaluacion}
                                                    {cal.Evaluaciones?.tipoEvaluacion && (
                                                      <span className="text-gray-400 ml-1">
                                                        ({cal.Evaluaciones.tipoEvaluacion})
                                                      </span>
                                                    )}
                                                  </span>
                                                  <span className={`font-medium px-2 py-1 rounded ${
                                                    cal.calificacion >= 14 ? 'bg-green-100 text-green-700' :
                                                    cal.calificacion >= 10 ? 'bg-yellow-100 text-yellow-700' : 
                                                    'bg-red-100 text-red-700'
                                                  }`}>
                                                    {parseFloat(cal.calificacion).toFixed(1)}
                                                  </span>
                                                </div>
                                                {cal.observaciones && (
                                                  <div className="text-xs text-gray-600 italic mt-1 pl-1">
                                                    "{cal.observaciones}"
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-400 italic">
                                    Sin evaluaciones en este lapso
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Resumen general */}
                        <div className="mt-6 bg-slate-100 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <FaChartBar className="h-4 w-4 mr-2 text-slate-600" />
                            Resumen General
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Promedios por materia */}
                            <div className="bg-white rounded p-3 border border-gray-200">
                              <h5 className="font-medium text-sm text-gray-800 mb-2">Promedios por Materia</h5>
                              {estudiante.materias && Object.keys(estudiante.materias).length > 0 ? (
                                <div className="space-y-2">
                                  {Object.entries(estudiante.materias).map(([nombreMateria, materiaData]) => (
                                    <div key={nombreMateria} className="flex justify-between items-center text-xs">
                                      <span className="text-gray-600">{nombreMateria}</span>
                                      <span className={`font-bold ${
                                        materiaData.promedio >= 14 ? 'text-green-600' :
                                        materiaData.promedio >= 10 ? 'text-yellow-600' : 'text-red-600'
                                      }`}>
                                        {parseFloat(materiaData.promedio || 0).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400 italic">Sin datos</div>
                              )}
                            </div>
                            
                            {/* Total de evaluaciones */}
                            <div className="bg-white rounded p-3 border border-gray-200">
                              <h5 className="font-medium text-sm text-gray-800 mb-2">Total de Evaluaciones</h5>
                              <div className="text-2xl font-bold text-slate-600">
                                {estudiante.calificaciones?.length || 0}
                              </div>
                              <div className="text-xs text-gray-500">
                                calificaciones registradas
                              </div>
                            </div>
                            
                            {/* Promedio general */}
                            <div className="bg-white rounded p-3 border border-gray-200">
                              <h5 className="font-medium text-sm text-gray-800 mb-2">Promedio General</h5>
                              <div className={`text-2xl font-bold ${
                                estudiante.promedio >= 14 ? 'text-green-600' :
                                estudiante.promedio >= 10 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {parseFloat(estudiante.promedio || 0).toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">
                                de {estudiante.totalCalificaciones} evaluaciones
                              </div>
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

      {/* Modal de Entregas de Estudiantes */}
      {showEntregasModal && selectedEvaluacion && (
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
                  onClick={() => setShowEntregasModal(false)}
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
                      
                      {/* Archivos entregados */}
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
                                  onClick={() => handleDescargarArchivoEntrega(archivo.id)}
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
                      
                      {/* Calificación y comentarios */}
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
      )}

    </div>
  );
};

// Componente para cada fila de calificación
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

export default ProfesorDashboard;