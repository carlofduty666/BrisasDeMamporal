import { useState, useEffect, useCallback } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaUsers, 
  FaRedo, 
  FaList, 
  FaTh, 
  FaDownload,
  FaGraduationCap,
  FaChalkboard,  
  FaBook,
  FaEye
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatearNombreGrado, formatearNombreNivel } from '../../../utils/formatters';

const SeccionesList = () => {
  const navigate = useNavigate();
  const [secciones, setSecciones] = useState([]);
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [niveles, setNiveles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

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
  
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };
  
        // Obtener secciones
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/secciones`,
          config
        );
  
        // Obtener grados
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/grados`,
          config
        );
  
        // Obtener niveles
        const nivelesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/nivel`,
          config
        );
  
        // Obtener año escolar activo
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          config
        );
  
        setSecciones(seccionesResponse.data);
        setGrados(gradosResponse.data);
        setNiveles(nivelesResponse.data);
        setAnnoEscolar(annoResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        setLoading(false);
        
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
  
    fetchData();
  }, [navigate]);

  // Filtrar secciones según término de búsqueda
  const filteredSecciones = secciones.filter(seccion => {
    const grado = grados.find(g => g.id === seccion.gradoID);
    const gradoNombre = grado?.nombre_grado.toLowerCase() || '';
    const seccionNombre = seccion.nombre_seccion.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return seccionNombre.includes(search) || gradoNombre.includes(search);
  });

  // Eliminar sección
  const handleDeleteSeccion = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta sección?')) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/secciones/${id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setSecciones(secciones.filter(seccion => seccion.id !== id));
      setSuccessMessage('Sección eliminada correctamente');
      toast.success('Sección eliminada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error al eliminar sección:', err);
      setError(err.response?.data?.message || 'Error al eliminar sección');
      toast.error(err.response?.data?.message || 'Error al eliminar sección');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Sección', 'Grado', 'Nivel', 'Capacidad', 'Estado'];
    const csvData = [
      headers.join(','),
      ...filteredSecciones.map(seccion => {
        const grado = grados.find(g => g.id === seccion.gradoID);
        const nivel = niveles.find(n => n.id === grado?.nivelID);
        return [
          seccion.nombre_seccion,
          grado?.nombre_grado || '',
          nivel?.nombre_nivel || '',
          seccion.capacidad || 30,
          seccion.activo ? 'Activo' : 'Inactivo'
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'secciones.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSecciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSecciones.length / itemsPerPage);

  // Obtener grado e información asociada
  const getGradoInfo = (gradoID) => {
    const grado = grados.find(g => g.id === gradoID);
    const nivel = grado ? niveles.find(n => n.id === grado.nivelID) : null;
    return { grado, nivel };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-pulse"></div>
          </div>
          <p className="mt-4 text-purple-600 font-medium">Cargando secciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-800 to-purple-900 shadow-2xl rounded-2xl mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-transparent"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-purple-300/10 rounded-full blur-2xl"></div>
        
        <div className="relative px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl backdrop-blur-sm border border-purple-400/30">
                  <FaChalkboard className="w-8 h-8 text-purple-200" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Gestión de Secciones
                  </h1>
                  <p className="text-purple-200 text-lg">
                    Administra las secciones académicas de la institución
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm font-medium">Total Secciones</p>
                      <p className="text-2xl font-bold text-white">{filteredSecciones.length}</p>
                    </div>
                    <FaGraduationCap className="w-8 h-8 text-purple-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm font-medium">Grados Activos</p>
                      <p className="text-2xl font-bold text-white">{grados.length}</p>
                    </div>
                    <FaBook className="w-8 h-8 text-purple-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm font-medium">Año Escolar</p>
                      <p className="text-2xl font-bold text-white">{annoEscolar?.periodo || 'N/A'}</p>
                    </div>
                    <FaUsers className="w-8 h-8 text-purple-300" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="mt-8 lg:mt-0 lg:ml-8">
              <Link
                to="/admin/academico/secciones/nuevo"
                className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaPlus className="w-5 h-5 mr-3" />
                Nueva Sección
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-purple-50 border-l-4 border-purple-500 text-purple-700 p-4 mb-6 rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
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
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg shadow-sm">
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

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  placeholder="Buscar por sección o grado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* View Mode & Actions */}
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => {
                    setViewMode('list');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <FaList className="w-4 h-4 mr-2" />
                  Lista
                </button>
                <button
                  onClick={() => {
                    setViewMode('cards');
                    setCurrentPage(1);
                  }}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'cards'
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:text-purple-600'
                  }`}
                >
                  <FaTh className="w-4 h-4 mr-2" />
                  Tarjetas
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors duration-200 border border-purple-200"
                title="Exportar a CSV"
              >
                <FaDownload className="w-4 h-4 mr-2" />
                Exportar
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => {
                  setLoading(true);
                  window.location.reload();
                }}
                className="flex items-center px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
                title="Actualizar lista"
              >
                <FaRedo className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        // Lista View
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">
                    Sección
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">
                    Grado
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">
                    Nivel
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">
                    Capacidad
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-purple-800 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((seccion) => {
                    const { grado, nivel } = getGradoInfo(seccion.gradoID);
                    return (
                      <tr key={seccion.id} className="hover:bg-purple-50/50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">
                                  {seccion.nombre_seccion?.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {seccion.nombre_seccion}
                              </div>
                              <div className="text-sm text-gray-500">
                                Sección
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {grado ? formatearNombreGrado(grado.nombre_grado) : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {nivel ? formatearNombreNivel(nivel.nombre_nivel) : 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {seccion.capacidad || 30} estudiantes
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            seccion.activo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {seccion.activo ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Link
                              to={`/admin/academico/secciones/${seccion.id}`}
                              className="inline-flex items-center px-3 py-2 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors duration-200"
                              title="Ver detalles"
                            >
                              <FaEye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/admin/academico/secciones/editar/${seccion.id}`}
                              className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                              title="Editar"
                            >
                              <FaEdit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteSeccion(seccion.id)}
                              className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                              title="Eliminar"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FaChalkboard className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">No se encontraron secciones</p>
                        <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Tarjetas View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentItems.length > 0 ? (
            currentItems.map((seccion) => {
              const { grado, nivel } = getGradoInfo(seccion.gradoID);
              return (
                <div
                  key={seccion.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Header Color Band */}
                  <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-600"></div>

                  <div className="p-6">
                    {/* Avatar y nombre */}
                    <div className="flex items-center mb-6">
                      <div className="flex-shrink-0 h-14 w-14">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {seccion.nombre_seccion?.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          Sección {seccion.nombre_seccion}
                        </h3>
                        <p className="text-sm text-gray-500">Académica</p>
                      </div>
                    </div>

                    {/* Información */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start">
                        <FaBook className="w-4 h-4 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Grado</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {grado ? formatearNombreGrado(grado.nombre_grado) : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <FaGraduationCap className="w-4 h-4 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Nivel</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {nivel ? formatearNombreNivel(nivel.nombre_nivel) : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <FaUsers className="w-4 h-4 text-purple-600 mt-1 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 font-medium">Capacidad</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {seccion.capacidad || 30} estudiantes
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        seccion.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {seccion.activo ? '● Activa' : '● Inactiva'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/academico/secciones/${seccion.id}`}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors duration-200"
                        title="Ver detalles"
                      >
                        <FaEye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/admin/academico/secciones/editar/${seccion.id}`}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                        title="Editar"
                      >
                        <FaEdit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteSeccion(seccion.id)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                        title="Eliminar"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
                <div className="flex flex-col items-center">
                  <FaChalkboard className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No se encontraron secciones</p>
                  <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Anterior
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors duration-200 ${
                currentPage === page
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default SeccionesList;