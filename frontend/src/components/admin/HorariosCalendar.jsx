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
  const [showModal, setShowModal] = useState(false);
  const [selectedDia, setSelectedDia] = useState(null);
  const [editingHorario, setEditingHorario] = useState(null);

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const diasSemanaEn = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

  // Filtrar horarios según grado seleccionado
  const horariosFiltrados = useMemo(() => {
    let filtered = [...horarios];
    if (selectedGrado) {
      filtered = filtered.filter(h => h.grado_id === selectedGrado);
    }
    return filtered;
  }, [horarios, selectedGrado]);

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

      const [inicioH] = horario.hora_inicio.split(':').map(Number);
      const [finH] = horario.hora_fin.split(':').map(Number);

      return hora >= inicioH && hora < finH;
    });
  };

  // Obtener espacios libres para un día específico
  const obtenerEspaciosLibresPorDia = (diaIndex) => {
    const dia = diasSemanaEn[diaIndex];
    const clasesDelDia = horariosFiltrados.filter(h => h.dia_semana === dia);
    
    if (clasesDelDia.length === 0) return [];

    // Ordenar clases por hora de inicio
    const clasesOrdenadas = clasesDelDia.sort((a, b) => {
      const [aH, aM] = a.hora_inicio.split(':').map(Number);
      const [bH, bM] = b.hora_inicio.split(':').map(Number);
      return aH * 60 + aM - (bH * 60 + bM);
    });

    const espaciosLibres = [];
    const primeraClase = clasesOrdenadas[0];
    const ultimaClase = clasesOrdenadas[clasesOrdenadas.length - 1];

    // ESPACIO LIBRE ANTES DE LA PRIMERA CLASE
    const [primeraH, primeraM] = primeraClase.hora_inicio.split(':').map(Number);
    if (rangoHoras.inicio < primeraH) {
      espaciosLibres.push({
        tipo: 'libre',
        hora_inicio: `${String(rangoHoras.inicio).padStart(2, '0')}:00`,
        hora_fin: `${String(primeraH).padStart(2, '0')}:${String(primeraM).padStart(2, '0')}`
      });
    }

    // ESPACIOS LIBRES ENTRE CLASES
    let horaActual = null;
    clasesOrdenadas.forEach((clase) => {
      const [inicioH, inicioM] = clase.hora_inicio.split(':').map(Number);
      const [finH, finM] = clase.hora_fin.split(':').map(Number);

      // Si hay gap desde la última clase, agregar espacio libre
      if (horaActual !== null && horaActual < inicioH * 60 + inicioM) {
        const gapInicio = Math.floor(horaActual / 60);
        const gapMinutos = horaActual % 60;
        const gapFin = inicioH;
        
        espaciosLibres.push({
          tipo: 'libre',
          hora_inicio: `${String(gapInicio).padStart(2, '0')}:${String(gapMinutos).padStart(2, '0')}`,
          hora_fin: `${String(gapFin).padStart(2, '0')}:${String(inicioM).padStart(2, '0')}`
        });
      }

      horaActual = finH * 60 + finM;
    });

    // ESPACIO LIBRE DESPUÉS DE LA ÚLTIMA CLASE
    const [ultimaH, ultimaM] = ultimaClase.hora_fin.split(':').map(Number);
    if (ultimaH < rangoHoras.fin) {
      espaciosLibres.push({
        tipo: 'libre',
        hora_inicio: `${String(ultimaH).padStart(2, '0')}:${String(ultimaM).padStart(2, '0')}`,
        hora_fin: `${String(rangoHoras.fin).padStart(2, '0')}:00`
      });
    }

    return espaciosLibres;
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
  const handleCreateClick = (diaIndex, hora) => {
    const diaSemana = diasSemanaEn[diaIndex];
    setSelectedDia(diaSemana);
    setEditingHorario(null);
    setShowModal(true);
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
      {/* Selector de Grado */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-4">
          <label className="text-lg font-bold text-gray-800">Filtrar por Grado:</label>
          <select
            value={selectedGrado || ''}
            onChange={(e) => setSelectedGrado(e.target.value ? Number(e.target.value) : null)}
            className="flex-1 max-w-xs p-3 border-2 border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none transition-colors"
          >
            <option value="">Ver todos los grados</option>
            {grados.map(grado => (
              <option key={grado.id} value={grado.id}>
                {grado.nombre_grado}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 overflow-x-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaClock className="mr-3 text-rose-600" />
            Calendario de Horarios
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            {selectedGrado 
              ? `Grado: ${grados.find(g => g.id === selectedGrado)?.nombre_grado}` 
              : 'Selecciona un grado para ver los horarios'}
          </p>
        </div>

        {horariosFiltrados.length === 0 ? (
          // Tabla vacía con cuadros clickeables
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
              {/* Header */}
              <thead>
                <tr>
                  <th className="bg-gradient-to-br from-rose-700 to-rose-800 text-white font-bold p-4 text-sm w-20 sticky left-0 z-20">
                    Hora
                  </th>
                  {diasSemana.map((dia, index) => (
                    <th
                      key={index}
                      className="bg-gradient-to-br from-rose-600 to-rose-700 text-white font-bold p-4 text-sm min-w-[150px] border-l border-rose-500/30"
                    >
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {horas.map((hora) => (
                  <tr key={hora} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                    {/* Hora */}
                    <td className="bg-gradient-to-br from-rose-50 to-rose-100 font-semibold text-rose-700 p-4 text-center text-sm sticky left-0 z-10 border-r border-rose-200">
                      {String(hora).padStart(2, '0')}:00
                    </td>

                    {/* Días */}
                    {diasSemana.map((_, diaIndex) => (
                      <td
                        key={diaIndex}
                        className="p-3 border-l border-gray-200 min-w-[150px] align-top bg-white hover:bg-rose-50/30 transition-colors cursor-pointer"
                        onClick={() => handleCreateClick(diaIndex, hora)}
                      >
                        <div className="h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-rose-500 hover:bg-rose-50 transition-all">
                          <button className="flex flex-col items-center gap-2 text-gray-500 hover:text-rose-600 transition-colors">
                            <FaPlus size={20} />
                            <span className="text-xs text-center">Haga click<br/>para crear</span>
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Tabla con horarios
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
              {/* Header */}
              <thead>
                <tr>
                  <th className="bg-gradient-to-br from-rose-700 to-rose-800 text-white font-bold p-4 text-sm w-20 sticky left-0 z-20">
                    Hora
                  </th>
                  {diasSemana.map((dia, index) => (
                    <th
                      key={index}
                      className="bg-gradient-to-br from-rose-600 to-rose-700 text-white font-bold p-4 text-sm min-w-[180px] border-l border-rose-500/30"
                    >
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {horas.map((hora) => (
                  <tr key={hora} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                    {/* Hora */}
                    <td className="bg-gradient-to-br from-rose-50 to-rose-100 font-semibold text-rose-700 p-4 text-center text-sm sticky left-0 z-10 border-r border-rose-200">
                      {String(hora).padStart(2, '0')}:00
                    </td>

                    {/* Días */}
                    {diasSemana.map((_, diaIndex) => {
                      const clasesEnCelda = obtenerClasesEnCelda(diaIndex, hora);
                      const espaciosLibres = obtenerEspaciosLibresPorDia(diaIndex);
                      
                      // Filtrar espacios libres que caen en esta hora
                      const espaciosLibresEnEstaHora = espaciosLibres.filter((evento) => {
                        const [inicioH, inicioM] = evento.hora_inicio.split(':').map(Number);
                        const [finH, finM] = evento.hora_fin.split(':').map(Number);
                        return (hora >= inicioH && hora < finH) || (inicioH === hora);
                      });

                      return (
                        <td
                          key={diaIndex}
                          className="p-2 border-l border-gray-200 min-w-[200px] align-top bg-white hover:bg-rose-50/30 transition-colors"
                          onClick={() => clasesEnCelda.length === 0 && espaciosLibresEnEstaHora.length === 0 && handleCreateClick(diaIndex, hora)}
                        >
                          {clasesEnCelda.length > 0 || espaciosLibresEnEstaHora.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {/* Mostrar clases */}
                              {clasesEnCelda.map((horario) => {
                                const info = obtenerInfoClase(horario);
                                const nombreMateria = info.materia?.asignatura || 'Materia';
                                const estilosMateria = obtenerEstilosMateria(nombreMateria);

                                return (
                                  <div
                                    key={horario.id}
                                    className={`border-l-4 p-2 rounded-r text-xs shadow-sm hover:shadow-md transition-shadow group relative border ${estilosMateria.bgColor} ${estilosMateria.textColor}`}
                                    style={{ borderLeftColor: estilosMateria.textColor.replace('text-', '') }}
                                  >
                                    {/* Contenido */}
                                    <div className="flex items-start justify-between mb-1">
                                      <div className="font-semibold text-sm flex items-center gap-1">
                                        <MateriaIcon nombreMateria={nombreMateria} size="0.9em" />
                                        <span className="truncate">{nombreMateria}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 text-xs opacity-75 mb-1">
                                      <FaClock className="w-3 h-3" />
                                      <span>{horario.hora_inicio} - {horario.hora_fin}</span>
                                    </div>

                                    {info.profesor && (
                                      <div className="flex items-center gap-1 text-xs opacity-75 mb-1 truncate">
                                        <FaChalkboardTeacher className="w-3 h-3 flex-shrink-0" />
                                        <span className="truncate">{info.profesor.nombre} {info.profesor.apellido}</span>
                                      </div>
                                    )}

                                    {info.grado && (
                                      <div className="flex items-center gap-1 text-xs opacity-75 mb-1">
                                        <FaBook className="w-3 h-3 flex-shrink-0" />
                                        <span>{info.grado.nombre_grado}</span>
                                      </div>
                                    )}

                                    {info.seccion && (
                                      <div className="flex items-center gap-1 text-xs opacity-75 mb-1">
                                        <span className="font-medium">Sección: {info.seccion.nombre}</span>
                                      </div>
                                    )}

                                    {horario.aula && (
                                      <div className="flex items-center gap-1 text-xs opacity-75">
                                        <FaMapMarkerAlt className="w-3 h-3 flex-shrink-0" />
                                        <span>Aula {horario.aula}</span>
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
                                        <FaEdit size={12} />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(horario.id);
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                                      >
                                        <FaTrash size={12} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                              
                              {/* Mostrar espacios libres si existen */}
                              {espaciosLibresEnEstaHora.map((evento, idx) => (
                                <div
                                  key={`libre-${idx}`}
                                  className="border-2 border-dashed border-gray-300 p-2 rounded text-xs text-center text-gray-500 bg-gray-50 hover:bg-yellow-50 hover:border-yellow-400 transition-colors cursor-pointer group"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCreateClick(diaIndex, hora);
                                  }}
                                >
                                  <span className="flex items-center justify-center gap-1">
                                    ⏱️ Libre: {evento.hora_inicio} - {evento.hora_fin}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-rose-500 hover:bg-rose-50 transition-all cursor-pointer">
                              <button className="flex flex-col items-center gap-2 text-gray-400 hover:text-rose-600 transition-colors">
                                <FaPlus size={16} />
                                <span className="text-xs">Crear</span>
                              </button>
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
            <div className="text-xs text-gray-600 space-y-3">
              <p className="font-semibold text-gray-800">💡 Ayuda:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Haz click en un cuadro vacío para crear una nueva clase</li>
                <li>Haz hover sobre una clase para ver opciones de edición/eliminación</li>
                <li>Los conflictos de horario se validarán automáticamente</li>
                <li>Los espacios libres entre clases se muestran automáticamente con el ícono ⏱️</li>
                <li>Cada materia tiene un color y icono único para fácil identificación</li>
                <li>Se muestra información de: Profesor, Grado, Sección y Aula</li>
              </ul>
            </div>
          </div>
        )}
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