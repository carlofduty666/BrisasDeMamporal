import { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaEdit, 
  FaTrash, 
  FaArrowLeft,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaUsers,
  FaSearch,
  FaGraduationCap,
  FaInfoCircle,
  FaChartBar,
  FaCalendarAlt,
  FaUser,
  FaClipboardList,
  FaPlus,
  FaArrowRight
} from 'react-icons/fa';
import { formatearNombreGrado, formatearCedula } from '../../../utils/formatters';
import { getMateriaStyles, MateriaCard } from '../../../utils/materiaStyles';
import MateriaDetailModal from './MateriaDetailModal';
import AsignarProfesorGrado from './modals/AsignarProfesorGrado';
import QuitarProfesorGrado from './modals/QuitarProfesorGrado';
import TransferirEstudiantesSeccionModal from './modals/TransferirEstudiantesSeccionModal';

const GradoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [grado, setGrado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [annoEscolar, setAnnoEscolar] = useState(null);
  // Leer el parámetro 'tab' de la URL, por defecto 'info'
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'info');
  const [estudiantes, setEstudiantes] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [cupos, setCupos] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [evaluacionesPorMateria, setEvaluacionesPorMateria] = useState({});
  
  // Estados para filtrado de estudiantes
  const [searchEstudiante, setSearchEstudiante] = useState('');
  const [selectedSeccion, setSelectedSeccion] = useState('');
  
  // Estado para almacenar representantes de estudiantes
  const [representantes, setRepresentantes] = useState({});

  // Estados para modal de AsignarProfesorGrado
  const [showAsignProfesorGradoModal, setShowAsignProfesorGradoModal] = useState(false);
  const [todosLosProfesores, setTodosLosProfesores] = useState([]);

  // Estados para modal de QuitarProfesorGrado
  const [showQuitarProfesorGradoModal, setShowQuitarProfesorGradoModal] = useState(false);
  const [selectedProfesor, setSelectedProfesor] = useState(null);

  // Estados para modal de transferencia de estudiantes
  const [showTransferirEstudiantesModal, setShowTransferirEstudiantesModal] = useState(false);

  const token = localStorage.getItem('token');

  // Actualizar la pestaña activa cuando cambie el parámetro de la URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchGradoDetails();
  }, [id]);

  const fetchGradoDetails = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // Obtener año escolar activo
      const annoResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
        config
      );
      setAnnoEscolar(annoResponse.data);

      // Obtener información del grado
      const gradoResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${id}`,
        config
      );
      setGrado(gradoResponse.data);

      // Obtener cupos
      try {
        const cuposResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos/grado/${id}`,
          { 
            ...config,
            params: { annoEscolarID: annoResponse.data.id }
          }
        );
        
        const cupoInfo = cuposResponse.data.reduce((acc, cupo) => {
          const ocupados = cupo.ocupados || cupo.cupos_reales || 0;
          const capacidad = cupo.capacidad || 0;
          return {
            capacidad: (acc.capacidad || 0) + capacidad,
            ocupados: (acc.ocupados || 0) + ocupados,
            disponibles: (acc.disponibles || 0) + (capacidad - ocupados)
          };
        }, {});
        
        setCupos(cupoInfo);
      } catch (error) {
        console.error('Error al cargar cupos:', error);
        setCupos({ capacidad: 0, ocupados: 0, disponibles: 0 });
      }

      // Cargar secciones
      try {
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/grado/${id}`,
          { 
            ...config,
            params: { annoEscolarID: annoResponse.data.id }
          }
        );
        setSecciones(seccionesResponse.data);
      } catch (error) {
        console.error('Error al cargar secciones:', error);
        setSecciones([]);
      }

      // Cargar estudiantes
      try {
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${id}/estudiantes`,
          { 
            ...config,
            params: { 
              annoEscolarID: annoResponse.data.id,
              tipo: 'estudiante'
            }
          }
        );
        
        // Obtener información de sección para cada estudiante
        const estudiantesConSeccion = await Promise.all(
          estudiantesResponse.data.map(async (estudiante) => {
            try {
              const seccionEstudianteResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/estudiante/${estudiante.id}`,
                { 
                  ...config,
                  params: { annoEscolarID: annoResponse.data.id }
                }
              );
              
              const seccionEnEsteGrado = seccionEstudianteResponse.data.find(s => s.gradoID === parseInt(id));
              
              return {
                ...estudiante,
                seccionID: seccionEnEsteGrado?.id,
                seccion: seccionEnEsteGrado
              };
            } catch (error) {
              console.error(`Error al obtener sección para estudiante ${estudiante.id}:`, error);
              return estudiante;
            }
          })
        );
        
        setEstudiantes(estudiantesConSeccion);
        
        // Obtener representantes para cada estudiante
        const representantesMap = {};
        await Promise.all(
          estudiantesConSeccion.map(async (estudiante) => {
            try {
              const representanteResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/estudiante/${estudiante.id}/representante`,
                { 
                  ...config,
                  params: { annoEscolarID: annoResponse.data.id }
                }
              );
              representantesMap[estudiante.id] = representanteResponse.data;
            } catch (error) {
              console.error(`Error al obtener representante para estudiante ${estudiante.id}:`, error);
              representantesMap[estudiante.id] = null;
            }
          })
        );
        setRepresentantes(representantesMap);
      } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        setEstudiantes([]);
      }

      // Cargar profesores
      try {
        const profesoresResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${id}/profesores`,
          { 
            ...config,
            params: { 
              annoEscolarID: annoResponse.data.id,
              tipo: 'profesor'
            }
          }
        );
        setProfesores(profesoresResponse.data);
      } catch (error) {
        console.error('Error al cargar profesores:', error);
        setProfesores([]);
      }

      // Cargar materias
      try {
        const materiasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grado/${id}/materias`,
          { 
            ...config,
            params: { 
              annoEscolarID: annoResponse.data.id,
              limit: 0
            }
          }
        );
        setMaterias(materiasResponse.data);

        // Cargar evaluaciones por materia
        const evaluacionesMap = {};
        await Promise.all(
          materiasResponse.data.map(async (materia) => {
            try {
              const evaluacionesResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/evaluaciones/filtradas`,
                {
                  ...config,
                  params: {
                    materiaID: materia.id,
                    gradoID: id,
                    annoEscolarID: annoResponse.data.id
                  }
                }
              );
              evaluacionesMap[materia.id] = evaluacionesResponse.data.length;
            } catch (error) {
              console.error(`Error al cargar evaluaciones para materia ${materia.id}:`, error);
              evaluacionesMap[materia.id] = 0;
            }
          })
        );
        setEvaluacionesPorMateria(evaluacionesMap);
      } catch (error) {
        console.error('Error al cargar materias:', error);
        setMaterias([]);
      }

      // Cargar todos los profesores para el modal de AsignarProfesorGrado
      try {
        const profesoresResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas`,
          { ...config, params: { tipo: 'profesor' } }
        );
        
        let profesoresData = [];
        if (Array.isArray(profesoresResponse.data)) {
          profesoresData = profesoresResponse.data.filter(p => p.tipo === 'profesor');
        } else if (profesoresResponse.data?.tipo === 'profesor') {
          profesoresData = [profesoresResponse.data];
        }
        
        // Cargar materias para cada profesor
        const profesoresConMaterias = await Promise.all(
          profesoresData.map(async (profesor) => {
            try {
              const materiasResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/profesor/${profesor.id}`,
                config
              );
              
              // Obtener materias de este grado que el profesor tiene
              const materiasEnGrado = materiasResponse.data.filter(m => 
                m.gradosImpartidos && m.gradosImpartidos.some(g => g.id === parseInt(id))
              );
              const otrasMateria = materiasResponse.data.filter(m => 
                !m.gradosImpartidos || !m.gradosImpartidos.some(g => g.id === parseInt(id))
              );
              
              return {
                ...profesor,
                materiasAsignadas: materiasEnGrado.map(m => m.asignatura),
                otrasMateriasAsignadas: otrasMateria.map(m => m.asignatura)
              };
            } catch (error) {
              console.error(`Error al cargar materias para profesor ${profesor.id}:`, error);
              return {
                ...profesor,
                materiasAsignadas: [],
                otrasMateriasAsignadas: []
              };
            }
          })
        );
        
        setTodosLosProfesores(profesoresConMaterias);
      } catch (error) {
        console.error('Error al cargar profesores:', error);
        setTodosLosProfesores([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error al cargar detalles del grado:', error);
      setError('Error al cargar los detalles del grado. Por favor, intente de nuevo.');
      setLoading(false);
      
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  // Filtrar estudiantes por sección y término de búsqueda
  const filteredEstudiantes = useMemo(() => {
    return estudiantes.filter(estudiante => {
      const matchesSearch = searchEstudiante === '' || 
        `${estudiante.nombre} ${estudiante.apellido}`.toLowerCase().includes(searchEstudiante.toLowerCase()) ||
        (estudiante.cedula && estudiante.cedula.toLowerCase().includes(searchEstudiante.toLowerCase()));
      
      const matchesSeccion = selectedSeccion === '' || 
        (estudiante.seccionID && estudiante.seccionID.toString() === selectedSeccion);
      
      return matchesSearch && matchesSeccion;
    });
  }, [estudiantes, searchEstudiante, selectedSeccion]);

  // Agrupar estudiantes por sección
  const estudiantesPorSeccion = useMemo(() => {
    const grupos = {};
    
    secciones.forEach(seccion => {
      grupos[seccion.id] = {
        seccion: seccion,
        estudiantes: []
      };
    });
    
    filteredEstudiantes.forEach(estudiante => {
      const seccionID = estudiante.seccion?.id || estudiante.seccionID;
      
      if (seccionID && grupos[seccionID]) {
        grupos[seccionID].estudiantes.push(estudiante);
      } else {
        if (!grupos['sin_seccion']) {
          grupos['sin_seccion'] = {
            seccion: { id: 'sin_seccion', nombre_seccion: 'Sin sección asignada' },
            estudiantes: []
          };
        }
        grupos['sin_seccion'].estudiantes.push(estudiante);
      }
    });
    
    return grupos;
  }, [filteredEstudiantes, secciones]);

  const handleDeleteGrado = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccessMessage(`El grado ${formatearNombreGrado(grado.nombre_grado)} ha sido eliminado correctamente.`);
      setTimeout(() => {
        navigate('/admin/academico/grados');
      }, 2000);
    } catch (error) {
      console.error('Error al eliminar grado:', error);
      setError('No se pudo eliminar el grado. Verifique que no tenga estudiantes o profesores asignados.');
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleAsignProfesorGrado = async (form) => {
    // El modal maneja los mensajes de éxito/error
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/asignar-profesor-grado`,
      form,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    // Refrescar profesores del grado después de la asignación
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${id}/profesores`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { 
            annoEscolarID: annoEscolar?.id,
            tipo: 'profesor'
          }
        }
      );
      setProfesores(response.data);
    } catch (error) {
      console.warn('Error al refrescar profesores:', error);
    }
    
    return response;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-pulse"></div>
          </div>
          <p className="mt-4 text-indigo-600 font-medium">Cargando detalles del grado...</p>
        </div>
      </div>
    );
  }

  if (error && !grado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <FaInfoCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar</h3>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => navigate('/admin/academico/grados')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
            >
              <FaArrowLeft className="mr-2" />
              Volver a la lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  const porcentajeOcupacion = cupos.capacidad > 0 
    ? Math.round((cupos.ocupados / cupos.capacidad) * 100) 
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-800 to-indigo-900 shadow-2xl rounded-2xl mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-transparent"></div>

        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-indigo-300/10 rounded-full blur-2xl"></div>
        
        <div className="relative px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <button
                  onClick={() => navigate('/admin/academico/grados')}
                  className="p-2 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
                >
                  <FaArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="p-3 bg-indigo-500/20 rounded-xl backdrop-blur-sm border border-indigo-400/30">
                  <FaGraduationCap className="w-8 h-8 text-indigo-200" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {grado && formatearNombreGrado(grado.nombre_grado)}
                  </h1>
                  <p className="text-indigo-200 text-lg">
                    {grado?.Niveles 
                      ? grado.Niveles.nombre_nivel.charAt(0).toUpperCase() + grado.Niveles.nombre_nivel.slice(1)
                      : 'Nivel no asignado'}
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-200 text-sm font-medium">Secciones</p>
                      <p className="text-2xl font-bold text-white">{secciones.length}</p>
                    </div>
                    <FaUsers className="w-8 h-8 text-indigo-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-200 text-sm font-medium">Estudiantes</p>
                      <p className="text-2xl font-bold text-white">{estudiantes.length}</p>
                    </div>
                    <FaUserGraduate className="w-8 h-8 text-indigo-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-200 text-sm font-medium">Profesores</p>
                      <p className="text-2xl font-bold text-white">{profesores.length}</p>
                    </div>
                    <FaChalkboardTeacher className="w-8 h-8 text-indigo-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-200 text-sm font-medium">Materias</p>
                      <p className="text-2xl font-bold text-white">{materias.length}</p>
                    </div>
                    <FaBook className="w-8 h-8 text-indigo-300" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-8 lg:mt-0 lg:ml-8 flex flex-col space-y-3">
              <Link
                to={`/admin/academico/grados/${id}/editar`}
                className="inline-flex items-center justify-center px-6 py-3 bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg"
              >
                <FaEdit className="w-4 h-4 mr-2" />
                Editar Grado
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center justify-center px-6 py-3 bg-red-500/20 backdrop-blur-md text-white font-semibold rounded-xl border border-red-400/30 hover:bg-red-500/30 transition-all duration-300 shadow-lg"
              >
                <FaTrash className="w-4 h-4 mr-2" />
                Eliminar Grado
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700 p-4 mb-6 rounded-r-lg shadow-sm animate-fade-in">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg shadow-sm animate-fade-in">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'info'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaInfoCircle className="inline-block w-4 h-4 mr-2" />
              Información
            </button>
            <button
              onClick={() => setActiveTab('estudiantes')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'estudiantes'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUserGraduate className="inline-block w-4 h-4 mr-2" />
              Estudiantes ({estudiantes.length})
            </button>
            <button
              onClick={() => setActiveTab('profesores')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'profesores'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaChalkboardTeacher className="inline-block w-4 h-4 mr-2" />
              Profesores ({profesores.length})
            </button>
            <button
              onClick={() => setActiveTab('materias')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === 'materias'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaClipboardList className="inline-block w-4 h-4 mr-2" />
              Materias y Evaluaciones ({materias.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Información Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Información General */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-6 border border-indigo-200">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center">
                    <FaInfoCircle className="mr-2" />
                    Información General
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-indigo-700">Nombre del Grado</dt>
                      <dd className="mt-1 text-sm text-indigo-900 font-semibold uppercase">
                        {grado && formatearNombreGrado(grado.nombre_grado)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-indigo-700">Nivel Educativo</dt>
                      <dd className="mt-1 text-sm text-indigo-900 font-semibold uppercase">
                        {grado?.Niveles 
                          ? grado.Niveles.nombre_nivel.charAt(0).toUpperCase() + grado.Niveles.nombre_nivel.slice(1)
                          : 'No asignado'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-indigo-700">Año Escolar</dt>
                      <dd className="mt-1 text-sm text-indigo-900 font-semibold">
                        {annoEscolar?.periodo || 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Cupos */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                    <FaChartBar className="mr-2" />
                    Cupos Disponibles
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-700">Capacidad Total</span>
                      <span className="text-2xl font-bold text-blue-900">{cupos.capacidad || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-700">Cupos Ocupados</span>
                      <span className="text-2xl font-bold text-blue-900">{cupos.ocupados || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-blue-700">Cupos Disponibles</span>
                      <span className="text-2xl font-bold text-green-600">{cupos.disponibles || 0}</span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-blue-700 mb-2">
                        <span>Ocupación</span>
                        <span className="font-bold">{porcentajeOcupacion}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-4">
                        <div 
                          className={`h-4 rounded-full transition-all duration-300 ${
                            porcentajeOcupacion >= 90 ? 'bg-red-500' : 
                            porcentajeOcupacion >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${porcentajeOcupacion}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secciones */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                  <FaUsers className="mr-2" />
                  Secciones ({secciones.length})
                </h3>
                {secciones.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {secciones.map((seccion) => (
                      <div key={seccion.id} className="bg-white rounded-xl p-4 border border-purple-200 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-purple-900">{seccion.nombre_seccion}</p>
                            <p className="text-sm text-purple-600">
                              {estudiantes.filter(e => e.seccionID === seccion.id).length} estudiantes
                            </p>
                          </div>
                          <FaUsers className="w-6 h-6 text-purple-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-purple-600 text-center py-4">No hay secciones asignadas a este grado</p>
                )}
              </div>
            </div>
          )}

          {/* Estudiantes Tab */}
          {activeTab === 'estudiantes' && (
            <div className="space-y-6">
              {/* Filtros y Botones */}
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar estudiante..."
                      value={searchEstudiante}
                      onChange={(e) => setSearchEstudiante(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="md:w-64">
                  <select
                    value={selectedSeccion}
                    onChange={(e) => setSelectedSeccion(e.target.value)}
                    className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                  >
                    <option value="">Todas las secciones</option>
                    {secciones.map((seccion) => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.nombre_seccion}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowTransferirEstudiantesModal(true)}
                  className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-medium hover:shadow-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                >
                  <FaArrowRight className="w-4 h-4" />
                  Transferir
                </button>
              </div>

              {/* Lista de estudiantes por sección */}
              {Object.entries(estudiantesPorSeccion).map(([seccionId, grupo]) => {
                if (grupo.estudiantes.length === 0) return null;
                
                return (
                  <div key={seccionId} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaUsers className="mr-2 text-indigo-600" />
                      {grupo.seccion.nombre_seccion} ({grupo.estudiantes.length} estudiantes)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {grupo.estudiantes.map((estudiante) => {
                        const representante = representantes[estudiante.id];
                        return (
                          <Link
                            key={estudiante.id}
                            to={`/admin/estudiantes/${estudiante.id}`}
                            className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg hover:border-indigo-300 transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {estudiante.nombre?.charAt(0)}{estudiante.apellido?.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {estudiante.nombre} {estudiante.apellido}
                                </p>
                                <p className="text-xs text-gray-500 mb-1">
                                  C.I: V-{formatearCedula(estudiante.cedula)}
                                </p>
                                {representante && (
                                  <div className="flex items-center text-xs text-indigo-600 mt-2">
                                    <FaUser className="w-3 h-3 mr-1" />
                                    <span className="truncate">
                                      {representante.nombre} {representante.apellido}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredEstudiantes.length === 0 && (
                <div className="text-center py-12">
                  <FaUserGraduate className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No se encontraron estudiantes</p>
                  <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
                </div>
              )}
            </div>
          )}

          {/* Profesores Tab */}
          {activeTab === 'profesores' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tarjeta para Asignar Profesor a Grado */}
                <button
                  onClick={() => setShowAsignProfesorGradoModal(true)}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-dashed border-purple-300 hover:shadow-lg hover:border-purple-400 transition-all duration-200 cursor-pointer transform hover:-translate-y-1 flex flex-col items-center justify-center min-h-[200px] group"
                >
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4 group-hover:shadow-lg transition-all">
                    <FaPlus className="text-2xl text-white font-bold" />
                  </div>
                  <p className="text-sm font-semibold text-purple-900 text-center">
                    Asignar Profesor a Grado
                  </p>
                  <p className="text-xs text-purple-600 text-center mt-1">
                    Agregar un nuevo profesor a este grado
                  </p>
                </button>

                {profesores.map((profesor) => (
                  <div
                    key={profesor.id}
                    className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200 hover:shadow-lg hover:border-emerald-300 transition-all duration-200 transform hover:-translate-y-1 relative group"
                  >
                    {/* Botón de eliminar - Posicionado en la esquina superior derecha */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedProfesor(profesor);
                        setShowQuitarProfesorGradoModal(true);
                      }}
                      className="absolute top-3 right-3 p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:shadow-lg hover:from-indigo-600 hover:to-indigo-700"
                      title="Quitar profesor del grado"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>

                    {/* Contenido clickeable que lleva al perfil del profesor */}
                    <Link
                      to={`/admin/profesores/${profesor.id}`}
                      onClick={(e) => {
                        // Prevenir navegación si se hace clic en el botón de eliminar
                        if (e.target.closest('button')) {
                          e.preventDefault();
                        }
                      }}
                      className="block cursor-pointer"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              {profesor.nombre?.charAt(0)}{profesor.apellido?.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-emerald-900 truncate">
                            {profesor.nombre} {profesor.apellido}
                          </p>
                          <p className="text-xs text-emerald-600">
                            C.I: V-{formatearCedula(profesor.cedula)}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-emerald-700 mb-2">
                          <FaBook className="w-4 h-4 mr-2" />
                          <span className="font-semibold">{profesor.materias?.length || 0} materias</span>
                        </div>
                        {profesor.materias && profesor.materias.length > 0 && (
                          <div className="space-y-1">
                            {profesor.materias.map((materia, index) => {
                              const { bgColor, textColor, iconColor, Icon } = getMateriaStyles(materia.asignatura, 'full');
                              return (
                                <div 
                                  key={index} 
                                  className={`flex items-center text-xs ${bgColor} ${textColor} rounded-lg px-2 py-1.5 border border-opacity-20`}
                                  style={{ borderColor: iconColor }}
                                >
                                  <Icon className={`w-3 h-3 mr-1.5 flex-shrink-0 ${iconColor}`} />
                                  <span className="truncate font-medium">{materia.asignatura}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        {profesor.email && (
                          <p className="text-xs text-emerald-600 truncate mt-2">{profesor.email}</p>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>

              {profesores.length === 0 && (
                <div className="text-center py-12">
                  <FaChalkboardTeacher className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No hay profesores asignados</p>
                  <p className="text-gray-400 text-sm mt-2">Asigna profesores a este grado para comenzar</p>
                </div>
              )}
            </div>
          )}

          {/* Materias Tab */}
          {activeTab === 'materias' && (
            <div className="space-y-6">
              {/* Mensaje instructivo */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded-lg p-4">
                <div className="flex items-start">
                  <FaInfoCircle className="w-5 h-5 text-indigo-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-indigo-900 mb-1">
                      Selecciona una materia para ver detalles
                    </h4>
                    <p className="text-sm text-indigo-700">
                      Haz clic en cualquier materia para ver sus evaluaciones, calificaciones y estadísticas detalladas.
                    </p>
                  </div>
                </div>
              </div>

              {materias.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {materias.map((materia) => {
                    const { bgColor, textColor, iconColor, borderColor, Icon } = getMateriaStyles(materia.asignatura, 'full');
                    const profesoresAsignados = materia.profesoresAsignados || [];
                    const numEvaluaciones = evaluacionesPorMateria[materia.id] || 0;
                    
                    return (
                      <div
                        key={materia.id}
                        onClick={() => setSelectedMateria(materia)}
                        className={`${bgColor} rounded-2xl p-6 border-2 ${borderColor} hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:-translate-y-1 hover:scale-105`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 bg-white/50 rounded-xl`}>
                            <Icon className={`w-6 h-6 ${iconColor}`} />
                          </div>
                          <span className={`px-3 py-1 ${textColor} bg-white/50 rounded-full text-xs font-semibold`}>
                            {materia.codigo || `MAT-${materia.id}`}
                          </span>
                        </div>
                        <h4 className={`text-lg font-bold ${textColor} mb-3`}>
                          {materia.asignatura}
                        </h4>
                        
                        {/* Información de evaluaciones */}
                        <div className="mb-3 space-y-2">
                          <div className={`flex items-center justify-between bg-white/40 rounded-lg px-3 py-2`}>
                            <div className="flex items-center">
                              <FaClipboardList className={`w-4 h-4 mr-2 ${iconColor}`} />
                              <span className={`text-sm font-medium ${textColor}`}>Evaluaciones</span>
                            </div>
                            <span className={`text-lg font-bold ${textColor}`}>
                              {numEvaluaciones}
                            </span>
                          </div>
                          
                          {/* Información por sección */}
                          {/* {secciones.length > 0 && (
                            <div className={`flex items-center justify-between bg-white/40 rounded-lg px-3 py-2`}>
                              <div className="flex items-center">
                                <FaUsers className={`w-4 h-4 mr-2 ${iconColor}`} />
                                <span className={`text-sm font-medium ${textColor}`}>Secciones</span>
                              </div>
                              <span className={`text-lg font-bold ${textColor}`}>
                                {secciones.length}
                              </span>
                            </div>
                          )} */}
                        </div>

                        {/* Profesores asignados */}
                        {profesoresAsignados.length > 0 ? (
                          <div className="space-y-1">
                            {profesoresAsignados.map((profesor, index) => (
                              <div key={index} className={`text-sm ${textColor} flex items-center bg-white/30 rounded-lg px-2 py-1`}>
                                <FaChalkboardTeacher className="w-3 h-3 mr-2 flex-shrink-0" />
                                <span className="truncate">{profesor.nombre} {profesor.apellido}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className={`text-sm ${textColor} opacity-70 italic`}>
                            Sin profesor asignado
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaBook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No hay materias asignadas</p>
                  <p className="text-gray-400 text-sm mt-2">Asigna materias a este grado para comenzar</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación para eliminar grado */}
      {showDeleteModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto animate-fade-in">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowDeleteModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FaTrash className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Eliminar Grado
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Está seguro de que desea eliminar el grado <strong>{grado && formatearNombreGrado(grado.nombre_grado)}</strong>? Esta acción no se puede deshacer.
                      </p>
                      <p className="text-sm text-red-500 mt-2">
                        Nota: Solo se pueden eliminar grados que no tengan estudiantes o profesores asignados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteGrado}
                  disabled={deleteLoading}
                  className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-all duration-200"
                >
                  {deleteLoading ? 'Eliminando...' : 'Eliminar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles de materia con evaluaciones y calificaciones */}
      {selectedMateria && grado && annoEscolar && (
        <MateriaDetailModal
          materia={selectedMateria}
          grado={grado}
          annoEscolar={annoEscolar}
          onClose={() => setSelectedMateria(null)}
        />
      )}

      {/* Modal para asignar profesor a grado */}
      <AsignarProfesorGrado
        isOpen={showAsignProfesorGradoModal}
        onClose={() => setShowAsignProfesorGradoModal(false)}
        materia={null}
        grados={[grado]}
        profesores={todosLosProfesores}
        secciones={secciones}
        annoEscolar={annoEscolar}
        loading={loading}
        onSubmit={handleAsignProfesorGrado}
        profesoresYaAsignados={[]}
        preselectedGradoID={parseInt(id)}
        showMateria={false}
      />

      {/* Modal para quitar profesor del grado */}
      <QuitarProfesorGrado
        isOpen={showQuitarProfesorGradoModal}
        onClose={() => {
          setShowQuitarProfesorGradoModal(false);
          setSelectedProfesor(null);
        }}
        profesor={selectedProfesor}
        grado={grado}
        annoEscolar={annoEscolar}
        onRefresh={fetchGradoDetails}
      />

      {/* Modal para transferir estudiantes entre secciones */}
      <TransferirEstudiantesSeccionModal
        isOpen={showTransferirEstudiantesModal}
        onClose={() => setShowTransferirEstudiantesModal(false)}
        estudiantes={estudiantes}
        secciones={secciones}
        gradoID={parseInt(id)}
        annoEscolarID={annoEscolar?.id}
        onTransferComplete={fetchGradoDetails}
        token={token}
      />
    </div>
  );
};

export default GradoDetail;