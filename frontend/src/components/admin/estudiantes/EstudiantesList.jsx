import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaEdit, FaEye, FaTrash, FaPlus } from 'react-icons/fa';
import AdminLayout from '../layout/AdminLayout';
import api from '../../../services/api';

const EstudiantesList = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGrado, setSelectedGrado] = useState('');
  const [grados, setGrados] = useState([]);
  
  useEffect(() => {
    const fetchEstudiantes = async () => {
      try {
        // En un escenario real, esta sería una llamada a tu API
        // Por ahora, usamos datos de ejemplo
        setTimeout(() => {
          const mockEstudiantes = [
            { id: 1, nombre: 'María', apellido: 'Rodríguez', cedula: '12345678', grado: '1er Grado', seccion: 'A', representante: 'Ana Rodríguez' },
            { id: 2, nombre: 'Juan', apellido: 'Pérez', cedula: '23456789', grado: '2do Grado', seccion: 'B', representante: 'Pedro Pérez' },
            { id: 3, nombre: 'Carlos', apellido: 'González', cedula: '34567890', grado: '3er Grado', seccion: 'A', representante: 'Laura González' },
            { id: 4, nombre: 'Ana', apellido: 'Martínez', cedula: '45678901', grado: '1er Grado', seccion: 'B', representante: 'José Martínez' },
            { id: 5, nombre: 'Luis', apellido: 'Sánchez', cedula: '56789012', grado: '4to Grado', seccion: 'A', representante: 'María Sánchez' },
            { id: 6, nombre: 'Laura', apellido: 'Díaz', cedula: '67890123', grado: '5to Grado', seccion: 'B', representante: 'Carlos Díaz' },
            { id: 7, nombre: 'Pedro', apellido: 'López', cedula: '78901234', grado: '6to Grado', seccion: 'A', representante: 'Ana López' },
            { id: 8, nombre: 'Sofía', apellido: 'Hernández', cedula: '89012345', grado: '2do Grado', seccion: 'A', representante: 'Juan Hernández' },
            { id: 9, nombre: 'Diego', apellido: 'Torres', cedula: '90123456', grado: '3er Grado', seccion: 'B', representante: 'Sofía Torres' },
            { id: 10, nombre: 'Valentina', apellido: 'Ramírez', cedula: '01234567', grado: '4to Grado', seccion: 'B', representante: 'Diego Ramírez' }
          ];
          
          const mockGrados = ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'];
          
          setEstudiantes(mockEstudiantes);
          setGrados(mockGrados);
          setTotalPages(2); // Simulando paginación
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error al cargar estudiantes:', error);
        setLoading(false);
      }
    };
    
    fetchEstudiantes();
  }, [currentPage, selectedGrado]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Implementar búsqueda
    console.log('Buscando:', search);
  };
  
  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este estudiante?')) {
      // Implementar eliminación
      console.log('Eliminando estudiante con ID:', id);
    }
  };
  
  const filteredEstudiantes = estudiantes.filter(estudiante => 
    (estudiante.nombre.toLowerCase().includes(search.toLowerCase()) ||
     estudiante.apellido.toLowerCase().includes(search.toLowerCase()) ||
     estudiante.cedula.includes(search)) &&
    (selectedGrado === '' || estudiante.grado === selectedGrado)
  );
  
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
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Estudiantes</h1>
          <Link
            to="/admin/estudiantes/nuevo"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Nuevo Estudiante
          </Link>
        </div>
        
        {/* Filtros */}
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
            
            <div className="flex items-center space-x-4">
              <label htmlFor="grado" className="text-gray-700">Filtrar por Grado:</label>
              <select
                id="grado"
                className="rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                value={selectedGrado}
                onChange={(e) => setSelectedGrado(e.target.value)}
              >
                <option value="">Todos los grados</option>
                {grados.map((grado, index) => (
                  <option key={index} value={grado}>{grado}</option>
                ))}
              </select>
            </div>
          </div>
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
                {filteredEstudiantes.map((estudiante) => (
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
                      <div className="text-sm text-gray-500">{estudiante.grado}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{estudiante.seccion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{estudiante.representante}</div>
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
                        <Link
                          to={`/admin/estudiantes/${estudiante.id}/editar`}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                        >
                          <FaEdit />
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
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
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
                  Mostrando <span className="font-medium">1</span> a <span className="font-medium">10</span> de{' '}
                  <span className="font-medium">{filteredEstudiantes.length}</span> resultados
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
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
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
        </div>
      </div>
    </AdminLayout>
  );
};

export default EstudiantesList;
