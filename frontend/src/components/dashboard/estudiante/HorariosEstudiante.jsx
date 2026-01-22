import { useMemo } from 'react';
import { FaClock, FaChalkboardTeacher, FaBook, FaMapMarkerAlt } from 'react-icons/fa';
import { getMateriaStyles, MateriaIcon } from '../../../utils/materiaStyles';

const HorariosEstudiante = ({ horarios, profesores, materias }) => {
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const diasSemanaEn = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

  const horaAMinutos = (horaStr) => {
    const [h, m] = horaStr.split(':').map(Number);
    return h * 60 + m;
  };

  const minutosAHora = (minutos) => {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const PX_PER_MINUTE = 1.2;
  const MIN_SLOT_HEIGHT = 60;

  const obtenerPuntosDetiempo = useMemo(() => {
    if (!horarios || horarios.length === 0) {
      const inicio = 420;
      const fin = 1020;
      const pxCalculado = (fin - inicio) * PX_PER_MINUTE;
      const pxReal = Math.max(pxCalculado, MIN_SLOT_HEIGHT);
      return [
        { minutos: inicio, hora: minutosAHora(inicio), px: 0, pxReal: 0 },
        { minutos: fin, hora: minutosAHora(fin), px: pxCalculado, pxReal: pxReal }
      ];
    }

    const puntosSet = new Set();
    
    horarios.forEach(h => {
      puntosSet.add(horaAMinutos(h.hora_inicio));
      puntosSet.add(horaAMinutos(h.hora_fin));
    });

    const minutosArray = Array.from(puntosSet).sort((a, b) => a - b);
    const min = Math.max(minutosArray[0] - 30, 420);
    const max = Math.min(minutosArray[minutosArray.length - 1] + 30, 1020);

    if (!puntosSet.has(min)) puntosSet.add(min);
    if (!puntosSet.has(max)) puntosSet.add(max);

    const minutosOrdenados = Array.from(puntosSet).sort((a, b) => a - b);
    
    const puntosFinal = [];
    let pxRealAcumulado = 0;
    
    for (let i = 0; i < minutosOrdenados.length; i++) {
      const minutos = minutosOrdenados[i];
      const pxCalculado = (minutos - minutosOrdenados[0]) * PX_PER_MINUTE;
      
      puntosFinal.push({
        minutos,
        hora: minutosAHora(minutos),
        px: pxCalculado,
        pxReal: pxRealAcumulado
      });
      
      if (i < minutosOrdenados.length - 1) {
        const duracionSlot = minutosOrdenados[i + 1] - minutos;
        const alturaSlot = duracionSlot * PX_PER_MINUTE;
        const alturaReal = Math.max(alturaSlot, MIN_SLOT_HEIGHT);
        pxRealAcumulado += alturaReal;
      }
    }

    return puntosFinal;
  }, [horarios]);

  const obtenerAlturaClase = (horario) => {
    const inicio = horaAMinutos(horario.hora_inicio);
    const fin = horaAMinutos(horario.hora_fin);
    
    let pxRealInicio = 0;
    let pxRealFin = 0;
    
    for (let i = 0; i < obtenerPuntosDetiempo.length - 1; i++) {
      const puntoActual = obtenerPuntosDetiempo[i];
      const puntoSiguiente = obtenerPuntosDetiempo[i + 1];
      
      if (inicio >= puntoActual.minutos && inicio <= puntoSiguiente.minutos) {
        const ratioEnSlot = (inicio - puntoActual.minutos) / (puntoSiguiente.minutos - puntoActual.minutos);
        const alturaSlot = Math.max((puntoSiguiente.minutos - puntoActual.minutos) * PX_PER_MINUTE, MIN_SLOT_HEIGHT);
        pxRealInicio = puntoActual.pxReal + ratioEnSlot * alturaSlot;
      }
      
      if (fin >= puntoActual.minutos && fin <= puntoSiguiente.minutos) {
        const ratioEnSlot = (fin - puntoActual.minutos) / (puntoSiguiente.minutos - puntoActual.minutos);
        const alturaSlot = Math.max((puntoSiguiente.minutos - puntoActual.minutos) * PX_PER_MINUTE, MIN_SLOT_HEIGHT);
        pxRealFin = puntoActual.pxReal + ratioEnSlot * alturaSlot;
      }
    }
    
    return Math.max(pxRealFin - pxRealInicio, 50);
  };

  const obtenerPosicionClase = (horario) => {
    const inicio = horaAMinutos(horario.hora_inicio);
    
    for (let i = 0; i < obtenerPuntosDetiempo.length - 1; i++) {
      const puntoActual = obtenerPuntosDetiempo[i];
      const puntoSiguiente = obtenerPuntosDetiempo[i + 1];
      
      if (inicio >= puntoActual.minutos && inicio <= puntoSiguiente.minutos) {
        const ratioEnSlot = (inicio - puntoActual.minutos) / (puntoSiguiente.minutos - puntoActual.minutos);
        const alturaSlot = Math.max((puntoSiguiente.minutos - puntoActual.minutos) * PX_PER_MINUTE, MIN_SLOT_HEIGHT);
        return puntoActual.pxReal + ratioEnSlot * alturaSlot;
      }
    }
    
    return 0;
  };

  const obtenerClasesPorDia = (diaIndex) => {
    const dia = diasSemanaEn[diaIndex];
    if (!horarios) return [];
    return horarios
      .filter(h => h.dia_semana === dia)
      .sort((a, b) => horaAMinutos(a.hora_inicio) - horaAMinutos(b.hora_inicio));
  };

  const obtenerInfoClase = (horario) => {
    const profesor = profesores?.find(p => p.id === horario.profesor_id);
    const materia = materias?.find(m => m.id === horario.materia_id);
    return { profesor, materia };
  };

  const obtenerEstilosMateria = (nombreMateria) => {
    return getMateriaStyles(nombreMateria, 'full');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <FaClock className="text-2xl text-white" />
          <h2 className="text-xl font-bold text-white">Mi Horario de Clases</h2>
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-50 min-h-[400px]">
        {(!horarios || horarios.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
            <div className="bg-white p-6 rounded-full shadow-sm mb-4">
              <FaClock className="text-5xl text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No hay horarios disponibles</h3>
            <p className="text-slate-500 max-w-md">
              Aún no se han configurado los horarios de clase para tu grado y sección. 
              Por favor consulta más tarde.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex min-w-full">
              {/* Columna de horas */}
              <div className="bg-slate-50 border-r border-slate-200 sticky left-0 z-30 min-w-[80px] flex flex-col shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                <div className="font-bold text-white px-2 py-3 text-sm bg-slate-700 h-14 flex items-center justify-center sticky top-0 border-b border-slate-600 z-40">
                  Hora
                </div>
                {obtenerPuntosDetiempo.map((punto, idx) => {
                   const alturaSlot = idx < obtenerPuntosDetiempo.length - 1 
                    ? obtenerPuntosDetiempo[idx + 1].pxReal - punto.pxReal
                    : 0;
                  return (
                    <div
                      key={idx}
                      className="text-center text-xs font-bold text-slate-500 px-2 flex items-center justify-center border-t border-slate-200"
                      style={{
                        height: `${alturaSlot}px`,
                        lineHeight: '1'
                      }}
                    >
                      {punto.hora}
                    </div>
                  );
                })}
              </div>

              {/* Columna de días */}
              <div className="flex flex-1 w-full bg-white">
                {diasSemana.map((dia, diaIndex) => {
                  const clases = obtenerClasesPorDia(diaIndex);
                  // Calculate total height based on last time point
                  const alturaTimeline = obtenerPuntosDetiempo.length > 0 
                    ? obtenerPuntosDetiempo[obtenerPuntosDetiempo.length - 1].pxReal 
                    : 500;

                  return (
                    <div key={diaIndex} className="flex flex-col border-r border-slate-200 flex-1 min-w-[160px] last:border-r-0">
                      <div className="font-bold text-white px-1 py-1 text-sm bg-slate-700 h-14 flex items-center justify-center text-center sticky top-0 z-20 border-b border-slate-600">
                        {dia}
                      </div>

                      <div
                        className="relative w-full bg-white hover:bg-slate-50 transition-colors"
                        style={{ height: `${alturaTimeline}px` }}
                      >
                         {/* Grid lines */}
                         <div className="flex flex-col" style={{ height: `${alturaTimeline}px` }}>
                            {obtenerPuntosDetiempo.map((punto, idx) => {
                                const alturaSlot = idx < obtenerPuntosDetiempo.length - 1 
                                ? obtenerPuntosDetiempo[idx + 1].pxReal - punto.pxReal
                                : 0;
                                return (
                                <div
                                    key={`line-${idx}`}
                                    className="w-full border-t border-slate-100 flex-shrink-0"
                                    style={{ height: `${alturaSlot}px` }}
                                />
                                );
                            })}
                        </div>

                        {/* Clases */}
                        <div
                          className="absolute top-0 left-0 w-full"
                          style={{ height: `${alturaTimeline}px` }}
                        >
                          {clases.map((horario) => {
                            const { profesor, materia } = obtenerInfoClase(horario);
                            const nombreMateria = materia?.asignatura || 'Materia';
                            const estilosMateria = obtenerEstilosMateria(nombreMateria);
                            const altura = obtenerAlturaClase(horario);
                            const posicion = obtenerPosicionClase(horario);

                            return (
                              <div
                                key={horario.id}
                                className={`absolute left-1 right-1 p-2 rounded border-l-4 shadow-sm hover:shadow-md transition-all group overflow-hidden text-xs ${estilosMateria.bgColor} ${estilosMateria.textColor}`}
                                style={{
                                  top: `${posicion}px`,
                                  height: `${Math.max(altura, 50)}px`,
                                  borderLeftColor: 'currentColor'
                                }}
                              >
                                <div className="flex flex-col gap-0.5 h-full overflow-hidden">
                                  <div className="font-semibold flex items-center gap-1 truncate">
                                    <MateriaIcon nombreMateria={nombreMateria} size="0.85em" />
                                    <span className="truncate">{nombreMateria}</span>
                                  </div>

                                  <div className="flex items-center gap-1 opacity-75 text-xs truncate">
                                    <FaClock className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{horario.hora_inicio} - {horario.hora_fin}</span>
                                  </div>

                                  {profesor && (
                                    <div className="flex items-center gap-1 text-xs opacity-75 truncate">
                                       <FaChalkboardTeacher className="w-3 h-3 flex-shrink-0" />
                                       <span className="truncate">{profesor.nombre} {profesor.apellido}</span>
                                    </div>
                                  )}

                                  {horario.aula && (
                                    <div className="flex items-center gap-1 text-xs opacity-75 truncate">
                                        <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0" />
                                        <span>Aula {horario.aula}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HorariosEstudiante;
