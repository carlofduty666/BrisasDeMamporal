import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaTimes,
  FaBook,
  FaLayerGroup,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaSearch,
  FaFilter,
  FaSpinner
} from 'react-icons/fa';
import { getMateriaStyles } from '../../../utils/materiaStyles';

const MateriaDetail = ({ materia, grados, isOpen, onClose, token }) => {
  const [detailedGrados, setDetailedGrados] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [secciones, setSecciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [nivelFilter, setNivelFilter] = useState('');
  const [materiaProfesorGrado, setMateriaProfesorGrado] = useState([]);

  // Cargar detalles detallados
  useEffect(() => {
    if (!isOpen || !materia) return;

    const fetchDetailedData = async () => {
      try {
        setLoading(true);
        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        // Obtener grados asignados a esta materia
        const profesorGradoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/materias/grado/${materia.id}`,
          config
        );

        let gradosData = Array.isArray(profesorGradoResponse.data)
          ? profesorGradoResponse.data
          : (profesorGradoResponse.data?.data ? profesorGradoResponse.data.data : []);

        // Enriquecer cada grado con sus profesores y secciones
        const gradosEnriquecidos = await Promise.all(
          gradosData.map(async (grado) => {
            try {
              // Obtener profesores que imparten esta materia en este grado
              const profResponse = await axios.get(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/personas/profesor/materia-grado`,
                { ...config, params: { materiaID: materia.id, gradoID: grado.id } }
              );
              
              const profs = Array.isArray(profResponse.data) 
                ? profResponse.data
                : (profResponse.data ? [profResponse.data] : []);

              return {
                ...grado,
                profesoresAsignados: profs
              };
            } catch (err) {
              console.warn(`Error cargando profesores para grado ${grado.id}:`, err);
              return {
                ...grado,
                profesoresAsignados: []
              };
            }
          })
        );

        setDetailedGrados(gradosEnriquecidos);

        // Obtener profesores únicos para estadísticas
        const profesoresUnicos = gradosEnriquecidos
          .flatMap(g => g.profesoresAsignados)
          .reduce((map, prof) => {
            map.set(prof.id, prof);
            return map;
          }, new Map());
        
        setProfesores([...profesoresUnicos.values()]);

        // Obtener secciones
        const seccionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/secciones`,
          config
        );
        setSecciones(Array.isArray(seccionesResponse.data) ? seccionesResponse.data : []);

        setLoading(false);
      } catch (err) {
        console.error('Error cargando detalles:', err);
        setLoading(false);
      }
    };

    fetchDetailedData();
  }, [isOpen, materia, token]);

  // Filtrar grados
  const filteredGrados = detailedGrados.filter(grado => {
    const gradoInfo = grados.find(g => g.id === grado.id);
    let match = true;

    if (searchTerm) {
      match = match && (
        gradoInfo?.nombre_grado?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (nivelFilter) {
      match = match && gradoInfo?.Niveles?.nombre_nivel === nivelFilter;
    }

    return match;
  });

  // Agrupar grados por nivel (filtrar sin nivel)
  const groupedGrados = filteredGrados.reduce((acc, grado) => {
    const gradoInfo = grados.find(g => g.id === grado.id);
    const nivel = gradoInfo?.Niveles?.nombre_nivel;
    // Solo incluir grados con nivel válido
    if (nivel) {
      if (!acc[nivel]) acc[nivel] = [];
      acc[nivel].push(grado);
    }
    return acc;
  }, {});

  // Manejador ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Renderizado condicional después de todos los hooks
  if (!isOpen || !materia) return null;

  const { bgColor, textColor, borderColor, Icon } = getMateriaStyles(materia.asignatura, 'card');

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in">
        <div
          className={`${bgColor} rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border ${borderColor} animate-slide-up`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`${bgColor} sticky top-0 z-10 px-8 py-6 border-b ${borderColor} flex items-center justify-between`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${bgColor} border ${borderColor} bg-opacity-70`}>
                <Icon className={`w-8 h-8 ${textColor}`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${textColor}`}>
                  {materia.asignatura}
                </h2>
                <p className="text-sm text-gray-500">
                  Código: {materia.id}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <FaTimes className={`w-6 h-6 ${textColor}`} />
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <FaSpinner className={`w-8 h-8 ${textColor} animate-spin`} />
                <span className="ml-3 text-gray-600">Cargando detalles...</span>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FaLayerGroup className={`w-6 h-6 ${textColor}`} />
                      <div>
                        <p className="text-sm text-gray-600">Grados Asignados</p>
                        <p className={`text-2xl font-bold ${textColor}`}>
                          {detailedGrados.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FaChalkboardTeacher className={`w-6 h-6 ${textColor}`} />
                      <div>
                        <p className="text-sm text-gray-600">Profesores</p>
                        <p className={`text-2xl font-bold ${textColor}`}>
                          {profesores.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FaBook className={`w-6 h-6 ${textColor}`} />
                      <div>
                        <p className="text-sm text-gray-600">Secciones</p>
                        <p className={`text-2xl font-bold ${textColor}`}>
                          {secciones.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filtros */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}>
                    <FaFilter className="w-5 h-5" />
                    Filtros
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Buscar grado
                      </label>
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filtrar por nivel
                      </label>
                      <select
                        value={nivelFilter}
                        onChange={(e) => setNivelFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">Todos los niveles</option>
                        {['Primaria', 'Secundaria'].map((nivel) => (
                          <option key={nivel} value={nivel}>
                            {nivel}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Grados Grouped by Nivel */}
                {Object.entries(groupedGrados).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(groupedGrados).map(([nivel, gradosDelNivel]) => (
                      <div key={nivel} className="space-y-3">
                        <h3 className={`text-base font-bold ${textColor} border-l-4 pl-3`} style={{ borderColor: textColor }}>
                          {nivel === 'Primaria' ? '📚' : '🎓'} {nivel}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {gradosDelNivel.map((grado) => {
                            const gradoInfo = grados.find(g => g.id === grado.id);
                            return (
                              <div
                                key={grado.id}
                                className="bg-white/70 rounded-lg p-4 border-2 border-gray-200 hover:border-orange-300 hover:shadow-md transition-all duration-300 group"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className={`font-bold ${textColor} group-hover:scale-105 transition-transform`}>
                                    {gradoInfo?.nombre_grado}
                                  </h4>
                                  <FaCheckCircle className={`w-5 h-5 ${textColor} opacity-50`} />
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                  {grado.profesoresAsignados && grado.profesoresAsignados.length > 0 ? (
                                    <>
                                      <p className="font-semibold text-gray-700">
                                        👨‍🏫 Profesores: {grado.profesoresAsignados.length}
                                      </p>
                                      <ul className="list-disc list-inside space-y-1 ml-2">
                                        {grado.profesoresAsignados.slice(0, 2).map((prof) => (
                                          <li key={prof.id} className="text-xs text-gray-600">
                                            {prof.nombre} {prof.apellido}
                                          </li>
                                        ))}
                                        {grado.profesoresAsignados.length > 2 && (
                                          <li className="text-xs text-orange-600 font-semibold">
                                            +{grado.profesoresAsignados.length - 2} más
                                          </li>
                                        )}
                                      </ul>
                                    </>
                                  ) : (
                                    <p className="italic text-gray-500">Sin profesores asignados</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-8 text-center">
                    <FaBook className="w-12 h-12 text-orange-300 mx-auto mb-3" />
                    <p className="text-orange-700 font-medium">
                      {detailedGrados.length === 0
                        ? 'Esta materia no está asignada a ningún grado'
                        : 'No se encontraron resultados con los filtros aplicados'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default MateriaDetail;