import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaRedo } from 'react-icons/fa';
import AdminLayout from '../layout/AdminLayout'; 

const ProfesoresList = () => {
  const [profesores, setProfesores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const token = localStorage.getItem('token');

  const fetchProfesores = async () => {
    try {
      setLoading(true);
      console.log('Obteniendo lista de profesores...');
      
      // Usar la misma estrategia que en RepresentanteList.jsx
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { tipo: 'profesor' }  // Usar parámetros de consulta
        }
      );
      
      console.log('Respuesta completa de la API:', response);
      
      // Determinar si tenemos un array o un solo objeto
      let profesoresData = [];
      
      if (Array.isArray(response.data)) {
        // Si es un array, filtramos por tipo profesor
        profesoresData = response.data.filter(p => p.tipo === 'profesor');
        console.log('Encontrados', profesoresData.length, 'profesores en el array');
      } else if (response.data && response.data.id) {
        // Si es un solo objeto y es profesor
        if (response.data.tipo === 'profesor') {
          profesoresData = [response.data];
          console.log('Encontrado un profesor individual, convertido a array');
        }
      }
      
      setProfesores(profesoresData);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar profesores:', err);
      if (err.response) {
        console.error('Detalles del error:', err.response.data);
        console.error('Estado HTTP:', err.response.status);
      }
      setError('Error al cargar la lista de profesores. Por favor, intente nuevamente.');
      setProfesores([]);
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchProfesores();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setProfesores(profesores.filter(profesor => profesor.id !== id));
      setSuccessMessage('Profesor eliminado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error al eliminar profesor:', err);
      setError('Error al eliminar el profesor. Por favor, intente nuevamente.');
    }
  };

  // Añadir verificación antes de filtrar
  const filteredProfesores = Array.isArray(profesores) 
    ? profesores.filter(profesor => 
        profesor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profesor.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profesor.cedula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profesor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
     
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Profesores</h1>
          <Link
            to="/admin/profesores/nuevo"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors"
          >
            <FaPlus className="mr-2" /> Nuevo Profesor
          </Link>
        </div>

        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
            <p>{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Buscar profesor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={fetchProfesores}
                className="ml-3 bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition-colors"
                title="Actualizar lista"
              >
                <FaRedo />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
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
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProfesores.length > 0 ? (
                    filteredProfesores.map((profesor) => (
                      <tr key={profesor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {profesor.cedula}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {profesor.nombre} {profesor.apellido}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {profesor.email || 'No disponible'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {profesor.telefono || 'No disponible'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/admin/profesores/${profesor.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Ver detalles"
                            >
                              <FaEye />
                            </Link>
                            <Link
                              to={`/admin/profesores/editar/${profesor.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar"
                            >
                              <FaEdit />
                            </Link>
                            {confirmDelete === profesor.id ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleDelete(profesor.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Confirmar eliminación"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="text-gray-600 hover:text-gray-900"
                                  title="Cancelar"
                                >
                                  ✗
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelete(profesor.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Eliminar"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No se encontraron profesores
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
     
  );
};

export default ProfesoresList;
