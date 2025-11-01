import React, { useMemo, useState } from 'react';
import { FaClock, FaPlus, FaChalkboardTeacher, FaBook, FaMapMarkerAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { formatearNombreGrado } from '../../utils/formatters';
import { getMateriaStyles, MateriaIcon } from '../../utils/materiaStyles';
import HorariosFormModal from './HorariosFormModal';
import axios from 'axios';
import { toast } from 'react-toastify';

const HorariosCalendar = ({ 
  horarios, 
  profesores, 
  grados, 
  secciones, 
  materias,
  onHorarioChange 
}) => {
  const [selectedGrado, setSelectedGrado] = useState(null);
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [selectedNivel, setSelectedNivel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDia, setSelectedDia] = useState(null);
  const [editingHorario, setEditingHorario] = useState(null);

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const diasSemanaEn = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

  // Convertir hora a minutos desde las 00:00
  const horaAMinutos = (horaStr) => {
    const [h, m] = horaStr.split(':').map(Number);
    return h * 60 + m;
  };

  // Convertir minutos a formato HH:MM
  const minutosAHora = (minutos) => {
    const h = Math.floor(minutos / 60);
    const m = minutos % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Obtener niveles únicos de los grados
  const obtenerNiveles = useMemo(() => {
    const niveles = [...new Set(grados.map(g => {
      if (g.Niveles?.nombre_nivel) return g.Niveles.nombre_nivel;
      if (g.nivel) return g.nivel;
      return 'Otros';
    }))].sort();
    return niveles;
  }, [grados]);

  // Obtener grados por nivel
  const obtenerGradosPorNivel = useMemo(() => {
    if (!selectedNivel) return [];
    return grados.filter(g => {
      const nivelActual = g.Niveles?.nombre_nivel || g.nivel || 'Otros';
      return nivelActual === selectedNivel;
    }).sort((a, b) => a.nombre_grado.localeCompare(b.nombre_grado));
  }, [grados, selectedNivel]);

  // Obtener secciones del grado seleccionado
  const obtenerSeccionesPorGrado = useMemo(() => {
    if (!selectedGrado) return [];
    return secciones.filter(s => {
      // Soportar tanto gradoID (backend retornado) como grado_id
      const gradoId = s.gradoID !== undefined ? s.gradoID : s.grado_id;
      return gradoId === selectedGrado;
    }).sort((a, b) => (a.nombre_seccion || 'A').localeCompare(b.nombre_seccion || 'A'));
  }, [secciones, selectedGrado]);

  // Filtrar horarios según nivel, grado y sección seleccionados
  const horariosFiltrados = useMemo(() => {
    let filtered = [...horarios];
    if (selectedNivel) {
      const gradoDelNivel = grados
        .filter(g => {
          const nivelActual = g.Niveles?.nombre_nivel || g.nivel || 'Otros';
          return nivelActual === selectedNivel;
        })
        .map(g => g.id);
      filtered = filtered.filter(h => gradoDelNivel.includes(h.grado_id));
    }
    if (selectedGrado) {
      filtered = filtered.filter(h => h.grado_id === selectedGrado);
    }
    if (selectedSeccion) {
      filtered = filtered.filter(h => h.seccion_id === selectedSeccion);
    }
    return filtered;
  }, [horarios, grados, selectedNivel, selectedGrado, selectedSeccion]);

  // Constante: píxeles por minuto (ajustable) - Aumentado para mejor visualización
  const PX_PER_MINUTE = 1.2;
  const MIN_SLOT_HEIGHT = 60; // Altura mínima de cada slot de tiempo

  // Obtener todos los puntos de tiempo únicos y ordenados (en píxeles)
  const obtenerPuntosDetiempo = useMemo(() => {
    if (horariosFiltrados.length === 0) {
      const inicio = 420; // 7:00
      const fin = 1020; // 17:00
      const pxCalculado = (fin - inicio) * PX_PER_MINUTE;
      const pxReal = Math.max(pxCalculado, MIN_SLOT_HEIGHT);
      return [
        { minutos: inicio, hora: minutosAHora(inicio), px: 0, pxReal: 0 },
        { minutos: fin, hora: minutosAHora(fin), px: pxCalculado, pxReal: pxReal }
      ];
    }

    const puntosSet = new Set();
    
    horariosFiltrados.forEach(h => {
      puntosSet.add(horaAMinutos(h.hora_inicio));
      puntosSet.add(horaAMinutos(h.hora_fin));
    });

    // Agregar límites mínimo y máximo
    const minutosArray = Array.from(puntosSet).sort((a, b) => a - b);
    const min = Math.max(minutosArray[0] - 30, 420); // Mínimo 7:00
    const max = Math.min(minutosArray[minutosArray.length - 1] + 30, 1020); // Máximo 17:00

    if (!puntosSet.has(min)) puntosSet.add(min);
    if (!puntosSet.has(max)) puntosSet.add(max);

    const minutosOrdenados = Array.from(puntosSet).sort((a, b) => a - b);
    
    // Calcular posiciones reales considerando MIN_SLOT_HEIGHT
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
      
      // Para el siguiente punto, sumar la altura real del slot actual
      if (i < minutosOrdenados.length - 1) {
        const duracionSlot = minutosOrdenados[i + 1] - minutos;
        const alturaSlot = duracionSlot * PX_PER_MINUTE;
        const alturaReal = Math.max(alturaSlot, MIN_SLOT_HEIGHT);
        pxRealAcumulado += alturaReal;
      }
    }

    return puntosFinal;
  }, [horariosFiltrados]);

  // Obtener la altura en píxeles de una clase considerando MIN_SLOT_HEIGHT
  const obtenerAlturaClase = (horario) => {
    const inicio = horaAMinutos(horario.hora_inicio);
    const fin = horaAMinutos(horario.hora_fin);
    const duracion = fin - inicio;
    const alturaCalculada = duracion * PX_PER_MINUTE;
    
    // Encontrar los puntos de tiempo que contienen inicio y fin
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

  // Obtener posición top en píxeles de una clase considerando MIN_SLOT_HEIGHT
  const obtenerPosicionClase = (horario) => {
    const inicio = horaAMinutos(horario.hora_inicio);
    
    // Encontrar el punto de tiempo que contiene el inicio
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

  // Obtener clases para un día específico
  const obtenerClasesPorDia = (diaIndex) => {
    const dia = diasSemanaEn[diaIndex];
    return horariosFiltrados
      .filter(h => h.dia_semana === dia)
      .sort((a, b) => horaAMinutos(a.hora_inicio) - horaAMinutos(b.hora_inicio));
  };

  // Obtener horas libres entre clases
  const obtenerHorasLibres = (diaIndex) => {
    const clases = obtenerClasesPorDia(diaIndex);
    if (clases.length === 0) return [];

    const tiempoInicio = obtenerPuntosDetiempo[0].minutos;
    const tiempoFin = obtenerPuntosDetiempo[obtenerPuntosDetiempo.length - 1].minutos;
    
    const libres = [];
    
    // Espacio libre al principio si la primera clase no comienza al inicio
    const primeraClaseInicio = horaAMinutos(clases[0].hora_inicio);
    if (primeraClaseInicio > tiempoInicio) {
      libres.push({
        hora_inicio: minutosAHora(tiempoInicio),
        hora_fin: clases[0].hora_inicio,
        tipo: 'libre'
      });
    }

    // Espacios libres entre clases
    for (let i = 0; i < clases.length - 1; i++) {
      const finClaseActual = horaAMinutos(clases[i].hora_fin);
      const inicioProximaClase = horaAMinutos(clases[i + 1].hora_inicio);
      
      if (finClaseActual < inicioProximaClase) {
        libres.push({
          hora_inicio: clases[i].hora_fin,
          hora_fin: clases[i + 1].hora_inicio,
          tipo: 'libre'
        });
      }
    }

    // Espacio libre al final si la última clase no termina al final
    const ultimaClaseFin = horaAMinutos(clases[clases.length - 1].hora_fin);
    if (ultimaClaseFin < tiempoFin) {
      libres.push({
        hora_inicio: clases[clases.length - 1].hora_fin,
        hora_fin: minutosAHora(tiempoFin),
        tipo: 'libre'
      });
    }

    return libres;
  };

  // Obtener información de una clase
  const obtenerInfoClase = (horario) => {
    const profesor = profesores.find(p => p.id === horario.profesor_id);
    const materia = materias.find(m => m.id === horario.materia_id);
    const grado = grados.find(g => g.id === horario.grado_id);
    const seccion = secciones.find(s => s.id === horario.seccion_id);

    return { profesor, materia, grado, seccion };
  };

  // Obtener estilos de color para una materia
  const obtenerEstilosMateria = (nombreMateria) => {
    return getMateriaStyles(nombreMateria, 'full');
  };

  // Abrir modal para crear nuevo horario
  const handleCreateClick = (diaIndex, horaStr) => {
    const diaSemana = diasSemanaEn[diaIndex];
    setSelectedDia(diaSemana);
    setEditingHorario(null);
    setShowModal(true);
    // La hora se pasa como string HH:MM desde el timeline
  };

  // Abrir modal para editar horario
  const handleEditClick = (horario) => {
    setEditingHorario(horario);
    setShowModal(true);
  };

  // Eliminar horario
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este horario?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL}/horarios/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Horario eliminado exitosamente');
        onHorarioChange();
      } catch (error) {
        console.error('Error al eliminar horario:', error);
        toast.error('Error al eliminar el horario');
      }
    }
  };

  const handleModalSubmit = async () => {
    await onHorarioChange();
    setEditingHorario(null);
  };

  return (
    <div className="space-y-6">
      {/* Selector de Nivel */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <label className="block text-lg font-bold text-gray-800 mb-4">Nivel Educativo:</label>
        <div className="flex flex-wrap gap-2">
          {obtenerNiveles.map(nivel => (
            <button
              key={nivel}
              onClick={() => {
                setSelectedNivel(nivel);
                setSelectedGrado(null);
                setSelectedSeccion(null);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedNivel === nivel
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {nivel === 'Otros' ? 'Sin Nivel' : nivel}
            </button>
          ))}
        </div>
      </div>

      {/* Pestañas de Grados */}
      {selectedNivel && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <label className="block text-lg font-bold text-gray-800 mb-4">Grado:</label>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {obtenerGradosPorNivel.map(grado => (
              <button
                key={grado.id}
                onClick={() => {
                  setSelectedGrado(grado.id);
                  setSelectedSeccion(null);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  selectedGrado === grado.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {formatearNombreGrado(grado.nombre_grado)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pestañas de Secciones */}
      {selectedGrado && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <label className="block text-lg font-bold text-gray-800 mb-4">Sección:</label>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {obtenerSeccionesPorGrado.map(seccion => (
              <button
                key={seccion.id}
                onClick={() => setSelectedSeccion(seccion.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedSeccion === seccion.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {seccion.nombre_seccion || 'Sección'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendario */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        {/* Header */}
        <div className="mb-3">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FaClock className="mr-3 text-rose-600" />
            Calendario de Horarios
          </h2>
          <p className="text-gray-600 text-xs mt-1">
            {selectedGrado && selectedSeccion
              ? `${formatearNombreGrado(grados.find(g => g.id === selectedGrado)?.nombre_grado)} - Sección ${secciones.find(s => s.id === selectedSeccion)?.nombre_seccion || 'N/A'}`
              : selectedGrado
              ? `${formatearNombreGrado(grados.find(g => g.id === selectedGrado)?.nombre_grado)}`
              : selectedNivel
              ? `Nivel: ${selectedNivel}`
              : 'Selecciona un nivel, grado y sección'}
          </p>
        </div>

        {!selectedSeccion ? (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-800 font-semibold">ℹ️ Por favor selecciona un nivel, grado y sección para ver el horario</p>
          </div>
        ) : horariosFiltrados.length === 0 ? (
          // Vista vacía - Compacta
          <div className="flex gap-4">
            {diasSemana.map((dia, diaIndex) => (
              <div
                key={diaIndex}
                className="flex flex-col border-2 border-dashed border-gray-300 rounded-lg min-w-[200px] h-32"
              >
                <div className="font-bold text-white text-sm bg-gradient-to-br from-rose-600 to-rose-700 h-10 flex items-center justify-center text-center">
                  {dia}
                </div>
                <div
                  className="flex-1 flex items-center justify-center hover:bg-yellow-50 transition-colors cursor-pointer"
                  onClick={() => handleCreateClick(diaIndex, '08:00')}
                >
                  <p className="text-center text-gray-500 text-sm font-semibold px-4">
                    Sin clases, presione para crear una
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Vista Timeline proporcional con clases
          <div className="overflow-x-auto">
            <div className="flex min-w-max">
              {/* Columna de horas - Flujo normal apilado */}
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 border-r-2 border-rose-200 sticky left-0 z-10 min-w-[80px] flex flex-col">
                <div className="font-bold text-white px-2 py-3 text-sm bg-gradient-to-br from-rose-700 to-rose-800 h-14 flex items-center justify-center sticky top-0">
                  Hora
                </div>
                {obtenerPuntosDetiempo.map((punto, idx) => {
                  const alturaSlot = idx < obtenerPuntosDetiempo.length - 1 
                    ? obtenerPuntosDetiempo[idx + 1].pxReal - punto.pxReal
                    : 0;
                  return (
                    <div
                      key={idx}
                      className="text-center text-xs font-bold text-rose-700 px-2 flex items-center justify-center border-t border-rose-200"
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
              <div className="flex">
                {diasSemana.map((dia, diaIndex) => {
                  const clasesPorDia = obtenerClasesPorDia(diaIndex);
                  const alturaTimeline = Math.max(obtenerPuntosDetiempo[obtenerPuntosDetiempo.length - 1].pxReal, 500);

                  return (
                    <div key={diaIndex} className="flex flex-col border-l border-gray-200 min-w-[220px]">
                      <div className="font-bold text-white px-1 py-1 text-sm bg-gradient-to-br from-rose-600 to-rose-700 h-14 flex items-center justify-center text-center sticky top-0 z-20">
                        {dia}
                      </div>
                      
                      {/* Container para timeline con slots apilados */}
                      <div
                        className="relative w-full bg-white hover:bg-rose-50/30 transition-colors"
                        style={{ height: `${alturaTimeline}px` }}
                      >
                        {/* Slots de tiempo apilados - Capa de fondo en flujo normal */}
                        <div className="flex flex-col" style={{ height: `${alturaTimeline}px` }}>
                          {obtenerPuntosDetiempo.map((punto, idx) => {
                            const alturaSlot = idx < obtenerPuntosDetiempo.length - 1 
                              ? obtenerPuntosDetiempo[idx + 1].pxReal - punto.pxReal
                              : 0;
                            return (
                              <div
                                key={`line-${idx}`}
                                className="w-full border-t border-transparent flex-shrink-0 cursor-pointer hover:bg-blue-50/40 transition-colors"
                                style={{
                                  height: `${alturaSlot}px`
                                }}
                                onClick={() => {
                                  setSelectedDia(diasSemanaEn[diaIndex]);
                                  setEditingHorario(null);
                                  setShowModal(true);
                                }}
                                title="Click para crear una clase"
                              />
                            );
                          })}
                        </div>

                        {/* Clases renderizadas - Capa absoluta superpuesta */}
                        <div
                          className="absolute top-0 left-0 w-full cursor-pointer"
                          style={{
                            height: `${alturaTimeline}px`,
                            pointerEvents: 'auto'
                          }}
                          onClick={() => {
                            setSelectedDia(diasSemanaEn[diaIndex]);
                            setEditingHorario(null);
                            setShowModal(true);
                          }}
                        >
                          {clasesPorDia.length > 0 ? (
                            <>
                              {clasesPorDia.map((horario) => {
                                const info = obtenerInfoClase(horario);
                                const nombreMateria = info.materia?.asignatura || 'Materia';
                                const estilosMateria = obtenerEstilosMateria(nombreMateria);
                                const altura = obtenerAlturaClase(horario);
                                const posicion = obtenerPosicionClase(horario);

                                return (
                                  <div
                                    key={horario.id}
                                    className={`absolute left-1 right-1 p-2 rounded border-l-4 shadow-sm hover:shadow-md transition-shadow group overflow-hidden text-xs pointer-events-auto ${estilosMateria.bgColor} ${estilosMateria.textColor}`}
                                    style={{
                                      top: `${posicion}px`,
                                      height: `${Math.max(altura, 50)}px`,
                                      borderLeftColor: 'currentColor'
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                  {/* Contenido */}
                                  <div className="flex flex-col gap-0.5 h-full overflow-hidden">
                                    <div className="font-semibold flex items-center gap-1 truncate">
                                      <MateriaIcon nombreMateria={nombreMateria} size="0.85em" />
                                      <span className="truncate">{nombreMateria}</span>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-75 text-xs truncate">
                                      <FaClock className="w-3 h-3 flex-shrink-0" />
                                      <span className="truncate">{horario.hora_inicio} - {horario.hora_fin}</span>
                                    </div>

                                    {info.profesor && (
                                      <div className="text-xs opacity-75 truncate">
                                        <span className="truncate">{info.profesor.nombre} {info.profesor.apellido}</span>
                                      </div>
                                    )}

                                    {horario.aula && (
                                      <div className="text-xs opacity-75 truncate">
                                        Aula {horario.aula}
                                      </div>
                                    )}

                                    {/* Botones en hover */}
                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditClick(horario);
                                        }}
                                        className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded"
                                      >
                                        <FaEdit size={10} />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(horario.id);
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                                      >
                                        <FaTrash size={10} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Horas libres renderizadas */}
                            {obtenerHorasLibres(diaIndex).map((libre, idx) => {
                              const inicio = horaAMinutos(libre.hora_inicio);
                              const fin = horaAMinutos(libre.hora_fin);
                              
                              // Calcular posición usando pxReal
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
                              
                              const altura = pxRealFin - pxRealInicio;

                              return (
                                <div
                                  key={`libre-${idx}`}
                                  className="absolute left-1 right-1 rounded border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70 transition-colors group flex flex-col items-center justify-center cursor-pointer text-xs text-emerald-700 font-medium pointer-events-auto"
                                  style={{
                                    top: `${pxRealInicio}px`,
                                    height: `${Math.max(altura, 60)}px`
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDia(diasSemanaEn[diaIndex]);
                                    setEditingHorario(null);
                                    setShowModal(true);
                                  }}
                                >
                                  <FaClock size={14} className="mb-1 opacity-60" />
                                  <span className="opacity-75">Libre</span>
                                  <span className="text-xs opacity-60">{libre.hora_inicio} - {libre.hora_fin}</span>
                                </div>
                              );
                            })}
                          </>
                          ) : (
                            <div className="h-full w-full flex items-center justify-center cursor-pointer group" onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDia(diasSemanaEn[diaIndex]);
                              setEditingHorario(null);
                              setShowModal(true);
                            }}>
                              <div className="text-center">
                                <FaPlus size={32} className="mx-auto mb-3 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                <p className="text-gray-500 text-sm font-medium group-hover:text-blue-600 transition-colors">Sin clases</p>
                                <p className="text-gray-400 text-xs mt-1">Presione para crear una</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Leyenda */}
        <div className="mt-6 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200">
          <div className="text-xs text-gray-600 space-y-3">
            <p className="font-semibold text-gray-800">💡 Ayuda:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Vista Timeline Proporcional:</strong> Cada clase ocupa el espacio exacto según su duración</li>
              <li><strong>Altura variable:</strong> Una clase de 90 minutos ocupa más espacio que una de 60 minutos</li>
              <li><strong>Columna de horas:</strong> Muestra todos los puntos de inicio y fin de las clases</li>
              <li><strong>Horas libres:</strong> Zonas verdes punteadas que indican espacios disponibles - click para crear una clase</li>
              <li>Haz hover sobre una clase para ver opciones de edición/eliminación</li>
              <li>Los conflictos de horario se validarán automáticamente en el backend</li>
              <li>Cada materia tiene un color y icono único para fácil identificación</li>
              <li>Se muestra información de: Materia, Hora, Profesor y Aula</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal */}
      <HorariosFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingHorario(null);
          setSelectedDia(null);
        }}
        onSubmit={handleModalSubmit}
        selectedDia={selectedDia}
        selectedGrado={selectedGrado}
        selectedSeccion={selectedSeccion}
        grados={grados}
        materias={materias}
        profesores={profesores}
        secciones={secciones}
        horarios={horarios}
        editingHorario={editingHorario}
      />
    </div>
  );
};

export default HorariosCalendar;