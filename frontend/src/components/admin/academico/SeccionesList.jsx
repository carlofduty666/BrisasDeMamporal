import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUserPlus, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import AdminLayout from '../layout/AdminLayout';
import { useNavigate } from 'react-router-dom';
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAsignarEstudianteForm, setShowAsignarEstudianteForm] = useState(false);
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [estudiantesSeccion, setEstudiantesSeccion] = useState([]);
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [niveles, setNiveles] = useState([]);
  const [gradoNivelMap, setGradoNivelMap] = useState({});

  // Estado para formularios
  const [newSeccion, setNewSeccion] = useState({
    nombre_seccion: '',
    gradoID: '',
    capacidad: 30,
    activo: true
  });

  const [asignarEstudianteForm, setAsignarEstudianteForm] = useState({
    estudianteID: '',
    seccionID: '',
    annoEscolarID: ''
  });

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
  
        // Configurar headers con token
        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };
  
        // Obtener secciones
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/secciones`,
          config
        );
        console.log("Secciones cargadas:", seccionesResponse.data);
  
        // Obtener grados
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/grados`,
          config
        );
        console.log("Grados cargados:", gradosResponse.data);
  
        // Obtener niveles
        const nivelesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/nivel`,
          config
        );
        console.log("Niveles cargados:", nivelesResponse.data);
  
        // Obtener año escolar activo
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          config
        );
  
        // Obtener SOLO estudiantes (tipo = 'estudiante')
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/tipo/estudiante`,
          config
        );
  
        setSecciones(seccionesResponse.data);
        setGrados(gradosResponse.data);
        setNiveles(nivelesResponse.data);
        setAnnoEscolar(annoResponse.data);
        setEstudiantes(estudiantesResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos. Por favor, intente nuevamente.');
        setLoading(false);
        
        // Si hay error de autenticación, redirigir al login
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };
  
    fetchData();
  }, [navigate]);

  useEffect(() => {
    if (grados.length > 0 && niveles.length > 0) {
      const mapGradoNivel = {};
      
      grados.forEach(grado => {
        const nivel = niveles.find(n => n.id === grado.nivelID);
        if (nivel) {
          mapGradoNivel[grado.id] = {
            nombreGrado: grado.nombre_grado,
            nombreNivel: nivel.nombre_nivel
          };
        }
      });
      
      setGradoNivelMap(mapGradoNivel);
      console.log("Mapa de grado-nivel creado:", mapGradoNivel);
    }
  }, [grados, niveles]);
  

  // Filtrar secciones según término de búsqueda
  const filteredSecciones = secciones.filter(seccion => 
    seccion.nombre_seccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grados.find(g => g.id === seccion.gradoID)?.nombre_grado.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Crear nueva sección
  const handleCreateSeccion = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/secciones`,
        newSeccion,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setSecciones([...secciones, response.data]);
      setSuccessMessage('Sección creada correctamente');
      setShowCreateForm(false);
      setNewSeccion({
        nombre_seccion: '',
        gradoID: '',
        capacidad: 30,
        activo: true
      });
      
      toast.success('Sección creada correctamente');
    } catch (err) {
      console.error('Error al crear sección:', err);
      setError(err.response?.data?.message || 'Error al crear sección');
      toast.error(err.response?.data?.message || 'Error al crear sección');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar sección
  const handleUpdateSeccion = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/secciones/${selectedSeccion.id}`,
        selectedSeccion,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setSecciones(secciones.map(seccion => 
        seccion.id === selectedSeccion.id ? response.data : seccion
      ));
      setSuccessMessage('Sección actualizada correctamente');
      setShowEditForm(false);
      setSelectedSeccion(null);
      
      toast.success('Sección actualizada correctamente');
    } catch (err) {
      console.error('Error al actualizar sección:', err);
      setError(err.response?.data?.message || 'Error al actualizar sección');
      toast.error(err.response?.data?.message || 'Error al actualizar sección');
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
      console.error('Error al eliminar sección:', err);
      setError(err.response?.data?.message || 'Error al eliminar sección');
      toast.error(err.response?.data?.message || 'Error al eliminar sección');
    } finally {
      setLoading(false);
    }
  };

  // Asignar estudiante a sección
const handleAsignarEstudiante = async (e) => {
    e.preventDefault();
    
    if (!asignarEstudianteForm.estudianteID) {
      toast.error('Seleccione un estudiante');
      return;
    }
    
    if (!annoEscolar) {
      toast.error('No hay un año escolar activo');
      return;
    }
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/secciones/asignar-estudiante`,
        {
          estudianteID: asignarEstudianteForm.estudianteID,
          seccionID: selectedSeccion.id,
          annoEscolarID: annoEscolar.id
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      toast.success('Estudiante asignado correctamente');
      
      // Actualizar la lista de estudiantes
      const estudiantesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/secciones/${selectedSeccion.id}/estudiantes?annoEscolarID=${annoEscolar.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setEstudiantesSeccion(estudiantesResponse.data);
      
      // Eliminar el estudiante asignado de la lista de disponibles
      setEstudiantes(prev => prev.filter(est => est.id !== asignarEstudianteForm.estudianteID));
      
      // Limpiar el formulario
      setAsignarEstudianteForm({ estudianteID: '' });
      
      setLoading(false);
    } catch (err) {
      console.error('Error al asignar estudiante:', err);
      toast.error(err.response?.data?.message || 'Error al asignar estudiante. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  

  // Eliminar estudiante de sección
// Modificar la función handleRemoveEstudiante
const handleRemoveEstudiante = async (estudianteID) => {
    if (!annoEscolar) {
      toast.error('No hay un año escolar activo');
      return;
    }
    
    if (window.confirm('¿Está seguro de eliminar este estudiante de la sección?')) {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/secciones/${selectedSeccion.id}/estudiantes/${estudianteID}/anno/${annoEscolar.id}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        toast.success('Estudiante eliminado de la sección correctamente');
        
        // Actualizar la lista de estudiantes
        const estudiantesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/secciones/${selectedSeccion.id}/estudiantes?annoEscolarID=${annoEscolar.id}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        setEstudiantesSeccion(estudiantesResponse.data);
        
        // Obtener el estudiante eliminado para añadirlo a la lista de disponibles
        const estudianteResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/personas/${estudianteID}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (estudianteResponse.data) {
          setEstudiantes(prev => [...prev, estudianteResponse.data]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error al eliminar estudiante de la sección:', err);
        toast.error(err.response?.data?.message || 'Error al eliminar estudiante. Por favor, intente nuevamente.');
        setLoading(false);
      }
    }
  };
  

  // Cargar estudiantes de una sección
  const loadEstudiantesSeccion = useCallback(async (seccionID) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/secciones/${seccionID}/estudiantes?annoEscolarID=${annoEscolar.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      setEstudiantesSeccion(response.data);
    } catch (err) {
      console.error('Error al cargar estudiantes de la sección:', err);
      setError('Error al cargar estudiantes de la sección');
    } finally {
      setLoading(false);
    }
  }, [annoEscolar]);

// Modificar la función handleOpenEstudiantesModal
const handleOpenEstudiantesModal = async (seccion) => {
    try {
      setLoading(true);
      setSelectedSeccion(seccion);
      
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      // Si hay año escolar activo, lo usamos para filtrar
      const annoEscolarID = annoEscolar ? annoEscolar.id : null;
      
      if (!annoEscolarID) {
        toast.error('No hay un año escolar activo');
        setLoading(false);
        return;
      }
      
      // Obtener estudiantes de la sección actual
      const estudiantesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/secciones/${seccion.id}/estudiantes?annoEscolarID=${annoEscolarID}`,
        config
      );
      
      setEstudiantesSeccion(estudiantesResponse.data);
      
      // Obtener estudiantes del grado pero que no estén asignados a ninguna sección
      // Primero obtenemos todos los estudiantes del grado
      const estudiantesGradoResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/grados/${seccion.gradoID}/estudiantes?annoEscolarID=${annoEscolarID}`,
        config
      );
      
      // Luego obtenemos todas las secciones del mismo grado
      const seccionesGradoResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/secciones/grado/${seccion.gradoID}`,
        config
      );
      
      const seccionesIds = seccionesGradoResponse.data.map(s => s.id);
      
      // Para cada sección, obtenemos sus estudiantes
      const estudiantesAsignados = new Set();
      
      for (const seccionId of seccionesIds) {
        const estudiantesSeccionResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/secciones/${seccionId}/estudiantes?annoEscolarID=${annoEscolarID}`,
          config
        );
        
        estudiantesSeccionResponse.data.forEach(est => {
          estudiantesAsignados.add(est.id);
        });
      }
      
      // Filtramos los estudiantes del grado que no están asignados a ninguna sección
      const estudiantesDisponibles = estudiantesGradoResponse.data.filter(
        est => !estudiantesAsignados.has(est.id)
      );
      
      setEstudiantes(estudiantesDisponibles);
      setShowAsignarEstudianteForm(true);
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar estudiantes:', err);
      toast.error(err.response?.data?.message || 'Error al cargar estudiantes. Por favor, intente nuevamente.');
      setLoading(false);
    }
  };
  

  // Contenido principal
  const content = (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Secciones</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center"
        >
          {showCreateForm ? (
            <>
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </>
          ) : (
            <>
              <FaPlus className="mr-2" /> Nueva Sección
            </>
          )}
        </button>
      </div>
      
      {/* Mensajes de éxito o error */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
          <p>{successMessage}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {/* Formulario para crear sección */}
      {showCreateForm && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Crear Nueva Sección</h3>
          
          <form onSubmit={handleCreateSeccion}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="nombre_seccion" className="block text-sm font-medium text-gray-700">
                  Nombre de la Sección *
                </label>
                <input
                  type="text"
                  id="nombre_seccion"
                  name="nombre_seccion"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newSeccion.nombre_seccion}
                  onChange={(e) => setNewSeccion({...newSeccion, nombre_seccion: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="gradoID" className="block text-sm font-medium text-gray-700">
                  Grado *
                </label>
                <select
                  id="gradoID"
                  name="gradoID"
                  required
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newSeccion.gradoID}
                  onChange={(e) => setNewSeccion({...newSeccion, gradoID: e.target.value})}
                >
                  <option value="">Seleccione un grado</option>
                  {grados.map((grado) => (
                    <option key={grado.id} value={grado.id}>
                      {grado.nombre_grado}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="capacidad" className="block text-sm font-medium text-gray-700">
                  Capacidad
                </label>
                <input
                  type="number"
                  id="capacidad"
                  name="capacidad"
                  min="1"
                  max="100"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newSeccion.capacidad}
                  onChange={(e) => setNewSeccion({...newSeccion, capacidad: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={newSeccion.activo}
                  onChange={(e) => setNewSeccion({...newSeccion, activo: e.target.checked})}
                />
                <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
                  Activo
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Buscador */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre o grado..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>
      
        {/* Tabla de secciones */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sección
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nivel
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacidad
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estudiantes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
                </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {loading && !secciones.length ? (
                <tr>
                <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                    </div>
                </td>
                </tr>
            ) : filteredSecciones.length === 0 ? (
                <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron secciones
                </td>
                </tr>
            ) : (
                filteredSecciones.map((seccion) => {
                  const grado = grados.find(g => g.id === seccion.gradoID);
                  const nivel = grado ? niveles.find(n => n.id === grado.nivelID) : null;
    
                return (
                  <tr key={seccion.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {seccion.nombre_seccion}
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {grado ? formatearNombreGrado(grado.nombre_grado) : 'No asignado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {nivel ? formatearNombreNivel(nivel.nombre_nivel) : 'No asignado'}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {gradoNivelMap[seccion.gradoID]?.nombreGrado ? 
                      formatearNombreGrado(gradoNivelMap[seccion.gradoID].nombreGrado) : 
                      'No asignado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {gradoNivelMap[seccion.gradoID]?.nombreNivel ? 
                      formatearNombreNivel(gradoNivelMap[seccion.gradoID].nombreNivel) : 
                      'No asignado'}
                  </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {seccion.capacidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${seccion.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {seccion.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                        onClick={() => handleOpenEstudiantesModal(seccion)}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        >
                        <FaUsers className="mr-1" /> Ver estudiantes
                        </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                        <button
                            onClick={() => {
                            setSelectedSeccion(seccion);
                            setShowEditForm(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                        >
                            <FaEdit />
                        </button>
                        <button
                            onClick={() => handleOpenEstudiantesModal(seccion)}
                            className="text-green-600 hover:text-green-900"
                            title="Asignar Estudiantes"
                        >
                            <FaUserPlus />
                        </button>
                        <button
                            onClick={() => handleDeleteSeccion(seccion.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                        >
                            <FaTrash />
                        </button>
                        </div>
                    </td>
                    </tr>
                );
                })
            )}
            </tbody>
        </table>
        </div>
      
      {/* Modal para editar sección */}
      {showEditForm && selectedSeccion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Editar Sección</h3>
              <button 
                onClick={() => setShowEditForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateSeccion}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit_nombre_seccion" className="block text-sm font-medium text-gray-700">
                    Nombre de la Sección *
                  </label>
                  <input
                    type="text"
                    id="edit_nombre_seccion"
                    name="nombre_seccion"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={selectedSeccion.nombre_seccion}
                    onChange={(e) => setSelectedSeccion({...selectedSeccion, nombre_seccion: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="edit_gradoID" className="block text-sm font-medium text-gray-700">
                    Grado *
                  </label>
                  <select
                    id="edit_gradoID"
                    name="gradoID"
                    required
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={selectedSeccion.gradoID}
                    onChange={(e) => setSelectedSeccion({...selectedSeccion, gradoID: e.target.value})}
                  >
                    <option value="">Seleccione un grado</option>
                    {grados.map((grado) => (
                      <option key={grado.id} value={grado.id}>
                        {grado.nombre_grado}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="edit_capacidad" className="block text-sm font-medium text-gray-700">
                    Capacidad
                  </label>
                  <input
                    type="number"
                    id="edit_capacidad"
                    name="capacidad"
                    min="1"
                    max="100"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={selectedSeccion.capacidad}
                    onChange={(e) => setSelectedSeccion({...selectedSeccion, capacidad: parseInt(e.target.value)})}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit_activo"
                    name="activo"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={selectedSeccion.activo}
                    onChange={(e) => setSelectedSeccion({...selectedSeccion, activo: e.target.checked})}
                  />
                  <label htmlFor="edit_activo" className="ml-2 block text-sm text-gray-900">
                    Activo
                  </label>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal para asignar/ver estudiantes */}
      {showAsignarEstudianteForm && selectedSeccion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Estudiantes de la Sección: {selectedSeccion.nombre_seccion}
              </h3>
              <button 
                onClick={() => setShowAsignarEstudianteForm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Formulario para asignar estudiante */}
              <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-3">Asignar Nuevo Estudiante</h4>
            <form onSubmit={handleAsignarEstudiante}>
                <div className="space-y-4">
                <div>
                    <label htmlFor="estudianteID" className="block text-sm font-medium text-gray-700">
                    Estudiante *
                    </label>
                    <select
                        id="estudianteID"
                        name="estudianteID"
                        required
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={asignarEstudianteForm.estudianteID}
                        onChange={(e) => setAsignarEstudianteForm({...asignarEstudianteForm, estudianteID: e.target.value})}
                        >
                        <option value="">Seleccione un estudiante</option>
                        {estudiantes.map((estudiante) => (
                            <option key={estudiante.id} value={estudiante.id}>
                            {estudiante.nombre} {estudiante.apellido} - {estudiante.cedula}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="annoEscolar" className="block text-sm font-medium text-gray-700">
                    Año Escolar
                    </label>
                    <input
                    type="text"
                    id="annoEscolar"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={annoEscolar ? annoEscolar.periodo : 'Cargando...'}
                    disabled
                    />
                </div>
                </div>
                <div className="mt-4">
                <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={loading}
                >
                    {loading ? 'Asignando...' : 'Asignar Estudiante'}
                </button>
                </div>
            </form>
            </div>
              
              {/* Lista de estudiantes asignados */}
              <div className="bg-white border rounded-lg">
                <div className="px-4 py-3 border-b">
                  <h4 className="text-md font-medium text-gray-900">Estudiantes Asignados</h4>
                  <p className="text-sm text-gray-500">
                    {estudiantesSeccion.length} de {selectedSeccion.capacidad} cupos ocupados
                  </p>
                </div>
                <div className="overflow-y-auto max-h-80">
                  {loading ? (
                    <div className="flex justify-center items-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : estudiantesSeccion.length === 0 ? (
                    <p className="text-center text-gray-500 p-4">No hay estudiantes asignados a esta sección</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {estudiantesSeccion.map((estudiante) => (
                        <li key={estudiante.id} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {estudiante.nombre} {estudiante.apellido}
                            </p>
                            <p className="text-xs text-gray-500">
                              {estudiante.cedula}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveEstudiante(estudiante.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar de la sección"
                          >
                            <FaTrash />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // Renderizar el componente dentro del layout de administración
  return (
    <AdminLayout>
      {content}
    </AdminLayout>
  );
};

export default SeccionesList;
