import { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUserPlus, FaUsers, FaFilter, FaSearch, FaChalkboard, FaChalkboardTeacher } from 'react-icons/fa';
import axios from 'axios';
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
  
  // Nuevos estados para filtros
  const [nivelFilter, setNivelFilter] = useState('');
  const [gradoFilter, setGradoFilter] = useState('');
  const [filteredSecciones, setFilteredSecciones] = useState([]);
  const [gradosByNivel, setGradosByNivel] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'

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
        setFilteredSecciones(seccionesResponse.data);
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

  // Crear mapa de grado-nivel y organizar grados por nivel
  useEffect(() => {
    if (grados.length > 0 && niveles.length > 0) {
      const mapGradoNivel = {};
      const gradosPorNivel = {};
      
      grados.forEach(grado => {
        const nivel = niveles.find(n => n.id === grado.nivelID);
        if (nivel) {
          mapGradoNivel[grado.id] = {
            nombreGrado: grado.nombre_grado,
            nombreNivel: nivel.nombre_nivel,
            nivelID: nivel.id
          };
          
          // Agrupar grados por nivel
          if (!gradosPorNivel[nivel.id]) {
            gradosPorNivel[nivel.id] = [];
          }
          gradosPorNivel[nivel.id].push(grado);
        }
      });
      
      setGradoNivelMap(mapGradoNivel);
      setGradosByNivel(gradosPorNivel);
      console.log("Mapa de grado-nivel creado:", mapGradoNivel);
    }
  }, [grados, niveles]);
  
  // Filtrar secciones según término de búsqueda y filtros
  useEffect(() => {
    let filtered = secciones;
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(seccion => 
        seccion.nombre_seccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (gradoNivelMap[seccion.gradoID]?.nombreGrado || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por nivel
    if (nivelFilter !== '') {
      filtered = filtered.filter(seccion => {
        const gradoInfo = gradoNivelMap[seccion.gradoID];
        return gradoInfo && gradoInfo.nivelID === nivelFilter;
      });
    }
    
    // Filtrar por grado
    if (gradoFilter !== '') {
      filtered = filtered.filter(seccion => seccion.gradoID === gradoFilter);
    }
    
    setFilteredSecciones(filtered);
  }, [searchTerm, nivelFilter, gradoFilter, secciones, gradoNivelMap]);

  // Función para cargar secciones por grado
  const loadSeccionesByGrado = async (gradoID) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/secciones/grado/${gradoID}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (err) {
      console.error('Error al cargar secciones del grado:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

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

  // Abrir modal de estudiantes
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

  // Obtener color según capacidad
  const getCapacidadColor = (seccion) => {
    const porcentajeOcupado = (estudiantesSeccion.length / seccion.capacidad) * 100;
    
    if (porcentajeOcupado < 50) return "bg-green-100 text-green-800";
    if (porcentajeOcupado < 75) return "bg-yellow-100 text-yellow-800";
    if (porcentajeOcupado < 90) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Secciones</h1>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Nueva Sección
          </button>
          
          <div className="flex items-center">
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className={`px-3 py-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'} mr-2`}
              title="Vista de cuadrícula"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className={`px-3 py-2 rounded-md ${viewMode === 'list' ? 'bg-gray-200 text-gray-800' : 'bg-gray-100 text-gray-600'}`}
              title="Vista de lista"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
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
      
      {/* Filtros y búsqueda */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o grado..."
            className="pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaFilter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={nivelFilter}
            onChange={(e) => {
              setNivelFilter(e.target.value);
              setGradoFilter(''); // Resetear filtro de grado al cambiar nivel
            }}
          >
            <option value="">Todos los niveles</option>
            {niveles.map(nivel => (
              <option key={nivel.id} value={nivel.id}>
                {formatearNombreNivel(nivel.nombre_nivel)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaChalkboardTeacher className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="pl-10 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={gradoFilter}
            onChange={(e) => setGradoFilter(e.target.value)}
            disabled={!nivelFilter}
          >
            <option value="">Todos los grados</option>
            {nivelFilter && gradosByNivel[nivelFilter] ? 
              gradosByNivel[nivelFilter].map(grado => (
                <option key={grado.id} value={grado.id}>
                  {formatearNombreGrado(grado.nombre_grado)}
                </option>
              )) : 
              grados.map(grado => (
                <option key={grado.id} value={grado.id}>
                  {formatearNombreGrado(grado.nombre_grado)}
                </option>
              ))
            }
          </select>
        </div>
      </div>
      
      {/* Vista de cuadrícula */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading && !filteredSecciones.length ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredSecciones.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              No se encontraron secciones con los filtros aplicados
            </div>
          ) : (
            filteredSecciones.map(seccion => {
              const gradoInfo = gradoNivelMap[seccion.gradoID] || {};
              
              return (
                <div 
                  key={seccion.id} 
                  className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-5 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Sección {seccion.nombre_seccion}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {gradoInfo.nombreGrado ? formatearNombreGrado(gradoInfo.nombreGrado) : 'Grado no asignado'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {gradoInfo.nombreNivel ? formatearNombreNivel(gradoInfo.nombreNivel) : 'Nivel no asignado'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${seccion.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {seccion.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Capacidad:</p>
                        <p className="text-lg font-bold">{seccion.capacidad} estudiantes</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedSeccion(seccion);
                            setShowEditForm(true);
                          }}
                          className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-full"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleOpenEstudiantesModal(seccion)}
                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-full"
                          title="Gestionar Estudiantes"
                        >
                          <FaUsers />
                        </button>
                        <button
                          onClick={() => handleDeleteSeccion(seccion.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full"
                          title="Eliminar"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleOpenEstudiantesModal(seccion)}
                      className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FaUserPlus className="inline mr-2" /> Gestionar Estudiantes
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      
      {/* Vista de tabla */}
      {viewMode === 'list' && (
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
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && !filteredSecciones.length ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredSecciones.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron secciones con los filtros aplicados
                  </td>
                </tr>
              ) : (
                filteredSecciones.map((seccion) => {
                  const gradoInfo = gradoNivelMap[seccion.gradoID] || {};
                  
                  return (
                    <tr key={seccion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {seccion.nombre_seccion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {gradoInfo.nombreGrado ? formatearNombreGrado(gradoInfo.nombreGrado) : 'No asignado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {gradoInfo.nombreNivel ? formatearNombreNivel(gradoInfo.nombreNivel) : 'No asignado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {seccion.capacidad}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${seccion.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {seccion.activo ? 'Activo' : 'Inactivo'}
                        </span>
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
                            title="Gestionar Estudiantes"
                          >
                            <FaUsers />
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
      )}
      
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
};

export default SeccionesList;