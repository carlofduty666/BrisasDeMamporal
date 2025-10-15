import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaRedo,
  FaGraduationCap,
  FaUsers,
  FaBookOpen,
  FaChalkboardTeacher,
  FaList,
  FaTh,
  FaFilter,
  FaDownload,
  FaChartLine,
  FaUserGraduate,
  FaBook
} from 'react-icons/fa';
import { formatearNombreGrado } from '../../../utils/formatters';

const GradosList = () => {
  const [grados, setGrados] = useState([]);
  const [niveles, setNiveles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [cupos, setCupos] = useState({});
  const [viewMode, setViewMode] = useState('cards'); // 'list' o 'cards'
  const navigate = useNavigate();
  
  // Estados para filtrado y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Obtener token de autenticación
  const token = localStorage.getItem('token');

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
      
      // Obtener niveles educativos
      const nivelesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/nivel`,
        config
      );
      setNiveles(nivelesResponse.data);
      
      // Obtener grados con información básica
      const gradosResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados`,
        { 
          ...config,
          params: { include: 'niveles' }
        }
      );
      
      // Enriquecer datos con SOLO contadores (optimizado)
      const gradosEnriquecidos = await Promise.all(
        gradosResponse.data.map(async (grado) => {
          try {
            // Obtener solo contadores en paralelo para mejor rendimiento
            const [seccionesResponse, estudiantesResponse, profesoresResponse, materiasResponse] = await Promise.all([
              // Secciones - obtener lista completa (son pocas)
              axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/grado/${grado.id}`,
                { 
                  ...config,
                  params: { annoEscolarID: annoResponse.data.id }
                }
              ),
              // Estudiantes - solo contar
              axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${grado.id}/estudiantes`,
                { 
                  ...config,
                  params: { 
                    annoEscolarID: annoResponse.data.id,
                    tipo: 'estudiante',
                    count: true // Solo obtener el conteo
                  }
                }
              ),
              // Profesores - solo contar
              axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/${grado.id}/profesores`,
                { 
                  ...config,
                  params: { 
                    annoEscolarID: annoResponse.data.id,
                    tipo: 'profesor',
                    count: true // Solo obtener el conteo
                  }
                }
              ),
              // Materias - solo contar
              axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/grado/${grado.id}`,
                { 
                  ...config,
                  params: { 
                    annoEscolarID: annoResponse.data.id,
                    count: true // Solo obtener el conteo
                  }
                }
              )
            ]);

            return {
              ...grado,
              // Secciones: guardamos la lista completa (son pocas)
              secciones: seccionesResponse.data || [],
              // Para el resto, solo guardamos el conteo
              estudiantesCount: Array.isArray(estudiantesResponse.data) 
                ? estudiantesResponse.data.length 
                : (estudiantesResponse.data?.count || 0),
              profesoresCount: Array.isArray(profesoresResponse.data) 
                ? profesoresResponse.data.length 
                : (profesoresResponse.data?.count || 0),
              materiasCount: Array.isArray(materiasResponse.data) 
                ? materiasResponse.data.length 
                : (materiasResponse.data?.count || 0)
            };
          } catch (err) {
            console.error(`Error al obtener datos adicionales para grado ${grado.id}:`, err);
            return {
              ...grado,
              secciones: [],
              estudiantesCount: 0,
              profesoresCount: 0,
              materiasCount: 0
            };
          }
        })
      );
      
      setGrados(gradosEnriquecidos);
      
      // Obtener información de cupos
      try {
        const cuposResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos/resumen`,
          { 
            ...config,
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
      
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);
  
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

  // Agrupar grados por nivel educativo
  const gradosPorNivel = useMemo(() => {
    const grupos = {};
    
    filteredGrados.forEach(grado => {
      const nivelInfo = grado.Niveles || niveles.find(n => n.id === grado.nivelID);
      const nivelNombre = nivelInfo ? nivelInfo.nombre_nivel : 'Sin Nivel';
      const nivelId = nivelInfo ? nivelInfo.id : 'sin-nivel';
      
      if (!grupos[nivelId]) {
        grupos[nivelId] = {
          id: nivelId,
          nombre: nivelNombre,
          grados: []
        };
      }
      
      grupos[nivelId].grados.push(grado);
    });
    
    // Ordenar los grados dentro de cada nivel
    Object.values(grupos).forEach(grupo => {
      grupo.grados.sort((a, b) => {
        const nombreA = formatearNombreGrado(a.nombre_grado);
        const nombreB = formatearNombreGrado(b.nombre_grado);
        return nombreA.localeCompare(nombreB);
      });
    });
    
    // Convertir a array y ordenar niveles (primaria primero, luego secundaria)
    return Object.values(grupos).sort((a, b) => {
      const ordenNiveles = { 'primaria': 1, 'secundaria': 2 };
      const ordenA = ordenNiveles[a.nombre.toLowerCase()] || 999;
      const ordenB = ordenNiveles[b.nombre.toLowerCase()] || 999;
      return ordenA - ordenB;
    });
  }, [filteredGrados, niveles]);

  const exportToCSV = () => {
    const headers = ['Grado', 'Nivel', 'Secciones', 'Estudiantes', 'Profesores', 'Materias', 'Cupos Totales', 'Cupos Ocupados', 'Cupos Disponibles'];
    const csvData = [
      headers.join(','),
      ...filteredGrados.map(grado => {
        const cupoInfo = cupos[grado.id] || { capacidad: 0, ocupados: 0, disponibles: 0 };
        const nivelInfo = grado.Niveles || niveles.find(n => n.id === grado.nivelID);
        return [
          formatearNombreGrado(grado.nombre_grado),
          nivelInfo ? nivelInfo.nombre_nivel : 'N/A',
          grado.secciones?.length || 0,
          grado.estudiantesCount || 0,
          grado.profesoresCount || 0,
          grado.materiasCount || 0,
          cupoInfo.capacidad,
          cupoInfo.ocupados,
          cupoInfo.disponibles
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'grados.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Paginación (deshabilitada para vista agrupada)
  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentItems = filteredGrados.slice(indexOfFirstItem, indexOfLastItem);
  // const totalPages = Math.ceil(filteredGrados.length / itemsPerPage);

  // Calcular estadísticas totales (usando contadores optimizados)
  const totalEstudiantes = grados.reduce((sum, g) => sum + (g.estudiantesCount || 0), 0);
  const totalProfesores = grados.reduce((sum, g) => sum + (g.profesoresCount || 0), 0);
  const totalMaterias = grados.reduce((sum, g) => sum + (g.materiasCount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-pulse"></div>
          </div>
          <p className="mt-4 text-indigo-600 font-medium">Cargando grados...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-800 to-indigo-900 shadow-2xl rounded-2xl mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-transparent"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-indigo-300/10 rounded-full blur-2xl"></div>
        
        <div className="relative px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-indigo-500/20 rounded-xl backdrop-blur-sm border border-indigo-400/30">
                  <FaGraduationCap className="w-8 h-8 text-indigo-200" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Gestión de Grados
                  </h1>
                  <p className="text-indigo-200 text-lg">
                    Administra los grados académicos de la institución
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-200 text-sm font-medium">Total Grados</p>
                      <p className="text-2xl font-bold text-white">{filteredGrados.length}</p>
                    </div>
                    <FaGraduationCap className="w-8 h-8 text-indigo-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-200 text-sm font-medium">Total Estudiantes</p>
                      <p className="text-2xl font-bold text-white">{totalEstudiantes}</p>
                    </div>
                    <FaUsers className="w-8 h-8 text-indigo-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-200 text-sm font-medium">Profesores Activos</p>
                      <p className="text-2xl font-bold text-white">{totalProfesores}</p>
                    </div>
                    <FaChalkboardTeacher className="w-8 h-8 text-indigo-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-200 text-sm font-medium">Año Escolar</p>
                      <p className="text-2xl font-bold text-white">{annoEscolar?.periodo || 'N/A'}</p>
                    </div>
                    <FaBookOpen className="w-8 h-8 text-indigo-300" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="mt-8 lg:mt-0 lg:ml-8">
              <Link
                to="/admin/academico/grados/nuevo"
                className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaPlus className="w-5 h-5 mr-3" />
                Nuevo Grado
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700 p-4 mb-6 rounded-r-lg shadow-sm">
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  placeholder="Buscar grado..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-xl transition-all duration-200 border ${
                  showFilters
                    ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <FaFilter className="w-4 h-4 mr-2" />
                Filtros
              </button>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  <FaList className="w-4 h-4 mr-2" />
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'cards'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  <FaTh className="w-4 h-4 mr-2" />
                  Tarjetas
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors duration-200 border border-indigo-200"
              >
                <FaDownload className="w-4 h-4 mr-2" />
                Exportar
              </button>

              {/* Refresh Button */}
              <button
                onClick={fetchData}
                className="flex items-center px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
                title="Actualizar lista"
              >
                <FaRedo className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel Educativo
                  </label>
                  <select
                    id="nivel"
                    value={selectedNivel}
                    onChange={(e) => setSelectedNivel(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
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
            </div>
          )}
        </div>
      </div>

      {/* Content - Agrupado por Nivel */}
      {gradosPorNivel.length > 0 ? (
        <div className="space-y-8">
          {gradosPorNivel.map((nivelGrupo) => (
            <div key={nivelGrupo.id} className="animate-fadeIn">
              {/* Nivel Header */}
              <div className="mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg">
                      <FaGraduationCap className="text-white text-xl" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {nivelGrupo.nombre.charAt(0).toUpperCase() + nivelGrupo.nombre.slice(1)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {nivelGrupo.grados.length} {nivelGrupo.grados.length === 1 ? 'grado' : 'grados'}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-100 text-indigo-800">
                      {nivelGrupo.grados.reduce((sum, g) => sum + (g.estudiantes?.length || 0), 0)} estudiantes
                    </span>
                  </div>
                </div>
              </div>

              {/* Grados del Nivel */}
              {viewMode === 'list' ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                            Grado
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                            Secciones
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                            Estudiantes
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                            Profesores
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                            Materias
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                            Cupos
                          </th>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {nivelGrupo.grados.map((grado) => {
                          const cupoInfo = cupos[grado.id] || { capacidad: 0, ocupados: 0, disponibles: 0 };
                          const porcentajeOcupacion = cupoInfo.capacidad > 0 
                            ? Math.round((cupoInfo.ocupados / cupoInfo.capacidad) * 100) 
                            : 0;

                          return (
                            <tr key={grado.id} className="hover:bg-indigo-50/50 transition-colors duration-200">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-12 w-12">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                                      <FaGraduationCap className="text-white text-xl" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-semibold text-gray-900">
                                      {formatearNombreGrado(grado.nombre_grado)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Link
                                  to={`/admin/academico/grados/${grado.id}?tab=info`}
                                  className="flex items-center hover:text-indigo-600 transition-colors cursor-pointer group"
                                  title="Ver secciones"
                                >
                                  <FaUsers className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 mr-2 transition-colors" />
                                  <span className="text-sm text-gray-900 group-hover:text-indigo-600 font-medium transition-colors">
                                    {grado.secciones?.length || 0}
                                  </span>
                                </Link>
                              </td>
                              <td className="px-6 py-4">
                                <Link
                                  to={`/admin/academico/grados/${grado.id}?tab=estudiantes`}
                                  className="flex items-center hover:text-blue-600 transition-colors cursor-pointer group"
                                  title="Ver estudiantes"
                                >
                                  <FaUserGraduate className="w-4 h-4 text-gray-400 group-hover:text-blue-500 mr-2 transition-colors" />
                                  <span className="text-sm text-gray-900 group-hover:text-blue-600 font-medium transition-colors">
                                    {grado.estudiantesCount || 0}
                                  </span>
                                </Link>
                              </td>
                              <td className="px-6 py-4">
                                <Link
                                  to={`/admin/academico/grados/${grado.id}?tab=profesores`}
                                  className="flex items-center hover:text-emerald-600 transition-colors cursor-pointer group"
                                  title="Ver profesores"
                                >
                                  <FaChalkboardTeacher className="w-4 h-4 text-gray-400 group-hover:text-emerald-500 mr-2 transition-colors" />
                                  <span className="text-sm text-gray-900 group-hover:text-emerald-600 font-medium transition-colors">
                                    {grado.profesoresCount || 0}
                                  </span>
                                </Link>
                              </td>
                              <td className="px-6 py-4">
                                <Link
                                  to={`/admin/academico/grados/${grado.id}?tab=materias`}
                                  className="flex items-center hover:text-purple-600 transition-colors cursor-pointer group"
                                  title="Ver materias"
                                >
                                  <FaBook className="w-4 h-4 text-gray-400 group-hover:text-purple-500 mr-2 transition-colors" />
                                  <span className="text-sm text-gray-900 group-hover:text-purple-600 font-medium transition-colors">
                                    {grado.materiasCount || 0}
                                  </span>
                                </Link>
                              </td>
                              <td className="px-6 py-4">
                                <div className="w-32">
                                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>{cupoInfo.ocupados}/{cupoInfo.capacidad}</span>
                                    <span>{porcentajeOcupacion}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-300 ${
                                        porcentajeOcupacion >= 90 ? 'bg-red-500' : 
                                        porcentajeOcupacion >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                      }`}
                                      style={{ width: `${porcentajeOcupacion}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <Link
                                    to={`/admin/academico/grados/${grado.id}`}
                                    className="inline-flex items-center px-3 py-2 border border-indigo-300 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200"
                                    title="Ver detalles"
                                  >
                                    <FaEye className="w-4 h-4" />
                                  </Link>
                                  <Link
                                    to={`/admin/academico/grados/${grado.id}/editar`}
                                    className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                                    title="Editar"
                                  >
                                    <FaEdit className="w-4 h-4" />
                                  </Link>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nivelGrupo.grados.map((grado) => {
                    const cupoInfo = cupos[grado.id] || { capacidad: 0, ocupados: 0, disponibles: 0 };
                    const porcentajeOcupacion = cupoInfo.capacidad > 0 
                      ? Math.round((cupoInfo.ocupados / cupoInfo.capacidad) * 100) 
                      : 0;

                    return (
                      <div
                        key={grado.id}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <FaGraduationCap className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white">
                                  {formatearNombreGrado(grado.nombre_grado)}
                                </h3>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6">
                          {/* Stats Grid - Clickeable */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <Link
                              to={`/admin/academico/grados/${grado.id}?tab=info`}
                              className="bg-indigo-50 rounded-xl p-3 hover:bg-indigo-100 transition-all duration-200 transform hover:scale-105 cursor-pointer group"
                              title="Ver secciones"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-indigo-600 font-medium group-hover:text-indigo-700">Secciones</p>
                                  <p className="text-xl font-bold text-indigo-900">{grado.secciones?.length || 0}</p>
                                </div>
                                <FaUsers className="w-6 h-6 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                              </div>
                            </Link>

                            <Link
                              to={`/admin/academico/grados/${grado.id}?tab=estudiantes`}
                              className="bg-blue-50 rounded-xl p-3 hover:bg-blue-100 transition-all duration-200 transform hover:scale-105 cursor-pointer group"
                              title="Ver estudiantes"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-blue-600 font-medium group-hover:text-blue-700">Estudiantes</p>
                                  <p className="text-xl font-bold text-blue-900">{grado.estudiantesCount || 0}</p>
                                </div>
                                <FaUserGraduate className="w-6 h-6 text-blue-400 group-hover:text-blue-600 transition-colors" />
                              </div>
                            </Link>

                            <Link
                              to={`/admin/academico/grados/${grado.id}?tab=profesores`}
                              className="bg-emerald-50 rounded-xl p-3 hover:bg-emerald-100 transition-all duration-200 transform hover:scale-105 cursor-pointer group"
                              title="Ver profesores"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-emerald-600 font-medium group-hover:text-emerald-700">Profesores</p>
                                  <p className="text-xl font-bold text-emerald-900">{grado.profesoresCount || 0}</p>
                                </div>
                                <FaChalkboardTeacher className="w-6 h-6 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
                              </div>
                            </Link>

                            <Link
                              to={`/admin/academico/grados/${grado.id}?tab=materias`}
                              className="bg-purple-50 rounded-xl p-3 hover:bg-purple-100 transition-all duration-200 transform hover:scale-105 cursor-pointer group"
                              title="Ver materias"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-purple-600 font-medium group-hover:text-purple-700">Materias</p>
                                  <p className="text-xl font-bold text-purple-900">{grado.materiasCount || 0}</p>
                                </div>
                                <FaBook className="w-6 h-6 text-purple-400 group-hover:text-purple-600 transition-colors" />
                              </div>
                            </Link>
                          </div>

                          {/* Cupos Progress */}
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Cupos</span>
                              <span className="text-sm font-bold text-gray-900">
                                {cupoInfo.ocupados}/{cupoInfo.capacidad}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                              <div 
                                className={`h-3 rounded-full transition-all duration-300 ${
                                  porcentajeOcupacion >= 90 ? 'bg-red-500' : 
                                  porcentajeOcupacion >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${porcentajeOcupacion}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>{porcentajeOcupacion}% ocupado</span>
                              <span>{cupoInfo.disponibles} disponibles</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex space-x-2">
                            <Link
                              to={`/admin/academico/grados/${grado.id}`}
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-indigo-300 rounded-xl text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors duration-200"
                            >
                              <FaEye className="w-4 h-4 mr-2" />
                              Ver
                            </Link>
                            <Link
                              to={`/admin/academico/grados/${grado.id}/editar`}
                              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-blue-300 rounded-xl text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                            >
                              <FaEdit className="w-4 h-4 mr-2" />
                              Editar
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
          <FaGraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No se encontraron grados</p>
          <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}


    </div>
  );
};

export default GradosList;