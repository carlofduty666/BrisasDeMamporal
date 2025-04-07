import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaEye, FaTrash, FaPlus, FaFilter, FaDownload } from 'react-icons/fa';
import AdminLayout from '../layout/AdminLayout';
import axios from 'axios';
import { formatearNombreGrado } from '../../../utils/formatters';

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
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Estudiantes</h1>
          <div className="flex space-x-2">
            <Link
              to="/inscripcion/nuevo-estudiante"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaPlus className="mr-2" /> Nuevo Estudiante
            </Link>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaDownload className="mr-2" /> Exportar CSV
            </button>
          </div>
        </div>
        
        {/* Mensaje de error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <form onSubmit={handleSearch} className="flex">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre o cédula"
                  className="w-full md:w-80 pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <FaSearch />
                </div>
              </div>
              <button
                type="submit"
                className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                Buscar
              </button>
            </form>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaFilter className="mr-2" /> Filtros
            </button>
          </div>
          
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="grado" className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por Grado:
                </label>
                <select
                  id="grado"
                  className="rounded-lg border px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
              
              <div>
                <label htmlFor="seccion" className="block text-sm font-medium text-gray-700 mb-1">
                  Filtrar por Sección:
                </label>
                <select
                  id="seccion"
                  className="rounded-lg border px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
          )}
        </div>
        
        {/* Tabla de Estudiantes */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cédula
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Representante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((estudiante) => (
                    <tr key={estudiante.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {estudiante.nombre} {estudiante.apellido}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{estudiante.cedula}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatearNombreGrado(estudiante.grado?.nombre_grado) || 'No asignado'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{estudiante.seccion?.nombre_seccion || 'No asignada'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                        {estudiante.representante?.nombre && estudiante.representante?.apellido 
                          ? `${estudiante.representante.nombre} ${estudiante.representante.apellido}`
                          : 'No asignado'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/estudiantes/${estudiante.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Ver detalles"
                          >
                            <FaEye />
                          </Link>
                          <button
                            onClick={() => handleDelete(estudiante.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No se encontraron estudiantes con los criterios de búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          {filteredEstudiantes.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredEstudiantes.length)}
                    </span>{' '}
                    de <span className="font-medium">{filteredEstudiantes.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Anterior</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Mostrar máximo 5 páginas, centradas en la página actual
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
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === pageNum
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Siguiente</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default EstudiantesList;
