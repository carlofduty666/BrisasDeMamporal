import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEdit, FaTrash, FaUserPlus, FaSearch, FaFilter, FaDownload } from 'react-icons/fa';
import AdminLayout from '../layout/AdminLayout';

const RepresentanteList = () => {
  const [representantes, setRepresentantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRepresentantes, setFilteredRepresentantes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    conEstudiantes: false,
    sinEstudiantes: false,
    pagosAlDia: false,
    pagosPendientes: false
  });

  const handleNuevoRepresentante = () => {
    navigate('/inscripcion/nuevo-estudiante');
  };
  
// En el useEffect donde cargas los representantes
useEffect(() => {
    const fetchRepresentantes = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
          // Intentar obtener todos los representantes
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas`,
            { 
              headers: { 'Authorization': `Bearer ${token}` },
              params: { tipo: 'representante' }  // Usar parámetros de consulta
            }
          );
          
        //   console.log("Respuesta completa:", response);
          
          // Determinar si tenemos un array o un solo objeto
          let representantesData = [];
          
          if (Array.isArray(response.data)) {
            // Si es un array, filtramos por tipo representante
            representantesData = response.data.filter(p => p.tipo === 'representante');
          } else if (response.data && response.data.id) {
            // Si es un solo objeto y es representante
            if (response.data.tipo === 'representante') {
              representantesData = [response.data];
            }
          }
          
        //   console.log("Representantes encontrados:", representantesData);
        
        // Obtener información adicional para cada representante
        const representantesConInfo = await Promise.all(
          representantesData.map(async (representante) => {
            try {
              // Obtener estudiantes asociados
              const estudiantesResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/representante/${representante.id}/estudiantes`,
                { headers: { 'Authorization': `Bearer ${token}` } }
              );
              
              // Verificar pagos
              let pagosAlDia = true;
              if (estudiantesResponse.data.length > 0) {
                for (const estudiante of estudiantesResponse.data) {
                  const pagosResponse = await axios.get(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/pagos/estudiante/${estudiante.id}/estado`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                  );
                  
                  if (!pagosResponse.data.alDia) {
                    pagosAlDia = false;
                    break;
                  }
                }
              }
              
              return {
                ...representante,
                estudiantes: estudiantesResponse.data,
                cantidadEstudiantes: estudiantesResponse.data.length,
                pagosAlDia
              };
            } catch (err) {
              console.error(`Error al obtener información adicional para representante ${representante.id}:`, err);
              return {
                ...representante,
                estudiantes: [],
                cantidadEstudiantes: 0,
                pagosAlDia: true
              };
            }
          })
        );
        
        setRepresentantes(representantesConInfo);
        setFilteredRepresentantes(representantesConInfo);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar representantes:', err);
        setError('Error al cargar la lista de representantes. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchRepresentantes();
  }, []);
  
  
  
  // Filtrar representantes según búsqueda y filtros
  useEffect(() => {
    let result = representantes;
    
    // Aplicar búsqueda
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      result = result.filter(
        representante =>
          representante.nombre.toLowerCase().includes(searchTermLower) ||
          representante.apellido.toLowerCase().includes(searchTermLower) ||
          representante.cedula.toLowerCase().includes(searchTermLower) ||
          representante.email?.toLowerCase().includes(searchTermLower) ||
          representante.telefono?.includes(searchTerm)
      );
    }
    
    // Aplicar filtros
    if (filters.conEstudiantes) {
      result = result.filter(representante => representante.cantidadEstudiantes > 0);
    }
    
    if (filters.sinEstudiantes) {
      result = result.filter(representante => representante.cantidadEstudiantes === 0);
    }
    
    if (filters.pagosAlDia) {
      result = result.filter(representante => representante.pagosAlDia);
    }
    
    if (filters.pagosPendientes) {
      result = result.filter(representante => !representante.pagosAlDia);
    }
    
    setFilteredRepresentantes(result);
  }, [searchTerm, filters, representantes]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleDeleteRepresentante = async (id) => {
    if (!confirm('¿Está seguro de eliminar este representante? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Actualizar la lista de representantes
      setRepresentantes(prev => prev.filter(rep => rep.id !== id));
      setFilteredRepresentantes(prev => prev.filter(rep => rep.id !== id));
      
      alert('Representante eliminado correctamente');
    } catch (err) {
      console.error('Error al eliminar representante:', err);
      alert(err.response?.data?.message || 'Error al eliminar el representante. Por favor, intente nuevamente.');
    }
  };
  
  const exportToCSV = () => {
    // Crear datos CSV
    const headers = ['Cédula', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Dirección', 'Profesión', 'Estudiantes', 'Pagos al día'];
    const csvData = [
      headers.join(','),
      ...filteredRepresentantes.map(rep => [
        rep.cedula,
        rep.nombre,
        rep.apellido,
        rep.email || '',
        rep.telefono || '',
        (rep.direccion || '').replace(/,/g, ' '),
        (rep.profesion || '').replace(/,/g, ' '),
        rep.cantidadEstudiantes,
        rep.pagosAlDia ? 'Sí' : 'No'
      ].join(','))
    ].join('\n');
    
    // Crear blob y descargar
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'representantes.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
     
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Representantes</h1>
          <div className="flex space-x-2">
            <Link
              to={'/inscripcion/nuevo-estudiante'}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaUserPlus className="mr-2" /> Nuevo Representante
            </Link>
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaDownload className="mr-2" /> Exportar CSV
            </button>
          </div>
        </div>
        
        {/* Búsqueda y filtros */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar por nombre, cédula, email o teléfono..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaFilter className="mr-2" /> Filtros
            </button>
          </div>
          
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Filtrar por:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <input
                    id="conEstudiantes"
                    name="conEstudiantes"
                    type="checkbox"
                    checked={filters.conEstudiantes}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="conEstudiantes" className="ml-2 block text-sm text-gray-700">
                    Con estudiantes
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="sinEstudiantes"
                    name="sinEstudiantes"
                    type="checkbox"
                    checked={filters.sinEstudiantes}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="sinEstudiantes" className="ml-2 block text-sm text-gray-700">
                    Sin estudiantes
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="pagosAlDia"
                    name="pagosAlDia"
                    type="checkbox"
                    checked={filters.pagosAlDia}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pagosAlDia" className="ml-2 block text-sm text-gray-700">
                    Pagos al día
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="pagosPendientes"
                    name="pagosPendientes"
                    type="checkbox"
                    checked={filters.pagosPendientes}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="pagosPendientes" className="ml-2 block text-sm text-gray-700">
                    Pagos pendientes
                  </label>
                </div>
              </div>
            </div>
          )}
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
        
        {/* Tabla de representantes */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredRepresentantes.length > 0 ? (
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
                      Contacto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estudiantes
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pagos
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRepresentantes.map((representante) => (
                    <tr key={representante.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {representante.cedula}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {representante.nombre} {representante.apellido}
                        </div>
                        <div className="text-sm text-gray-500">
                          {representante.profesion || 'Profesión: no especificada'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{representante.email}</div>
                        <div className="text-sm text-gray-500">{representante.telefono}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {representante.cantidadEstudiantes} estudiante(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          representante.pagosAlDia ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {representante.pagosAlDia ? 'Al día' : 'Pendientes'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            to={`/admin/representantes/${representante.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Ver detalles"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            to={`/admin/representantes/${representante.id}/editar`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <FaEdit />
                          </Link>
                          {representante.cantidadEstudiantes === 0 && (
                            <button
                              onClick={() => handleDeleteRepresentante(representante.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">No se encontraron representantes con los criterios de búsqueda.</p>
            </div>
          )}
        </div>
        
        {/* Paginación (opcional) */}
        {filteredRepresentantes.length > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{filteredRepresentantes.length}</span> de{' '}
              <span className="font-medium">{representantes.length}</span> representantes
            </div>
            {/* Aquí puedes agregar controles de paginación si lo necesitas */}
          </div>
        )}
      </div>
     
  );
};

export default RepresentanteList;
