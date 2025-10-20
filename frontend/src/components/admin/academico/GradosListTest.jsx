import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaTrash, FaEye, FaUserGraduate, FaChalkboardTeacher, FaBook, FaUsers, FaSearch, FaFilter, FaChevronDown, FaChevronUp, FaComments, FaGlobe, FaCalculator, FaPalette, FaRunning, FaLanguage, FaLaptop, FaFlask, FaAtom, FaPencilRuler, FaBrain, FaProjectDiagram, FaMoneyBillWave, FaChartBar } from 'react-icons/fa';
import { FaEarthAmericas } from "react-icons/fa6";
import { GiChemicalDrop } from "react-icons/gi";
import { formatearNombreGrado } from '../../../utils/formatters';
import { getMateriaStyles, MateriaCard } from '../../../utils/materiaStyles';

const GradosList = () => {
  const [grados, setGrados] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [selectedGrado, setSelectedGrado] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [estudiantes, setEstudiantes] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [cupos, setCupos] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gradoToDelete, setGradoToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedMateria, setSelectedMateria] = useState(null);
  
  // Estados para filtrado y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para filtrado de estudiantes
  const [searchEstudiante, setSearchEstudiante] = useState('');
  const [selectedSeccion, setSelectedSeccion] = useState('');

  // Obtener token de autenticación
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener año escolar activo
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setAnnoEscolar(annoResponse.data);
        
        // Obtener niveles educativos
        const nivelesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/nivel`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setNiveles(nivelesResponse.data);
        
        // Obtener grados
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { include: 'niveles' } // Solicitar que incluya la información de niveles
          }
        );
        setGrados(gradosResponse.data);
        
        // Obtener información de cupos
        try {
          const cuposResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos/resumen`,
            { 
              headers: { 'Authorization': `Bearer ${token}` },
              params: { annoEscolarID: annoResponse.data.id }
            }
          );
          
          const cuposData = {};
          if (cuposResponse.data && cuposResponse.data.cuposPorGrado) {
            Object.entries(cuposResponse.data.cuposPorGrado).forEach(([gradoID, cupoInfo]) => {
              cuposData[gradoID] = {
                capacidad: cupoInfo.capacidadTotal || 0,
                ocupados: cupoInfo.ocupados || 0,
                disponibles: cupoInfo.disponibles || 0
              };
            });
          }
          setCupos(cuposData);
        } catch (error) {
          console.error('Error al cargar cupos:', error);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos. Por favor, intente de nuevo.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);
  
  // Filtrar grados según búsqueda y nivel seleccionado
  const filteredGrados = useMemo(() => {
    return grados.filter(grado => {
      const matchesSearch = searchTerm === '' || 
        formatearNombreGrado(grado.nombre_grado).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesNivel = selectedNivel === '' || 
        (grado.nivelID && grado.nivelID.toString() === selectedNivel) ||
        (grado.Niveles && grado.Niveles.id.toString() === selectedNivel);
      
      return matchesSearch && matchesNivel;
    });
  }, [grados, searchTerm, selectedNivel]);
  
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
    
    // Inicializar grupos con todas las secciones
    secciones.forEach(seccion => {
      grupos[seccion.id] = {
        seccion: seccion,
        estudiantes: []
      };
    });
    
    // Agrupar estudiantes por sección
    filteredEstudiantes.forEach(estudiante => {
      // Verificar si el estudiante tiene información de inscripción con sección
      const seccionID = estudiante.seccion?.id || estudiante.seccionID || 
                        (estudiante.inscripcion && estudiante.inscripcion.seccionID);
      
      if (seccionID && grupos[seccionID]) {
        grupos[seccionID].estudiantes.push(estudiante);
      } else {
        // Si no tiene sección asignada o la sección no existe en el grupo
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

  const loadGradoDetails = async (grado) => {
    setSelectedGrado(grado);
    setActiveTab('info');
    setLoadingDetails(true);
    
    try {
      // Cargar estudiantes
      try {
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${grado.id}/estudiantes`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { 
              annoEscolarID: annoEscolar.id,
              tipo: 'estudiante'
            }
          }
        );
        
        // Obtener información de sección para cada estudiante
        const estudiantesConSeccion = [];
        
        for (const estudiante of estudiantesResponse.data) {
          try {
            // Buscar la inscripción actual del estudiante que incluye la sección
            const inscripcionResponse = await axios.get(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones/estudiante/${estudiante.id}/actual`,
              { 
                headers: { 'Authorization': `Bearer ${token}` },
                params: { annoEscolarID: annoEscolar.id }
              }
            );
            
            if (inscripcionResponse.data && inscripcionResponse.data.seccionID) {
              // Buscar la información completa de la sección
              const seccion = secciones.find(s => s.id === inscripcionResponse.data.seccionID);
              
              estudiantesConSeccion.push({
                ...estudiante,
                seccionID: inscripcionResponse.data.seccionID,
                seccion: seccion || null,
                inscripcion: inscripcionResponse.data
              });
            } else {
              estudiantesConSeccion.push(estudiante);
            }
          } catch (error) {
            console.error(`Error al obtener inscripción para estudiante ${estudiante.id}:`, error);
            estudiantesConSeccion.push(estudiante);
          }
        }
        
        setEstudiantes(estudiantesConSeccion);
      } catch (estudiantesError) {
        console.error('Error al cargar estudiantes:', estudiantesError);
        setEstudiantes([]);
      }
      
      // Cargar profesores
      try {
        const profesoresResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${grado.id}/profesores`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { 
              annoEscolarID: annoEscolar.id,
              tipo: 'profesor'
            }
          }
        );
        setProfesores(profesoresResponse.data);
      } catch (profesoresError) {
        console.error('Error al cargar profesores:', profesoresError);
        setProfesores([]);
      }
      
      // Cargar materias
      try {
        const materiasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grado/${grado.id}/materias`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { 
              annoEscolarID: annoEscolar.id,
              limit: 0
            }
          }
        );
        setMaterias(materiasResponse.data);
      } catch (materiasError) {
        console.error('Error al cargar materias:', materiasError);
        setMaterias([]);
      }
      
      // Cargar secciones
      try {
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/grado/${grado.id}`,
          { 
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        setSecciones(seccionesResponse.data);
      } catch (seccionesError) {
        console.error('Error al cargar secciones:', seccionesError);
        setSecciones([]);
      }
      
      setLoadingDetails(false);
    } catch (error) {
      console.error('Error general al cargar detalles del grado:', error);
      setLoadingDetails(false);
    }
  };

  // Función para confirmar eliminación de grado
  const confirmDelete = (grado) => {
    setGradoToDelete(grado);
    setShowDeleteModal(true);
  };

  // Función para eliminar grado
  const handleDeleteGrado = async () => {
    if (!gradoToDelete) return;
    
    setDeleteLoading(true);
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${gradoToDelete.id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Actualizar la lista de grados
      setGrados(grados.filter(g => g.id !== gradoToDelete.id));
      
      // Si el grado eliminado es el seleccionado, limpiar la selección
      if (selectedGrado && selectedGrado.id === gradoToDelete.id) {
        setSelectedGrado(null);
      }
      
      setSuccessMessage(`El grado ${formatearNombreGrado(gradoToDelete.nombre_grado)} ha sido eliminado correctamente.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setShowDeleteModal(false);
      setGradoToDelete(null);
      setDeleteLoading(false);
    } catch (error) {
      console.error('Error al eliminar grado:', error);
      setError('No se pudo eliminar el grado. Verifique que no tenga estudiantes o profesores asignados.');
      setDeleteLoading(false);
    }
  };

  const handleShowMateriaDetails = (materia) => {
    setSelectedMateria(materia);
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Gestión de Grados</h1>
        <Link
          to="/admin/academico/grados/nuevo"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Nuevo Grado
        </Link>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      
      {annoEscolar && (
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <h2 className="text-lg font-medium text-blue-800">
            Año Escolar: {annoEscolar.periodo}
            {annoEscolar.activo ? ' (Activo)' : ''}
          </h2>
          <p className="text-sm text-blue-600 mt-1">
            Los datos mostrados corresponden al año escolar actual.
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Panel de filtros y lista de grados */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
              <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-800">Filtros</h2>
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showFilters ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
              
              {showFilters && (
  <div className="p-4 border-b">
    <div className="mb-4">
      <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">
        Nivel Educativo
      </label>
      <select
        id="nivel"
        value={selectedNivel}
        onChange={(e) => setSelectedNivel(e.target.value)}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="">Todos los niveles</option>
        {niveles.map((nivel) => (
          <option key={nivel.id} value={nivel.id}>
            {nivel.nombre_nivel.charAt(0).toUpperCase() + nivel.nombre_nivel.slice(1)}
          </option>
        ))}
      </select>
    </div>
  </div>
)}
              
              <div className="p-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar grado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
                {filteredGrados.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No se encontraron grados con los filtros seleccionados.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {filteredGrados.map((grado) => {
                      // Obtener información del nivel
                      const nivelInfo = grado.Niveles || niveles.find(n => n.id === grado.nivelID);
                      const nivelNombre = nivelInfo ? nivelInfo.nombre_nivel : 'No asignado';
                      
                      // Obtener información de cupos
                      const cupoInfo = cupos[grado.id] || { capacidad: 0, ocupados: 0, disponibles: 0 };
                      const porcentajeOcupacion = cupoInfo.capacidad > 0 
                        ? Math.round((cupoInfo.ocupados / cupoInfo.capacidad) * 100) 
                        : 0;
                      
                      return (
                        <li 
                          key={grado.id}
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedGrado && selectedGrado.id === grado.id ? 'bg-indigo-50' : ''}`}
                          onClick={() => loadGradoDetails(grado)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-md font-medium text-gray-900">
                                {formatearNombreGrado(grado.nombre_grado)}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                Nivel: {nivelNombre.charAt(0).toUpperCase() + nivelNombre.slice(1)}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              {/* <Link
                                to={`/admin/academico/grados/${grado.id}/editar`}
                                className="text-indigo-600 hover:text-indigo-900"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FaEdit />
                              </Link> */}
                              {/* <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  confirmDelete(grado);
                                }}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FaTrash />
                              </button> */}
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Cupos: {cupoInfo.ocupados}/{cupoInfo.capacidad}</span>
                              <span>{porcentajeOcupacion}% ocupado</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  porcentajeOcupacion >= 90 ? 'bg-red-500' : 
                                  porcentajeOcupacion >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${porcentajeOcupacion}%` }}
                              ></div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
          
          {/* Panel de detalles del grado seleccionado */}
          <div className="md:w-2/3">
            {selectedGrado ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {formatearNombreGrado(selectedGrado.nombre_grado)}
                    </h2>
                    <div className="flex space-x-2">
                      <Link
                        to={`/admin/academico/grados/${selectedGrado.id}/editar`}
                        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-200 flex items-center"
                      >
                        <FaEdit className="mr-1" /> Editar
                      </Link>
                      {/* <button
                        onClick={() => confirmDelete(selectedGrado)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 flex items-center"
                      >
                        <FaTrash className="mr-1" /> Eliminar
                      </button> */}
                    </div>
                  </div>
                  
                  {/* Información del nivel */}
                  <div className="mt-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Nivel:</span>{' '}
                      {selectedGrado.Niveles 
                        ? selectedGrado.Niveles.nombre_nivel.charAt(0).toUpperCase() + selectedGrado.Niveles.nombre_nivel.slice(1)
                        : niveles.find(n => n.id === selectedGrado.nivelID)?.nombre_nivel.charAt(0).toUpperCase() + niveles.find(n => n.id === selectedGrado.nivelID)?.nombre_nivel.slice(1) || 'No asignado'}
                    </p>
                  </div>
                </div>
                
                {/* Pestañas de navegación */}
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab('info')}
                      className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                        activeTab === 'info'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Información
                    </button>
                    <button
                      onClick={() => setActiveTab('estudiantes')}
                      className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                        activeTab === 'estudiantes'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Estudiantes ({estudiantes.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('profesores')}
                      className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                        activeTab === 'profesores'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Profesores ({profesores.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('materias')}
                      className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                        activeTab === 'materias'
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Materias ({materias.length})
                    </button>
                  </nav>
                </div>
                
                {/* Contenido de las pestañas */}
                <div className="p-6">
                  {loadingDetails ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : (
                    <>
                      {/* Pestaña de Información */}
                      {activeTab === 'info' && (
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Grado</h3>
                          
                          <div className="bg-gray-50 p-4 rounded-md mb-6">
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                                <dd className="mt-1 text-sm text-gray-900">{formatearNombreGrado(selectedGrado.nombre_grado)}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Nivel Educativo</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {selectedGrado.Niveles 
                                    ? selectedGrado.Niveles.nombre_nivel.charAt(0).toUpperCase() + selectedGrado.Niveles.nombre_nivel.slice(1)
                                    : niveles.find(n => n.id === selectedGrado.nivelID)?.nombre_nivel.charAt(0).toUpperCase() + niveles.find(n => n.id === selectedGrado.nivelID)?.nombre_nivel.slice(1) || 'No asignado'}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-gray-500">Descripción</dt>
                                <dd className="mt-1 text-sm text-gray-900">{selectedGrado.descripcion || 'Sin descripción'}</dd>
                              </div>
                            </dl>
                          </div>
                          
                          {/* Resumen de estadísticas */}
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-md shadow-sm">
                              <div className="flex items-center">
                                <div className="p-3 rounded-full bg-blue-100 mr-4">
                                  <FaUsers className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-blue-500">Estudiantes</p>
                                  <p className="text-xl font-semibold text-blue-700">{estudiantes.length}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-green-50 p-4 rounded-md shadow-sm">
                              <div className="flex items-center">
                                <div className="p-3 rounded-full bg-green-100 mr-4">
                                  <FaChalkboardTeacher className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-green-500">Profesores</p>
                                  <p className="text-xl font-semibold text-green-700">{profesores.length}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-purple-50 p-4 rounded-md shadow-sm">
                              <div className="flex items-center">
                              <div className="p-3 rounded-full bg-purple-100 mr-4">
                                <FaBook className="h-6 w-6 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-sm text-purple-500">Materias</p>
                                <p className="text-xl font-semibold text-purple-700">{materias.length}</p>
                              </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Secciones y Cupos */}
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Secciones y Cupos</h3>
                          <div className="bg-gray-50 p-4 rounded-md mb-6">
                            {secciones.length > 0 ? (
                              <div>
                                <div className="mb-4">
                                  <h4 className="text-md font-medium text-gray-800 mb-2">Resumen de Cupos</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                      <p className="text-sm text-gray-500">Capacidad Total</p>
                                      <p className="text-xl font-semibold text-gray-900">
                                        {secciones.reduce((total, seccion) => total + (seccion.capacidad || 0), 0)}
                                      </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                      <p className="text-sm text-gray-500">Cupos Ocupados</p>
                                      <p className="text-xl font-semibold text-gray-900">
                                        {cupos[selectedGrado.id]?.ocupados || 0}
                                      </p>
                                    </div>
                                    <div className="bg-white p-3 rounded-md shadow-sm">
                                      <p className="text-sm text-gray-500">Cupos Disponibles</p>
                                      <p className="text-xl font-semibold text-gray-900">
                                        {cupos[selectedGrado.id]?.disponibles || 
                                          (secciones.reduce((total, seccion) => total + (seccion.capacidad || 0), 0) - 
                                          (cupos[selectedGrado.id]?.ocupados || 0))}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <h4 className="text-md font-medium text-gray-800 mb-2">Secciones</h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                      <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Sección
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Capacidad
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Estado
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Ocupación
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {secciones.map((seccion) => {
                                        // Calcular ocupación de la sección
                                        const seccionCupos = cupos[`${selectedGrado.id}-${seccion.id}`] || { ocupados: 0 };
                                        const porcentajeOcupacion = seccion.capacidad > 0 
                                          ? Math.round((seccionCupos.ocupados / seccion.capacidad) * 100) 
                                          : 0;
                                        
                                        return (
                                          <tr key={seccion.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                              {seccion.nombre_seccion}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              {seccion.capacidad}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                seccion.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                              }`}>
                                                {seccion.activo ? 'Activo' : 'Inactivo'}
                                              </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                              <div className="flex items-center">
                                                <div className="w-full bg-gray-200 rounded-full h-2 mr-2 flex-grow">
                                                  <div 
                                                    className={`h-2 rounded-full ${
                                                      porcentajeOcupacion >= 90 ? 'bg-red-500' : 
                                                      porcentajeOcupacion >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                                    }`}
                                                    style={{ width: `${porcentajeOcupacion}%` }}
                                                  ></div>
                                                </div>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                  {seccionCupos.ocupados}/{seccion.capacidad}
                                                </span>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                                
                                <div className="mt-4 flex justify-end">
                                  <Link
                                    to={`/admin/academico/grados/${selectedGrado.id}/secciones`}
                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                  >
                                    Administrar secciones →
                                  </Link>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-6">
                                <p className="text-gray-500 mb-4">No hay secciones creadas para este grado.</p>
                                <Link
                                  to={`/admin/academico/grados/${selectedGrado.id}/secciones/nueva`}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                  Crear Sección
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Pestaña de Estudiantes */}
                      {activeTab === 'estudiantes' && (
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Estudiantes Inscritos</h3>
                          </div>
                          
                          {/* Filtros para estudiantes */}
                          <div className="bg-gray-50 p-4 rounded-md mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="searchEstudiante" className="block text-sm font-medium text-gray-700 mb-1">
                                  Buscar estudiante
                                </label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="h-4 w-4 text-gray-400" />
                                  </div>
                                  <input
                                    type="text"
                                    id="searchEstudiante"
                                    placeholder="Nombre o cédula..."
                                    value={searchEstudiante}
                                    onChange={(e) => setSearchEstudiante(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label htmlFor="seccionFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                  Filtrar por sección
                                </label>
                                <select
                                  id="seccionFilter"
                                  value={selectedSeccion}
                                  onChange={(e) => setSelectedSeccion(e.target.value)}
                                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                  <option value="">Todas las secciones</option>
                                  {secciones.map((seccion) => (
                                    <option key={seccion.id} value={seccion.id}>
                                      {seccion.nombre_seccion}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                          
                          {estudiantes.length > 0 ? (
                            <div>
                              {/* Mostrar estudiantes agrupados por sección */}
                              {Object.entries(estudiantesPorSeccion).map(([seccionId, grupo]) => (
                                <div key={seccionId} className="mb-6">
                                  <h4 className="text-md font-medium text-gray-800 mb-2 bg-gray-100 p-2 rounded">
                                    {grupo.seccion.nombre_seccion} ({grupo.estudiantes.length} estudiantes)
                                  </h4>
                                  
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-50">
                                        <tr>
                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cédula
                                          </th>
                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Nombre
                                          </th>
                                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {grupo.estudiantes.map((estudiante) => (
                                          <tr key={estudiante.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                              {estudiante.cedula}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                              <div className="text-sm font-medium text-gray-900 uppercase">
                                                {estudiante.nombre} {estudiante.apellido}
                                              </div>
                                            </td>
                                            <td className="px-6 py-4 flex flex-row text-sm font-medium">
                                              <Link
                                                to={`/admin/estudiantes/${estudiante.id}`}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-900 mr-3"
                                              >
                                                 Detalles
                                              </Link>
                                              <Link
                                                to={`/admin/estudiantes/${estudiante.id}/notas`}
                                                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-900 mr-3"
                                              >
                                                 Notas
                                              </Link>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-gray-500">No hay estudiantes inscritos en este grado.</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Pestaña de Profesores */}
                      {activeTab === 'profesores' && (
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Profesores Asignados</h3>
                          </div>
                          
                          {profesores.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cédula
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nombre
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Materias Asignadas
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                  </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {profesores.map((profesor) => (
                                    <tr key={profesor.id}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {profesor.cedula}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 uppercase">
                                          {profesor.nombre} {profesor.apellido}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-500">
                                        {profesor.materiasAsignadas && profesor.materiasAsignadas.length > 0 ? (
                                          <div className="flex flex-wrap gap-1">
                                            {profesor.materiasAsignadas.map(materia => {
                                              // Determinar el color según el nombre de la materia
                                              let bgColor = "bg-blue-100";
                                              let textColor = "text-blue-800";
                                              
                                              const nombreMateria = (materia.nombre || materia.asignatura || "").toLowerCase();
                                              
                                              if (nombreMateria.includes("comunicacion") || nombreMateria.includes("lengua") || nombreMateria.includes("literatura") || nombreMateria.includes("castellano")) {
                                                bgColor = "bg-purple-100";
                                                textColor = "text-purple-800";
                                              } else if (nombreMateria.includes("social") || nombreMateria.includes("ghc") || nombreMateria.includes("historia")) {
                                                bgColor = "bg-yellow-100";
                                                textColor = "text-yellow-800";
                                              } else if (nombreMateria.includes("matematica")) {
                                                bgColor = "bg-blue-100";
                                                textColor = "text-blue-800";
                                              } else if (nombreMateria.includes("arte")) {
                                                bgColor = "bg-pink-100";
                                                textColor = "text-pink-800";
                                              } else if (nombreMateria.includes("educacion fisica")) {
                                                bgColor = "bg-red-100";
                                                textColor = "text-red-800";
                                              } else if (nombreMateria.includes("fisica")) {
                                                bgColor = "bg-cyan-100";
                                                textColor = "text-cyan-800";
                                              } else if (nombreMateria.includes("ingles") || nombreMateria.includes("idioma")) {
                                                bgColor = "bg-indigo-100";
                                                textColor = "text-indigo-800";
                                              } else if (nombreMateria.includes("informatica") || nombreMateria.includes("computacion")) {
                                                bgColor = "bg-lime-100";
                                                textColor = "text-lime-800";
                                              } else if (nombreMateria.includes("ciencia") || nombreMateria.includes("natural") || nombreMateria.includes("biologia")) {
                                                bgColor = "bg-green-100";
                                                textColor = "text-green-800";
                                              } else if (nombreMateria.includes("quimica")) {
                                                bgColor = "bg-teal-100";
                                                textColor = "text-teal-800";
                                              } else if (nombreMateria.includes("dibujo") || nombreMateria.includes("tecnico")) {
                                                bgColor = "bg-gray-100";
                                                textColor = "text-gray-800";
                                              } else if (nombreMateria.includes("orientacion") || nombreMateria.includes("vocacional") || nombreMateria.includes("psicologia")) {
                                                bgColor = "bg-orange-100";
                                                textColor = "text-orange-800";
                                              } else if (nombreMateria.includes("proyecto")) {
                                                bgColor = "bg-cyan-100";
                                                textColor = "text-cyan-800";
                                              } else if (nombreMateria.includes("contabilidad")) {
                                                bgColor = "bg-emerald-100";
                                                textColor = "text-emerald-800";
                                              }
                                              
                                              return (
                                                <span 
                                                  key={materia.id}
                                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} uppercase`}
                                                >
                                                  {materia.nombre || materia.asignatura}
                                                </span>
                                              );
                                            })}
                                          </div>
                                        ) : profesor.materias && profesor.materias.length > 0 ? (
                                          <div className="flex flex-wrap gap-1">
                                            {profesor.materias.map(materia => {
                                              // Determinar el color según el nombre de la materia
                                              let bgColor = "bg-blue-100";
                                              let textColor = "text-blue-800";
                                              
                                              const nombreMateria = (materia.nombre || materia.asignatura || "").toLowerCase();
                                              
                                              if (nombreMateria.includes("comunicacion") || nombreMateria.includes("lengua") || nombreMateria.includes("literatura") || nombreMateria.includes("castellano")) {
                                                bgColor = "bg-purple-100";
                                                textColor = "text-purple-800";
                                              } else if (nombreMateria.includes("social") || nombreMateria.includes("ghc") || nombreMateria.includes("historia")) {
                                                bgColor = "bg-yellow-100";
                                                textColor = "text-yellow-800";
                                              } else if (nombreMateria.includes("matematica")) {
                                                bgColor = "bg-blue-100";
                                                textColor = "text-blue-800";
                                              } else if (nombreMateria.includes("arte")) {
                                                bgColor = "bg-pink-100";
                                                textColor = "text-pink-800";
                                              } else if (nombreMateria.includes("educacion fisica")) {
                                                bgColor = "bg-red-100";
                                                textColor = "text-red-800";
                                              } else if (nombreMateria.includes("fisica")) {
                                                bgColor = "bg-cyan-100";
                                                textColor = "text-cyan-800";
                                              } else if (nombreMateria.includes("ingles") || nombreMateria.includes("idioma")) {
                                                bgColor = "bg-indigo-100";
                                                textColor = "text-indigo-800";
                                              } else if (nombreMateria.includes("informatica") || nombreMateria.includes("computacion")) {
                                                bgColor = "bg-lime-100";
                                                textColor = "text-lime-800";
                                              } else if (nombreMateria.includes("ciencia") || nombreMateria.includes("natural") || nombreMateria.includes("biologia")) {
                                                bgColor = "bg-green-100";
                                                textColor = "text-green-800";
                                              } else if (nombreMateria.includes("quimica")) {
                                                bgColor = "bg-teal-100";
                                                textColor = "text-teal-800";
                                              } else if (nombreMateria.includes("dibujo") || nombreMateria.includes("tecnico")) {
                                                bgColor = "bg-gray-100";
                                                textColor = "text-gray-800";
                                              } else if (nombreMateria.includes("orientacion") || nombreMateria.includes("vocacional") || nombreMateria.includes("psicologia")) {
                                                bgColor = "bg-orange-100";
                                                textColor = "text-orange-800";
                                              } else if (nombreMateria.includes("proyecto")) {
                                                bgColor = "bg-cyan-100";
                                                textColor = "text-cyan-800";
                                              } else if (nombreMateria.includes("contabilidad")) {
                                                bgColor = "bg-emerald-100";
                                                textColor = "text-emerald-800";
                                              }
                                              
                                              return (
                                                <span 
                                                  key={materia.id}
                                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} uppercase`}
                                                >
                                                  {materia.nombre || materia.asignatura}
                                                </span>
                                              );
                                            })}
                                          </div>
                                        ) : (
                                          'No asignadas'
                                        )}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link
                                          to={`/admin/profesores/${profesor.id}`}
                                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-900 mr-3"
                                        >
                                          Detalles
                                        </Link>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-gray-500">No hay profesores asignados a este grado.</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Pestaña de Materias */}
                      {activeTab === 'materias' && (
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Materias del Grado</h3>
                          </div>
                          
                          {materias.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {materias.map((materia) => {
                                // Determinar el color y el icono según el nombre de la materia
                                let bgColor = "bg-blue-50";
                                let textColor = "text-blue-700";
                                let iconColor = "text-blue-600";
                                let bgIconColor = "bg-blue-100";
                                let Icon = FaBook; // Icono por defecto
                                
                                const nombreMateria = (materia.nombre || materia.asignatura || "").toLowerCase();
                                
                                if (nombreMateria.includes("comunicacion") || nombreMateria.includes("lengua") || nombreMateria.includes("literatura") || nombreMateria.includes("castellano")) {
                                  bgColor = "bg-purple-50";
                                  textColor = "text-purple-700";
                                  iconColor = "text-purple-600";
                                  bgIconColor = "bg-purple-100";
                                  Icon = FaComments;
                                } else if (nombreMateria.includes("social") || nombreMateria.includes("ghc") || nombreMateria.includes("historia")) {
                                  bgColor = "bg-yellow-50";
                                  textColor = "text-yellow-700";
                                  iconColor = "text-yellow-600";
                                  bgIconColor = "bg-yellow-100";
                                  Icon = FaGlobe;
                                } else if (nombreMateria.includes("matematica")) {
                                  bgColor = "bg-blue-50";
                                  textColor = "text-blue-700";
                                  iconColor = "text-blue-600";
                                  bgIconColor = "bg-blue-100";
                                  Icon = FaCalculator;
                                } else if (nombreMateria.includes("arte")) {
                                  bgColor = "bg-pink-50";
                                  textColor = "text-pink-700";
                                  iconColor = "text-pink-600";
                                  bgIconColor = "bg-pink-100";
                                  Icon = FaPalette;
                                } else if (nombreMateria.includes("educacion fisica")) {
                                  bgColor = "bg-red-50";
                                  textColor = "text-red-700";
                                  iconColor = "text-red-600";
                                  bgIconColor = "bg-red-100";
                                  Icon = FaRunning;
                                } else if (nombreMateria.includes("fisica")) {
                                  bgColor = "bg-cyan-50";
                                  textColor = "text-cyan-700";
                                  iconColor = "text-cyan-600";
                                  bgIconColor = "bg-cyan-100";
                                  Icon = FaAtom;
                                } else if (nombreMateria.includes("ingles") || nombreMateria.includes("idioma")) {
                                  bgColor = "bg-indigo-50";
                                  textColor = "text-indigo-700";
                                  iconColor = "text-indigo-600";
                                  bgIconColor = "bg-indigo-100";
                                  Icon = FaLanguage;
                                } else if (nombreMateria.includes("informatica") || nombreMateria.includes("computacion")) {
                                  bgColor = "bg-lime-50";
                                  textColor = "text-lime-700";
                                  iconColor = "text-lime-600";
                                  bgIconColor = "bg-lime-100";
                                  Icon = FaLaptop;
                                } else if (nombreMateria.includes("ciencia") || nombreMateria.includes("natural") || nombreMateria.includes("biologia")) {
                                  bgColor = "bg-green-50";
                                  textColor = "text-green-700";
                                  iconColor = "text-green-600";
                                  bgIconColor = "bg-green-100";
                                  Icon = FaEarthAmericas;
                                } else if (nombreMateria.includes("quimica")) {
                                  bgColor = "bg-teal-50";
                                  textColor = "text-teal-700";
                                  iconColor = "text-teal-600";
                                  bgIconColor = "bg-teal-100";
                                  Icon = GiChemicalDrop;
                                } else if (nombreMateria.includes("dibujo") || nombreMateria.includes("tecnico")) {
                                  bgColor = "bg-gray-50";
                                  textColor = "text-gray-700";
                                  iconColor = "text-gray-600";
                                  bgIconColor = "bg-gray-100";
                                  Icon = FaPencilRuler;
                                } else if (nombreMateria.includes("orientacion") || nombreMateria.includes("vocacional") || nombreMateria.includes("psicologia")) {
                                  bgColor = "bg-orange-50";
                                  textColor = "text-orange-700";
                                  iconColor = "text-orange-600";
                                  bgIconColor = "bg-orange-100";
                                  Icon = FaBrain;
                                } else if (nombreMateria.includes("proyecto")) {
                                  bgColor = "bg-cyan-50";
                                  textColor = "text-cyan-700";
                                  iconColor = "text-cyan-600";
                                  bgIconColor = "bg-cyan-100";
                                  Icon = FaProjectDiagram;
                                } else if (nombreMateria.includes("contabilidad")) {
                                  bgColor = "bg-emerald-50";
                                  textColor = "text-emerald-700";
                                  iconColor = "text-emerald-600";
                                  bgIconColor = "bg-emerald-100";
                                  Icon = FaMoneyBillWave;
                                }
                                
                                return (
                                  <div key={materia.id} className={`${bgColor} p-3 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200`}>
                                    <div className="flex items-center">
                                      <div className={`p-2 rounded-full ${bgIconColor} mr-3`}>
                                        <Icon className={`h-5 w-5 ${iconColor}`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium ${textColor} truncate`}>
                                          {materia.nombre || materia.asignatura}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                          {materia.codigo || `Código: ${materia.id}`}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-3 flex justify-between items-center">
                                      <button
                                        onClick={() => handleShowMateriaDetails(materia)}
                                        className={`text-xs font-medium ${textColor} hover:underline flex items-center`}
                                      >
                                        <FaChartBar className="mr-1" /> Estadísticas
                                      </button>
                                      <Link
                                        to={`/admin/academico/materias/${materia.id}`}
                                        className={`text-xs font-medium ${textColor} hover:underline flex items-center`}
                                      >
                                        <FaEye className="mr-1" /> Detalles
                                      </Link>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-6">
                              <p className="text-gray-500">No hay materias asignadas a este grado.</p>
                            </div>
                          )}
                          
                          {/* Modal para mostrar detalles de la materia */}
                          {selectedMateria && (
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
                                          {selectedMateria.nombre || selectedMateria.asignatura}
                                        </h3>
                                        
                                        <div className="mt-4">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 p-3 rounded-md">
                                              <p className="text-sm font-medium text-gray-700">Profesor Asignado</p>
                                              <p className="text-sm text-gray-900">
                                                {selectedMateria.profesor 
                                                  ? `${selectedMateria.profesor.nombre} ${selectedMateria.profesor.apellido}` 
                                                  : selectedMateria.profesorAsignado
                                                    ? `${selectedMateria.profesorAsignado.nombre} ${selectedMateria.profesorAsignado.apellido}`
                                                    : 'No asignado'}
                                              </p>
                                            </div>
                                            
                                            <div className="bg-gray-50 p-3 rounded-md">
                                              <p className="text-sm font-medium text-gray-700">Estudiantes</p>
                                              <p className="text-sm text-gray-900">
                                                {selectedMateria.estudiantesCount || estudiantes.length || 0}
                                              </p>
                                            </div>
                                            
                                            <div className="bg-gray-50 p-3 rounded-md">
                                              <p className="text-sm font-medium text-gray-700">Horas Semanales</p>
                                              <p className="text-sm text-gray-900">
                                                {selectedMateria.horasSemanales || 'No especificado'}
                                              </p>
                                            </div>
                                            
                                            <div className="bg-gray-50 p-3 rounded-md">
                                              <p className="text-sm font-medium text-gray-700">Código</p>
                                              <p className="text-sm text-gray-900">
                                                {selectedMateria.codigo || selectedMateria.id}
                                              </p>
                                            </div>
                                          </div>
                                          
                                          {selectedMateria.descripcion && (
                                            <div className="mt-4 bg-gray-50 p-3 rounded-md">
                                              <p className="text-sm font-medium text-gray-700">Descripción</p>
                                              <p className="text-sm text-gray-900">{selectedMateria.descripcion}</p>
                                            </div>
                                          )}
                                          
                                          <div className="mt-4">
                                            <h4 className="text-md font-medium text-gray-900 mb-2">Estadísticas</h4>
                                            <div className="bg-gray-50 p-3 rounded-md">
                                              <p className="text-sm font-medium text-gray-700">Rendimiento Promedio</p>
                                              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                                <div 
                                                  className="bg-blue-600 h-2.5 rounded-full" 
                                                  style={{ width: `${selectedMateria.rendimientoPromedio || 75}%` }}
                                                ></div>
                                              </div>
                                              <p className="text-xs text-gray-500 mt-1">
                                                {selectedMateria.rendimientoPromedio || 75}% de aprobación
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedMateria(null)}
                                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                      Cerrar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-500">Seleccione un grado para ver sus detalles.</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Modal de confirmación para eliminar grado */}
      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
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
                        ¿Está seguro de que desea eliminar el grado <strong>{gradoToDelete && formatearNombreGrado(gradoToDelete.nombre_grado)}</strong>? Esta acción no se puede deshacer.
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
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {deleteLoading ? 'Eliminando...' : 'Eliminar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setGradoToDelete(null);
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

export default GradosList;