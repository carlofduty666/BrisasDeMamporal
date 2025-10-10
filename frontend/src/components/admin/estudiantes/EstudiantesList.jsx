import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaEye, FaTrash, FaPlus, FaFilter, FaDownload, FaUserGraduate, FaChartLine, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import { formatearNombreGrado, formatearCedula } from '../../../utils/formatters';

const EstudiantesList = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [filteredEstudiantes, setFilteredEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedGrado, setSelectedGrado] = useState('');
  const [selectedSeccion, setSelectedSeccion] = useState('');
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
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
        
        // Obtener todos los estudiantes directamente
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas`,
          { 
            ...config,
            params: { tipo: 'estudiante' }
          }
        );
        
        // Obtener grados
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados`,
          config
        );
        setGrados(gradosResponse.data);
        
        // Obtener secciones
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones`,
          config
        );
        setSecciones(seccionesResponse.data);
        
        // Procesar estudiantes básicos (sin información adicional por ahora)
        const estudiantesBasicos = estudiantesResponse.data.map(estudiante => ({
          ...estudiante,
          grado: { nombre_grado: 'Cargando...' },
          seccion: { nombre_seccion: 'Cargando...' },
          representante: { nombre: 'Cargando...', apellido: '', id: null },
          nombreCompleto: `${estudiante.nombre} ${estudiante.apellido}`
        }));
        
        setEstudiantes(estudiantesBasicos);
        setFilteredEstudiantes(estudiantesBasicos);
        
        // Crear un mapa para almacenar la información de grado y sección por estudiante
        const estudiantesInfo = {};
        
        // Para cada grado, obtener sus estudiantes
        for (const grado of gradosResponse.data) {
          try {
            const estudiantesGradoResponse = await axios.get(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${grado.id}/estudiantes`,
              { 
                ...config,
                params: { annoEscolarID: annoResponse.data.id }
              }
            );
            
            // Asignar el grado a cada estudiante encontrado
            for (const estudianteGrado of estudiantesGradoResponse.data) {
              if (!estudiantesInfo[estudianteGrado.id]) {
                estudiantesInfo[estudianteGrado.id] = {};
              }
              estudiantesInfo[estudianteGrado.id].grado = grado;
            }
          } catch (err) {
            console.error(`Error al obtener estudiantes para el grado ${grado.id}:`, err);
          }
        }
        
        // Para cada sección, obtener sus estudiantes
        for (const seccion of seccionesResponse.data) {
          try {
            const estudiantesSeccionResponse = await axios.get(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/${seccion.id}/estudiantes`,
              { 
                ...config,
                params: { annoEscolarID: annoResponse.data.id }
              }
            );
            
            // Asignar la sección a cada estudiante encontrado
            for (const estudianteSeccion of estudiantesSeccionResponse.data) {
              if (!estudiantesInfo[estudianteSeccion.id]) {
                estudiantesInfo[estudianteSeccion.id] = {};
              }
              estudiantesInfo[estudianteSeccion.id].seccion = seccion;
            }
          } catch (err) {
            console.error(`Error al obtener estudiantes para la sección ${seccion.id}:`, err);
          }
        }
        
        for (const estudiante of estudiantesBasicos) {
          try {
            // Usar la nueva ruta para obtener directamente el representante del estudiante
            const representanteResponse = await axios.get(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/estudiante/${estudiante.id}/representante`,
              { 
                ...config,
                params: { annoEscolarID: annoResponse.data.id }
              }
            );
            
            if (representanteResponse.data) {
              if (!estudiantesInfo[estudiante.id]) {
                estudiantesInfo[estudiante.id] = {};
              }
              
              estudiantesInfo[estudiante.id].representante = representanteResponse.data;
            }
          } catch (err) {
            console.error(`Error al obtener representante para el estudiante ${estudiante.id}:`, err);
          }
        }
        
        // Y luego, al actualizar la información de los estudiantes:
        const estudiantesActualizados = estudiantesBasicos.map(estudiante => {
          const info = estudiantesInfo[estudiante.id] || {};
          return {
            ...estudiante,
            grado: info.grado || { nombre_grado: 'No asignado' },
            seccion: info.seccion || { nombre_seccion: 'No asignada' },
            representante: info.representante || { nombre: 'No asignado', apellido: '', id: null }
          };
        });
        
        setEstudiantes(estudiantesActualizados);
        setFilteredEstudiantes(estudiantesActualizados);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar la lista de estudiantes. Por favor, intente nuevamente.');
        setLoading(false);
        
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
    
    fetchData();
  }, [navigate]);
  
  // Filtrar estudiantes cuando cambia la búsqueda o los filtros
  useEffect(() => {
    let result = estudiantes;
    
    // Aplicar búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        est => 
          est.nombre?.toLowerCase().includes(searchLower) ||
          est.apellido?.toLowerCase().includes(searchLower) ||
          est.cedula?.toLowerCase().includes(searchLower) ||
          est.nombreCompleto?.toLowerCase().includes(searchLower)
      );
    }
    
    // Aplicar filtro de grado
    if (selectedGrado) {
      result = result.filter(est => est.grado?.id === parseInt(selectedGrado));
    }
    
    // Aplicar filtro de sección
    if (selectedSeccion) {
      result = result.filter(est => est.seccion?.id === parseInt(selectedSeccion));
    }
    
    setFilteredEstudiantes(result);
  }, [search, selectedGrado, selectedSeccion, estudiantes]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    // La búsqueda se maneja en el useEffect
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este estudiante? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Actualizar la lista de estudiantes
      setEstudiantes(prev => prev.filter(est => est.id !== id));
      setFilteredEstudiantes(prev => prev.filter(est => est.id !== id));
      
      alert('Estudiante eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar estudiante:', err);
      alert(err.response?.data?.message || 'Error al eliminar el estudiante. Por favor, intente nuevamente.');
    }
  };
  
  const exportToCSV = () => {
    // Crear datos CSV
    const headers = ['Cédula', 'Nombre', 'Apellido', 'Fecha Nacimiento', 'Género', 'Grado', 'Sección'];
    const csvData = [
      headers.join(','),
      ...filteredEstudiantes.map(est => [
        est.cedula || '',
        est.nombre || '',
        est.apellido || '',
        est.fechaNacimiento ? new Date(est.fechaNacimiento).toLocaleDateString() : '',
        est.genero || '',
        est.grado?.nombre_grado || 'No asignado',
        est.seccion?.nombre_seccion || 'No asignada'
      ].join(','))
    ].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'estudiantes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEstudiantes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEstudiantes.length / itemsPerPage);
  
  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse"></div>
            </div>
            <p className="mt-4 text-blue-600 font-medium">Cargando estudiantes...</p>
          </div>
        </div>
    );
  }
  
  return (
      <div>
        {/* Header Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-800 to-blue-900 shadow-2xl rounded-2xl mb-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-transparent"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-blue-300/10 rounded-full blur-2xl"></div>
        
        <div className="relative px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-400/30">
                  <FaUserGraduate className="w-8 h-8 text-blue-200" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Gestión de Estudiantes
                  </h1>
                  <p className="text-blue-200 text-lg">
                    Administra y supervisa el registro académico estudiantil
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm font-medium">Total Estudiantes</p>
                      <p className="text-2xl font-bold text-white">{filteredEstudiantes.length}</p>
                    </div>
                    <FaUsers className="w-8 h-8 text-blue-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm font-medium">Grados Activos</p>
                      <p className="text-2xl font-bold text-white">{grados.length}</p>
                    </div>
                    <FaChartLine className="w-8 h-8 text-blue-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-200 text-sm font-medium">Año Escolar</p>
                      <p className="text-2xl font-bold text-white">{annoEscolar?.periodo || 'N/A'}</p>
                    </div>
                    <FaUserGraduate className="w-8 h-8 text-blue-300" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-8 lg:mt-0 lg:ml-8">
              <div className="flex flex-col sm:flex-row lg:flex-col space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-0 lg:space-y-3">
                <Link
                  to="/inscripcion/nuevo-estudiante?from=estudiantes"
                  className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FaPlus className="mr-2 relative z-10" />
                  <span className="relative z-10">Nuevo Estudiante</span>
                </Link>
                
                <button
                  onClick={exportToCSV}
                  className="group relative overflow-hidden bg-white/10 backdrop-blur-md text-white px-6 py-3 rounded-xl font-semibold border border-white/20 hover:bg-white/20 transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
                >
                  <FaDownload className="mr-2" />
                  Exportar CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Mensaje de error */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 mb-6 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Búsqueda y filtros */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Barra de búsqueda */}
            <div className="flex-1 max-w-2xl">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Buscar estudiantes por nombre, apellido o cédula..."
                    className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors duration-300">
                    <FaSearch className="w-5 h-5" />
                  </div>
                </div>
              </form>
            </div>
            
            {/* Botón de filtros */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`group relative overflow-hidden px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center ${
                  showFilters 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-white/80 text-blue-600 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                <FaFilter className="mr-2" />
                Filtros
                {showFilters && (
                  <div className="absolute inset-0 bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
            </div>
          </div>
          
          {/* Panel de filtros expandible */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="grado" className="block text-sm font-semibold text-blue-800">
                      Filtrar por Grado
                    </label>
                    <select
                      id="grado"
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
                      value={selectedGrado}
                      onChange={(e) => setSelectedGrado(e.target.value)}
                    >
                      <option value="">Todos los grados</option>
                      {grados.map((grado) => (
                        <option key={grado.id} value={grado.id}>
                          {grado.nombre_grado}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="seccion" className="block text-sm font-semibold text-blue-800">
                      Filtrar por Sección
                    </label>
                    <select
                      id="seccion"
                      className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-700"
                      value={selectedSeccion}
                      onChange={(e) => setSelectedSeccion(e.target.value)}
                    >
                      <option value="">Todas las secciones</option>
                      {secciones
                        .filter(seccion => !selectedGrado || seccion.gradoID === parseInt(selectedGrado))
                        .map((seccion) => (
                          <option key={seccion.id} value={seccion.id}>
                            {seccion.nombre_seccion}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
        </div>
        
        {/* Tabla de estudiantes */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          {currentItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Estudiante
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Cédula
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Grado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Sección
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Representante
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  {currentItems.map((estudiante, index) => (
                    <tr 
                        key={estudiante.id} 
                        className={`transition-all duration-300 hover:bg-blue-50/50 ${
                          index % 2 === 0 ? 'bg-white/50' : 'bg-blue-50/30'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-4">
                              {estudiante.nombre?.charAt(0)}{estudiante.apellido?.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {estudiante.nombre} {estudiante.apellido}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {estudiante.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-700">
                            {estudiante.cedula ? `V - ${formatearCedula(estudiante.cedula)}` : 'No registrada'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {formatearNombreGrado(estudiante.grado?.nombre_grado) || 'No asignado'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {estudiante.seccion?.nombre_seccion || 'No asignada'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            {estudiante.representante?.nombre && estudiante.representante?.apellido 
                              ? `${estudiante.representante.nombre} ${estudiante.representante.apellido}`
                              : 'No asignado'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link
                            to={`/admin/estudiantes/${estudiante.id}`}
                            className="group relative inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                            title="Ver detalles del estudiante"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                            <FaEye className="mr-2 relative z-10" />
                            <span className="relative z-10">Ver Detalles</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUserGraduate className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontraron estudiantes</h3>
                <p className="text-gray-500 mb-6">
                  No hay estudiantes que coincidan con los criterios de búsqueda actuales.
                </p>
                <Link
                  to="/inscripcion/nuevo-estudiante"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <FaPlus className="mr-2" />
                  Agregar Primer Estudiante
                </Link>
              </div>
            )}
          </div>
          
          {/* Paginación */}
          {filteredEstudiantes.length > 0 && (
            <div className="mt-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                {/* Información de resultados */}
                <div className="flex items-center space-x-2">
                  <div className="text-sm text-gray-600">
                    Mostrando <span className="font-semibold text-blue-600">{indexOfFirstItem + 1}</span> a{' '}
                    <span className="font-semibold text-blue-600">
                      {Math.min(indexOfLastItem, filteredEstudiantes.length)}
                    </span>{' '}
                    de <span className="font-semibold text-blue-600">{filteredEstudiantes.length}</span> estudiantes
                  </div>
                </div>
                
                {/* Controles de paginación */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      currentPage === 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md'
                    }`}
                  >
                    Anterior
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else {
                        const startPage = Math.max(1, currentPage - 2);
                        const endPage = Math.min(totalPages, startPage + 4);
                        pageNum = startPage + i;
                        if (pageNum > endPage) return null;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-xl font-semibold transition-all duration-300 ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                              : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      currentPage === totalPages 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md'
                    }`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};

export default EstudiantesList;
