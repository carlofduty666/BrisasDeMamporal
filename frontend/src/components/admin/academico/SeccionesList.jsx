import { useState, useEffect, useMemo } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaUsers, 
  FaRedo, 
  FaDownload,
  FaGraduationCap,
  FaChalkboard,  
  FaBook,
  FaChevronDown,
  FaChevronRight
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { formatearNombreGrado, formatearNombreNivel } from '../../../utils/formatters';
import CrearSeccion from './modals/CrearSeccion';
import EditarSeccion from './modals/EditarSeccion';
import EliminarSeccion from './modals/EliminarSeccion';

const SeccionesList = () => {
  const navigate = useNavigate();
  const [secciones, setSecciones] = useState([]);
  const [grados, setGrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [annoEscolar, setAnnoEscolar] = useState(null);
  const [niveles, setNiveles] = useState([]);
  const [expandedNiveles, setExpandedNiveles] = useState({});
  const [expandedGrados, setExpandedGrados] = useState({});

  // Modal states
  const [modalCrear, setModalCrear] = useState({ isOpen: false, gradoId: null, gradoNombre: '', nivelNombre: '' });
  const [modalEditar, setModalEditar] = useState({ isOpen: false, seccion: null });
  const [modalEliminar, setModalEliminar] = useState({ isOpen: false, seccion: null });

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
  
        // Obtener secciones
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/secciones`,
          config
        );
  
        // Obtener grados
        const gradosResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/grados`,
          config
        );
  
        // Obtener niveles
        const nivelesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/nivel`,
          config
        );
  
        // Obtener año escolar activo
        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          config
        );
  
        setSecciones(seccionesResponse.data);
        setGrados(gradosResponse.data);
        setNiveles(nivelesResponse.data);
        setAnnoEscolar(annoResponse.data);
        
        // Expandir todos los niveles por defecto
        const allNivelesExpanded = {};
        nivelesResponse.data.forEach(nivel => {
          allNivelesExpanded[nivel.id] = true;
        });
        setExpandedNiveles(allNivelesExpanded);
        
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

  // Agrupar secciones por nivel y grado
  const organizarPorNivelyGrado = useMemo(() => {
    const estructura = {};
    
    niveles.forEach(nivel => {
      estructura[nivel.id] = {
        nivel,
        grados: {}
      };
    });
    
    grados.forEach(grado => {
      if (!estructura[grado.nivelID]) {
        estructura[grado.nivelID] = {
          nivel: null,
          grados: {}
        };
      }
      estructura[grado.nivelID].grados[grado.id] = {
        grado,
        secciones: []
      };
    });
    
    secciones.forEach(seccion => {
      const grado = grados.find(g => g.id === seccion.gradoID);
      if (grado && estructura[grado.nivelID] && estructura[grado.nivelID].grados[grado.id]) {
        estructura[grado.nivelID].grados[grado.id].secciones.push(seccion);
      }
    });
    
    return estructura;
  }, [secciones, grados, niveles]);

  // Filtrar por búsqueda
  const estructuraFiltrada = useMemo(() => {
    if (!searchTerm.trim()) return organizarPorNivelyGrado;
    
    const search = searchTerm.toLowerCase();
    const resultado = {};
    
    Object.entries(organizarPorNivelyGrado).forEach(([nivelId, nivelData]) => {
      const gradosFiltrados = {};
      
      Object.entries(nivelData.grados).forEach(([gradoId, gradoData]) => {
        const seccionesFiltradas = gradoData.secciones.filter(seccion => {
          const gradoNombre = gradoData.grado?.nombre_grado.toLowerCase() || '';
          const seccionNombre = seccion.nombre_seccion.toLowerCase();
          const nivelNombre = nivelData.nivel?.nombre_nivel.toLowerCase() || '';
          
          return seccionNombre.includes(search) || 
                 gradoNombre.includes(search) || 
                 nivelNombre.includes(search);
        });
        
        if (seccionesFiltradas.length > 0) {
          gradosFiltrados[gradoId] = {
            ...gradoData,
            secciones: seccionesFiltradas
          };
        }
      });
      
      if (Object.keys(gradosFiltrados).length > 0) {
        resultado[nivelId] = {
          ...nivelData,
          grados: gradosFiltrados
        };
      }
    });
    
    return resultado;
  }, [organizarPorNivelyGrado, searchTerm]);

  // Estadísticas
  const stats = useMemo(() => {
    let totalSecciones = 0;
    let totalGrados = 0;
    let totalNiveles = 0;
    
    Object.values(estructuraFiltrada).forEach(nivelData => {
      if (Object.keys(nivelData.grados).length > 0) {
        totalNiveles++;
      }
      Object.values(nivelData.grados).forEach(gradoData => {
        totalGrados++;
        totalSecciones += gradoData.secciones.length;
      });
    });
    
    return { totalSecciones, totalGrados, totalNiveles };
  }, [estructuraFiltrada]);

  // Modal handlers - Crear
  const handleOpenCrearModal = (gradoId, gradoNombre, nivelNombre) => {
    setModalCrear({
      isOpen: true,
      gradoId,
      gradoNombre,
      nivelNombre
    });
  };

  const handleCloseCrearModal = () => {
    setModalCrear({ isOpen: false, gradoId: null, gradoNombre: '', nivelNombre: '' });
  };

  const handleSectionCreated = (newSection) => {
    setSecciones([...secciones, newSection]);
    setSuccessMessage('Sección creada correctamente');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Modal handlers - Editar
  const handleOpenEditarModal = (seccion) => {
    setModalEditar({
      isOpen: true,
      seccion
    });
  };

  const handleCloseEditarModal = () => {
    setModalEditar({ isOpen: false, seccion: null });
  };

  const handleSectionUpdated = (updatedSection) => {
    setSecciones(secciones.map(s => s.id === updatedSection.id ? updatedSection : s));
    setSuccessMessage('Sección actualizada correctamente');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Modal handlers - Eliminar
  const handleOpenEliminarModal = (seccion) => {
    setModalEliminar({
      isOpen: true,
      seccion
    });
  };

  const handleCloseEliminarModal = () => {
    setModalEliminar({ isOpen: false, seccion: null });
  };

  const handleSectionDeleted = (sectionId) => {
    setSecciones(secciones.filter(s => s.id !== sectionId));
    setSuccessMessage('Sección eliminada correctamente');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const exportToCSV = () => {
    const headers = ['Nivel', 'Grado', 'Sección', 'Capacidad', 'Estado'];
    const rows = [];
    
    Object.values(estructuraFiltrada).forEach(nivelData => {
      Object.values(nivelData.grados).forEach(gradoData => {
        gradoData.secciones.forEach(seccion => {
          rows.push([
            nivelData.nivel?.nombre_nivel || 'N/A',
            gradoData.grado?.nombre_grado || '',
            seccion.nombre_seccion,
            seccion.capacidad || 30,
            seccion.activo ? 'Activo' : 'Inactivo'
          ]);
        });
      });
    });
    
    const csvData = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'secciones.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleNivel = (nivelId) => {
    setExpandedNiveles(prev => ({
      ...prev,
      [nivelId]: !prev[nivelId]
    }));
  };

  const toggleGrado = (gradoId) => {
    setExpandedGrados(prev => ({
      ...prev,
      [gradoId]: !prev[gradoId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-slate-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full bg-purple-500/10 animate-pulse"></div>
          </div>
          <p className="mt-4 text-purple-600 font-medium">Cargando secciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-800 to-purple-900 shadow-2xl rounded-2xl mb-8">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-transparent"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-purple-300/10 rounded-full blur-2xl"></div>
        
        <div className="relative px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl backdrop-blur-sm border border-purple-400/30">
                  <FaChalkboard className="w-8 h-8 text-purple-200" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Gestión de Secciones
                  </h1>
                  <p className="text-purple-200 text-lg">
                    Administra las secciones académicas organizadas por nivel y grado
                  </p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm font-medium">Total Secciones</p>
                      <p className="text-2xl font-bold text-white">{stats.totalSecciones}</p>
                    </div>
                    <FaGraduationCap className="w-8 h-8 text-purple-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm font-medium">Grados</p>
                      <p className="text-2xl font-bold text-white">{stats.totalGrados}</p>
                    </div>
                    <FaBook className="w-8 h-8 text-purple-300" />
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-200 text-sm font-medium">Niveles</p>
                      <p className="text-2xl font-bold text-white">{stats.totalNiveles}</p>
                    </div>
                    <FaUsers className="w-8 h-8 text-purple-300" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-purple-50 border-l-4 border-purple-500 text-purple-700 p-4 mb-6 rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  placeholder="Buscar por nivel, grado o sección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* View Mode & Actions */}
            <div className="flex items-center space-x-3">
              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors duration-200 border border-purple-200"
                title="Exportar a CSV"
              >
                <FaDownload className="w-4 h-4 mr-2" />
                Exportar
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => {
                  setLoading(true);
                  window.location.reload();
                }}
                className="flex items-center px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
                title="Actualizar lista"
              >
                <FaRedo className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchical View */}
      <div className="space-y-6">
        {Object.entries(estructuraFiltrada).length > 0 ? (
          Object.entries(estructuraFiltrada).map(([nivelId, nivelData]) => (
            <div key={nivelId} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Nivel Header */}
              <button
                onClick={() => toggleNivel(nivelId)}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-150 transition-colors duration-200 flex items-center justify-between border-b border-gray-100"
              >
                <div className="flex items-center space-x-4 flex-1 text-left">
                  {expandedNiveles[nivelId] ? (
                    <FaChevronDown className="w-5 h-5 text-purple-600" />
                  ) : (
                    <FaChevronRight className="w-5 h-5 text-purple-600" />
                  )}
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <FaGraduationCap className="w-5 h-5 text-purple-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {nivelData.nivel ? formatearNombreNivel(nivelData.nivel.nombre_nivel) : 'Nivel desconocido'}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {Object.keys(nivelData.grados).length} grado(s) • {
                        Object.values(nivelData.grados).reduce((sum, g) => sum + g.secciones.length, 0)
                      } sección(es)
                    </p>
                  </div>
                </div>
              </button>

              {/* Nivel Content */}
              {expandedNiveles[nivelId] && (
                <div className="p-6 space-y-4">
                  {Object.entries(nivelData.grados).map(([gradoId, gradoData]) => (
                    <div key={gradoId} className="border border-gray-200 rounded-xl overflow-hidden">
                      {/* Grado Header */}
                      <button
                        onClick={() => toggleGrado(gradoId)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 transition-colors duration-200 flex items-center space-x-3 text-left"
                      >
                        {expandedGrados[gradoId] ? (
                          <FaChevronDown className="w-4 h-4 text-blue-600" />
                        ) : (
                          <FaChevronRight className="w-4 h-4 text-blue-600" />
                        )}
                        <div className="p-1.5 bg-blue-500/20 rounded-lg">
                          <FaBook className="w-4 h-4 text-blue-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {formatearNombreGrado(gradoData.grado.nombre_grado)}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {gradoData.secciones.length} sección(es)
                          </p>
                        </div>
                      </button>

                      {/* Secciones Grid */}
                      {expandedGrados[gradoId] && (
                        <div className="p-4 bg-gray-50/50">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {gradoData.secciones.map((seccion) => (
                              <div
                                key={seccion.id}
                                className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 p-4"
                              >
                                {/* Header Color Band */}
                                <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600 -mx-4 -mt-4 mb-4"></div>

                                {/* Avatar y nombre */}
                                <div className="flex items-center mb-4">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">
                                        {seccion.nombre_seccion?.charAt(0)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-3 flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900">
                                      Sección {seccion.nombre_seccion}
                                    </h4>
                                  </div>
                                </div>

                                {/* Información */}
                                <div className="space-y-2 mb-4 text-xs">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Capacidad:</span>
                                    <span className="font-semibold text-gray-900">{seccion.capacidad || 30} est.</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Estado:</span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      seccion.activo 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {seccion.activo ? '● Activa' : '● Inactiva'}
                                    </span>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleOpenEditarModal(seccion)}
                                    className="flex-1 inline-flex items-center justify-center px-2 py-1.5 border border-blue-300 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                                    title="Editar"
                                  >
                                    <FaEdit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenEliminarModal(seccion)}
                                    className="flex-1 inline-flex items-center justify-center px-2 py-1.5 border border-red-300 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                                    title="Eliminar"
                                  >
                                    <FaTrash className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}

                            {/* Card Añadir Nueva Sección */}
                            <button
                              onClick={() => handleOpenCrearModal(
                                gradoId,
                                formatearNombreGrado(gradoData.grado.nombre_grado),
                                formatearNombreNivel(nivelData.nivel.nombre_nivel)
                              )}
                              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow border-2 border-dashed border-purple-300 overflow-hidden hover:shadow-lg hover:from-purple-100 hover:to-purple-150 transition-all duration-300 p-4 flex flex-col items-center justify-center min-h-[240px] group"
                            >
                              {/* Header Color Band */}
                              <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600 -mx-4 -mt-4 mb-4 w-full"></div>

                              {/* Icon and Text */}
                              <div className="flex flex-col items-center justify-center flex-1 space-y-3">
                                <div className="p-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full group-hover:scale-110 transition-transform duration-300">
                                  <FaPlus className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-center">
                                  <h4 className="text-sm font-semibold text-purple-900">
                                    Añadir Sección
                                  </h4>
                                  <p className="text-xs text-purple-600 mt-1">
                                    Crear nueva
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12">
            <div className="flex flex-col items-center text-center">
              <FaChalkboard className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-2">No se encontraron secciones</p>
              <p className="text-gray-600">
                {searchTerm ? 'Intenta ajustar los filtros de búsqueda' : 'Comienza creando una nueva sección'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <CrearSeccion
        isOpen={modalCrear.isOpen}
        onClose={handleCloseCrearModal}
        gradoId={modalCrear.gradoId}
        gradoNombre={modalCrear.gradoNombre}
        nivelNombre={modalCrear.nivelNombre}
        onSectionCreated={handleSectionCreated}
      />

      <EditarSeccion
        isOpen={modalEditar.isOpen}
        onClose={handleCloseEditarModal}
        seccion={modalEditar.seccion}
        onSectionUpdated={handleSectionUpdated}
      />

      <EliminarSeccion
        isOpen={modalEliminar.isOpen}
        onClose={handleCloseEliminarModal}
        seccion={modalEliminar.seccion}
        onSectionDeleted={handleSectionDeleted}
      />
    </div>
  );
};

export default SeccionesList;