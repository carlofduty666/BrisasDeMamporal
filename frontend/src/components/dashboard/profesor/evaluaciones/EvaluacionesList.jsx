import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaDownload, FaEye, FaFilter, FaSearch } from 'react-icons/fa';
import ProfesorLayout from '../layout/ProfesorLayout';

const EvaluacionesList = () => {
  const navigate = useNavigate();
  
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    materiaID: '',
    gradoID: '',
    lapso: '',
    busqueda: ''
  });
  
  // Estado para mostrar/ocultar filtros en móviles
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
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
        
        // Decodificar el token para obtener el ID del profesor
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const profesorID = tokenData.personaID;
        
        // Obtener año escolar actual
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        const annoEscolarID = annoResponse.data.id;
        
        // Cargar evaluaciones del profesor
        const evaluacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/evaluaciones/profesor/${profesorID}`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { annoEscolarID }
          }
        );
        
        setEvaluaciones(evaluacionesResponse.data);
        
        // Cargar materias asignadas al profesor
        const materiasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/materias/profesor/${profesorID}`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { annoEscolarID }
          }
        );
        
        setMaterias(materiasResponse.data);
        
        // Cargar grados
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/grados`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        setGrados(gradosResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);
  
  // Filtrar evaluaciones
  const evaluacionesFiltradas = evaluaciones.filter(evaluacion => {
    // Filtro por materia
    if (filtros.materiaID && evaluacion.materiaID.toString() !== filtros.materiaID) {
      return false;
    }
    
    // Filtro por grado
    if (filtros.gradoID && evaluacion.gradoID.toString() !== filtros.gradoID) {
      return false;
    }
    
    // Filtro por lapso
    if (filtros.lapso && evaluacion.lapso.toString() !== filtros.lapso) {
      return false;
    }
    
    // Filtro por búsqueda (nombre de evaluación)
    if (filtros.busqueda && !evaluacion.nombreEvaluacion.toLowerCase().includes(filtros.busqueda.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      materiaID: '',
      gradoID: '',
      lapso: '',
      busqueda: ''
    });
  };
  
  // Eliminar evaluación
  const handleDeleteEvaluacion = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta evaluación? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/evaluaciones/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Actualizar lista de evaluaciones
      setEvaluaciones(prev => prev.filter(ev => ev.id !== id));
      
      setSuccess('Evaluación eliminada correctamente');
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      
      setLoading(false);
    } catch (error) {
      console.error('Error al eliminar evaluación:', error);
      setError(error.response?.data?.message || 'Error al eliminar la evaluación. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  
  // Formatear fecha
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'No especificada';
    
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  return (
    <ProfesorLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Mis Evaluaciones</h1>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:hidden"
            >
              <FaFilter className="mr-2" /> {mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros'}
            </button>
            
            <Link
              to="/profesor/evaluaciones/nueva"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FaPlus className="mr-2" /> Nueva Evaluación
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}
        
        {/* Filtros */}
        <div className={`bg-white shadow-md rounded-lg overflow-hidden mb-6 ${!mostrarFiltros && 'hidden md:block'}`}>
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Búsqueda por nombre */}
              <div>
                <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar por nombre
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="busqueda"
                    name="busqueda"
                    value={filtros.busqueda}
                    onChange={handleFilterChange}
                    placeholder="Nombre de evaluación"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md pl-10"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              {/* Filtro por materia */}
              <div>
                <label htmlFor="materiaID" className="block text-sm font-medium text-gray-700 mb-1">
                  Materia
                </label>
                <select
                  id="materiaID"
                  name="materiaID"
                  value={filtros.materiaID}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Todas las materias</option>
                  {materias.map((materia) => (
                    <option key={materia.id} value={materia.id}>
                      {materia.asignatura}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Filtro por grado */}
              <div>
                <label htmlFor="gradoID" className="block text-sm font-medium text-gray-700 mb-1">
                  Grado
                </label>
                <select
                  id="gradoID"
                  name="gradoID"
                  value={filtros.gradoID}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Todos los grados</option>
                  {grados.map((grado) => (
                    <option key={grado.id} value={grado.id}>
                      {grado.nombre_grado}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Filtro por lapso */}
              <div>
                <label htmlFor="lapso" className="block text-sm font-medium text-gray-700 mb-1">
                  Lapso
                </label>
                <select
                  id="lapso"
                  name="lapso"
                  value={filtros.lapso}
                  onChange={handleFilterChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="">Todos los lapsos</option>
                  <option value="1">Primer Lapso</option>
                  <option value="2">Segundo Lapso</option>
                  <option value="3">Tercer Lapso</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={limpiarFiltros}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
        
        {/* Lista de evaluaciones */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-6 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : evaluacionesFiltradas.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No se encontraron evaluaciones con los filtros seleccionados.</p>
              {Object.values(filtros).some(v => v) && (
                <button
                  onClick={limpiarFiltros}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evaluación
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Materia / Grado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lapso
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Porcentaje
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {evaluacionesFiltradas.map((evaluacion) => {
                    // Buscar materia y grado correspondientes
                    const materia = materias.find(m => m.id === evaluacion.materiaID);
                    const grado = grados.find(g => g.id === evaluacion.gradoID);
                    
                    return (
                      <tr key={evaluacion.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {evaluacion.nombreEvaluacion}
                              </div>
                              <div className="text-sm text-gray-500">
                                {evaluacion.tipoEvaluacion}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{materia?.asignatura || 'No disponible'}</div>
                          <div className="text-sm text-gray-500">{grado?.nombre_grado || 'No disponible'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {evaluacion.lapso === 1 ? 'Primer Lapso' : 
                             evaluacion.lapso === 2 ? 'Segundo Lapso' : 
                             evaluacion.lapso === 3 ? 'Tercer Lapso' : 
                             `Lapso ${evaluacion.lapso}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatearFecha(evaluacion.fechaEvaluacion)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {evaluacion.porcentaje}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            new Date(evaluacion.fechaEvaluacion) > new Date() 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {new Date(evaluacion.fechaEvaluacion) > new Date() ? 'Pendiente' : 'Realizada'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              to={`/profesor/evaluaciones/${evaluacion.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Ver detalles"
                            >
                              <FaEye />
                            </Link>
                            <Link
                              to={`/profesor/evaluaciones/${evaluacion.id}/editar`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar"
                            >
                              <FaEdit />
                            </Link>
                            {evaluacion.archivoURL && (
                              <a
                                href={`${import.meta.env.VITE_API_URL}${evaluacion.archivoURL}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-900"
                                title="Descargar archivo"
                              >
                                <FaDownload />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteEvaluacion(evaluacion.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProfesorLayout>
  );
};

export default EvaluacionesList;