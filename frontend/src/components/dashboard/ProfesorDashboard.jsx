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
  FaChevronUp
} from 'react-icons/fa';

const ProfesorDashboard = () => {
  const navigate = useNavigate();
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
  
  // Estados para filtros de modales
  const [filtroGradoEstudiantes, setFiltroGradoEstudiantes] = useState('');
  const [filtroSeccionEstudiantes, setFiltroSeccionEstudiantes] = useState('');
  const [filtroGradoEvaluaciones, setFiltroGradoEvaluaciones] = useState('');
  const [filtroMateriaEvaluaciones, setFiltroMateriaEvaluaciones] = useState('');
  
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
    
    if (seccionID && filtroGradoEstudiantes) {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        // Cargar estudiantes de la sección específica
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/grados/${filtroGradoEstudiantes}/estudiantes?annoEscolarID=${annoEscolar.id}&seccionID=${seccionID}`,
          config
        );
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
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // Cargar todas las evaluaciones del profesor
      const evaluacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesor.id}`,
        config
      );
      
      setEvaluacionesModal(evaluacionesResponse.data);
      
    } catch (err) {
      console.error('Error al cargar evaluaciones:', err);
      setError('Error al cargar evaluaciones');
    }
    
    setLoadingModal(false);
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
    setLoadingModal(true);
    setShowPromediosModal(true);
    
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // Cargar todos los promedios de estudiantes
      const promediosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/promedios/estudiantes/${profesor.id}?annoEscolarID=${annoEscolar.id}`,
        config
      );
      setPromediosEstudiantes(promediosResponse.data);
      
    } catch (err) {
      console.error('Error al cargar promedios:', err);
      setError('Error al cargar promedios');
    }
    
    setLoadingModal(false);
  };

  // FUNCIONES PARA CREAR/EDITAR EVALUACIÓN

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
        setSuccess('Evaluación actualizada correctamente');
      } else {
        // Crear nueva evaluación
        await axios.post(
          `${import.meta.env.VITE_API_URL}/evaluaciones`,
          formData,
          config
        );
        setSuccess('Evaluación creada correctamente');
      }
      
      setTimeout(() => setSuccess(''), 3000);
      
      setShowEvaluacionModal(false);
      setSelectedFile(null);
      
      // Recargar datos
      const configJson = { headers: { 'Authorization': `Bearer ${token}` } };
      await cargarResumenData(profesor.id, annoEscolar.id, configJson);
      await cargarEstadisticas(profesor.id, annoEscolar.id, configJson);
      
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
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <p className="text-slate-300 mt-1">
                {profesor?.nombre} {profesor?.apellido} • {annoEscolar?.periodo}
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}
      
      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                <p className="text-2xl font-bold text-gray-900">{resumenData.totalEstudiantes}</p>
              </div>
            </div>
            <button
              onClick={handleVerTodosEstudiantes}
              className="mt-4 w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver todos los estudiantes
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaTasks className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Evaluaciones</p>
                <p className="text-2xl font-bold text-gray-900">{resumenData.totalEvaluaciones}</p>
              </div>
            </div>
            <button
              onClick={handleVerTodasEvaluaciones}
              className="mt-4 w-full text-sm text-green-600 hover:text-green-800 font-medium"
            >
              Ver todas las evaluaciones
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <FaBook className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Promedio General</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.estadisticasGenerales.promedioGeneral}</p>
              </div>
            </div>
            <button
              onClick={handleVerPromedios}
              className="mt-4 w-full text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              Ver promedios detallados
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaChartBar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">{resumenData.evaluacionesPendientes}</p>
              </div>
            </div>
            <button
              onClick={handleVerEstadisticas}
              className="mt-4 w-full text-sm text-yellow-600 hover:text-yellow-800 font-medium"
            >
              Ver estadísticas completas
            </button>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={handleNuevaEvaluacion}
              className="flex items-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-gray-200 transition-colors"
            >
              <FaPlus className="h-5 w-5 text-slate-600 mr-3" />
              <span className="text-slate-700 font-medium">Nueva Evaluación</span>
            </button>
            
            <button
              onClick={handleVerTodosEstudiantes}
              className="flex items-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-gray-200 transition-colors"
            >
              <FaUsers className="h-5 w-5 text-slate-600 mr-3" />
              <span className="text-slate-700 font-medium">Ver Estudiantes</span>
            </button>
            
            <button
              onClick={handleMostrarCalificar}
              className="flex items-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg border border-gray-200 transition-colors"
            >
              <FaUserCheck className="h-5 w-5 text-slate-600 mr-3" />
              <span className="text-slate-700 font-medium">Calificar</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Materias que imparte */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Mis Materias</h2>
            </div>
            <div className="p-6">
              {materiasResumen.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay materias asignadas</p>
              ) : (
                <div className="space-y-3">
                  {materiasResumen.slice(0, 5).map((materia) => (
                    <div key={materia.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FaBook className="h-4 w-4 text-slate-600 mr-3" />
                        <span className="font-medium text-gray-900">{materia.asignatura}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVerEstudiantesMateria(materia)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Estudiantes
                        </button>
                        <button
                          onClick={() => handleVerEvaluacionesMateria(materia)}
                          className="text-sm text-green-600 hover:text-green-800"
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
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Evaluaciones Recientes</h2>
            </div>
            <div className="p-6">
              {evaluacionesRecientes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay evaluaciones registradas</p>
              ) : (
                <div className="space-y-3">
                  {evaluacionesRecientes.map((evaluacion) => (
                    <div key={evaluacion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{evaluacion.nombreEvaluacion}</p>
                        <p className="text-sm text-gray-500">
                          {evaluacion.Materias?.asignatura} • Lapso {evaluacion.lapso}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCalificarEvaluacion(evaluacion)}
                        className="text-sm bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded"
                      >
                        Calificar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Nueva Evaluación */}
      {showEvaluacionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditMode ? 'Editar Evaluación' : 'Nueva Evaluación'}
                </h2>
                <button
                  onClick={() => setShowEvaluacionModal(false)}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    disabled={!evaluacionForm.gradoID}
                  >
                    <option value="">Seleccionar sección</option>
                    {seccionesModal.map(seccion => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.nombre_seccion}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                  onClick={() => setShowEvaluacionModal(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEvaluacion}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  >
                    <option value="">Todos los grados</option>
                    {gradosModal.map(grado => (
                      <option key={grado.id} value={grado.id}>
                        {grado.nombre_grado}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    disabled={!filtroGradoEstudiantes}
                  >
                    <option value="">Todas las secciones</option>
                    {seccionesModalFiltro.map(seccion => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.nombre_seccion}
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
                  {estudiantesModal.map((estudiante) => (
                    <div key={estudiante.id} className="bg-gray-50 rounded-lg">
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

      {/* Modal de Evaluaciones */}
      {showEvaluacionesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto">
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
            
            <div className="p-6">
              {loadingModal ? (
                <div className="flex justify-center py-8">
                  <FaSpinner className="animate-spin h-8 w-8 text-slate-600" />
                </div>
              ) : evaluacionesModal.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay evaluaciones registradas</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        {evaluacion.requiereEntrega && (
                          <p className="text-sm text-blue-600">
                            Requiere entrega • Límite: {evaluacion.fechaLimiteEntrega 
                              ? new Date(evaluacion.fechaLimiteEntrega).toLocaleDateString() 
                              : 'No especificado'}
                          </p>
                        )}
                        {evaluacion.archivoURL && (
                          <p className="text-sm text-green-600">
                            📎 Archivo adjunto
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditarEvaluacion(evaluacion)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors flex items-center justify-center"
                        >
                          <FaEdit className="h-3 w-3 mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleCalificarEvaluacion(evaluacion)}
                          className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded text-sm transition-colors"
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
      )}

      {/* Modal de Seleccionar Evaluación para Calificar */}
      {showCalificarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
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
                      <button
                        onClick={() => handleCalificarEvaluacion(evaluacion)}
                        className="w-full bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        Seleccionar
                      </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto">
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
                  {calificacionesModal.map((estudiante) => (
                    <CalificacionRow
                      key={estudiante.id}
                      estudiante={estudiante}
                      onGuardar={handleGuardarCalificacion}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Estadísticas */}
      {showEstadisticasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
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

      {/* Modal de Promedios de Estudiantes */}
      {showPromediosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Promedios de Estudiantes</h2>
                <button
                  onClick={() => setShowPromediosModal(false)}
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
              ) : promediosEstudiantes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay datos de estudiantes disponibles</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estudiante
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cédula
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Calificaciones
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Promedio General
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Materias
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {promediosEstudiantes.map((estudiante) => (
                        <tr key={estudiante.estudianteID}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {estudiante.nombre} {estudiante.apellido}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {estudiante.cedula}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {estudiante.totalCalificaciones}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`font-bold ${
                              estudiante.promedio >= 14 ? 'text-green-600' :
                              estudiante.promedio >= 10 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {estudiante.promedio}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="space-y-1">
                              {Object.entries(estudiante.materias || {}).map(([materia, stats]) => (
                                <div key={materia} className="flex justify-between">
                                  <span className="text-xs">{materia}:</span>
                                  <span className={`text-xs font-medium ${
                                    stats.promedio >= 14 ? 'text-green-600' :
                                    stats.promedio >= 10 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {stats.promedio}
                                  </span>
                                </div>
                              ))}
                            </div>
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
      )}

      {/* Modal de Estadísticas */}
      {showEstadisticasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Promedios de Estudiantes */}
      {showPromediosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Promedios de Estudiantes</h2>
                <button
                  onClick={() => setShowPromediosModal(false)}
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
              ) : promediosEstudiantes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay datos de estudiantes disponibles</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estudiante
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cédula
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Calificaciones
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Promedio General
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Materias
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {promediosEstudiantes.map((estudiante) => (
                        <tr key={estudiante.estudianteID}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {estudiante.nombre} {estudiante.apellido}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {estudiante.cedula}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {estudiante.totalCalificaciones}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`font-bold ${
                              estudiante.promedio >= 14 ? 'text-green-600' :
                              estudiante.promedio >= 10 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {estudiante.promedio}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="space-y-1">
                              {Object.entries(estudiante.materias).map(([materia, stats]) => (
                                <div key={materia} className="flex justify-between">
                                  <span className="text-xs">{materia}:</span>
                                  <span className={`text-xs font-medium ${
                                    stats.promedio >= 14 ? 'text-green-600' :
                                    stats.promedio >= 10 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {stats.promedio}
                                  </span>
                                </div>
                              ))}
                            </div>
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
      )}

      
    </div>
  );
};

// Componente para cada fila de calificación
const CalificacionRow = ({ estudiante, onGuardar }) => {
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            placeholder="Opcional..."
          />
        </div>
        
        <div className="md:col-span-1 text-right">
          <button
            onClick={handleGuardar}
            disabled={guardando || !calificacion}
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center ml-auto"
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
        </div>
      </div>


    </div>
  );
};

export default ProfesorDashboard;