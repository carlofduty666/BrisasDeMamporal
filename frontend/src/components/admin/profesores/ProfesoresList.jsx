import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaRedo, 
  FaChalkboardTeacher,
  FaUsers,
  FaBookOpen,
  FaGraduationCap,
  FaList,
  FaTh,
  FaFilter,
  FaDownload,
  FaChartLine
} from 'react-icons/fa';
import { formatearNombreGrado, formatearCedula } from '../../../utils/formatters';

const ProfesoresList = () => {
  const [profesores, setProfesores] = useState([]);
  const [filteredProfesores, setFilteredProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'cards'
  const [showFilters, setShowFilters] = useState(false);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchProfesores = async () => {
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
      
      // Obtener profesores básicos
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas`,
        { 
          ...config,
          params: { tipo: 'profesor' }
        }
      );
      
      let profesoresData = [];
      
      if (Array.isArray(response.data)) {
        profesoresData = response.data.filter(p => p.tipo === 'profesor');
      } else if (response.data && response.data.id) {
        if (response.data.tipo === 'profesor') {
          profesoresData = [response.data];
        }
      }

      // Enriquecer datos con materias y grados
      const profesoresEnriquecidos = await Promise.allSettled(
        profesoresData.map(async (profesor) => {
          try {
            // Obtener materias que imparte el profesor
            const materiasResponse = await axios.get(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/profesor/${profesor.id}`,
              { 
                ...config,
                params: { annoEscolarID: annoResponse.data.id },
                timeout: 5000 // Timeout de 5 segundos
              }
            );

            // Obtener grados donde imparte
            const gradosResponse = await axios.get(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados/profesor/${profesor.id}`,
              { 
                ...config,
                params: { annoEscolarID: annoResponse.data.id },
                timeout: 5000 // Timeout de 5 segundos
              }
            );

            return {
              ...profesor,
              materias: Array.isArray(materiasResponse.data) ? materiasResponse.data : [],
              grados: Array.isArray(gradosResponse.data) ? gradosResponse.data : [],
              nombreCompleto: `${profesor.nombre} ${profesor.apellido}`
            };
          } catch (err) {
            console.error(`Error al obtener datos adicionales para profesor ${profesor.id}:`, err.message);
            // Devolver datos básicos incluso si falla
            return {
              ...profesor,
              materias: [],
              grados: [],
              nombreCompleto: `${profesor.nombre} ${profesor.apellido}`
            };
          }
        })
      );
      
      // Procesar resultados de Promise.allSettled
      const procesados = profesoresEnriquecidos
        .map((resultado, index) => {
          if (resultado.status === 'fulfilled') {
            return resultado.value;
          } else {
            // Si falla, devolver datos básicos del profesor
            console.error(`Error en promesa del profesor ${index}:`, resultado.reason);
            return {
              ...profesoresData[index],
              materias: [],
              grados: [],
              nombreCompleto: `${profesoresData[index].nombre} ${profesoresData[index].apellido}`
            };
          }
        });
      
      // Filtrar resultados nulos
      const profesoresValidos = procesados.filter(p => p !== null);
      
      setProfesores(profesoresValidos);
      setFilteredProfesores(profesoresValidos);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar profesores:', err);
      setError('Error al cargar la lista de profesores. Por favor, intente nuevamente.');
      setProfesores([]);
      setFilteredProfesores([]);
      setLoading(false);
      
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };
  

  useEffect(() => {
    fetchProfesores();
  }, [navigate]);

  // Filtrar profesores cuando cambia la búsqueda
  useEffect(() => {
    let result = profesores;
    
    // Aplicar búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        prof => 
          prof.nombre?.toLowerCase().includes(searchLower) ||
          prof.apellido?.toLowerCase().includes(searchLower) ||
          prof.cedula?.toLowerCase().includes(searchLower) ||
          prof.email?.toLowerCase().includes(searchLower) ||
          prof.nombreCompleto?.toLowerCase().includes(searchLower) ||
          prof.materias?.some(materia => 
            materia.asignatura?.toLowerCase().includes(searchLower)
          ) ||
          prof.grados?.some(grado => 
            formatearNombreGrado(grado.nombre_grado)?.toLowerCase().includes(searchLower)
          )
      );
    }
    
    setFilteredProfesores(result);
  }, [searchTerm, profesores]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este profesor? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setProfesores(prev => prev.filter(profesor => profesor.id !== id));
      setFilteredProfesores(prev => prev.filter(profesor => profesor.id !== id));
      setSuccessMessage('Profesor eliminado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error al eliminar profesor:', err);
      setError(err.response?.data?.message || 'Error al eliminar el profesor. Por favor, intente nuevamente.');
    }
  };

  const exportToCSV = () => {
    // Crear datos CSV
    const headers = ['Cédula', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Materias', 'Grados'];
    const csvData = [
      headers.join(','),
      ...filteredProfesores.map(prof => [
        prof.cedula || '',
        prof.nombre || '',
        prof.apellido || '',
        prof.email || '',
        prof.telefono || '',
        prof.materias?.map(m => m.asignatura).join('; ') || '',
        prof.grados?.map(g => g.nombre_grado).join('; ') || ''
      ].join(','))
    ].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'profesores.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProfesores.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProfesores.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse"></div>
          </div>
          <p className="mt-4 text-emerald-600 font-medium">Cargando profesores...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-900 shadow-2xl rounded-2xl mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/30 to-transparent"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-emerald-300/10 rounded-full blur-2xl"></div>
        
        <div className="relative px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl backdrop-blur-sm border border-emerald-400/30">
                  <FaChalkboardTeacher className="w-8 h-8 text-emerald-200" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Gestión de Profesores
                  </h1>
                  <p className="text-emerald-200 text-lg">
                    Administra el cuerpo docente de la institución
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-200 text-sm font-medium">Total Profesores</p>
                      <p className="text-2xl font-bold text-white">{filteredProfesores.length}</p>
                    </div>
                    <FaUsers className="w-8 h-8 text-emerald-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-200 text-sm font-medium">Materias Activas</p>
                      <p className="text-2xl font-bold text-white">
                        {[...new Set(filteredProfesores.flatMap(p => p.materias?.map(m => m.id) || []))].length}
                      </p>
                    </div>
                    <FaBookOpen className="w-8 h-8 text-emerald-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-200 text-sm font-medium">Año Escolar</p>
                      <p className="text-2xl font-bold text-white">{annoEscolar?.periodo || 'N/A'}</p>
                    </div>
                    <FaGraduationCap className="w-8 h-8 text-emerald-300" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="mt-8 lg:mt-0 lg:ml-8">
              <Link
                to="/admin/profesores/nuevo"
                className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaPlus className="w-5 h-5 mr-3" />
                Nuevo Profesor
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 mb-6 rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
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
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                  placeholder="Buscar por nombre, cédula, materia o grado..."
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
                  onClick={() => setViewMode('list')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:text-emerald-600'
                  }`}
                >
                  <FaList className="w-4 h-4 mr-2" />
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'cards'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-gray-600 hover:text-emerald-600'
                  }`}
                >
                  <FaTh className="w-4 h-4 mr-2" />
                  Tarjetas
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors duration-200 border border-emerald-200"
              >
                <FaDownload className="w-4 h-4 mr-2" />
                Exportar
              </button>

              {/* Refresh Button */}
              <button
                onClick={fetchProfesores}
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-emerald-50 to-emerald-100">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                    Profesor
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                    Materias
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                    Grados
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((profesor) => (
                    <tr key={profesor.id} className="hover:bg-emerald-50/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                              <span className="text-white font-semibold text-lg">
                                {profesor.nombre?.charAt(0)}{profesor.apellido?.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {profesor.nombre} {profesor.apellido}
                            </div>
                            <div className="text-sm text-gray-500">
                              C.I: V - {formatearCedula(profesor.cedula)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {profesor.email || 'No disponible'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {profesor.telefono || 'No disponible'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {profesor.materias?.length > 0 ? (
                            profesor.materias.slice(0, 3).map((materia, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"
                              >
                                {materia.asignatura}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">Sin materias</span>
                          )}
                          {profesor.materias?.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              +{profesor.materias.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {profesor.grados?.length > 0 ? (
                            profesor.grados.slice(0, 2).map((grado, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {formatearNombreGrado(grado.nombre_grado)}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">Sin grados</span>
                          )}
                          {profesor.grados?.length > 2 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              +{profesor.grados.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/admin/profesores/${profesor.id}`}
                            className="inline-flex items-center px-3 py-2 border border-emerald-300 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors duration-200"
                            title="Ver detalles"
                          >
                            <FaEye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/profesores/editar/${profesor.id}`}
                            className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                            title="Editar"
                          >
                            <FaEdit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(profesor.id)}
                            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                            title="Eliminar"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <FaChalkboardTeacher className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">No se encontraron profesores</p>
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
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentItems.length > 0 ? (
            currentItems.map((profesor) => (
              <div
                key={profesor.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  {/* Avatar y nombre */}
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-14 w-14">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {profesor.nombre?.charAt(0)}{profesor.apellido?.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {profesor.nombre} {profesor.apellido}
                      </h3>
                      <p className="text-sm text-gray-500">C.I: V - {formatearCedula(profesor.cedula)}</p>
                    </div>
                  </div>

                  {/* Contacto */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">{profesor.email || 'No disponible'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{profesor.telefono || 'No disponible'}</span>
                    </div>
                  </div>

                  {/* Materias */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Materias</h4>
                    <div className="flex flex-wrap gap-1">
                      {profesor.materias?.length > 0 ? (
                        profesor.materias.slice(0, 2).map((materia, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800"
                          >
                            {materia.asignatura}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">Sin materias asignadas</span>
                      )}
                      {profesor.materias?.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                          +{profesor.materias.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Grados */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Grados</h4>
                    <div className="flex flex-wrap gap-1">
                      {profesor.grados?.length > 0 ? (
                        profesor.grados.slice(0, 2).map((grado, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {grado.nombre_grado}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">Sin grados asignados</span>
                      )}
                      {profesor.grados?.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                          +{profesor.grados.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <Link
                      to={`/admin/profesores/${profesor.id}`}
                      className="inline-flex items-center px-3 py-2 border border-emerald-300 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors duration-200"
                    >
                      <FaEye className="w-4 h-4 mr-1" />
                      Ver
                    </Link>
                    <Link
                      to={`/admin/profesores/editar/${profesor.id}`}
                      className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                    >
                      <FaEdit className="w-4 h-4 mr-1" />
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(profesor.id)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <FaChalkboardTeacher className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-xl font-medium text-gray-900 mb-2">No se encontraron profesores</p>
              <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando{' '}
                <span className="font-medium">{indexOfFirstItem + 1}</span>
                {' '}a{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredProfesores.length)}
                </span>
                {' '}de{' '}
                <span className="font-medium">{filteredProfesores.length}</span>
                {' '}resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span
                        key={page}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Siguiente</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfesoresList;
