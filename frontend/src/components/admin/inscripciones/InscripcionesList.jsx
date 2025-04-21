import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaFilter, FaSearch, FaFileExport, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { formatearFecha } from '../../../utils/formatters';
import AdminLayout from '../layout/AdminLayout'

const InscripcionesList = () => {
  const navigate = useNavigate();
  const [inscripciones, setInscripciones] = useState([]);
  const [filteredInscripciones, setFilteredInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [grados, setGrados] = useState([]);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroGrado, setFiltroGrado] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
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
    
    setFilteredInscripciones(filtered);
  }, [inscripciones, searchTerm, filtroEstado, filtroGrado]);
  
  // Función para exportar a Excel/CSV
  const exportarInscripciones = () => {
    // Implementar exportación a Excel/CSV
    alert('Funcionalidad de exportación en desarrollo');
  };
  
  // Obtener el nombre del grado
  const getNombreGrado = (gradoID) => {
    const grado = grados.find(g => g.id === gradoID);
    return grado ? grado.nombre_grado.replace(/_/g, ' ') : 'No asignado';
  };
  
  // Obtener color según estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'inscrito':
        return 'bg-green-100 text-green-800';
      case 'aprobado':
        return 'bg-green-100 text-green-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      case 'retirado':
        return 'bg-gray-100 text-gray-800';
      case 'graduado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
     
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Inscripciones</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
          >
            <FaFilter className="mr-2" />
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
          <button
            onClick={exportarInscripciones}
            className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
          >
            <FaFileExport className="mr-2" />
            Exportar
          </button>
        </div>
      </div>
      
      {/* Año escolar activo */}
      {annoEscolar && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md">
          <p className="text-blue-800">
            <span className="font-medium">Año Escolar Activo:</span> {annoEscolar.periodo}
          </p>
        </div>
      )}
      
      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Buscar por código, nombre, apellido o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Filtros adicionales */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h2 className="text-lg font-medium text-gray-700 mb-3">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="filtroEstado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                id="filtroEstado"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              <label htmlFor="filtroGrado" className="block text-sm font-medium text-gray-700 mb-1">
                Grado
              </label>
              <select
                id="filtroGrado"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={filtroGrado}
                onChange={(e) => setFiltroGrado(e.target.value)}
              >
                <option value="">Todos los grados</option>
                {grados.map(grado => (
                  <option key={grado.id} value={grado.id}>
                    {grado.nombre_grado.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFiltroEstado('');
                  setFiltroGrado('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
          <p>{error}</p>
        </div>
      )}
      
      {/* Tabla de inscripciones */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estudiante
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Representante
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documentos
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pago
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredInscripciones.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron inscripciones
                  </td>
                </tr>
              ) : (
                filteredInscripciones.map((inscripcion) => (
                  <tr key={inscripcion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{inscripcion.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium text-gray-900">
                          {inscripcion.estudiante?.nombre} {inscripcion.estudiante?.apellido}
                        </div>
                        <div className="text-xs text-gray-500">
                          CI: {inscripcion.estudiante?.cedula}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium text-gray-900">
                          {inscripcion.representante?.nombre} {inscripcion.representante?.apellido}
                        </div>
                        <div className="text-xs text-gray-500">
                          CI: {inscripcion.representante?.cedula}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getNombreGrado(inscripcion.gradoID)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatearFecha(inscripcion.fechaInscripcion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(inscripcion.estado)}`}>
                        {inscripcion.estado.charAt(0).toUpperCase() + inscripcion.estado.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inscripcion.documentosCompletos ? (
                        <span className="text-green-600 flex items-center">
                          <FaCheckCircle className="mr-1" /> Completos
                        </span>
                      ) : (
                        <span className="text-yellow-600 flex items-center">
                          <FaTimesCircle className="mr-1" /> Pendientes
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inscripcion.pagoInscripcionCompletado ? (
                        <span className="text-green-600 flex items-center">
                          <FaCheckCircle className="mr-1" /> Pagado
                        </span>
                      ) : (
                        <span className="text-yellow-600 flex items-center">
                          <FaTimesCircle className="mr-1" /> Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link
                        to={`/admin/inscripciones/${inscripcion.id}`}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <FaEye className="mr-1" /> Ver detalles
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Paginación (si es necesario) */}
      {filteredInscripciones.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Mostrando <span className="font-medium">{filteredInscripciones.length}</span> de{' '}
            <span className="font-medium">{inscripciones.length}</span> inscripciones
          </div>
          
          {/* Aquí se puede agregar componente de paginación si es necesario */}
        </div>
      )}
    </div>
     
  );
};

export default InscripcionesList;
