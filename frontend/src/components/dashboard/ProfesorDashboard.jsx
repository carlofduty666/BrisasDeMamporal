import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserGraduate, FaClipboardList, FaBook, FaChalkboardTeacher, FaPlus, FaEdit, FaTrash, FaFilter, FaSearch, FaSave } from 'react-icons/fa';

const ProfesorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('estudiantes');
  
  // Datos del profesor
  const [profesor, setProfesor] = useState(null);
  
  // Datos académicos
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    gradoID: '',
    seccionID: '',
    materiaID: '',
    busqueda: ''
  });
  
  // Estados para modales
  const [showEvaluacionModal, setShowEvaluacionModal] = useState(false);
  const [showCalificacionModal, setShowCalificacionModal] = useState(false);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [savingEvaluacion, setSavingEvaluacion] = useState(false);
  const [savingCalificacion, setSavingCalificacion] = useState(false);
  
  // Formularios
  const [evaluacionForm, setEvaluacionForm] = useState({
    nombreEvaluacion: '',
    descripcion: '',
    tipoEvaluacion: '',
    fechaEvaluacion: '',
    materiaID: '',
    gradoID: '',
    seccionID: '',
    porcentaje: '',
    lapso: '',
    requiereEntrega: false,
    fechaLimiteEntrega: ''
  });
  
  const [calificacionForm, setCalificacionForm] = useState({
    valor: '',
    observaciones: ''
  });
  
  // Archivo para evaluación
  const [selectedFile, setSelectedFile] = useState(null);
  
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
        
        // Decodificar token para obtener datos del usuario
        const userData = JSON.parse(atob(token.split('.')[1]));
        
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };
        
        // Obtener datos del profesor
        const profesorResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/${userData.personaID}`,
          config
        );
        const profesorData = profesorResponse.data;
        setProfesor(profesorData);
        
        // Obtener año escolar activo
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          config
        );
        setAnnoEscolar(annoResponse.data);
        
        // Obtener materias del profesor
        const materiasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/materias/profesor/${userData.personaID}`,
          config
        );
        setMaterias(materiasResponse.data);
        
        // Obtener grados donde enseña el profesor
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/grados/profesor/${userData.personaID}`,
          config
        );
        setGrados(gradosResponse.data);
        
        // Obtener calificaciones del estudiante
        try {
          const annoEscolarId = annoResponse.data.id;
          
          // Primero intentamos con el endpoint de resumen
          const calificacionesResponse = await axios.get(
            `${import.meta.env.VITE_API_URL}/calificaciones/resumen/estudiante/${estudianteID}`,
            { 
              ...config,
              params: { annoEscolarID: annoEscolarId }
            }
          );
          
          console.log("Respuesta de calificaciones (resumen):", calificacionesResponse.data);
          
          if (calificacionesResponse.data && calificacionesResponse.data.materias && calificacionesResponse.data.materias.length > 0) {
            // Si recibimos materias con calificaciones, las procesamos
            setCalificaciones(calificacionesResponse.data.materias);
          } else if (materias && materias.length > 0) {
            // Si el estudiante tiene materias asignadas pero no calificaciones en el resumen,
            // intentamos obtener calificaciones para cada materia individualmente
            const calificacionesPorMateria = [];
            
            for (const materia of materias) {
              try {
                const materiaCalificacionesResponse = await axios.get(
                  `${import.meta.env.VITE_API_URL}/calificaciones/materia/${materia.id}`,
                  { 
                    ...config,
                    params: { 
                      annoEscolarID: annoEscolarId,
                      estudianteID: estudianteID
                    }
                  }
                );
                
                if (materiaCalificacionesResponse.data && materiaCalificacionesResponse.data.length > 0) {
                  // Agregamos información de la materia a cada calificación
                  const calificacionesConMateria = materiaCalificacionesResponse.data.map(cal => ({
                    ...cal,
                    materiaID: materia.id,
                    nombreMateria: materia.asignatura
                  }));
                  
                  calificacionesPorMateria.push(...calificacionesConMateria);
                }
              } catch (error) {
                console.error(`Error al obtener calificaciones para materia ${materia.id}:`, error);
              }
            }
            
            if (calificacionesPorMateria.length > 0) {
              setCalificaciones(calificacionesPorMateria);
            } else {
              // Si no hay calificaciones por materia, intentamos con el endpoint tradicional
              const calificacionesAntiguasResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/calificaciones/estudiante/${estudianteID}`,
                { 
                  ...config,
                  params: { annoEscolarID: annoEscolarId }
                }
              );
              
              if (Array.isArray(calificacionesAntiguasResponse.data) && calificacionesAntiguasResponse.data.length > 0) {
                setCalificaciones(calificacionesAntiguasResponse.data);
              } else {
                // Si no hay calificaciones en ninguna parte, establecemos un array vacío
                setCalificaciones([]);
              }
            }
          } else {
            // Si no hay materias o no hay calificaciones, intentamos con el endpoint tradicional
            const calificacionesAntiguasResponse = await axios.get(
              `${import.meta.env.VITE_API_URL}/calificaciones/estudiante/${estudianteID}`,
              { 
                ...config,
                params: { annoEscolarID: annoEscolarId }
              }
            );
            
            if (Array.isArray(calificacionesAntiguasResponse.data) && calificacionesAntiguasResponse.data.length > 0) {
              setCalificaciones(calificacionesAntiguasResponse.data);
            } else {
              setCalificaciones([]);
            }
          }
        } catch (calificacionesError) {
          console.error('Error al obtener calificaciones:', calificacionesError);
          setCalificaciones([]);
        }
        
        // Obtener secciones
        const seccionesPromises = gradosResponse.data.map(grado => 
          axios.get(`${import.meta.env.VITE_API_URL}/secciones/grado/${grado.id}`, config)
        );
        
        const seccionesResponses = await Promise.all(seccionesPromises);
        const todasSecciones = seccionesResponses.flatMap(response => response.data);
        setSecciones(todasSecciones);
        
        // Obtener estudiantes de los grados/secciones donde enseña el profesor
        const estudiantesPromises = gradosResponse.data.map(grado => 
          axios.get(`${import.meta.env.VITE_API_URL}/grados/${grado.id}/estudiantes`, {
            ...config,
            params: { annoEscolarID: annoResponse.data.id }
          })
        );

        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/profesor/${profesorData.id}/estudiantes`,
          {
            ...config,
            params: { annoEscolarID: annoResponse.data.id }
          }
        );
        setEstudiantes(estudiantesResponse.data);
        
        // Obtener evaluaciones creadas por el profesor
        const evaluacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${userData.personaID}`,
          config
        );
        setEvaluaciones(evaluacionesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  // Filtrar estudiantes según los criterios seleccionados
  const estudiantesFiltrados = estudiantes.filter(estudiante => {
    // Filtrar por grado
    if (filtros.gradoID && estudiante.gradoID !== parseInt(filtros.gradoID)) {
      return false;
    }
    
    // Filtrar por sección
    if (filtros.seccionID && estudiante.seccionID !== parseInt(filtros.seccionID)) {
      return false;
    }
    
    // Filtrar por búsqueda (nombre, apellido o cédula)
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      const nombreCompleto = `${estudiante.nombre} ${estudiante.apellido}`.toLowerCase();
      const cedula = estudiante.cedula ? estudiante.cedula.toLowerCase() : '';
      
      if (!nombreCompleto.includes(busqueda) && !cedula.includes(busqueda)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Filtrar evaluaciones según los criterios seleccionados
  const evaluacionesFiltradas = evaluaciones.filter(evaluacion => {
    // Filtrar por materia
    if (filtros.materiaID && evaluacion.materiaID !== parseInt(filtros.materiaID)) {
      return false;
    }
    
    // Filtrar por grado
    if (filtros.gradoID && evaluacion.gradoID !== parseInt(filtros.gradoID)) {
      return false;
    }
    
    // Filtrar por búsqueda (nombre o descripción)
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      const nombre = evaluacion.nombreEvaluacion.toLowerCase();
      const descripcion = evaluacion.descripcion ? evaluacion.descripcion.toLowerCase() : '';
      
      if (!nombre.includes(busqueda) && !descripcion.includes(busqueda)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Manejar cambios en los filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({
      ...filtros,
      [name]: value
    });
  };
  
  // Limpiar filtros
  const handleLimpiarFiltros = () => {
    setFiltros({
      gradoID: '',
      seccionID: '',
      materiaID: '',
      busqueda: ''
    });
  };
  
  // Manejar cambios en el formulario de evaluación
  const handleEvaluacionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEvaluacionForm({
      ...evaluacionForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Manejar cambios en el formulario de calificación
  const handleCalificacionChange = (e) => {
    const { name, value } = e.target;
    setCalificacionForm({
      ...calificacionForm,
      [name]: value
    });
  };
  
  // Manejar cambio de archivo
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };
  
  // Abrir modal para nueva evaluación
  const handleNuevaEvaluacion = () => {
    setSelectedEvaluacion(null);
    setEvaluacionForm({
      nombreEvaluacion: '',
      descripcion: '',
      tipoEvaluacion: '',
      fechaEvaluacion: '',
      materiaID: '',
      gradoID: '',
      seccionID: '',
      porcentaje: '',
      lapso: '',
      requiereEntrega: false,
      fechaLimiteEntrega: ''
    });
    setSelectedFile(null);
    setShowEvaluacionModal(true);
  };
  
  // Abrir modal para editar evaluación
  const handleEditarEvaluacion = (evaluacion) => {
    setSelectedEvaluacion(evaluacion);
    setEvaluacionForm({
      nombreEvaluacion: evaluacion.nombreEvaluacion,
      descripcion: evaluacion.descripcion || '',
      tipoEvaluacion: evaluacion.tipoEvaluacion,
      fechaEvaluacion: evaluacion.fechaEvaluacion.split('T')[0],
      materiaID: evaluacion.materiaID.toString(),
      gradoID: evaluacion.gradoID.toString(),
      seccionID: evaluacion.seccionID.toString(),
      porcentaje: evaluacion.porcentaje.toString(),
      lapso: evaluacion.lapso.toString(),
      requiereEntrega: evaluacion.requiereEntrega || false,
      fechaLimiteEntrega: evaluacion.fechaLimiteEntrega ? evaluacion.fechaLimiteEntrega.split('T')[0] : ''
    });
    setSelectedFile(null);
    setShowEvaluacionModal(true);
  };
  
  // Eliminar evaluación
  const handleEliminarEvaluacion = async (evaluacionId) => {
    if (!confirm('¿Está seguro de eliminar esta evaluación? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/evaluaciones/${evaluacionId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Actualizar lista de evaluaciones
      setEvaluaciones(evaluaciones.filter(ev => ev.id !== evaluacionId));
      
      setSuccess('Evaluación eliminada correctamente');
      setTimeout(() => setSuccess(''), 3000);
      
      setLoading(false);
    } catch (err) {
      console.error('Error al eliminar evaluación:', err);
      setError('Error al eliminar la evaluación. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Guardar evaluación (crear o actualizar)
  const handleSubmitEvaluacion = async (e) => {
    e.preventDefault();
    
    try {
      setSavingEvaluacion(true);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      Object.keys(evaluacionForm).forEach(key => {
        formData.append(key, evaluacionForm[key]);
      });
      
      if (selectedFile) {
        formData.append('archivo', selectedFile);
      }
      
      let response;
      
      if (selectedEvaluacion) {
        // Actualizar evaluación existente
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/evaluaciones/${selectedEvaluacion.id}`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        // Actualizar la evaluación en la lista
        setEvaluaciones(evaluaciones.map(ev => 
          ev.id === selectedEvaluacion.id ? response.data : ev
        ));
        
        setSuccess('Evaluación actualizada correctamente');
      } else {
        // Crear nueva evaluación
        formData.append('profesorID', profesor.id);
        
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/evaluaciones`,
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        // Añadir la nueva evaluación a la lista
        setEvaluaciones([...evaluaciones, response.data]);
        
        setSuccess('Evaluación creada correctamente');
      }
      
      setTimeout(() => setSuccess(''), 3000);
      
      // Cerrar modal y limpiar formulario
      setShowEvaluacionModal(false);
      setSelectedEvaluacion(null);
      setSavingEvaluacion(false);
    } catch (err) {
      console.error('Error al guardar evaluación:', err);
      setError('Error al guardar la evaluación. Por favor, intente nuevamente.');
      setSavingEvaluacion(false);
    }
  };
  
  // Abrir modal para calificar estudiante
  const handleCalificarEstudiante = (estudiante, evaluacion) => {
    setSelectedEstudiante(estudiante);
    setSelectedEvaluacion(evaluacion);
    
    // Verificar si ya existe una calificación para este estudiante y evaluación
    const buscarCalificacion = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/calificaciones/evaluacion/${evaluacion.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        const calificaciones = response.data;
        const calificacionExistente = calificaciones.find(cal => cal.estudianteID === estudiante.id);
        
        if (calificacionExistente) {
          setCalificacionForm({
            valor: calificacionExistente.valor,
            observaciones: calificacionExistente.observaciones || ''
          });
        } else {
          setCalificacionForm({
            valor: '',
            observaciones: ''
          });
        }
      } catch (err) {
        console.error('Error al buscar calificación:', err);
        setCalificacionForm({
          valor: '',
          observaciones: ''
        });
      }
    };
    
    buscarCalificacion();
    setShowCalificacionModal(true);
  };
  
  // Guardar calificación
  const handleSubmitCalificacion = async (e) => {
    e.preventDefault();
    
    if (!selectedEstudiante || !selectedEvaluacion) {
      setError('Datos incompletos para registrar la calificación');
      return;
    }
    
    try {
      setSavingCalificacion(true);
      const token = localStorage.getItem('token');
      
      // Verificar si ya existe una calificación para este estudiante y evaluación
      const calificacionesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/calificaciones/evaluacion/${selectedEvaluacion.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const calificaciones = calificacionesResponse.data;
      const calificacionExistente = calificaciones.find(cal => cal.estudianteID === selectedEstudiante.id);
      
      let response;
      
      if (calificacionExistente) {
        // Actualizar calificación existente
        response = await axios.put(
          `${import.meta.env.VITE_API_URL}/calificaciones/${calificacionExistente.id}`,
          {
            calificacion: calificacionForm.valor,
            observaciones: calificacionForm.observaciones
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setSuccess('Calificación actualizada correctamente');
      } else {
        // Crear nueva calificación
        response = await axios.post(
          `${import.meta.env.VITE_API_URL}/calificaciones`,
          {
            personaID: selectedEstudiante.id,
            evaluacionID: selectedEvaluacion.id,
            calificacion: calificacionForm.valor,
            observaciones: calificacionForm.observaciones,
            fecha: new Date().toISOString()
          },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setSuccess('Calificación registrada correctamente');
      }
      
      setTimeout(() => setSuccess(''), 3000);
      
      // Cerrar modal y limpiar formulario
      setShowCalificacionModal(false);
      setSelectedEstudiante(null);
      setSelectedEvaluacion(null);
      setSavingCalificacion(false);
    } catch (err) {
      console.error('Error al guardar calificación:', err);
      setError('Error al guardar la calificación. Por favor, intente nuevamente.');
      setSavingCalificacion(false);
    }
  };
  
  if (loading && !profesor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Panel del Profesor</h1>
            <div className="flex items-center">
              <span className="text-gray-600 mr-4">{profesor?.nombre} {profesor?.apellido}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Mensajes de error y éxito */}
        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
            <p>{success}</p>
          </div>
        )}
        
        {/* Pestañas de navegación */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('estudiantes')}
                className={`${
                  activeTab === 'estudiantes'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <FaUserGraduate className="inline-block mr-2" /> Estudiantes
              </button>
              
              <button
                onClick={() => setActiveTab('evaluaciones')}
                className={`${
                  activeTab === 'evaluaciones'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <FaClipboardList className="inline-block mr-2" /> Evaluaciones
              </button>
              
              <button
                onClick={() => setActiveTab('materias')}
                className={`${
                  activeTab === 'materias'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <FaBook className="inline-block mr-2" /> Materias
              </button>
              
              <button
                onClick={() => setActiveTab('grados')}
                className={`${
                  activeTab === 'grados'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <FaChalkboardTeacher className="inline-block mr-2" /> Grados y Secciones
              </button>
            </nav>
          </div>
        </div>
        
        {/* Contenido de la pestaña Estudiantes */}
        {activeTab === 'estudiantes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Mis Estudiantes</h2>
              
              {/* Filtros */}
              <div className="flex space-x-4">
                <select
                  name="gradoID"
                  value={filtros.gradoID}
                  onChange={handleFiltroChange}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Todos los grados</option>
                  {grados.map(grado => (
                    <option key={grado.id} value={grado.id}>
                      {grado.nombre_grado}
                    </option>
                  ))}
                </select>
                
                <select
                  name="seccionID"
                  value={filtros.seccionID}
                  onChange={handleFiltroChange}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  disabled={!filtros.gradoID}
                >
                  <option value="">Todas las secciones</option>
                  {secciones
                    .filter(seccion => !filtros.gradoID || seccion.gradoID === parseInt(filtros.gradoID))
                    .map(seccion => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.nombre_seccion}
                      </option>
                    ))}
                </select>
                
                <div className="relative">
                  <input
                    type="text"
                    name="busqueda"
                    value={filtros.busqueda}
                    onChange={handleFiltroChange}
                    placeholder="Buscar estudiante..."
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                </div>
                
                <button
                  onClick={handleLimpiarFiltros}
                  className="px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
            
            {/* Lista de estudiantes */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {estudiantesFiltrados.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {estudiantesFiltrados.map(estudiante => {
                    const gradoEstudiante = grados.find(g => g.id === estudiante.gradoID);
                    const seccionEstudiante = secciones.find(s => s.id === estudiante.seccionID);
                    
                    return (
                      <li key={estudiante.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-700 font-semibold">
                                  {estudiante.nombre.charAt(0)}{estudiante.apellido.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-indigo-600">
                                  {estudiante.nombre} {estudiante.apellido}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {estudiante.cedula || 'Sin cédula'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="mr-8 text-sm text-gray-500">
                                <span className="font-medium">Grado:</span> {gradoEstudiante?.nombre_grado || 'No asignado'}
                                <span className="mx-2">|</span>
                                <span className="font-medium">Sección:</span> {seccionEstudiante?.nombre_seccion || 'No asignada'}
                              </div>
                              <div>
                                <button
                                  onClick={() => navigate(`/admin/estudiantes/${estudiante.id}`)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  Ver detalles
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                  No se encontraron estudiantes con los filtros seleccionados.
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Contenido de la pestaña Evaluaciones */}
        {activeTab === 'evaluaciones' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Mis Evaluaciones</h2>
              
              <div className="flex space-x-4">
                <select
                  name="materiaID"
                  value={filtros.materiaID}
                  onChange={handleFiltroChange}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Todas las materias</option>
                  {materias.map(materia => (
                    <option key={materia.id} value={materia.id}>
                      {materia.asignatura}
                    </option>
                  ))}
                </select>
                
                <select
                  name="gradoID"
                  value={filtros.gradoID}
                  onChange={handleFiltroChange}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                >
                  <option value="">Todos los grados</option>
                  {grados.map(grado => (
                    <option key={grado.id} value={grado.id}>
                      {grado.nombre_grado}
                    </option>
                  ))}
                </select>
                
                <div className="relative">
                  <input
                    type="text"
                    name="busqueda"
                    value={filtros.busqueda}
                    onChange={handleFiltroChange}
                    placeholder="Buscar evaluación..."
                    className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                </div>
                
                <button
                  onClick={handleLimpiarFiltros}
                  className="px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Limpiar filtros
                </button>
                
                <button
                  onClick={handleNuevaEvaluacion}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaPlus className="mr-2" /> Nueva Evaluación
                </button>
              </div>
            </div>
            
            {/* Lista de evaluaciones */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {evaluacionesFiltradas.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {evaluacionesFiltradas.map(evaluacion => {
                    const materia = materias.find(m => m.id === evaluacion.materiaID);
                    const grado = grados.find(g => g.id === evaluacion.gradoID);
                    const seccion = secciones.find(s => s.id === evaluacion.seccionID);
                    
                    return (
                      <li key={evaluacion.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-indigo-600">{evaluacion.nombreEvaluacion}</h3>
                              <div className="mt-1 text-sm text-gray-500">
                                <span className="font-medium">Materia:</span> {materia?.asignatura || 'No disponible'}
                                <span className="mx-2">|</span>
                                <span className="font-medium">Grado:</span> {grado?.nombre_grado || 'No disponible'}
                                <span className="mx-2">|</span>
                                <span className="font-medium">Sección:</span> {seccion?.nombre_seccion || 'No disponible'}
                              </div>
                              <div className="mt-1 text-sm text-gray-500">
                                <span className="font-medium">Tipo:</span> {evaluacion.tipoEvaluacion}
                                <span className="mx-2">|</span>
                                <span className="font-medium">Fecha:</span> {new Date(evaluacion.fechaEvaluacion).toLocaleDateString()}
                                <span className="mx-2">|</span>
                                <span className="font-medium">Lapso:</span> {evaluacion.lapso}
                                <span className="mx-2">|</span>
                                <span className="font-medium">Porcentaje:</span> {evaluacion.porcentaje}%
                              </div>
                              {evaluacion.descripcion && (
                                <div className="mt-1 text-sm text-gray-500">
                                  <span className="font-medium">Descripción:</span> {evaluacion.descripcion}
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditarEvaluacion(evaluacion)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <FaEdit className="mr-1" /> Editar
                              </button>
                              <button
                                onClick={() => handleEliminarEvaluacion(evaluacion.id)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <FaTrash className="mr-1" /> Eliminar
                              </button>
                            </div>
                          </div>
                          
                          {/* Lista de estudiantes para calificar */}
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Calificar Estudiantes:</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {estudiantes
                                .filter(est => est.gradoID === evaluacion.gradoID && est.seccionID === evaluacion.seccionID)
                                .map(estudiante => (
                                  <button
                                    key={estudiante.id}
                                    onClick={() => handleCalificarEstudiante(estudiante, evaluacion)}
                                    className="text-left px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    {estudiante.nombre} {estudiante.apellido}
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                  No se encontraron evaluaciones con los filtros seleccionados.
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Contenido de la pestaña Materias */}
        {activeTab === 'materias' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Mis Materias</h2>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {materias.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {materias.map(materia => {
                    // Encontrar los grados donde se imparte esta materia
                    const gradosMateria = grados.filter(grado => 
                      materia.grados && materia.grados.some(g => g.id === grado.id)
                    );
                    
                    return (
                      <li key={materia.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-indigo-600">{materia.asignatura}</h3>
                              <div className="mt-1 text-sm text-gray-500">
                                {materia.descripcion || 'Sin descripción'}
                              </div>
                              <div className="mt-2">
                                <h4 className="text-sm font-medium text-gray-700">Grados:</h4>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {gradosMateria.length > 0 ? (
                                    gradosMateria.map(grado => (
                                      <span 
                                        key={grado.id}
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                      >
                                        {grado.nombre_grado}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-sm text-gray-500">No asignada a ningún grado</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                  No tiene materias asignadas.
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Contenido de la pestaña Grados y Secciones */}
        {activeTab === 'grados' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Mis Grados y Secciones</h2>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {grados.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {grados.map(grado => {
                    // Encontrar las secciones de este grado
                    const seccionesGrado = secciones.filter(seccion => seccion.gradoID === grado.id);
                    
                    return (
                      <li key={grado.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div>
                            <h3 className="text-lg font-medium text-indigo-600">{grado.nombre_grado}</h3>
                            
                            <div className="mt-2">
                              <h4 className="text-sm font-medium text-gray-700">Secciones:</h4>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {seccionesGrado.length > 0 ? (
                                  seccionesGrado.map(seccion => (
                                    <span 
                                      key={seccion.id}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                                    >
                                      {seccion.nombre_seccion}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-gray-500">No hay secciones asignadas</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="mt-2">
                              <h4 className="text-sm font-medium text-gray-700">Materias:</h4>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {materias
                                  .filter(materia => 
                                    materia.grados && materia.grados.some(g => g.id === grado.id)
                                  )
                                  .map(materia => (
                                    <span 
                                      key={materia.id}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                    >
                                      {materia.asignatura}
                                    </span>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
                  No tiene grados asignados.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Modal para crear/editar evaluación */}
      {showEvaluacionModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {selectedEvaluacion ? 'Editar Evaluación' : 'Nueva Evaluación'}
                    </h3>
                    <div className="mt-2">
                      <form onSubmit={handleSubmitEvaluacion} className="space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                          <div className="sm:col-span-6">
                          <label htmlFor="nombreEvaluacion" className="block text-sm font-medium text-gray-700">
                              Nombre de la Evaluación
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                id="nombreEvaluacion"
                                name="nombreEvaluacion"
                                value={evaluacionForm.nombreEvaluacion}
                                onChange={handleEvaluacionChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="sm:col-span-6">
                            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                              Descripción
                            </label>
                            <div className="mt-1">
                              <textarea
                                id="descripcion"
                                name="descripcion"
                                rows="3"
                                value={evaluacionForm.descripcion}
                                onChange={handleEvaluacionChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              ></textarea>
                            </div>
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor="tipoEvaluacion" className="block text-sm font-medium text-gray-700">
                              Tipo de Evaluación
                            </label>
                            <div className="mt-1">
                              <select
                                id="tipoEvaluacion"
                                name="tipoEvaluacion"
                                value={evaluacionForm.tipoEvaluacion}
                                onChange={handleEvaluacionChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                required
                              >
                                <option value="">Seleccione un tipo</option>
                                <option value="Examen">Examen</option>
                                <option value="Tarea">Tarea</option>
                                <option value="Proyecto">Proyecto</option>
                                <option value="Exposición">Exposición</option>
                                <option value="Participación">Participación</option>
                                <option value="Prueba Corta">Prueba Corta</option>
                                <option value="Otro">Otro</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="sm:col-span-3">
                            <label htmlFor="fechaEvaluacion" className="block text-sm font-medium text-gray-700">
                              Fecha de Evaluación
                            </label>
                            <div className="mt-1">
                              <input
                                type="date"
                                id="fechaEvaluacion"
                                name="fechaEvaluacion"
                                value={evaluacionForm.fechaEvaluacion}
                                onChange={handleEvaluacionChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="sm:col-span-2">
                            <label htmlFor="materiaID" className="block text-sm font-medium text-gray-700">
                              Materia
                            </label>
                            <div className="mt-1">
                              <select
                                id="materiaID"
                                name="materiaID"
                                value={evaluacionForm.materiaID}
                                onChange={handleEvaluacionChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                required
                              >
                                <option value="">Seleccione una materia</option>
                                {materias.map(materia => (
                                  <option key={materia.id} value={materia.id}>
                                    {materia.asignatura}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="sm:col-span-2">
                            <label htmlFor="gradoID" className="block text-sm font-medium text-gray-700">
                              Grado
                            </label>
                            <div className="mt-1">
                              <select
                                id="gradoID"
                                name="gradoID"
                                value={evaluacionForm.gradoID}
                                onChange={handleEvaluacionChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                required
                              >
                                <option value="">Seleccione un grado</option>
                                {grados.map(grado => (
                                  <option key={grado.id} value={grado.id}>
                                    {grado.nombre_grado}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="sm:col-span-2">
                            <label htmlFor="seccionID" className="block text-sm font-medium text-gray-700">
                              Sección
                            </label>
                            <div className="mt-1">
                              <select
                                id="seccionID"
                                name="seccionID"
                                value={evaluacionForm.seccionID}
                                onChange={handleEvaluacionChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                required
                                disabled={!evaluacionForm.gradoID}
                              >
                                <option value="">Seleccione una sección</option>
                                {secciones
                                  .filter(seccion => !evaluacionForm.gradoID || seccion.gradoID === parseInt(evaluacionForm.gradoID))
                                  .map(seccion => (
                                    <option key={seccion.id} value={seccion.id}>
                                      {seccion.nombre_seccion}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          </div>
                          
                          <div className="sm:col-span-2">
                            <label htmlFor="porcentaje" className="block text-sm font-medium text-gray-700">
                              Porcentaje (%)
                            </label>
                            <div className="mt-1">
                              <input
                                type="number"
                                id="porcentaje"
                                name="porcentaje"
                                min="1"
                                max="100"
                                value={evaluacionForm.porcentaje}
                                onChange={handleEvaluacionChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="sm:col-span-2">
                            <label htmlFor="lapso" className="block text-sm font-medium text-gray-700">
                              Lapso
                            </label>
                            <div className="mt-1">
                              <select
                                id="lapso"
                                name="lapso"
                                value={evaluacionForm.lapso}
                                onChange={handleEvaluacionChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                required
                              >
                                <option value="">Seleccione un lapso</option>
                                <option value="1">Primer Lapso</option>
                                <option value="2">Segundo Lapso</option>
                                <option value="3">Tercer Lapso</option>
                              </select>
                            </div>
                          </div>
                          
                          <div className="sm:col-span-2">
                            <div className="flex items-start mt-6">
                              <div className="flex items-center h-5">
                                <input
                                  id="requiereEntrega"
                                  name="requiereEntrega"
                                  type="checkbox"
                                  checked={evaluacionForm.requiereEntrega}
                                  onChange={handleEvaluacionChange}
                                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="requiereEntrega" className="font-medium text-gray-700">
                                  Requiere entrega
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          {evaluacionForm.requiereEntrega && (
                            <div className="sm:col-span-3">
                              <label htmlFor="fechaLimiteEntrega" className="block text-sm font-medium text-gray-700">
                                Fecha Límite de Entrega
                              </label>
                              <div className="mt-1">
                                <input
                                  type="date"
                                  id="fechaLimiteEntrega"
                                  name="fechaLimiteEntrega"
                                  value={evaluacionForm.fechaLimiteEntrega}
                                  onChange={handleEvaluacionChange}
                                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                  required={evaluacionForm.requiereEntrega}
                                />
                              </div>
                            </div>
                          )}
                          
                          <div className="sm:col-span-6">
                            <label htmlFor="archivo" className="block text-sm font-medium text-gray-700">
                              Archivo (opcional)
                            </label>
                            <div className="mt-1">
                              <input
                                type="file"
                                id="archivo"
                                onChange={handleFileChange}
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                              Suba un archivo con instrucciones o material relacionado con la evaluación.
                            </p>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmitEvaluacion}
                  disabled={savingEvaluacion}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {savingEvaluacion ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaSave className="mr-2" /> {selectedEvaluacion ? 'Actualizar' : 'Guardar'}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEvaluacionModal(false);
                    setSelectedEvaluacion(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para calificar estudiante */}
      {showCalificacionModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Calificar Estudiante
                    </h3>
                    <div className="mt-2">
                      <div className="bg-gray-50 p-4 rounded-md mb-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Estudiante:</span> {selectedEstudiante?.nombre} {selectedEstudiante?.apellido}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Evaluación:</span> {selectedEvaluacion?.nombreEvaluacion}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Tipo:</span> {selectedEvaluacion?.tipoEvaluacion}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Fecha:</span> {selectedEvaluacion ? new Date(selectedEvaluacion.fechaEvaluacion).toLocaleDateString() : ''}
                        </p>
                      </div>
                      
                      <form onSubmit={handleSubmitCalificacion} className="space-y-6">
                        <div>
                          <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
                            Calificación (0-20)
                          </label>
                          <div className="mt-1">
                            <input
                              type="number"
                              id="valor"
                              name="valor"
                              min="0"
                              max="20"
                              step="0.1"
                              value={calificacionForm.valor}
                              onChange={handleCalificacionChange}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              required
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">
                            Observaciones
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="observaciones"
                              name="observaciones"
                              rows="3"
                              value={calificacionForm.observaciones}
                              onChange={handleCalificacionChange}
                              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            ></textarea>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmitCalificacion}
                  disabled={savingCalificacion}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {savingCalificacion ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaSave className="mr-2" /> Guardar Calificación
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCalificacionModal(false);
                    setSelectedEstudiante(null);
                    setSelectedEvaluacion(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfesorDashboard;
