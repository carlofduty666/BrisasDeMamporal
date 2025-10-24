import React, { useMemo } from 'react';
import { FaClock, FaChalkboardTeacher, FaBook, FaMapMarkerAlt } from 'react-icons/fa';
import { formatearNombreGrado } from '../../utils/formatters'

const HorariosCalendar = ({ horarios, profesores, grados, secciones, materias, selectedGrado = null, selectedSeccion = null }) => {
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const diasSemanaEn = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

  // Filtrar horarios según selección
  const horariosFiltrados = useMemo(() => {
    let filtered = [...horarios];
    
    if (selectedGrado) {
      filtered = filtered.filter(h => h.grado_id === selectedGrado);
    }
    if (selectedSeccion) {
      filtered = filtered.filter(h => h.seccion_id === selectedSeccion);
    }
    
    return filtered;
  }, [horarios, selectedGrado, selectedSeccion]);

  // Obtener rango de horas
  const obtenerRangoHoras = () => {
    if (horariosFiltrados.length === 0) {
      return { inicio: 7, fin: 17 };
    }

    const horas = horariosFiltrados.flatMap(h => {
      const [inicioH] = h.hora_inicio.split(':').map(Number);
      const [finH] = h.hora_fin.split(':').map(Number);
      return [inicioH, finH];
    });

    const minHora = Math.min(...horas);
    const maxHora = Math.max(...horas) + 1;

    return {
      inicio: Math.max(minHora - 1, 7),
      fin: Math.min(maxHora + 1, 18)
    };
  };

  const rangoHoras = obtenerRangoHoras();
  const horas = Array.from({ length: rangoHoras.fin - rangoHoras.inicio }, (_, i) => rangoHoras.inicio + i);

  // Obtener clases para una celda específica
  const obtenerClasesEnCelda = (diaIndex, hora) => {
    return horariosFiltrados.filter(horario => {
      const dia = diasSemanaEn[diaIndex];
      if (horario.dia_semana !== dia) return false;

      const [inicioH, inicioM] = horario.hora_inicio.split(':').map(Number);
      const [finH] = horario.hora_fin.split(':').map(Number);

      return hora >= inicioH && hora < finH;
    });
  };

  // Obtener información de una clase
  const obtenerInfoClase = (horario) => {
    const profesor = profesores.find(p => p.id === horario.profesor_id);
    const materia = materias.find(m => m.id === horario.materia_id);
    const grado = grados.find(g => g.id === horario.grado_id);
    const seccion = secciones.find(s => s.id === horario.seccion_id);

    return { profesor, materia, grado, seccion };
  };

  // Colores para las clases
  const obtenerColorClase = (index) => {
    const colores = [
      'bg-rose-50 border-rose-300 text-rose-900',
      'bg-pink-50 border-pink-300 text-pink-900',
      'bg-red-50 border-red-300 text-red-900',
      'bg-orange-50 border-orange-300 text-orange-900',
      'bg-amber-50 border-amber-300 text-amber-900'
    ];
    return colores[index % colores.length];
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 overflow-x-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaClock className="mr-3 text-rose-600" />
          Calendario de Horarios
        </h2>
        <p className="text-gray-600 text-sm mt-2">
          Visualización de las clases programadas por día y hora
        </p>
      </div>

      {horariosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <FaClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No hay horarios para mostrar</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-max">
            {/* Header de horas */}
            <thead>
              <tr>
                <th className="bg-gradient-to-br from-rose-700 to-rose-800 text-white font-bold p-4 text-sm w-20 sticky left-0 z-20">
                  Hora
                </th>
                {diasSemana.map((dia, index) => (
                  <th
                    key={index}
                    className="bg-gradient-to-br from-rose-600 to-rose-700 text-white font-bold p-4 text-sm min-w-max border-l border-rose-500/30"
                  >
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Cuerpo del calendario */}
            <tbody>
              {horas.map((hora) => (
                <tr key={hora} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                  {/* Celda de hora */}
                  <td className="bg-gradient-to-br from-rose-50 to-rose-100 font-semibold text-rose-700 p-4 text-center text-sm sticky left-0 z-10 border-r border-rose-200">
                    {String(hora).padStart(2, '0')}:00
                  </td>

                  {/* Celdas de días */}
                  {diasSemana.map((_, diaIndex) => {
                    const clasesEnCelda = obtenerClasesEnCelda(diaIndex, hora);

                    return (
                      <td
                        key={diaIndex}
                        className="p-2 border-l border-gray-200 min-w-max align-top bg-white hover:bg-rose-50/30 transition-colors"
                      >
                        {clasesEnCelda.length > 0 && (
                          <div className="flex flex-col gap-1">
                            {clasesEnCelda.map((horario, idx) => {
                              const info = obtenerInfoClase(horario);
                              const colorClass = obtenerColorClase(idx);

                              return (
                                <div
                                  key={horario.id}
                                  className={`border-l-4 p-2 rounded-r text-xs ${colorClass} shadow-sm hover:shadow-md transition-shadow cursor-pointer group relative border border-l-4`}
                                >
                                  {/* Contenido principal */}
                                  <div className="font-semibold text-sm mb-1 truncate">
                                    {info.materia?.asignatura || 'Materia'}
                                  </div>

                                  {/* Hora precisa */}
                                  <div className="flex items-center gap-1 text-xs opacity-75 mb-1">
                                    <FaClock className="w-3 h-3" />
                                    <span>{horario.hora_inicio} - {horario.hora_fin}</span>
                                  </div>

                                  {/* Profesor */}
                                  {info.profesor && (
                                    <div className="flex items-center gap-1 text-xs opacity-75 mb-1 truncate">
                                      <FaChalkboardTeacher className="w-3 h-3 flex-shrink-0" />
                                      <span className="truncate">{info.profesor.nombre} {info.profesor.apellido}</span>
                                    </div>
                                  )}

                                  {/* Aula */}
                                  {horario.aula && (
                                    <div className="flex items-center gap-1 text-xs opacity-75">
                                      <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0" />
                                      <span>Aula {horario.aula}</span>
                                    </div>
                                  )}

                                  {/* Tooltip en hover */}
                                  <div className="absolute left-0 bottom-full mb-2 bg-gray-900 text-white p-3 rounded-lg text-xs w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                    <div className="font-bold mb-2">{info.materia?.asignatura}</div>
                                    <div className="space-y-1 text-gray-200">
                                      <div>⏰ {horario.hora_inicio} - {horario.hora_fin}</div>
                                      <div>👨‍🏫 {info.profesor?.nombre} {info.profesor?.apellido}</div>
                                      {info.grado && <div>📚 {formatearNombreGrado(info.grado.nombre_grado)} {info.seccion?.nombre_seccion}</div>}
                                      {horario.aula && <div>🏛️ Aula {horario.aula}</div>}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Leyenda */}
      {horariosFiltrados.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200">
          <div className="text-xs text-gray-600 space-y-2">
            <p className="font-semibold text-gray-800">💡 Ayuda:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Pasa el mouse sobre una clase para ver más detalles</li>
              <li>Cada color representa una clase diferente</li>
              <li>Las clases se agrupan por hora de inicio</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default HorariosCalendar;