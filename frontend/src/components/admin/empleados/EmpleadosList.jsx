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
  FaUserTie,
  FaUsers,
  FaBriefcase,
  FaIdCard,
  FaList,
  FaTh,
  FaFilter,
  FaDownload,
  FaChartLine,
  FaUserCog,
  FaTools
} from 'react-icons/fa';
import { formatearCedula } from '../../../utils/formatters';

const EmpleadosList = () => {
  const [empleados, setEmpleados] = useState([]);
  const [filteredEmpleados, setFilteredEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'cards'
  const [showFilters, setShowFilters] = useState(false);
  const [filterTipo, setFilterTipo] = useState('all'); // 'all', 'administrativo', 'obrero'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      // Obtener empleados (administrativos y obreros)
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas`,
        config
      );
      
      let empleadosData = [];
      
      if (Array.isArray(response.data)) {
        empleadosData = response.data.filter(p => 
          p.tipo === 'administrativo' || p.tipo === 'obrero'
        );
      } else if (response.data && response.data.id) {
        if (response.data.tipo === 'administrativo' || response.data.tipo === 'obrero') {
          empleadosData = [response.data];
        }
      }

      // Enriquecer datos con roles y documentos
      const empleadosEnriquecidos = await Promise.all(
        empleadosData.map(async (empleado) => {
          try {
            // Obtener roles del empleado
            const rolesResponse = await axios.get(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${empleado.id}/roles`,
              config
            );

            // Obtener documentos del empleado
            const documentosResponse = await axios.get(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/documentos/persona/${empleado.id}`,
              config
            );

            return {
              ...empleado,
              roles: rolesResponse.data || [],
              documentos: documentosResponse.data || [],
              nombreCompleto: `${empleado.nombre} ${empleado.apellido}`,
              tipoEmpleado: empleado.tipo === 'administrativo' ? 'Administrativo' : 'Obrero'
            };
          } catch (err) {
            console.error(`Error al obtener datos adicionales para empleado ${empleado.id}:`, err);
            return {
              ...empleado,
              roles: [],
              documentos: [],
              nombreCompleto: `${empleado.nombre} ${empleado.apellido}`,
              tipoEmpleado: empleado.tipo === 'administrativo' ? 'Administrativo' : 'Obrero'
            };
          }
        })
      );
      
      setEmpleados(empleadosEnriquecidos);
      setFilteredEmpleados(empleadosEnriquecidos);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar empleados:', err);
      setError('Error al cargar la lista de empleados. Por favor, intente nuevamente.');
      setEmpleados([]);
      setFilteredEmpleados([]);
      setLoading(false);
      
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };
  

  useEffect(() => {
    fetchEmpleados();
  }, [navigate]);

  // Filtrar empleados cuando cambia la búsqueda o el filtro de tipo
  useEffect(() => {
    let result = empleados;
    
    // Aplicar filtro de tipo
    if (filterTipo !== 'all') {
      result = result.filter(emp => emp.tipo === filterTipo);
    }
    
    // Aplicar búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        emp => 
          emp.nombre?.toLowerCase().includes(searchLower) ||
          emp.apellido?.toLowerCase().includes(searchLower) ||
          emp.cedula?.toLowerCase().includes(searchLower) ||
          emp.email?.toLowerCase().includes(searchLower) ||
          emp.nombreCompleto?.toLowerCase().includes(searchLower) ||
          emp.profesion?.toLowerCase().includes(searchLower) ||
          emp.roles?.some(rol => 
            rol.nombre?.toLowerCase().includes(searchLower)
          )
      );
    }
    
    setFilteredEmpleados(result);
    setCurrentPage(1); // Reset to first page when filtering
  }, [searchTerm, filterTipo, empleados]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este empleado? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setEmpleados(prev => prev.filter(empleado => empleado.id !== id));
      setFilteredEmpleados(prev => prev.filter(empleado => empleado.id !== id));
      setSuccessMessage('Empleado eliminado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error al eliminar empleado:', err);
      setError(err.response?.data?.message || 'Error al eliminar el empleado. Por favor, intente nuevamente.');
      setTimeout(() => setError(''), 5000);
    }
  };

  const exportToCSV = () => {
    // Crear datos CSV
    const headers = ['Cédula', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Tipo', 'Profesión', 'Roles'];
    const csvData = [
      headers.join(','),
      ...filteredEmpleados.map(emp => [
        emp.cedula || '',
        emp.nombre || '',
        emp.apellido || '',
        emp.email || '',
        emp.telefono || '',
        emp.tipoEmpleado || '',
        emp.profesion || '',
        emp.roles?.map(r => r.nombre).join('; ') || ''
      ].join(','))
    ].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'empleados.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEmpleados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEmpleados.length / itemsPerPage);

  // Estadísticas
  const stats = {
    total: filteredEmpleados.length,
    administrativos: empleados.filter(e => e.tipo === 'administrativo').length,
    obreros: empleados.filter(e => e.tipo === 'obrero').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-200 border-t-amber-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-pulse"></div>
          </div>
          <p className="mt-4 text-amber-600 font-medium">Cargando empleados...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Hero Section */}
      <div className="relative overflow-hidden bg-amber-800 shadow-2xl rounded-2xl mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-amber-700/30"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-amber-300/10 rounded-full blur-2xl"></div>
        
        <div className="relative px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-amber-500/20 rounded-xl backdrop-blur-sm border border-amber-400/30">
                  <FaUserTie className="w-8 h-8 text-amber-200" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Gestión de Empleados
                  </h1>
                  <p className="text-amber-200 text-lg">
                    Administra el personal administrativo y obrero de la institución
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-200 text-sm font-medium">Total Empleados</p>
                      <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                    <FaUsers className="w-8 h-8 text-amber-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-200 text-sm font-medium">Administrativos</p>
                      <p className="text-2xl font-bold text-white">{stats.administrativos}</p>
                    </div>
                    <FaUserCog className="w-8 h-8 text-amber-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-105">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-200 text-sm font-medium">Obreros</p>
                      <p className="text-2xl font-bold text-white">{stats.obreros}</p>
                    </div>
                    <FaTools className="w-8 h-8 text-amber-300" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="mt-8 lg:mt-0 lg:ml-8">
              <Link
                to="/admin/empleados/nuevo"
                className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaPlus className="w-5 h-5 mr-3" />
                Nuevo Empleado
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-4 mb-6 rounded-r-lg shadow-sm animate-fade-in">
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

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-amber-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400" />
              <input
                type="text"
                placeholder="Buscar empleados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                showFilters 
                  ? 'bg-amber-600 text-white shadow-lg' 
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              <FaFilter className="mr-2" />
              Filtros
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-amber-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-white text-amber-600 shadow-md' 
                    : 'text-amber-600 hover:bg-white/50'
                }`}
              >
                <FaList />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-3 rounded-lg transition-all duration-300 ${
                  viewMode === 'cards' 
                    ? 'bg-white text-amber-600 shadow-md' 
                    : 'text-amber-600 hover:bg-white/50'
                }`}
              >
                <FaTh />
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <FaDownload className="mr-2" />
              Exportar
            </button>

            {/* Refresh Button */}
            {/* <button
              onClick={fetchEmpleados}
              className="flex items-center px-4 py-3 bg-slate-600 text-white rounded-xl font-medium hover:bg-slate-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <FaRedo className="mr-2" />
              Actualizar
            </button> */}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-amber-200 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-700 mb-2">
                  Tipo de Empleado
                </label>
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-amber-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="all">Todos</option>
                  <option value="administrativo">Administrativos</option>
                  <option value="obrero">Obreros</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {filteredEmpleados.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-amber-100">
          <FaUserTie className="w-16 h-16 text-amber-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            No se encontraron empleados
          </h3>
          <p className="text-slate-500 mb-6">
            {searchTerm || filterTipo !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando un nuevo empleado'}
          </p>
          <Link
            to="/admin/empleados/nuevo"
            className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <FaPlus className="mr-2" />
            Agregar Empleado
          </Link>
        </div>
      ) : (
        <>
          {/* List View */}
          {viewMode === 'list' && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-amber-200">
                  <thead className="bg-amber-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        Empleado
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        Cédula
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        Profesión
                      </th>
                      {/* <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        Roles
                      </th> */}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        Documentos
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-amber-700 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-amber-100">
                    {currentItems.map((empleado, index) => (
                      <tr 
                        key={empleado.id} 
                        className="hover:bg-amber-50 transition-colors duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <span className="text-amber-600 font-semibold text-sm">
                                  {empleado.nombre?.charAt(0)}{empleado.apellido?.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900">
                                {empleado.nombreCompleto}
                              </div>
                              <div className="text-sm text-slate-500">
                                {empleado.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">
                            {formatearCedula(empleado.cedula)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            empleado.tipo === 'administrativo'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {empleado.tipoEmpleado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{empleado.telefono || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{empleado.profesion || 'N/A'}</div>
                        </td>
                        {/* <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {empleado.roles && empleado.roles.length > 0 ? (
                              empleado.roles.map((rol, idx) => (
                                <span 
                                  key={idx}
                                  className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-lg"
                                >
                                  {rol.nombre}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-slate-400">Sin roles</span>
                            )}
                          </div>
                        </td> */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaIdCard className="text-amber-500 mr-2" />
                            <span className="text-sm text-slate-900">
                              {empleado.documentos?.length || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/empleados/${empleado.id}`}
                              className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2 hover:bg-blue-50 rounded-lg"
                              title="Ver detalles"
                            >
                              <FaEye />
                            </Link>
                            <Link
                              to={`/admin/empleados/editar/${empleado.id}`}
                              className="text-amber-600 hover:text-amber-900 transition-colors duration-200 p-2 hover:bg-amber-50 rounded-lg"
                              title="Editar"
                            >
                              <FaEdit />
                            </Link>
                            <button
                              onClick={() => handleDelete(empleado.id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2 hover:bg-red-50 rounded-lg"
                              title="Eliminar"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((empleado, index) => (
                <div
                  key={empleado.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Card Header */}
                  <div className="bg-amber-50 px-6 py-4 border-b border-amber-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                          <span className="text-amber-600 font-bold text-lg">
                            {empleado.nombre?.charAt(0)}{empleado.apellido?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {empleado.nombreCompleto}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {formatearCedula(empleado.cedula)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        empleado.tipo === 'administrativo'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {empleado.tipoEmpleado}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-6 py-4 space-y-3">
                    <div className="flex items-center text-sm">
                      <FaBriefcase className="text-amber-500 mr-3 flex-shrink-0" />
                      <span className="text-slate-600">
                        {empleado.profesion || 'No especificado'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-amber-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      <span className="text-slate-600 truncate">
                        {empleado.email || 'No especificado'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-amber-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <span className="text-slate-600">
                        {empleado.telefono || 'No especificado'}
                      </span>
                    </div>

                    {/* Roles */}
                    {/* <div className="pt-2">
                      <p className="text-xs font-semibold text-amber-700 mb-2">ROLES:</p>
                      <div className="flex flex-wrap gap-1">
                        {empleado.roles && empleado.roles.length > 0 ? (
                          empleado.roles.map((rol, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded-lg"
                            >
                              {rol.nombre}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Sin roles asignados</span>
                        )}
                      </div>
                    </div> */}

                    {/* Documentos */}
                    <div className="flex items-center justify-between pt-2 border-t border-amber-100">
                      <div className="flex items-center text-sm text-slate-600">
                        <FaIdCard className="text-amber-500 mr-2" />
                        <span>{empleado.documentos?.length || 0} documentos</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="bg-amber-50 px-6 py-4 border-t border-amber-100">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/empleados/${empleado.id}`}
                        className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 text-sm font-medium"
                      >
                        <FaEye className="mr-2" />
                        Ver
                      </Link>
                      <Link
                        to={`/admin/empleados/editar/${empleado.id}`}
                        className="flex items-center px-4 py-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-all duration-200 text-sm font-medium"
                      >
                        <FaEdit className="mr-2" />
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(empleado.id)}
                        className="flex items-center px-4 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200 text-sm font-medium"
                      >
                        <FaTrash className="mr-2" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-between bg-white rounded-2xl shadow-lg p-6 border border-amber-100">
              <div className="text-sm text-slate-600">
                Mostrando <span className="font-semibold text-amber-600">{indexOfFirstItem + 1}</span> a{' '}
                <span className="font-semibold text-amber-600">
                  {Math.min(indexOfLastItem, filteredEmpleados.length)}
                </span>{' '}
                de <span className="font-semibold text-amber-600">{filteredEmpleados.length}</span> empleados
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  Anterior
                </button>
                
                <div className="flex items-center gap-1">
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
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            currentPage === pageNumber
                              ? 'bg-amber-600 text-white shadow-md'
                              : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="px-2 text-slate-400">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EmpleadosList;