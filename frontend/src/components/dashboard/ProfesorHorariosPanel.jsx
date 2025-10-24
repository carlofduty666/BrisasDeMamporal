import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaClock, 
  FaCalendarAlt, 
  FaChalkboard, 
  FaUsers, 
  FaMapMarkerAlt,
  FaBook,
  FaSpinner,
  FaChevronRight
} from 'react-icons/fa';

const ProfesorHorariosPanel = ({ profesorId, annoEscolarId }) => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const diasSemana = [
    { value: 'lunes', label: 'Lunes' },
    { value: 'martes', label: 'Martes' },
    { value: 'miércoles', label: 'Miércoles' },
    { value: 'jueves', label: 'Jueves' },
    { value: 'viernes', label: 'Viernes' }
  ];

  useEffect(() => {
    fetchHorarios();
  }, [profesorId, annoEscolarId]);

  const fetchHorarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Obtener todos los horarios del profesor
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/horarios`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { profesor_id: profesorId, anno_escolar_id: annoEscolarId }
        }
      );
      
      const horariosProfesor = response.data.filter(h => h.profesor_id === profesorId);
      setHorarios(horariosProfesor.sort((a, b) => {
        const diaOrder = { 'lunes': 0, 'martes': 1, 'miércoles': 2, 'jueves': 3, 'viernes': 4 };
        if (diaOrder[a.dia_semana] !== diaOrder[b.dia_semana]) {
          return diaOrder[a.dia_semana] - diaOrder[b.dia_semana];
        }
        return a.hora_inicio.localeCompare(b.hora_inicio);
      }));
    } catch (error) {
      console.error('Error al cargar horarios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar horarios por día
  const horariosPorDia = diasSemana.reduce((acc, dia) => {
    acc[dia.value] = horarios.filter(h => h.dia_semana === dia.value);
    return acc;
  }, {});

  // Obtener horario de hoy
  const obtenerDiaHoy = () => {
    const hoy = new Date().getDay();
    const dias = ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', ''];
    return dias[hoy] || null;
  };

  const diaHoy = obtenerDiaHoy();

  // Formatear hora
  const formatearHora = (hora) => {
    const [h, m] = hora.split(':');
    return `${h}:${m}`;
  };

  // Obtener color por posición
  const obtenerColorClase = (index) => {
    const colores = [
      'from-rose-500 to-rose-600',
      'from-pink-500 to-pink-600',
      'from-red-500 to-red-600',
      'from-orange-500 to-orange-600',
      'from-amber-500 to-amber-600'
    ];
    return colores[index % colores.length];
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-rose-50 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <FaSpinner className="w-8 h-8 text-rose-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Cargando horarios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-rose-50 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-700 to-rose-800 px-6 py-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-rose-600/30 rounded-xl backdrop-blur-sm border border-rose-400/30">
            <FaClock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Mis Horarios</h3>
            <p className="text-rose-200 text-sm">Visualiza tus clases de la semana</p>
          </div>
        </div>
      </div>

      {horarios.length === 0 ? (
        <div className="p-8 text-center">
          <FaCalendarAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No hay horarios asignados</p>
        </div>
      ) : (
        <div className="p-6">
          {/* Selector de día (Mobile) */}
          <div className="md:hidden mb-6">
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Seleccionar día:
            </label>
            <div className="flex flex-wrap gap-2">
              {diasSemana.map(dia => (
                <button
                  key={dia.value}
                  onClick={() => setSelectedDay(selectedDay === dia.value ? null : dia.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedDay === dia.value
                      ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {dia.label.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Vista Desktop */}
          <div className="hidden md:grid gap-6">
            {diasSemana.map(dia => {
              const clasesDelDia = horariosPorDia[dia.value];
              const esHoy = dia.value === diaHoy;

              return (
                <div
                  key={dia.value}
                  className={`rounded-xl overflow-hidden border-2 transition-all ${
                    esHoy
                      ? 'border-rose-300 bg-rose-50/50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Header del día */}
                  <div
                    className={`px-4 py-3 font-bold flex items-center justify-between cursor-pointer ${
                      esHoy
                        ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white'
                        : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="w-4 h-4" />
                      <span>{dia.label}</span>
                      {esHoy && (
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-semibold">
                          Hoy
                        </span>
                      )}
                    </div>
                    <span className="text-sm">({clasesDelDia.length})</span>
                  </div>

                  {/* Clases del día */}
                  {clasesDelDia.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Sin clases
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {clasesDelDia.map((horario, idx) => (
                        <div
                          key={horario.id}
                          className="p-4 hover:bg-rose-50/50 transition-colors cursor-pointer"
                          onClick={() => setExpanded(expanded === horario.id ? null : horario.id)}
                        >
                          <div className="flex items-start gap-4">
                            {/* Indicador de hora */}
                            <div className={`px-3 py-2 rounded-lg bg-gradient-to-br ${obtenerColorClase(idx)} text-white text-center flex-shrink-0 min-w-max`}>
                              <div className="font-bold text-sm">{formatearHora(horario.hora_inicio)}</div>
                              <div className="text-xs opacity-90">{formatearHora(horario.hora_fin)}</div>
                            </div>

                            {/* Información de la clase */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-800 text-base mb-2">
                                {horario.materia?.asignatura || 'Materia'}
                              </h4>

                              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-2">
                                  <FaChalkboard className="w-4 h-4 text-rose-600 flex-shrink-0" />
                                  <span className="truncate">{horario.grado?.nombre_grado}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FaUsers className="w-4 h-4 text-rose-600 flex-shrink-0" />
                                  <span className="truncate">{horario.seccion?.nombre_seccion}</span>
                                </div>
                              </div>

                              {horario.aula && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                  <FaMapMarkerAlt className="w-4 h-4 text-rose-600 flex-shrink-0" />
                                  <span>Aula {horario.aula}</span>
                                </div>
                              )}

                              {/* Detalles expandidos */}
                              {expanded === horario.id && (
                                <div className="mt-3 pt-3 border-t border-gray-200 bg-white rounded-lg p-3 space-y-2 animate-fadeIn">
                                  <div className="text-xs text-gray-600 space-y-1">
                                    {horario.profesor && (
                                      <div>
                                        <span className="font-semibold">Profesor:</span>
                                        <div>{horario.profesor.nombre} {horario.profesor.apellido}</div>
                                      </div>
                                    )}
                                    {horario.materia && (
                                      <div>
                                        <span className="font-semibold">Materia:</span>
                                        <div>{horario.materia.asignatura}</div>
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-semibold">Estado:</span>
                                      <div>
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                          horario.activo
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                          {horario.activo ? '✓ Activo' : '✗ Inactivo'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <FaChevronRight
                              className={`w-5 h-5 text-rose-600 flex-shrink-0 transition-transform ${
                                expanded === horario.id ? 'rotate-90' : ''
                              }`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Vista Mobile */}
          <div className="md:hidden">
            {selectedDay && horariosPorDia[selectedDay].length > 0 ? (
              <div className="space-y-3">
                {horariosPorDia[selectedDay].map((horario, idx) => (
                  <div
                    key={horario.id}
                    className="bg-gradient-to-br from-white to-rose-50 rounded-xl p-4 border border-rose-200 shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`px-3 py-2 rounded-lg bg-gradient-to-br ${obtenerColorClase(idx)} text-white text-center flex-shrink-0`}>
                        <div className="font-bold text-sm">{formatearHora(horario.hora_inicio)}</div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{horario.materia?.asignatura}</h4>
                        <div className="text-xs text-gray-600 mt-1 space-y-1">
                          <div>📚 {horario.grado?.nombre_grado} {horario.seccion?.nombre_seccion}</div>
                          {horario.aula && <div>🏛️ Aula {horario.aula}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedDay ? (
              <div className="text-center py-8 text-gray-500">
                Sin clases en este día
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Selecciona un día para ver las clases
              </div>
            )}
          </div>

          {/* Resumen de la semana */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {diasSemana.map(dia => (
                <div
                  key={dia.value}
                  className={`rounded-lg p-3 text-center transition-all ${
                    dia.value === diaHoy
                      ? 'bg-gradient-to-br from-rose-600 to-rose-700 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="font-bold text-sm">{dia.label.slice(0, 3)}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {horariosPorDia[dia.value].length} {horariosPorDia[dia.value].length === 1 ? 'clase' : 'clases'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default ProfesorHorariosPanel;