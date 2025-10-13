import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaEye, 
  FaFilter, 
  FaSearch, 
  FaFileExport, 
  FaCheckCircle, 
  FaTimesCircle,
  FaClipboardList,
  FaUsers,
  FaGraduationCap,
  FaList,
  FaTh,
  FaDownload,
  FaChartLine,
  FaUserGraduate,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFileAlt,
  FaIdCard,
  FaUserTag,
  FaChalkboard,
  FaHashtag,
  FaInfoCircle,
  FaClock,
  FaExclamationTriangle,
  FaCog
} from 'react-icons/fa';
import { formatearFecha, formatearNombreGrado, formatearCedula } from '../../../utils/formatters';

const InscripcionesList = () => {
  const navigate = useNavigate();
  const [inscripciones, setInscripciones] = useState([]);
  const [filteredInscripciones, setFilteredInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroGrado, setFiltroGrado] = useState('');
  const [filtroSeccion, setFiltroSeccion] = useState('');
  const [filtroDocumentos, setFiltroDocumentos] = useState('');
  const [filtroPago, setFiltroPago] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'cards'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  const token = localStorage.getItem('token');
  
  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
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
        
        // Obtener inscripciones del año escolar activo
        const inscripcionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/inscripciones?annoEscolarID=${annoResponse.data.id}`,
          config
        );
        setInscripciones(inscripcionesResponse.data);
        setFilteredInscripciones(inscripcionesResponse.data);
        
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
  }, [navigate, token]);
  
  // Aplicar filtros cuando cambian
  useEffect(() => {
    if (!inscripciones.length) return;
    
    let filtered = [...inscripciones];
    
    // Filtrar por término de búsqueda (código, nombre, apellido, cédula)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(inscripcion => 
        inscripcion.id.toString().includes(searchTerm) ||
        (inscripcion.estudiante?.nombre || '').toLowerCase().includes(searchLower) ||
        (inscripcion.estudiante?.apellido || '').toLowerCase().includes(searchLower) ||
        (inscripcion.estudiante?.cedula || '').toLowerCase().includes(searchLower) ||
        (inscripcion.representante?.nombre || '').toLowerCase().includes(searchLower) ||
        (inscripcion.representante?.apellido || '').toLowerCase().includes(searchLower) ||
        (inscripcion.representante?.cedula || '').toLowerCase().includes(searchLower)
      );
    }
    
    // Filtrar por estado
    if (filtroEstado) {
      filtered = filtered.filter(inscripcion => inscripcion.estado === filtroEstado);
    }
    
    // Filtrar por grado
    if (filtroGrado) {
      filtered = filtered.filter(inscripcion => inscripcion.gradoID.toString() === filtroGrado);
    }

    // Filtrar por sección
    if (filtroSeccion) {
      filtered = filtered.filter(inscripcion => inscripcion.seccionID?.toString() === filtroSeccion);
    }

    // Filtrar por documentos
    if (filtroDocumentos) {
      filtered = filtered.filter(inscripcion => {
        if (filtroDocumentos === 'completos') return inscripcion.documentosCompletos;
        if (filtroDocumentos === 'pendientes') return !inscripcion.documentosCompletos;
        return true;
      });
    }

    // Filtrar por pago
    if (filtroPago) {
      filtered = filtered.filter(inscripcion => {
        if (filtroPago === 'pagado') return inscripcion.pagoInscripcionCompletado;
        if (filtroPago === 'pendiente') return !inscripcion.pagoInscripcionCompletado;
        return true;
      });
    }
    
    setFilteredInscripciones(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [inscripciones, searchTerm, filtroEstado, filtroGrado, filtroSeccion, filtroDocumentos, filtroPago]);
  
  // Función para exportar a CSV
  const exportarInscripciones = () => {
    // Crear datos CSV
    const headers = ['Código', 'Estudiante', 'Cédula Estudiante', 'Representante', 'Cédula Representante', 'Grado', 'Sección', 'Fecha', 'Estado', 'Documentos', 'Pago'];
    const csvData = [
      headers.join(','),
      ...filteredInscripciones.map(insc => [
        insc.id || '',
        `${insc.estudiante?.nombre || ''} ${insc.estudiante?.apellido || ''}`,
        insc.estudiante?.cedula || '',
        `${insc.representante?.nombre || ''} ${insc.representante?.apellido || ''}`,
        insc.representante?.cedula || '',
        getNombreGrado(insc.gradoID),
        getNombreSeccion(insc.seccionID),
        formatearFecha(insc.fechaInscripcion),
        insc.estado || '',
        insc.documentosCompletos ? 'Completos' : 'Pendientes',
        insc.pagoInscripcionCompletado ? 'Pagado' : 'Pendiente'
      ].join(','))
    ].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inscripciones_${annoEscolar?.periodo || 'export'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSuccessMessage('Inscripciones exportadas correctamente');
    setTimeout(() => setSuccessMessage(''), 3000);
  };
  
  // Obtener el nombre del grado
  const getNombreGrado = (gradoID) => {
    const grado = grados.find(g => g.id === gradoID);
    return grado ? formatearNombreGrado(grado.nombre_grado) : 'No asignado';
  };

  // Obtener el nombre de la sección
  const getNombreSeccion = (seccionID) => {
    if (!seccionID) return 'Sin asignar';
    const seccion = secciones.find(s => s.id === seccionID);
    return seccion ? seccion.nombre_seccion : 'Sin asignar';
  };
  
  // Obtener color según estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inscrito':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'aprobado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rechazado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'retirado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'graduado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInscripciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInscripciones.length / itemsPerPage);

  // Calcular estadísticas
  const stats = {
    total: filteredInscripciones.length,
    pendientes: filteredInscripciones.filter(i => i.estado === 'pendiente').length,
    inscritos: filteredInscripciones.filter(i => i.estado === 'inscrito' || i.estado === 'aprobado').length,
    documentosPendientes: filteredInscripciones.filter(i => !i.documentosCompletos).length,
    pagosPendientes: filteredInscripciones.filter(i => !i.pagoInscripcionCompletado).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-slate-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-200 border-t-cyan-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-cyan-500/10 animate-pulse"></div>
            <FaClipboardList className="absolute inset-0 m-auto w-6 h-6 text-cyan-600 animate-pulse" />
          </div>
          <p className="mt-4 text-cyan-600 font-medium animate-pulse">Cargando inscripciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-800 to-cyan-900 shadow-2xl rounded-2xl mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/30 to-transparent"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-cyan-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-cyan-300/10 rounded-full blur-2xl"></div>
        
        <div className="relative px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-cyan-500/20 rounded-xl backdrop-blur-sm border border-cyan-400/30">
                  <FaClipboardList className="w-8 h-8 text-cyan-200" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Gestión de Inscripciones
                  </h1>
                  <p className="text-cyan-200 text-lg">
                    Administra las inscripciones del año escolar {annoEscolar?.periodo || ''}
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-colors duration-200 hover:bg-white/15 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cyan-200 text-sm font-medium">Total Inscripciones</p>
                      <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-cyan-500/20 rounded-xl">
                      <FaUsers className="w-8 h-8 text-cyan-300" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-colors duration-200 hover:bg-white/15 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cyan-200 text-sm font-medium">Pendientes</p>
                      <p className="text-2xl font-bold text-white">{stats.pendientes}</p>
                    </div>
                    <div className="p-3 bg-yellow-500/20 rounded-xl">
                      <FaClock className="w-8 h-8 text-yellow-300" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-colors duration-200 hover:bg-white/15 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cyan-200 text-sm font-medium">Inscritos</p>
                      <p className="text-2xl font-bold text-white">{stats.inscritos}</p>
                    </div>
                    <div className="p-3 bg-green-500/20 rounded-xl">
                      <FaGraduationCap className="w-8 h-8 text-green-300" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-colors duration-200 hover:bg-white/15 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cyan-200 text-sm font-medium">Pagos Pendientes</p>
                      <p className="text-2xl font-bold text-white">{stats.pagosPendientes}</p>
                    </div>
                    <div className="p-3 bg-cyan-500/20 rounded-xl">
                      <FaMoneyBillWave className="w-8 h-8 text-cyan-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-cyan-50 border-l-4 border-cyan-500 text-cyan-700 p-4 mb-6 rounded-r-lg shadow-sm animate-slideInRight">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaCheckCircle className="h-5 w-5 text-cyan-500 animate-bounce" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg shadow-sm animate-slideInRight">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-500 animate-pulse" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 transition-all duration-300 group-focus-within:text-cyan-500 group-focus-within:scale-110" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 hover:border-cyan-300"
                placeholder="Buscar por código, nombre, apellido o cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                showFilters 
                  ? 'bg-cyan-600 text-white shadow-lg hover:bg-cyan-700' 
                  : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
              }`}
            >
              <FaFilter className={`mr-2 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </button>

            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                  viewMode === 'list' 
                    ? 'bg-white text-cyan-600 shadow-sm' 
                    : 'text-gray-600 hover:text-cyan-600'
                }`}
                title="Vista de lista"
              >
                <FaList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                  viewMode === 'cards' 
                    ? 'bg-white text-cyan-600 shadow-sm' 
                    : 'text-gray-600 hover:text-cyan-600'
                }`}
                title="Vista de tarjetas"
              >
                <FaTh className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={exportarInscripciones}
              className="flex items-center px-4 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-600 hover:text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg group"
            >
              <FaDownload className="mr-2 transition-transform duration-300 group-hover:animate-bounce" />
              Exportar
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros Avanzados</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="filtroEstado" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  id="filtroEstado"
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="inscrito">Inscrito</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="retirado">Retirado</option>
                  <option value="graduado">Graduado</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="filtroGrado" className="block text-sm font-medium text-gray-700 mb-2">
                  Grado
                </label>
                <select
                  id="filtroGrado"
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                  value={filtroGrado}
                  onChange={(e) => setFiltroGrado(e.target.value)}
                >
                  <option value="">Todos los grados</option>
                  {grados.map(grado => (
                    <option key={grado.id} value={grado.id}>
                      {formatearNombreGrado(grado.nombre_grado)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filtroSeccion" className="block text-sm font-medium text-gray-700 mb-2">
                  Sección
                </label>
                <select
                  id="filtroSeccion"
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                  value={filtroSeccion}
                  onChange={(e) => setFiltroSeccion(e.target.value)}
                >
                  <option value="">Todas las secciones</option>
                  {secciones
                    .filter(seccion => !filtroGrado || seccion.gradoID?.toString() === filtroGrado)
                    .map(seccion => (
                      <option key={seccion.id} value={seccion.id}>
                        {seccion.nombre_seccion}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label htmlFor="filtroDocumentos" className="block text-sm font-medium text-gray-700 mb-2">
                  Documentos
                </label>
                <select
                  id="filtroDocumentos"
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                  value={filtroDocumentos}
                  onChange={(e) => setFiltroDocumentos(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="completos">Completos</option>
                  <option value="pendientes">Pendientes</option>
                </select>
              </div>

              <div>
                <label htmlFor="filtroPago" className="block text-sm font-medium text-gray-700 mb-2">
                  Pago
                </label>
                <select
                  id="filtroPago"
                  className="block w-full px-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200"
                  value={filtroPago}
                  onChange={(e) => setFiltroPago(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="pagado">Pagado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFiltroEstado('');
                    setFiltroGrado('');
                    setFiltroSeccion('');
                    setFiltroDocumentos('');
                    setFiltroPago('');
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content - List or Cards View */}
      {viewMode === 'list' ? (
        /* Table View */
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-cyan-50 to-cyan-100">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-cyan-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FaHashtag className="w-3 h-3" />
                      <span>Código</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-cyan-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FaUserGraduate className="w-3 h-3" />
                      <span>Estudiante</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-cyan-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FaUserTag className="w-3 h-3" />
                      <span>Representante</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-cyan-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FaChalkboard className="w-3 h-3" />
                      <span>Grado/Sección</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-cyan-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="w-3 h-3" />
                      <span>Fecha</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-cyan-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FaInfoCircle className="w-3 h-3" />
                      <span>Estado</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-cyan-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FaFileAlt className="w-3 h-3" />
                      <span>Documentos</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-cyan-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FaMoneyBillWave className="w-3 h-3" />
                      <span>Pago</span>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-cyan-800 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FaCog className="w-3 h-3" />
                      <span>Acciones</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FaClipboardList className="w-12 h-12 mb-3 text-gray-300" />
                        <p className="text-lg font-medium">No se encontraron inscripciones</p>
                        <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((inscripcion, index) => (
                    <tr 
                      key={inscripcion.id} 
                      className="hover:bg-cyan-50 transition-all duration-300 hover:shadow-md transform hover:scale-[1.01]"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-cyan-600">
                        <div className="flex items-center space-x-2">
                          <FaHashtag className="w-3 h-3 text-cyan-400" />
                          <span>{inscripcion.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
                            <FaUserGraduate className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {inscripcion.estudiante?.nombre} {inscripcion.estudiante?.apellido}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center space-x-1">
                              <FaIdCard className="w-3 h-3" />
                              <span>V-{formatearCedula(inscripcion.estudiante?.cedula)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-violet-400 to-violet-600 rounded-full flex items-center justify-center">
                            <FaUserTag className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {inscripcion.representante?.nombre} {inscripcion.representante?.apellido}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center space-x-1">
                              <FaIdCard className="w-3 h-3" />
                              <span>V-{formatearCedula(inscripcion.representante?.cedula)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium flex items-center space-x-1">
                            <FaGraduationCap className="w-3 h-3 text-cyan-500" />
                            <span>{getNombreGrado(inscripcion.gradoID)}</span>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center space-x-1">
                            <FaChalkboard className="w-3 h-3" />
                            <span>{getNombreSeccion(inscripcion.seccionID)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <FaCalendarAlt className="w-3 h-3 text-gray-400" />
                          <span>{formatearFecha(inscripcion.fechaInscripcion)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border transition-all duration-300 hover:scale-110 ${getEstadoColor(inscripcion.estado)}`}>
                          {inscripcion.estado.charAt(0).toUpperCase() + inscripcion.estado.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {inscripcion.documentosCompletos ? (
                          <span className="text-green-600 flex items-center font-medium transition-all duration-300 hover:scale-110">
                            <FaCheckCircle className="mr-1 animate-pulse" /> Completos
                          </span>
                        ) : (
                          <span className="text-yellow-600 flex items-center font-medium transition-all duration-300 hover:scale-110">
                            <FaClock className="mr-1 animate-pulse" /> Pendientes
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {inscripcion.pagoInscripcionCompletado ? (
                          <span className="text-green-600 flex items-center font-medium transition-all duration-300 hover:scale-110">
                            <FaCheckCircle className="mr-1 animate-pulse" /> Pagado
                          </span>
                        ) : (
                          <span className="text-yellow-600 flex items-center font-medium transition-all duration-300 hover:scale-110">
                            <FaMoneyBillWave className="mr-1 animate-pulse" /> Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/admin/inscripciones/${inscripcion.id}`}
                          className="inline-flex items-center px-3 py-2 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-600 hover:text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                        >
                          <FaEye className="mr-1" /> Ver
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
              <FaClipboardList className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No se encontraron inscripciones</p>
              <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            currentItems.map((inscripcion, index) => (
              <div
                key={inscripcion.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-cyan-300 transform hover:scale-105 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 px-6 py-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm transition-all duration-300 hover:bg-white/30 hover:rotate-12">
                        <FaClipboardList className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white/80 text-xs font-medium flex items-center space-x-1">
                          <FaHashtag className="w-2 h-2" />
                          <span>Inscripción</span>
                        </p>
                        <p className="text-white text-lg font-bold">{inscripcion.id}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all duration-300 hover:scale-110 ${getEstadoColor(inscripcion.estado)}`}>
                      {inscripcion.estado.charAt(0).toUpperCase() + inscripcion.estado.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Estudiante */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
                        <FaUserGraduate className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-cyan-600 mb-1 flex items-center space-x-1">
                          <FaUserGraduate className="w-3 h-3" />
                          <span>Estudiante</span>
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {inscripcion.estudiante?.nombre} {inscripcion.estudiante?.apellido}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center space-x-1">
                          <FaIdCard className="w-3 h-3" />
                          <span>{inscripcion.estudiante?.cedula}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Representante */}
                  <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 transition-all duration-300 hover:shadow-md">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-violet-400 to-violet-600 rounded-full flex items-center justify-center">
                        <FaUserTag className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-violet-600 mb-1 flex items-center space-x-1">
                          <FaUserTag className="w-3 h-3" />
                          <span>Representante</span>
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {inscripcion.representante?.nombre} {inscripcion.representante?.apellido}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center space-x-1">
                          <FaIdCard className="w-3 h-3" />
                          <span>{inscripcion.representante?.cedula}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grado y Sección */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-cyan-100 rounded-lg">
                        <FaGraduationCap className="w-4 h-4 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Grado</p>
                        <p className="text-sm font-semibold text-gray-900">{getNombreGrado(inscripcion.gradoID)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <FaChalkboard className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Sección</p>
                        <p className="text-sm font-semibold text-gray-900">{getNombreSeccion(inscripcion.seccionID)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Icons */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="text-center transition-all duration-300 hover:scale-110">
                        {inscripcion.documentosCompletos ? (
                          <>
                            <FaCheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1 animate-pulse" />
                            <p className="text-xs text-gray-600 font-medium">Docs OK</p>
                          </>
                        ) : (
                          <>
                            <FaClock className="w-6 h-6 text-yellow-500 mx-auto mb-1 animate-pulse" />
                            <p className="text-xs text-gray-600 font-medium">Docs Pend.</p>
                          </>
                        )}
                      </div>
                      <div className="text-center transition-all duration-300 hover:scale-110">
                        {inscripcion.pagoInscripcionCompletado ? (
                          <>
                            <FaCheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1 animate-pulse" />
                            <p className="text-xs text-gray-600 font-medium">Pagado</p>
                          </>
                        ) : (
                          <>
                            <FaMoneyBillWave className="w-6 h-6 text-yellow-500 mx-auto mb-1 animate-pulse" />
                            <p className="text-xs text-gray-600 font-medium">Pago Pend.</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <FaCalendarAlt className="w-3 h-3" />
                      <span>{formatearFecha(inscripcion.fechaInscripcion)}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/admin/inscripciones/${inscripcion.id}`}
                    className="block w-full mt-4 px-4 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white text-center font-semibold rounded-xl hover:from-cyan-600 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105"
                  >
                    <FaEye className="inline mr-2" />
                    Ver Detalles
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
          <div className="text-sm text-gray-700 flex items-center space-x-2">
            <FaInfoCircle className="w-4 h-4 text-cyan-500" />
            <span>
              Mostrando <span className="font-semibold text-cyan-600">{indexOfFirstItem + 1}</span> a{' '}
              <span className="font-semibold text-cyan-600">{Math.min(indexOfLastItem, filteredInscripciones.length)}</span> de{' '}
              <span className="font-semibold text-cyan-600">{filteredInscripciones.length}</span> inscripciones
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              Anterior
            </button>
            
            <div className="flex space-x-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                // Show first page, last page, current page, and pages around current
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-110 ${
                        currentPage === pageNumber
                          ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-md hover:shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber} className="px-2 py-2 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InscripcionesList;