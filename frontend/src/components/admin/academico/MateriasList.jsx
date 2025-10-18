import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaPlus, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaLayerGroup,
  FaChalkboardTeacher,
  FaList,
  FaTh,
  FaFilter,
  FaBook,
  FaTimes
} from 'react-icons/fa';
import { getMateriaStyles, MateriaIcon } from '../../../utils/materiaStyles';
import AsignarMateriaGradoSeccion from './modals/AsignarMateriaGradoSeccion';
import AsignarProfesorMateriaGradoSeccion from './modals/AsignarProfesorMateriaGradoSeccion';
import MateriaDetail from './MateriaDetail';

const MateriasList = () => {
  const [materias, setMaterias] = useState([]);
  const [filteredMaterias, setFilteredMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards');
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [grados, setGrados] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [gradoFilter, setGradoFilter] = useState('');
  const [nivelFilter, setNivelFilter] = useState('');

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAsignGradoSeccionModal, setShowAsignGradoSeccionModal] = useState(false);
  const [showAsignProfesorModal, setShowAsignProfesorModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMateria, setSelectedMateria] = useState(null);

  // Formularios
  const [newMateria, setNewMateria] = useState({ asignatura: '' });

  const token = localStorage.getItem('token');

  // Función auxiliar para limitar grados mostrados (2 primaria, 3 secundaria)
  const getLimitedGrados = (gradosAsignados) => {
    if (!gradosAsignados || gradosAsignados.length === 0) return [];
    
    const gradosPrimaria = [];
    const gradosSecundaria = [];
    
    gradosAsignados.forEach(grado => {
      const gradoInfo = grados.find(g => g.id === grado.id);
      if (gradoInfo) {
        if (gradoInfo.Niveles?.nombre_nivel === 'Primaria') {
          if (gradosPrimaria.length < 2) gradosPrimaria.push(grado);
        } else if (gradoInfo.Niveles?.nombre_nivel === 'Secundaria') {
          if (gradosSecundaria.length < 3) gradosSecundaria.push(grado);
        }
      }
    });
    
    return [...gradosPrimaria, ...gradosSecundaria];
  };

  // Función para contar grados ocultos
  const getHiddenGradosCount = (gradosAsignados) => {
    if (!gradosAsignados) return 0;
    return gradosAsignados.length - getLimitedGrados(gradosAsignados).length;
  };

  // Cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        
        // Obtener año escolar activo
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
          config
        );
        setAnnoEscolar(annoResponse.data);
        
        // Obtener materias - asegurarse de que es un array
        const materiasResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias`,
          config
        );
        
        // Garantizar que materiasResponse.data es un array
        let materiasData = Array.isArray(materiasResponse.data) 
          ? materiasResponse.data 
          : (materiasResponse.data?.data ? materiasResponse.data.data : []);
        
        // Enriquecer materias con sus grados asignados
        const materiasEnriquecidas = await Promise.all(
          materiasData.map(async (materia) => {
            try {
              const gradosResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/grado/${materia.id}`,
                { ...config, params: { annoEscolarID: annoResponse.data.id } }
              );
              
              // Asegurar que gradosResponse.data es un array
              let gradosData = Array.isArray(gradosResponse.data) 
                ? gradosResponse.data 
                : (gradosResponse.data?.data ? gradosResponse.data.data : []);
              
              return {
                ...materia,
                gradosAsignados: gradosData || []
              };
            } catch (err) {
              // 404 es normal si no hay grados asignados
              if (err.response?.status !== 404) {
                console.warn(`Error cargando grados para materia ${materia.id}:`, err);
              }
              return { ...materia, gradosAsignados: [] };
            }
          })
        );
        
        setMaterias(materiasEnriquecidas);
        setFilteredMaterias(materiasEnriquecidas);
        
        // Obtener grados
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados`,
          config
        );
        setGrados(gradosResponse.data);
        
        // Obtener profesores
        const profesoresResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas`,
          { ...config, params: { tipo: 'profesor' } }
        );
        
        if (Array.isArray(profesoresResponse.data)) {
          setProfesores(profesoresResponse.data.filter(p => p.tipo === 'profesor'));
        } else if (profesoresResponse.data?.tipo === 'profesor') {
          setProfesores([profesoresResponse.data]);
        } else {
          setProfesores([]);
        }
        
        // Obtener secciones
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones`,
          config
        );
        setSecciones(seccionesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
        setError('Error al cargar datos. Por favor, recargue la página.');
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [token]);

  // Filtrar materias
  useEffect(() => {
    let result = materias;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(materia =>
        materia.asignatura?.toLowerCase().includes(searchLower) ||
        materia.id?.toString().includes(searchLower)
      );
    }
    
    if (nivelFilter) {
      result = result.filter(materia =>
        materia.gradosAsignados?.some(grado => 
          grados.find(g => g.id === grado.id && g.Niveles?.id === nivelFilter)
        )
      );
    }
    
    if (gradoFilter) {
      result = result.filter(materia =>
        materia.gradosAsignados?.some(grado => grado.id === parseInt(gradoFilter))
      );
    }
    
    setFilteredMaterias(result);
  }, [searchTerm, nivelFilter, gradoFilter, materias, grados]);

  // Funciones de manejo
  const handleCreateMateria = async (e) => {
    e.preventDefault();
    if (!newMateria.asignatura.trim()) {
      setError('El nombre de la materia es requerido');
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias`,
        newMateria,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setMaterias([...materias, { ...response.data, gradosAsignados: [] }]);
      setSuccessMessage('Materia creada correctamente');
      setShowCreateModal(false);
      setNewMateria({ asignatura: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error al crear materia:', err);
      setError(err.response?.data?.message || 'Error al crear la materia');
      setLoading(false);
    }
  };

  const handleAsignGrado = async (form) => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/asignar-a-grado`,
        {
          materiaID: selectedMateria.id,
          gradoID: form.gradoID,
          annoEscolarID: form.annoEscolarID || annoEscolar.id
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccessMessage('Materia asignada al grado correctamente');
      
      // Refrescar materias
      const materiasResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      const materiasEnriquecidas = await Promise.all(
        materiasResponse.data.map(async (materia) => {
          try {
            const gradosResponse = await axios.get(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/grado/${materia.id}`,
              { 
                headers: { 'Authorization': `Bearer ${token}` },
                params: { annoEscolarID: annoEscolar.id, limit: 0 } 
              }
            );
            return { ...materia, gradosAsignados: gradosResponse.data || [] };
          } catch {
            return { ...materia, gradosAsignados: [] };
          }
        })
      );
      
      setMaterias(materiasEnriquecidas);
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error al asignar materia a grado:', err);
      setError(err.response?.data?.message || 'Error al asignar la materia');
      setLoading(false);
    }
  };

  const handleAsignSeccion = async (form) => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/asignar-a-seccion`,
        {
          materiaID: selectedMateria.id,
          seccionID: form.seccionID,
          annoEscolarID: form.annoEscolarID || annoEscolar.id
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccessMessage('Materia asignada a sección correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error al asignar materia a sección:', err);
      setError(err.response?.data?.message || 'Error al asignar materia');
      setLoading(false);
    }
  };

  const handleAsignProfesor = async (form) => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/asignar-profesor`,
        {
          profesorID: form.profesorID,
          materiaID: selectedMateria.id,
          gradoID: form.gradoID,
          seccionID: form.seccionID,
          annoEscolarID: form.annoEscolarID || annoEscolar.id
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuccessMessage('Profesor asignado correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error al asignar profesor:', err);
      setError(err.response?.data?.message || 'Error al asignar profesor');
      setLoading(false);
    }
  };

  const handleDeleteMateria = async (materiaID) => {
    if (!window.confirm('¿Está seguro de eliminar esta materia? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/${materiaID}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setMaterias(materias.filter(m => m.id !== materiaID));
      setSuccessMessage('Materia eliminada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error al eliminar materia:', err);
      setError(err.response?.data?.message || 'Error al eliminar la materia');
      setLoading(false);
    }
  };

  // Agrupar materias por nivel/grado
  const groupedByNivel = grados.reduce((acc, grado) => {
    const nivel = grado.Niveles?.nombre_nivel || 'Sin nivel';
    if (!acc[nivel]) {
      acc[nivel] = [];
    }
    acc[nivel].push(grado);
    return acc;
  }, {});

  if (loading && filteredMaterias.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-slate-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-orange-500/10 animate-pulse"></div>
          </div>
          <p className="mt-4 text-orange-600 font-medium">Cargando materias...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-800 to-orange-900 shadow-2xl rounded-2xl mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/30 to-transparent"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-orange-300/10 rounded-full blur-2xl"></div>
        
        <div className="relative px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl backdrop-blur-sm border border-orange-400/30">
                  <FaBook className="w-8 h-8 text-orange-200" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Gestión de Materias
                  </h1>
                  <p className="text-orange-200 text-lg">
                    Administra las asignaturas del plan académico
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-200 text-sm font-medium">Total Materias</p>
                      <p className="text-2xl font-bold text-white">{materias.length}</p>
                    </div>
                    <FaBook className="w-8 h-8 text-orange-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-200 text-sm font-medium">Grados</p>
                      <p className="text-2xl font-bold text-white">{grados.length}</p>
                    </div>
                    <FaLayerGroup className="w-8 h-8 text-orange-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-200 text-sm font-medium">Año Escolar</p>
                      <p className="text-2xl font-bold text-white">{annoEscolar?.periodo || 'N/A'}</p>
                    </div>
                    <FaChalkboardTeacher className="w-8 h-8 text-orange-300" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="mt-8 lg:mt-0 lg:ml-8">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-8 py-4 bg-white/20 backdrop-blur-md text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaPlus className="w-5 h-5 mr-3" />
                Nueva Materia
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
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
      <div className="mb-6 flex flex-col gap-4">
        {/* Search and View Mode */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-orange-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar materias..."
              className="pl-10 w-full px-4 py-2 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50 backdrop-blur"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
              title="Vista de tarjetas"
            >
              <FaTh className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
              title="Vista de lista"
            >
              <FaList className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
            >
              <FaFilter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/50 backdrop-blur border border-orange-200 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Nivel</label>
                <select
                  value={nivelFilter}
                  onChange={(e) => setNivelFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todos los niveles</option>
                  {Object.keys(groupedByNivel).map((nivel) => (
                    <option key={nivel} value={nivel}>
                      {nivel}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Grado</label>
                <select
                  value={gradoFilter}
                  onChange={(e) => setGradoFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todos los grados</option>
                  {grados.map((grado) => (
                    <option key={grado.id} value={grado.id}>
                      {grado.nombre_grado}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vista de Tarjetas (predeterminada) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-slow">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
            </div>
          ) : filteredMaterias.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <FaBook className="w-16 h-16 text-orange-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No se encontraron materias</p>
            </div>
          ) : (
            filteredMaterias.map((materia) => {
              const { bgColor, textColor, borderColor, Icon } = getMateriaStyles(materia.asignatura, 'card');
              
              return (
                <div
                  key={materia.id}
                  className={`${bgColor} rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border ${borderColor} hover:scale-105 hover:-translate-y-1 group`}
                  style={{
                    animation: `slideInCard 0.5s ease-out ${(materias.indexOf(materia) % 6) * 0.05}s both`
                  }}
                >
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-lg ${bgColor} border ${borderColor}`}>
                        <Icon className={`w-8 h-8 ${textColor}`} />
                      </div>
                      <button
                        onClick={() => handleDeleteMateria(materia.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h3 className={`text-xl font-bold ${textColor} mb-2`}>
                      {materia.asignatura}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Código: {materia.id}
                    </p>
                  </div>

                  {/* Grados Asignados */}
                  {materia.gradosAsignados && materia.gradosAsignados.length > 0 ? (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <p className={`text-sm font-semibold ${textColor} mb-3 flex items-center justify-between`}>
                        <span>Asignada en {materia.gradosAsignados.length} grado{materia.gradosAsignados.length !== 1 ? 's' : ''}</span>
                        {getHiddenGradosCount(materia.gradosAsignados) > 0 && (
                          <button
                            onClick={() => {
                              setSelectedMateria(materia);
                              setShowDetailModal(true);
                            }}
                            className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors animate-pulse"
                            title="Ver detalles"
                          >
                            Ver más
                          </button>
                        )}
                      </p>
                      <div className="space-y-2">
                        {/* Primaria */}
                        {getLimitedGrados(materia.gradosAsignados)
                          .filter(g => {
                            const gradoInfo = grados.find(gr => gr.id === g.id);
                            return gradoInfo?.Niveles?.nombre_nivel === 'Primaria';
                          })
                          .length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">📚 Primaria</p>
                            <div className="space-y-1">
                              {getLimitedGrados(materia.gradosAsignados)
                                .filter(g => {
                                  const gradoInfo = grados.find(gr => gr.id === g.id);
                                  return gradoInfo?.Niveles?.nombre_nivel === 'Primaria';
                                })
                                .map((grado) => {
                                  const gradoInfo = grados.find(g => g.id === grado.id);
                                  return (
                                    <div key={grado.id} className="flex items-center justify-between bg-white/50 px-3 py-1 rounded text-sm">
                                      <span className="text-gray-700">{gradoInfo?.nombre_grado}</span>
                                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${textColor}`}></span>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                        
                        {/* Secundaria */}
                        {getLimitedGrados(materia.gradosAsignados)
                          .filter(g => {
                            const gradoInfo = grados.find(gr => gr.id === g.id);
                            return gradoInfo?.Niveles?.nombre_nivel === 'Secundaria';
                          })
                          .length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-600 mb-1">🎓 Secundaria</p>
                            <div className="space-y-1">
                              {getLimitedGrados(materia.gradosAsignados)
                                .filter(g => {
                                  const gradoInfo = grados.find(gr => gr.id === g.id);
                                  return gradoInfo?.Niveles?.nombre_nivel === 'Secundaria';
                                })
                                .map((grado) => {
                                  const gradoInfo = grados.find(g => g.id === grado.id);
                                  return (
                                    <div key={grado.id} className="flex items-center justify-between bg-white/50 px-3 py-1 rounded text-sm">
                                      <span className="text-gray-700">{gradoInfo?.nombre_grado}</span>
                                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${textColor}`}></span>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                      <p className="text-sm text-gray-500 italic">
                        No asignada a ningún grado
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="px-6 py-4 bg-white/30 border-t border-gray-200 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedMateria(materia);
                        setShowAsignGradoSeccionModal(true);
                      }}
                      className={`flex-1 py-2 px-3 ${textColor} bg-white/60 hover:bg-white border border-current rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2`}
                      title="Asignar a Grado y Sección"
                    >
                      <FaLayerGroup className="w-4 h-4" />
                      <span className="hidden sm:inline">Grado/Sección</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMateria(materia);
                        setShowAsignProfesorModal(true);
                      }}
                      className={`flex-1 py-2 px-3 ${textColor} bg-white/60 hover:bg-white border border-current rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2`}
                      title="Asignar Profesor"
                    >
                      <FaChalkboardTeacher className="w-4 h-4" />
                      <span className="hidden sm:inline">Profesor</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Vista de Lista */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-orange-900">Materia</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-orange-900">Código</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-orange-900">Grados</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-orange-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredMaterias.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No se encontraron materias
                  </td>
                </tr>
              ) : (
                filteredMaterias.map((materia) => {
                  const { Icon } = getMateriaStyles(materia.asignatura, 'icon');
                  
                  return (
                    <tr key={materia.id} className="hover:bg-orange-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-orange-600" />
                          <span className="font-medium text-gray-900">{materia.asignatura}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{materia.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {materia.gradosAsignados && materia.gradosAsignados.length > 0 ? (
                            materia.gradosAsignados.slice(0, 3).map((grado) => {
                              const gradoInfo = grados.find(g => g.id === grado.id);
                              return (
                                <span key={grado.id} className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                  {gradoInfo?.nombre_grado}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-sm text-gray-500 italic">Sin grados</span>
                          )}
                          {materia.gradosAsignados?.length > 3 && (
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                              +{materia.gradosAsignados.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedMateria(materia);
                              setShowAsignGradoSeccionModal(true);
                            }}
                            className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                            title="Asignar a Grado y Sección"
                          >
                            <FaLayerGroup className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedMateria(materia);
                              setShowAsignProfesorModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Asignar Profesor"
                          >
                            <FaChalkboardTeacher className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMateria(materia.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <FaTrash className="w-4 h-4" />
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

      {/* Modal para crear materia */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Crear Nueva Materia
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={() => setShowCreateModal(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <form onSubmit={handleCreateMateria}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="asignatura" className="block text-sm font-medium text-gray-700">
                        Nombre de la Materia *
                      </label>
                      <input
                        type="text"
                        id="asignatura"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        value={newMateria.asignatura}
                        onChange={(e) => setNewMateria({...newMateria, asignatura: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-5 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Guardando...' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modales importados */}
      <AsignarMateriaGradoSeccion 
        isOpen={showAsignGradoSeccionModal}
        onClose={() => setShowAsignGradoSeccionModal(false)}
        materia={selectedMateria}
        grados={grados}
        secciones={secciones}
        annoEscolar={annoEscolar}
        loading={loading}
        onSubmitGrado={handleAsignGrado}
        onSubmitSeccion={handleAsignSeccion}
        gradosYaAsignados={selectedMateria?.gradosAsignados?.map(g => g.id) || []}
        seccionesYaAsignadas={selectedMateria?.seccionesAsignadas?.map(s => s.id) || []}
      />

      <AsignarProfesorMateriaGradoSeccion
        isOpen={showAsignProfesorModal}
        onClose={() => setShowAsignProfesorModal(false)}
        materia={selectedMateria}
        profesores={profesores}
        grados={grados}
        secciones={secciones}
        annoEscolar={annoEscolar}
        loading={loading}
        onSubmit={handleAsignProfesor}
        profesoresYaAsignados={selectedMateria?.profesoresAsignados || []}
      />

      {/* Modal de Detalles de Materia */}
      <MateriaDetail
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        materia={selectedMateria}
        grados={grados}
        token={token}
      />

      <style>{`
        @keyframes slideInCard {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInSlow {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in-slow {
          animation: fadeInSlow 0.6s ease-out;
        }

        /* Smooth transitions para elementos interactivos */
        button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        button:hover {
          transform: translateY(-2px);
        }

        button:active {
          transform: translateY(0);
        }

        /* Transiciones en inputs */
        input, select {
          transition: all 0.3s ease;
        }

        input:focus, select:focus {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default MateriasList;