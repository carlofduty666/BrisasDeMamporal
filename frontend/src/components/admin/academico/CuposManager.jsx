import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaSave, 
  FaSync, 
  FaPlus, 
  FaRedo,
  FaFilter,
  FaSearch,
  FaChair,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaChalkboard,
  FaChild,
  FaBook,
  FaGraduationCap,
  FaChevronDown,
  FaClock,
  FaInfoCircle,
  FaTimes,
  FaCog
} from 'react-icons/fa';
import axios from 'axios';
import { formatearNombreGrado, formatearNombreNivel } from '../../../utils/formatters';

const CuposManager = () => {
  const navigate = useNavigate();
  const [cupos, setCupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [grados, setGrados] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [cuposModificados, setCuposModificados] = useState({});
  const [restableciendo, setRestableciendo] = useState(false);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');
  const [filtroGrado, setFiltroGrado] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Obtener token de autenticación
  const token = localStorage.getItem('token');
  
  // En el useEffect inicial de CuposManager.jsx
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const gradoIDParam = urlParams.get('gradoID');
        const seccionIDParam = urlParams.get('seccionID');
        
        // Obtener año escolar activo
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setAnnoEscolar(annoResponse.data);
        
        // Obtener grados
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/grados`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setGrados(gradosResponse.data);
        
        // Obtener secciones
        let seccionesResponse;
        if (gradoIDParam) {
          // Si hay un grado específico, obtener solo las secciones de ese grado
          seccionesResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones/grado/${gradoIDParam}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        } else {
          // Si no, obtener todas las secciones
          seccionesResponse = await axios.get(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        }
        setSecciones(seccionesResponse.data);
        
        // Obtener cupos
        const cuposResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos`,
          { 
            headers: { 'Authorization': `Bearer ${token}` },
            params: { 
              annoEscolarID: annoResponse.data.id,
              gradoID: gradoIDParam,
              seccionID: seccionIDParam
            }
          }
        );
        
        // Procesar los datos de cupos
        const cuposData = cuposResponse.data;
        
        // Si hay un grado o sección específica, filtrar los cupos
        let cuposFiltrados = cuposData;
        if (gradoIDParam) {
          cuposFiltrados = cuposData.filter(cupo => cupo.gradoID == gradoIDParam);
        }
        if (seccionIDParam) {
          cuposFiltrados = cuposFiltrados.filter(cupo => cupo.seccionID == seccionIDParam);
        }
        
        // Deduplicar cupos por gradoID_seccionID para evitar duplicados
        const cuposDeduplicados = [];
        const seenKeys = new Set();
        for (const cupo of cuposFiltrados) {
          const key = `${cupo.gradoID}_${cupo.seccionID}`;
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            cuposDeduplicados.push(cupo);
          }
        }
        
        setCupos(cuposDeduplicados);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setLoading(false);
        setMessage({ 
          type: 'error', 
          text: 'Error al cargar los datos. Por favor, intente de nuevo.' 
        });
      }
    };
    
    fetchData();
  }, [token]);

  
  // Función para manejar cambios en la capacidad
  const handleCapacidadChange = (id, gradoID, seccionID, value) => {
    const newValue = parseInt(value, 10);
    if (isNaN(newValue) || newValue < 0) return;
    
    // Validar que la capacidad no sea menor a los ocupados
    const cupo = cupos.find(c => c.id === id || (c.gradoID === gradoID && c.seccionID === seccionID));
    
    if (cupo && newValue < cupo.ocupados) {
      setMessage({
        type: 'error',
        text: `La capacidad no puede ser menor a ${cupo.ocupados} estudiante(s) ocupado(s)`
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      return;
    }
    
    setCupos(cupos.map(cupo => {
      if (cupo.id === id || (cupo.gradoID === gradoID && cupo.seccionID === seccionID)) {
        const disponibles = Math.max(0, newValue - cupo.ocupados);
        return { ...cupo, capacidad: newValue, disponibles };
      }
      return cupo;
    }));
    
    // Marcar este cupo como modificado
    setCuposModificados({
      ...cuposModificados,
      [`${gradoID}_${seccionID}`]: true
    });
  };
  
  // Función para guardar los cambios de cupos
  const handleSaveCupos = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Para cada cupo modificado, enviar actualización al servidor
      for (const cupo of cupos) {
        const cupoKey = `${cupo.gradoID}_${cupo.seccionID}`;
        
        if (cuposModificados[cupoKey]) {
          const cupoData = {
            gradoID: cupo.gradoID,
            seccionID: cupo.seccionID,
            annoEscolarID: annoEscolar.id,
            capacidad: cupo.capacidad,
            ocupados: cupo.ocupados,
            disponibles: cupo.disponibles
          };
          
          if (cupo.id && !cupo.id.toString().startsWith('temp_')) {
            // Actualizar cupo existente
            await axios.put(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos/${cupo.id}/capacidad`,
              { capacidad: cupo.capacidad },
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
          } else {
            // Crear nuevo cupo
            await axios.post(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos`,
              cupoData,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
          }
        }
      }
      
      // Recargar los cupos actualizados
      const cuposResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID: annoEscolar.id }
        }
      );
      
      setCupos(cuposResponse.data);
      setCuposModificados({});
      
      setSaving(false);
      setMessage({ type: 'success', text: 'Cupos actualizados correctamente' });
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error al guardar cupos:', error);
      setSaving(false);
      setMessage({ 
        type: 'error', 
        text: 'Error al guardar los cupos. Por favor, intente de nuevo.' 
      });
    }
  };
  
  // Función para refrescar los datos
  const handleRefresh = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      // Obtener cupos actualizados
      const cuposResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID: annoEscolar.id }
        }
      );
      
      setCupos(cuposResponse.data);
      setCuposModificados({});
      
      setLoading(false);
      setMessage({ type: 'success', text: 'Datos actualizados correctamente' });
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      console.error('Error al refrescar datos:', error);
      setLoading(false);
      setMessage({ 
        type: 'error', 
        text: 'Error al actualizar los datos. Por favor, intente de nuevo.' 
      });
    }
  };
  
  // Función para recalcular ocupados basados en estudiantes reales
  const handleRecalcularOcupados = async () => {
    try {
      setRestableciendo(true);
      setMessage({ type: '', text: '' });
      
      // Llamar al endpoint para actualizar cupos basados en estudiantes reales
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos/actualizar-reales`,
        { annoEscolarID: annoEscolar.id },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Recargar los cupos actualizados
      const cuposResponse = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/cupos`,
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          params: { annoEscolarID: annoEscolar.id }
        }
      );
      
      setCupos(cuposResponse.data);
      setCuposModificados({});
      
      setRestableciendo(false);
      setMessage({ 
        type: 'success', 
        text: 'Estudiantes ocupados recalculados correctamente. Verifica que los números coincidan con tus registros.' 
      });
      
      // Limpiar el mensaje después de 4 segundos
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 4000);
    } catch (error) {
      console.error('Error al recalcular ocupados:', error);
      setRestableciendo(false);
      setMessage({ 
        type: 'error', 
        text: 'Error al recalcular estudiantes ocupados. Por favor, intente de nuevo.' 
      });
    }
  };
  
  // Obtener niveles únicos de los grados
  const nivelesUnicos = [...new Set(grados.map(g => g.Niveles?.nombre_nivel))].filter(Boolean);
  
  // Función para obtener nivel de un grado
  const getNivelDeGrado = (gradoID) => {
    const grado = grados.find(g => g.id === gradoID);
    return grado?.Niveles?.nombre_nivel || '';
  };
  
  // Función para extraer número de orden de un grado
  const getGradeOrderNumber = (gradoID) => {
    const grado = grados.find(g => g.id === parseInt(gradoID));
    if (!grado) return 999;
    
    const nombreGrado = grado.nombre_grado.toLowerCase();
    
    // Buscar números en el nombre (para "1er Grado", "2do Año", etc)
    const match = nombreGrado.match(/\d+/);
    if (match) {
      return parseInt(match[0]);
    }
    
    // Si no encuentra número, retorna un valor alto
    return 999;
  };
  
  // Agrupar cupos por grado para mejor visualización (deduplicando por gradoID_seccionID)
  let cuposPorGrado = cupos.reduce((acc, cupo) => {
    const gradoID = cupo.gradoID;
    if (!acc[gradoID]) {
      acc[gradoID] = [];
    }
    
    // Evitar duplicados usando seccionID como identificador único
    const exists = acc[gradoID].some(c => c.seccionID === cupo.seccionID);
    if (!exists) {
      acc[gradoID].push(cupo);
    }
    
    return acc;
  }, {});
  
  // Aplicar filtros
  const gradosFiltrados = grados.filter(grado => {
    // Filtrar por nivel
    if (filtroNivel && grado.Niveles?.nombre_nivel !== filtroNivel) return false;
    
    // Filtrar por término de búsqueda (nombre del grado)
    if (searchTerm) {
      const nombreFormateado = formatearNombreGrado(grado.nombre_grado).toLowerCase();
      if (!nombreFormateado.includes(searchTerm.toLowerCase())) return false;
    }
    
    // Filtrar por grado específico
    if (filtroGrado && grado.id !== parseInt(filtroGrado)) return false;
    
    return true;
  });
  
  // Filtrar cuposPorGrado para mostrar solo los grados filtrados
  const cuposPorGradoFiltrados = {};
  gradosFiltrados.forEach(grado => {
    if (cuposPorGrado[grado.id]) {
      cuposPorGradoFiltrados[grado.id] = cuposPorGrado[grado.id];
    }
  });
  
  // Estadísticas
  const stats = {
    totalCapacidad: cupos.reduce((total, cupo) => total + (cupo.capacidad || 0), 0),
    totalOcupados: cupos.reduce((total, cupo) => total + (cupo.ocupados || 0), 0),
    totalDisponibles: cupos.reduce((total, cupo) => total + (cupo.disponibles || 0), 0),
    porcentajeOcupacion: cupos.length > 0 
      ? Math.round((cupos.reduce((total, cupo) => total + (cupo.ocupados || 0), 0) / 
                    cupos.reduce((total, cupo) => total + (cupo.capacidad || 0), 0)) * 100) 
      : 0
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-slate-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-red-500/10 animate-pulse"></div>
            <FaChalkboard className="absolute inset-0 m-auto w-6 h-6 text-red-600 animate-pulse" />
          </div>
          <p className="mt-4 text-red-600 font-medium animate-pulse">Cargando cupos...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-slate-50 to-red-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-800 to-red-900 shadow-2xl rounded-2xl mb-8">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 to-transparent"></div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-400/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-red-300/10 rounded-full blur-2xl"></div>
          
          <div className="relative px-6 py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-red-500/20 rounded-xl backdrop-blur-sm border border-red-400/30">
                    <FaChair className="w-8 h-8 text-red-200" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      Gestión de Cupos
                    </h1>
                    <p className="text-red-200 text-lg">
                      {annoEscolar ? `Año escolar ${annoEscolar.periodo}` : 'Administra los cupos disponibles'}
                    </p>
                  </div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-105 cursor-default">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-200 text-sm font-medium">Capacidad Total</p>
                        <p className="text-2xl font-bold text-white">{stats.totalCapacidad}</p>
                      </div>
                      <div className="p-3 bg-red-500/20 rounded-xl">
                        <FaChair className="w-8 h-8 text-red-300" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-105 cursor-default">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-200 text-sm font-medium">Ocupados</p>
                        <p className="text-2xl font-bold text-white">{stats.totalOcupados}</p>
                      </div>
                      <div className="p-3 bg-orange-500/20 rounded-xl">
                        <FaUsers className="w-8 h-8 text-orange-300" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-105 cursor-default">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-200 text-sm font-medium">Disponibles</p>
                        <p className="text-2xl font-bold text-white">{stats.totalDisponibles}</p>
                      </div>
                      <div className="p-3 bg-emerald-500/20 rounded-xl">
                        <FaCheckCircle className="w-8 h-8 text-emerald-300" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-105 cursor-default">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-200 text-sm font-medium">% Ocupación</p>
                        <p className="text-2xl font-bold text-white">{stats.porcentajeOcupacion}%</p>
                      </div>
                      <div className="p-3 bg-red-500/20 rounded-xl">
                        <FaBook className="w-8 h-8 text-red-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col lg:flex-row gap-3 mb-6 lg:items-center lg:justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-lg hover:bg-white hover:border-red-400 transition-all duration-300"
          >
            <FaFilter className="w-4 h-4" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-lg hover:bg-white hover:border-red-400 transition-all duration-300 disabled:opacity-50"
          >
            <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>

          <div className="group relative">
            <button
              onClick={handleRecalcularOcupados}
              disabled={restableciendo || loading}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
              title="Sincroniza el contador de estudiantes ocupados con los registros reales de inscripciones"
            >
              <FaRedo className={`w-4 h-4 ${restableciendo ? 'animate-spin' : ''}`} />
              Recalcular Ocupados
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Sincroniza estudiantes ocupados con el registro real
            </div>
          </div>
          
          <button
            onClick={handleSaveCupos}
            disabled={saving || Object.keys(cuposModificados).length === 0}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl ${
              Object.keys(cuposModificados).length === 0 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800'
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4" />
                Guardar ({Object.keys(cuposModificados).length})
              </>
            )}
          </button>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg backdrop-blur-sm border transition-all duration-300 animate-in fade-in ${
            message.type === 'success' 
              ? 'bg-emerald-100/80 text-emerald-800 border-emerald-300' 
              : 'bg-red-100/80 text-red-800 border-red-300'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {message.type === 'success' ? (
                  <FaCheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                ) : (
                  <FaTimesCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                )}
                <p className="font-medium">{message.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        {showFilters && (
          <div className="bg-white/60 backdrop-blur-md border border-red-200 rounded-2xl p-6 mb-6 shadow-lg animate-in fade-in slide-in-from-top">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaFilter className="text-red-600 w-5 h-5" />
                <h2 className="text-lg font-semibold text-gray-900">Filtros de Búsqueda</h2>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search by Grade Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FaSearch className="w-4 h-4 text-red-600" />
                    Buscar Grado
                  </div>
                </label>
                <input
                  type="text"
                  placeholder="Ej: 1er grado, 2do año..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              {/* Filter by Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FaGraduationCap className="w-4 h-4 text-red-600" />
                    Nivel
                  </div>
                </label>
                <select
                  value={filtroNivel}
                  onChange={(e) => {
                    setFiltroNivel(e.target.value);
                    setFiltroGrado(''); // Reset grade filter when level changes
                  }}
                  className="w-full px-4 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                >
                  <option value="">Todos los Niveles</option>
                  {nivelesUnicos.map(nivel => (
                    <option key={nivel} value={nivel}>
                      {formatearNombreNivel(nivel)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <FaChalkboard className="w-4 h-4 text-red-600" />
                    Grado
                  </div>
                </label>
                <select
                  value={filtroGrado}
                  onChange={(e) => setFiltroGrado(e.target.value)}
                  className="w-full px-4 py-2 border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                >
                  <option value="">Todos los Grados</option>
                  {gradosFiltrados.map(grado => (
                    <option key={grado.id} value={grado.id}>
                      {formatearNombreGrado(grado.nombre_grado)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || filtroNivel || filtroGrado) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFiltroNivel('');
                  setFiltroGrado('');
                }}
                className="mt-4 text-sm text-red-600 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
              >
                <FaTimes className="w-3 h-3" />
                Limpiar Filtros
              </button>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="bg-white/60 backdrop-blur-md border border-red-200 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-xl flex-shrink-0">
              <FaInfoCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FaClock className="w-4 h-4 text-red-600" />
                Instrucciones
              </h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                <li className="flex gap-2"><span className="text-red-600 font-bold">•</span> Modifique la capacidad de cada sección según sea necesario</li>
                <li className="flex gap-2"><span className="text-red-600 font-bold">•</span> Los cupos disponibles se calculan automáticamente (capacidad - ocupados)</li>
                <li className="flex gap-2"><span className="text-red-600 font-bold">•</span> Las filas resaltadas indican cambios pendientes de guardar</li>
                <li className="flex gap-2"><span className="text-red-600 font-bold">•</span> Use "Recalcular Ocupados" solo si los números no coinciden con inscripciones reales</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        {Object.keys(cuposPorGradoFiltrados).length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna izquierda: Primaria */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <FaChild className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Primaria</h2>
              </div>
              
              {Object.keys(cuposPorGradoFiltrados)
                .filter(gradoID => {
                  const gradoInfo = grados.find(g => g.id === parseInt(gradoID));
                  return gradoInfo && (
                    gradoInfo.Niveles?.nombre_nivel === 'primaria' ||
                    gradoInfo.nombre_grado.toLowerCase().includes('grado')
                  );
                })
                .sort((a, b) => getGradeOrderNumber(a) - getGradeOrderNumber(b))
                .map(gradoID => {
                  const gradoInfo = grados.find(g => g.id === parseInt(gradoID));
                  const cuposDelGrado = cuposPorGradoFiltrados[gradoID];

                  return (
                    <div key={gradoID} className="bg-white/70 backdrop-blur-sm border border-red-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="px-6 py-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-b border-blue-200 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <FaChalkboard className="text-blue-600" />
                          {gradoInfo ? formatearNombreGrado(gradoInfo.nombre_grado) : `Grado ${gradoID}`}
                        </h3>
                        <button
                          onClick={() => navigate('/admin/academico/secciones')}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 text-sm font-medium hover:shadow-md"
                          title="Administrar secciones"
                        >
                          <FaCog className="w-4 h-4" />
                          Administrar
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-red-100">
                          <thead className="bg-gray-50/50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sección</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Capacidad</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ocupados</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Disponibles</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-red-100">
                            {cuposDelGrado.map((cupo) => {
                              const seccionNombre = cupo.Secciones ? cupo.Secciones.nombre_seccion : 'No disponible';
                              const cupoKey = `${cupo.gradoID}_${cupo.seccionID}`;
                              const isModified = cuposModificados[cupoKey];
                              
                              return (
                                <tr key={cupo.id || `${cupo.gradoID}_${cupo.seccionID}`} 
                                    className={`transition-all duration-300 ${
                                      isModified 
                                        ? 'bg-red-100/40 border-l-4 border-red-500' 
                                        : 'hover:bg-gray-50/50'
                                    }`}>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{seccionNombre}</div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <input
                                      type="number"
                                      min="0"
                                      value={cupo.capacidad}
                                      onChange={(e) => handleCapacidadChange(
                                        cupo.id, 
                                        cupo.gradoID, 
                                        cupo.seccionID, 
                                        e.target.value
                                      )}
                                      className={`w-20 px-3 py-1.5 border rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                        isModified 
                                          ? 'border-red-400 bg-red-50' 
                                          : 'border-red-200 bg-white hover:border-red-300'
                                      }`}
                                    />
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-100/50 text-orange-700 font-semibold text-sm">
                                      <FaUsers className="w-3 h-3" />
                                      {cupo.ocupados}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-100/50 text-emerald-700 font-semibold text-sm">
                                      <FaCheckCircle className="w-3 h-3" />
                                      {cupo.disponibles}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full transition-all ${
                                      cupo.disponibles > 0 
                                        ? 'bg-emerald-100/70 text-emerald-800' 
                                        : 'bg-red-100/70 text-red-800'
                                    }`}>
                                      {cupo.disponibles > 0 ? 'Disponible' : 'Completo'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Columna derecha: Secundaria */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <FaGraduationCap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Secundaria</h2>
              </div>
              
              {Object.keys(cuposPorGradoFiltrados)
                .filter(gradoID => {
                  const gradoInfo = grados.find(g => g.id === parseInt(gradoID));
                  return gradoInfo && (
                    gradoInfo.Niveles?.nombre_nivel === 'secundaria' ||
                    gradoInfo.nombre_grado.toLowerCase().includes('año')
                  );
                })
                .sort((a, b) => getGradeOrderNumber(a) - getGradeOrderNumber(b))
                .map(gradoID => {
                  const gradoInfo = grados.find(g => g.id === parseInt(gradoID));
                  const cuposDelGrado = cuposPorGradoFiltrados[gradoID];

                  return (
                    <div key={gradoID} className="bg-white/70 backdrop-blur-sm border border-red-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="px-6 py-4 bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-b border-purple-200 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <FaChalkboard className="text-purple-600" />
                          {gradoInfo ? formatearNombreGrado(gradoInfo.nombre_grado) : `Año ${gradoID}`}
                        </h3>
                        <button
                          onClick={() => navigate('/admin/academico/secciones')}
                          className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all duration-300 text-sm font-medium hover:shadow-md"
                          title="Administrar secciones"
                        >
                          <FaCog className="w-4 h-4" />
                          Administrar
                        </button>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-red-100">
                          <thead className="bg-gray-50/50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sección</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Capacidad</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ocupados</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Disponibles</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-red-100">
                            {cuposDelGrado.map((cupo) => {
                              const seccionNombre = cupo.Secciones ? cupo.Secciones.nombre_seccion : 'No disponible';
                              const cupoKey = `${cupo.gradoID}_${cupo.seccionID}`;
                              const isModified = cuposModificados[cupoKey];
                              
                              return (
                                <tr key={cupo.id || `${cupo.gradoID}_${cupo.seccionID}`} 
                                    className={`transition-all duration-300 ${
                                      isModified 
                                        ? 'bg-red-100/40 border-l-4 border-red-500' 
                                        : 'hover:bg-gray-50/50'
                                    }`}>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{seccionNombre}</div>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <input
                                      type="number"
                                      min="0"
                                      value={cupo.capacidad}
                                      onChange={(e) => handleCapacidadChange(
                                        cupo.id, 
                                        cupo.gradoID, 
                                        cupo.seccionID, 
                                        e.target.value
                                      )}
                                      className={`w-20 px-3 py-1.5 border rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-red-500 ${
                                        isModified 
                                          ? 'border-red-400 bg-red-50' 
                                          : 'border-red-200 bg-white hover:border-red-300'
                                      }`}
                                    />
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-orange-100/50 text-orange-700 font-semibold text-sm">
                                      <FaUsers className="w-3 h-3" />
                                      {cupo.ocupados}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-100/50 text-emerald-700 font-semibold text-sm">
                                      <FaCheckCircle className="w-3 h-3" />
                                      {cupo.disponibles}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full transition-all ${
                                      cupo.disponibles > 0 
                                        ? 'bg-emerald-100/70 text-emerald-800' 
                                        : 'bg-red-100/70 text-red-800'
                                    }`}>
                                      {cupo.disponibles > 0 ? 'Disponible' : 'Completo'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-white/70 backdrop-blur-sm border border-red-200 rounded-2xl p-12 text-center shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-red-100 rounded-full">
                  <FaChalkboard className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <p className="text-gray-600 text-lg font-medium mb-6">
                {Object.keys(cuposPorGrado).length === 0
                  ? 'No hay cupos configurados para el año escolar actual.'
                  : 'No hay resultados que coincidan con los filtros seleccionados.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {Object.keys(cuposPorGrado).length === 0 && (
                  <button
                    onClick={handleCrearTodosCupos}
                    disabled={saving}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 disabled:opacity-50 shadow-lg"
                  >
                    <FaPlus className="w-5 h-5" />
                    Crear Cupos para Todos los Grados
                  </button>
                )}
                {Object.keys(cuposPorGrado).length > 0 && (Object.keys(cuposPorGradoFiltrados).length === 0) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFiltroNivel('');
                      setFiltroGrado('');
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg"
                  >
                    <FaTimes className="w-5 h-5" />
                    Limpiar Filtros
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Grados sin Cupos - Enhanced */}
        {grados.length > 0 && Object.keys(cuposPorGrado).length > 0 && 
         grados.filter(grado => !Object.keys(cuposPorGrado).includes(grado.id.toString())).length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                <FaClock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Grados sin Cupos</h2>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm border border-red-200 rounded-2xl p-8 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grados
                  .filter(grado => !Object.keys(cuposPorGrado).includes(grado.id.toString()))
                  .map(grado => (
                    <div key={grado.id} className="p-6 border border-red-200 rounded-xl bg-gradient-to-br from-amber-50 to-red-50 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <FaChalkboard className="text-amber-600 w-5 h-5" />
                        <h3 className="font-semibold text-gray-900">{formatearNombreGrado(grado.nombre_grado)}</h3>
                      </div>
                      <p className="text-sm text-gray-600">
                        No hay cupos configurados para este grado.
                      </p>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CuposManager;
