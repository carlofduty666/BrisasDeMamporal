import { FaTimes, FaChartLine, FaBook, FaTrophy, FaExclamationCircle, FaStar, FaChartBar } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const ProgresoAcademicoDetalleModal = ({ isOpen, onClose, calificaciones }) => {
  const [materiaStats, setMateriaStats] = useState([]);
  const [ordenarPor, setOrdenarPor] = useState('promedio');
  const [mostrarSolo, setMostrarSolo] = useState('todas');

  useEffect(() => {
    if (calificaciones && calificaciones.length > 0) {
      const materiaMap = {};

      calificaciones.forEach(calif => {
        const materia = calif.Evaluaciones?.Materias?.asignatura || 'Sin materia';
        const materiaID = calif.Evaluaciones?.Materias?.id || 'sin-id';
        const nota = parseFloat(calif.calificacion) || 0;
        const lapso = calif.Evaluaciones?.lapso || null;

        if (!materiaMap[materiaID]) {
          materiaMap[materiaID] = {
            id: materiaID,
            nombre: materia,
            notas: [],
            notasPorLapso: { 1: [], 2: [], 3: [] },
            promedio: 0,
            totalEvaluaciones: 0,
            mejorNota: 0,
            peorNota: 20
          };
        }

        materiaMap[materiaID].notas.push(nota);
        if (lapso) {
          materiaMap[materiaID].notasPorLapso[lapso].push(nota);
        }
        materiaMap[materiaID].totalEvaluaciones++;
      });

      const statsArray = Object.values(materiaMap).map(materia => {
        const suma = materia.notas.reduce((acc, nota) => acc + nota, 0);
        const promedio = suma / materia.notas.length;
        const mejorNota = Math.max(...materia.notas);
        const peorNota = Math.min(...materia.notas);
        
        const promediosPorLapso = {};
        [1, 2, 3].forEach(lapso => {
          if (materia.notasPorLapso[lapso].length > 0) {
            const sumaLapso = materia.notasPorLapso[lapso].reduce((a, b) => a + b, 0);
            promediosPorLapso[lapso] = (sumaLapso / materia.notasPorLapso[lapso].length).toFixed(2);
          }
        });

        return {
          ...materia,
          promedio: promedio.toFixed(2),
          mejorNota: mejorNota.toFixed(2),
          peorNota: peorNota.toFixed(2),
          promediosPorLapso
        };
      });

      setMateriaStats(statsArray);
    }
  }, [calificaciones]);

  const getPromedioColor = (promedio) => {
    const prom = parseFloat(promedio);
    if (prom >= 16) return 'from-green-500 to-emerald-600';
    if (prom >= 14) return 'from-blue-500 to-blue-600';
    if (prom >= 10) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getProgressBarColor = (promedio) => {
    const prom = parseFloat(promedio);
    if (prom >= 16) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (prom >= 14) return 'bg-gradient-to-r from-blue-500 to-blue-600';
    if (prom >= 10) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    return 'bg-gradient-to-r from-red-500 to-red-600';
  };

  const getIconoEstado = (promedio) => {
    const prom = parseFloat(promedio);
    if (prom >= 16) return <FaTrophy className="text-green-400 text-2xl" />;
    if (prom >= 14) return <FaStar className="text-blue-400 text-2xl" />;
    if (prom >= 10) return <FaBook className="text-yellow-400 text-2xl" />;
    return <FaExclamationCircle className="text-red-400 text-2xl" />;
  };

  const getMateriasOrdenadas = () => {
    let materias = [...materiaStats];
    
    if (mostrarSolo === 'aprobadas') {
      materias = materias.filter(m => parseFloat(m.promedio) >= 10);
    } else if (mostrarSolo === 'reprobadas') {
      materias = materias.filter(m => parseFloat(m.promedio) < 10);
    }

    switch (ordenarPor) {
      case 'promedio':
        return materias.sort((a, b) => parseFloat(b.promedio) - parseFloat(a.promedio));
      case 'nombre':
        return materias.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'evaluaciones':
        return materias.sort((a, b) => b.totalEvaluaciones - a.totalEvaluaciones);
      default:
        return materias;
    }
  };

  const calcularEstadisticasGenerales = () => {
    if (materiaStats.length === 0) return null;

    const promedios = materiaStats.map(m => parseFloat(m.promedio));
    const promedioGeneral = (promedios.reduce((a, b) => a + b, 0) / promedios.length).toFixed(2);
    const mejorPromedio = Math.max(...promedios).toFixed(2);
    const peorPromedio = Math.min(...promedios).toFixed(2);
    const aprobadas = promedios.filter(p => p >= 10).length;
    const reprobadas = promedios.filter(p => p < 10).length;

    return { promedioGeneral, mejorPromedio, peorPromedio, aprobadas, reprobadas, total: materiaStats.length };
  };

  if (!isOpen) return null;

  const materiasOrdenadas = getMateriasOrdenadas();
  const stats = calcularEstadisticasGenerales();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaChartLine className="text-3xl text-white" />
            <h2 className="text-2xl font-bold text-white">Progreso Académico Detallado</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Estadísticas Generales */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-center">
                <FaChartBar className="text-3xl text-white/80 mx-auto mb-2" />
                <p className="text-white/80 text-xs mb-1">Promedio General</p>
                <p className="text-3xl font-bold text-white">{stats.promedioGeneral}</p>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 text-center">
                <FaTrophy className="text-3xl text-white/80 mx-auto mb-2" />
                <p className="text-white/80 text-xs mb-1">Mejor Promedio</p>
                <p className="text-3xl font-bold text-white">{stats.mejorPromedio}</p>
              </div>
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4 text-center">
                <FaExclamationCircle className="text-3xl text-white/80 mx-auto mb-2" />
                <p className="text-white/80 text-xs mb-1">Menor Promedio</p>
                <p className="text-3xl font-bold text-white">{stats.peorPromedio}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4 text-center">
                <FaStar className="text-3xl text-white/80 mx-auto mb-2" />
                <p className="text-white/80 text-xs mb-1">Aprobadas</p>
                <p className="text-3xl font-bold text-white">{stats.aprobadas}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4 text-center">
                <FaBook className="text-3xl text-white/80 mx-auto mb-2" />
                <p className="text-white/80 text-xs mb-1">Total Materias</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          )}

          {/* Controles */}
          <div className="bg-slate-700/30 rounded-xl p-4 mb-6 border border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Ordenar por</label>
                <select
                  value={ordenarPor}
                  onChange={(e) => setOrdenarPor(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="promedio">Promedio (Mayor a Menor)</option>
                  <option value="nombre">Nombre (A-Z)</option>
                  <option value="evaluaciones">Número de Evaluaciones</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Mostrar</label>
                <select
                  value={mostrarSolo}
                  onChange={(e) => setMostrarSolo(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="todas">Todas las materias</option>
                  <option value="aprobadas">Solo aprobadas (≥10)</option>
                  <option value="reprobadas">Solo reprobadas (&lt;10)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Materias */}
          <div className="space-y-4">
            {materiasOrdenadas.length > 0 ? (
              materiasOrdenadas.map((materia, index) => (
                <div
                  key={index}
                  className="bg-slate-700/30 rounded-xl p-5 border border-slate-600 transition-all duration-300 hover:bg-slate-700/50 hover:border-purple-500 hover:shadow-lg"
                >
                  {/* Encabezado de Materia */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      {getIconoEstado(materia.promedio)}
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1">
                          {materia.nombre}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {materia.totalEvaluaciones} evaluación{materia.totalEvaluaciones !== 1 ? 'es' : ''}
                        </p>
                      </div>
                    </div>
                    <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${getPromedioColor(materia.promedio)} flex items-center justify-center shadow-lg`}>
                      <span className="text-white font-bold text-2xl">
                        {parseFloat(materia.promedio).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Estadísticas de Materia */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-700/50 rounded-lg p-3 border border-green-500/30">
                      <p className="text-slate-400 text-xs mb-1">Mejor Nota</p>
                      <p className="text-green-400 font-bold text-xl">{materia.mejorNota}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 border border-red-500/30">
                      <p className="text-slate-400 text-xs mb-1">Nota Mínima</p>
                      <p className="text-red-400 font-bold text-xl">{materia.peorNota}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-3 border border-blue-500/30">
                      <p className="text-slate-400 text-xs mb-1">Evaluaciones</p>
                      <p className="text-blue-400 font-bold text-xl">{materia.totalEvaluaciones}</p>
                    </div>
                  </div>

                  {/* Promedios por Lapso */}
                  {Object.keys(materia.promediosPorLapso).length > 0 && (
                    <div className="mb-4">
                      <p className="text-slate-400 text-sm mb-2 font-semibold">Promedios por Lapso:</p>
                      <div className="flex gap-2">
                        {[1, 2, 3].map(lapso => (
                          materia.promediosPorLapso[lapso] && (
                            <div key={lapso} className="flex-1 bg-slate-700/50 rounded-lg p-2 border border-slate-600 text-center">
                              <p className="text-slate-400 text-xs mb-1">Lapso {lapso}</p>
                              <p className="text-white font-bold text-lg">{materia.promediosPorLapso[lapso]}</p>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Barra de Progreso */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>0</span>
                      <span className="text-white font-semibold">Promedio: {materia.promedio}</span>
                      <span>20</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full ${getProgressBarColor(materia.promedio)} transition-all duration-500 ease-out`}
                        style={{ width: `${(parseFloat(materia.promedio) / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Mini Indicadores de Últimas Notas */}
                  <div>
                    <p className="text-slate-400 text-xs mb-2 font-semibold">Últimas 10 notas:</p>
                    <div className="flex gap-1 flex-wrap">
                      {materia.notas.slice(-10).map((nota, idx) => (
                        <div
                          key={idx}
                          className={`w-10 h-10 rounded-lg ${
                            nota >= 16 ? 'bg-green-500/30 border border-green-500' :
                            nota >= 14 ? 'bg-blue-500/30 border border-blue-500' :
                            nota >= 10 ? 'bg-yellow-500/30 border border-yellow-500' :
                            'bg-red-500/30 border border-red-500'
                          } flex items-center justify-center text-white text-xs font-semibold transition-all duration-300 hover:scale-110`}
                          title={`Nota: ${nota}`}
                        >
                          {nota.toFixed(0)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FaChartLine className="text-6xl text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No hay materias con los filtros seleccionados</p>
              </div>
            )}
          </div>

          {/* Leyenda */}
          <div className="mt-6 bg-slate-700/20 rounded-xl p-4 border border-slate-600">
            <p className="text-slate-300 text-sm mb-3 font-semibold">Escala de Calificación:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-emerald-500" />
                <span className="text-slate-300 text-sm">16-20 (Excelente)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-blue-600" />
                <span className="text-slate-300 text-sm">14-15 (Bueno)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-500 to-yellow-600" />
                <span className="text-slate-300 text-sm">10-13 (Regular)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 to-red-600" />
                <span className="text-slate-300 text-sm">0-9 (Insuficiente)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgresoAcademicoDetalleModal;
