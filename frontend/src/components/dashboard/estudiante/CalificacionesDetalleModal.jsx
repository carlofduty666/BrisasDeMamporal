import { FaTimes, FaChartBar, FaTrophy, FaStar, FaBook, FaCalendarAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const CalificacionesDetalleModal = ({ isOpen, onClose, calificaciones }) => {
  const [calificacionesAgrupadas, setCalificacionesAgrupadas] = useState([]);
  const [filtroMateria, setFiltroMateria] = useState('todas');
  const [filtroLapso, setFiltroLapso] = useState('todos');

  useEffect(() => {
    if (calificaciones && calificaciones.length > 0) {
      const agrupadas = agruparCalificaciones(calificaciones);
      setCalificacionesAgrupadas(agrupadas);
    }
  }, [calificaciones]);

  const agruparCalificaciones = (califs) => {
    const map = {};
    califs.forEach(calif => {
      const materia = calif.Evaluaciones?.Materias?.asignatura || 'Sin materia';
      if (!map[materia]) {
        map[materia] = [];
      }
      map[materia].push(calif);
    });
    return Object.entries(map).map(([materia, notas]) => ({
      materia,
      notas: notas.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    }));
  };

  const getMaterias = () => {
    return [...new Set(calificaciones.map(c => c.Evaluaciones?.Materias?.asignatura || 'Sin materia'))];
  };

  const getLapsos = () => {
    return [...new Set(calificaciones.map(c => c.Evaluaciones?.lapso).filter(Boolean))];
  };

  const getCalificacionesFiltradas = () => {
    let filtradas = [...calificaciones];
    
    if (filtroMateria !== 'todas') {
      filtradas = filtradas.filter(c => 
        (c.Evaluaciones?.Materias?.asignatura || 'Sin materia') === filtroMateria
      );
    }
    
    if (filtroLapso !== 'todos') {
      filtradas = filtradas.filter(c => 
        c.Evaluaciones?.lapso?.toString() === filtroLapso
      );
    }
    
    return filtradas;
  };

  const getNotaColor = (nota) => {
    const n = parseFloat(nota);
    if (n >= 16) return 'text-green-400 bg-green-500/20 border-green-500';
    if (n >= 14) return 'text-blue-400 bg-blue-500/20 border-blue-500';
    if (n >= 10) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500';
    return 'text-red-400 bg-red-500/20 border-red-500';
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-VE', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const calcularEstadisticas = () => {
    const califs = getCalificacionesFiltradas();
    if (califs.length === 0) return null;

    const notas = califs.map(c => parseFloat(c.calificacion) || 0);
    const promedio = (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2);
    const mejorNota = Math.max(...notas).toFixed(2);
    const peorNota = Math.min(...notas).toFixed(2);
    const aprobadas = notas.filter(n => n >= 10).length;
    const tasaAprobacion = ((aprobadas / notas.length) * 100).toFixed(0);

    return { promedio, mejorNota, peorNota, aprobadas, total: notas.length, tasaAprobacion };
  };

  if (!isOpen) return null;

  const stats = calcularEstadisticas();
  const califsFiltradas = getCalificacionesFiltradas();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaChartBar className="text-3xl text-white" />
            <h2 className="text-2xl font-bold text-white">Detalle de Calificaciones</h2>
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
                <p className="text-white/80 text-xs mb-1">Promedio</p>
                <p className="text-3xl font-bold text-white">{stats.promedio}</p>
              </div>
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 text-center">
                <FaTrophy className="text-3xl text-white/80 mx-auto mb-2" />
                <p className="text-white/80 text-xs mb-1">Mejor Nota</p>
                <p className="text-3xl font-bold text-white">{stats.mejorNota}</p>
              </div>
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4 text-center">
                <FaStar className="text-3xl text-white/80 mx-auto mb-2" />
                <p className="text-white/80 text-xs mb-1">Nota Mínima</p>
                <p className="text-3xl font-bold text-white">{stats.peorNota}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 text-center">
                <FaBook className="text-3xl text-white/80 mx-auto mb-2" />
                <p className="text-white/80 text-xs mb-1">Evaluaciones</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4 text-center">
                <FaStar className="text-3xl text-white/80 mx-auto mb-2" />
                <p className="text-white/80 text-xs mb-1">Tasa Aprobación</p>
                <p className="text-3xl font-bold text-white">{stats.tasaAprobacion}%</p>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-slate-700/30 rounded-xl p-4 mb-6 border border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Filtrar por Materia</label>
                <select
                  value={filtroMateria}
                  onChange={(e) => setFiltroMateria(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="todas">Todas las materias</option>
                  {getMaterias().map(materia => (
                    <option key={materia} value={materia}>{materia}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Filtrar por Lapso</label>
                <select
                  value={filtroLapso}
                  onChange={(e) => setFiltroLapso(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="todos">Todos los lapsos</option>
                  {getLapsos().map(lapso => (
                    <option key={lapso} value={lapso}>Lapso {lapso}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Calificaciones */}
          <div className="space-y-4">
            {califsFiltradas.length > 0 ? (
              califsFiltradas.map((calif, index) => (
                <div
                  key={index}
                  className="bg-slate-700/30 rounded-xl p-5 border border-slate-600 hover:bg-slate-700/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FaBook className="text-green-400" />
                        <h3 className="text-white font-semibold text-lg">
                          {calif.Evaluaciones?.nombreEvaluacion || 'Evaluación'}
                        </h3>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-slate-300">
                          <span className="text-slate-400">Materia:</span> {calif.Evaluaciones?.Materias?.asignatura || 'N/A'}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Tipo:</span> {calif.Evaluaciones?.tipoEvaluacion || 'N/A'}
                        </p>
                        <p className="text-slate-300">
                          <span className="text-slate-400">Lapso:</span> {calif.Evaluaciones?.lapso || 'N/A'}
                        </p>
                        <div className="flex items-center gap-2 text-slate-400">
                          <FaCalendarAlt className="text-xs" />
                          <span>{formatFecha(calif.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`w-24 h-24 rounded-xl border-2 ${getNotaColor(calif.calificacion)} flex flex-col items-center justify-center font-bold`}>
                      <span className="text-3xl">{parseFloat(calif.calificacion).toFixed(1)}</span>
                      <span className="text-xs opacity-80">/ 20</span>
                    </div>
                  </div>
                  {calif.observaciones && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <p className="text-slate-400 text-sm">
                        <span className="font-semibold">Observaciones:</span> {calif.observaciones}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FaChartBar className="text-6xl text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No hay calificaciones con los filtros seleccionados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalificacionesDetalleModal;
