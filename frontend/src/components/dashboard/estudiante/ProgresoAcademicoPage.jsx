import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChartLine, FaBook, FaTrophy, FaExclamationCircle, FaStar, FaChartBar, FaSpinner } from 'react-icons/fa';

const ProgresoAcademicoPage = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [materiaStats, setMateriaStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ordenarPor, setOrdenarPor] = useState('promedio');
  const [mostrarSolo, setMostrarSolo] = useState('todas');

  useEffect(() => {
    const fetchCalificaciones = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const userData = JSON.parse(atob(token.split('.')[1]));
        const estudianteID = userData.personaID;

        const annoResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/anno-escolar/actual`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        const annoEscolarID = annoResponse.data.id;

        const calificacionesResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/calificaciones/estudiante/${estudianteID}?annoEscolarID=${annoEscolarID}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setCalificaciones(calificacionesResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar calificaciones:', err);
        setError('Error al cargar calificaciones. Por favor, intente nuevamente.');
        setLoading(false);
      }
    };

    fetchCalificaciones();
  }, []);

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
    if (prom >= 16) return <FaTrophy className="text-green-600 text-2xl" />;
    if (prom >= 14) return <FaStar className="text-blue-600 text-2xl" />;
    if (prom >= 10) return <FaBook className="text-yellow-600 text-2xl" />;
    return <FaExclamationCircle className="text-red-600 text-2xl" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-slate-800 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Cargando progreso académico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  const materiasOrdenadas = getMateriasOrdenadas();
  const stats = calcularEstadisticasGenerales();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <FaChartLine className="text-4xl text-slate-800" />
          <h1 className="text-3xl font-bold text-slate-800">Materias y Progreso Académico</h1>
        </div>

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
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Ordenar por</label>
              <select
                value={ordenarPor}
                onChange={(e) => setOrdenarPor(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="promedio">Promedio (Mayor a Menor)</option>
                <option value="nombre">Nombre (A-Z)</option>
                <option value="evaluaciones">Número de Evaluaciones</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Mostrar</label>
              <select
                value={mostrarSolo}
                onChange={(e) => setMostrarSolo(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="todas">Todas las materias</option>
                <option value="aprobadas">Solo aprobadas (≥10)</option>
                <option value="reprobadas">Solo reprobadas (&lt;10)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Materias */}
      <div className="space-y-4">
        {materiasOrdenadas.length > 0 ? (
          materiasOrdenadas.map((materia, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 border border-slate-200 transition-all duration-300 hover:shadow-lg hover:border-purple-500"
            >
              {/* Encabezado de Materia */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  {getIconoEstado(materia.promedio)}
                  <div className="flex-1">
                    <h3 className="text-slate-800 font-bold text-lg mb-1">
                      {materia.nombre}
                    </h3>
                    <p className="text-slate-500 text-sm">
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
                <div className="bg-slate-50 rounded-lg p-3 border border-green-200">
                  <p className="text-slate-500 text-xs mb-1">Mejor Nota</p>
                  <p className="text-green-600 font-bold text-xl">{materia.mejorNota}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-red-200">
                  <p className="text-slate-500 text-xs mb-1">Nota Mínima</p>
                  <p className="text-red-600 font-bold text-xl">{materia.peorNota}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-blue-200">
                  <p className="text-slate-500 text-xs mb-1">Evaluaciones</p>
                  <p className="text-blue-600 font-bold text-xl">{materia.totalEvaluaciones}</p>
                </div>
              </div>

              {/* Promedios por Lapso */}
              {Object.keys(materia.promediosPorLapso).length > 0 && (
                <div className="mb-4">
                  <p className="text-slate-600 text-sm mb-2 font-semibold">Promedios por Lapso:</p>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(lapso => (
                      materia.promediosPorLapso[lapso] && (
                        <div key={lapso} className="flex-1 bg-slate-50 rounded-lg p-2 border border-slate-200 text-center">
                          <p className="text-slate-500 text-xs mb-1">Lapso {lapso}</p>
                          <p className="text-slate-800 font-bold text-lg">{materia.promediosPorLapso[lapso]}</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Barra de Progreso */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>0</span>
                  <span className="text-slate-800 font-semibold">Promedio: {materia.promedio}</span>
                  <span>20</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full ${getProgressBarColor(materia.promedio)} transition-all duration-500 ease-out`}
                    style={{ width: `${(parseFloat(materia.promedio) / 20) * 100}%` }}
                  />
                </div>
              </div>

              {/* Mini Indicadores de Últimas Notas */}
              <div>
                <p className="text-slate-600 text-xs mb-2 font-semibold">Últimas 10 notas:</p>
                <div className="flex gap-1 flex-wrap">
                  {materia.notas.slice(-10).map((nota, idx) => (
                    <div
                      key={idx}
                      className={`w-10 h-10 rounded-lg ${
                        nota >= 16 ? 'bg-green-100 border border-green-500 text-green-700' :
                        nota >= 14 ? 'bg-blue-100 border border-blue-500 text-blue-700' :
                        nota >= 10 ? 'bg-yellow-100 border border-yellow-500 text-yellow-700' :
                        'bg-red-100 border border-red-500 text-red-700'
                      } flex items-center justify-center text-xs font-semibold transition-all duration-300 hover:scale-110`}
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
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <FaChartLine className="text-6xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No hay materias con los filtros seleccionados</p>
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-6 bg-white rounded-xl p-4 border border-slate-200">
        <p className="text-slate-700 text-sm mb-3 font-semibold">Escala de Calificación:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-emerald-500" />
            <span className="text-slate-700 text-sm">16-20 (Excelente)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-blue-600" />
            <span className="text-slate-700 text-sm">14-15 (Bueno)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-yellow-500 to-yellow-600" />
            <span className="text-slate-700 text-sm">10-13 (Regular)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 to-red-600" />
            <span className="text-slate-700 text-sm">0-9 (Insuficiente)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgresoAcademicoPage;
