import { FaTimes, FaTasks, FaCalendarAlt, FaBook, FaClock, FaCheckCircle, FaExclamationTriangle, FaDownload, FaFileAlt } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const EvaluacionesDetalleModal = ({ isOpen, onClose, evaluaciones }) => {
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroMateria, setFiltroMateria] = useState('todas');
  const [evaluacionesProcesadas, setEvaluacionesProcesadas] = useState([]);

  useEffect(() => {
    if (evaluaciones && evaluaciones.length > 0) {
      const hoy = new Date();
      
      const evaluacionesConEstado = evaluaciones.map(evaluacion => {
        const fechaEval = new Date(evaluacion.fechaEvaluacion);
        const diasRestantes = Math.ceil((fechaEval - hoy) / (1000 * 60 * 60 * 24));
        
        let estado = 'completada';
        if (diasRestantes > 0) {
          estado = 'proxima';
        } else if (diasRestantes === 0) {
          estado = 'hoy';
        }
        
        return {
          ...evaluacion,
          diasRestantes,
          estado
        };
      });

      const ordenadas = evaluacionesConEstado.sort((a, b) => {
        return new Date(b.fechaEvaluacion) - new Date(a.fechaEvaluacion);
      });

      setEvaluacionesProcesadas(ordenadas);
    }
  }, [evaluaciones]);

  const getMaterias = () => {
    return [...new Set(evaluaciones.map(e => e.Materias?.asignatura || 'Sin materia'))];
  };

  const getEvaluacionesFiltradas = () => {
    let filtradas = [...evaluacionesProcesadas];
    
    if (filtroEstado !== 'todas') {
      filtradas = filtradas.filter(e => e.estado === filtroEstado);
    }
    
    if (filtroMateria !== 'todas') {
      filtradas = filtradas.filter(e => 
        (e.Materias?.asignatura || 'Sin materia') === filtroMateria
      );
    }
    
    return filtradas;
  };

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-VE', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      weekday: 'long'
    });
  };

  const getEstadoBadge = (evaluacion) => {
    if (evaluacion.estado === 'hoy') {
      return (
        <span className="px-3 py-1.5 bg-red-500/20 border border-red-500 text-red-400 text-sm rounded-full flex items-center gap-2 font-semibold">
          <FaClock />
          Hoy
        </span>
      );
    } else if (evaluacion.estado === 'proxima') {
      const color = evaluacion.diasRestantes <= 3 ? 'yellow' : 'blue';
      return (
        <span className={`px-3 py-1.5 bg-${color}-500/20 border border-${color}-500 text-${color}-400 text-sm rounded-full flex items-center gap-2 font-semibold`}>
          <FaClock />
          En {evaluacion.diasRestantes} día{evaluacion.diasRestantes !== 1 ? 's' : ''}
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1.5 bg-green-500/20 border border-green-500 text-green-400 text-sm rounded-full flex items-center gap-2 font-semibold">
          <FaCheckCircle />
          Completada
        </span>
      );
    }
  };

  const getTipoColor = (tipo) => {
    const tipos = {
      'examen': 'bg-red-500/20 text-red-400 border-red-500',
      'quiz': 'bg-blue-500/20 text-blue-400 border-blue-500',
      'taller': 'bg-green-500/20 text-green-400 border-green-500',
      'proyecto': 'bg-purple-500/20 text-purple-400 border-purple-500',
      'exposicion': 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
      'trabajo': 'bg-pink-500/20 text-pink-400 border-pink-500'
    };
    return tipos[tipo?.toLowerCase()] || 'bg-slate-500/20 text-slate-400 border-slate-500';
  };

  const getLapsoColor = (lapso) => {
    const lapsos = {
      '1': 'bg-blue-500/20 text-blue-400 border-blue-500',
      '2': 'bg-purple-500/20 text-purple-400 border-purple-500',
      '3': 'bg-green-500/20 text-green-400 border-green-500'
    };
    return lapsos[lapso?.toString()] || 'bg-slate-500/20 text-slate-400 border-slate-500';
  };

  if (!isOpen) return null;

  const evalsFiltradas = getEvaluacionesFiltradas();
  const proximas = evalsFiltradas.filter(e => e.estado === 'proxima' || e.estado === 'hoy').length;
  const completadas = evalsFiltradas.filter(e => e.estado === 'completada').length;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaTasks className="text-3xl text-white" />
            <h2 className="text-2xl font-bold text-white">Detalle de Evaluaciones</h2>
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
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-center">
              <FaTasks className="text-3xl text-white/80 mx-auto mb-2" />
              <p className="text-white/80 text-xs mb-1">Total</p>
              <p className="text-3xl font-bold text-white">{evalsFiltradas.length}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4 text-center">
              <FaClock className="text-3xl text-white/80 mx-auto mb-2" />
              <p className="text-white/80 text-xs mb-1">Próximas</p>
              <p className="text-3xl font-bold text-white">{proximas}</p>
            </div>
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 text-center">
              <FaCheckCircle className="text-3xl text-white/80 mx-auto mb-2" />
              <p className="text-white/80 text-xs mb-1">Completadas</p>
              <p className="text-3xl font-bold text-white">{completadas}</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-slate-700/30 rounded-xl p-4 mb-6 border border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Filtrar por Estado</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="todas">Todas</option>
                  <option value="hoy">Hoy</option>
                  <option value="proxima">Próximas</option>
                  <option value="completada">Completadas</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Filtrar por Materia</label>
                <select
                  value={filtroMateria}
                  onChange={(e) => setFiltroMateria(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="todas">Todas las materias</option>
                  {getMaterias().map(materia => (
                    <option key={materia} value={materia}>{materia}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Alerta de evaluaciones urgentes */}
          {evalsFiltradas.some(e => e.diasRestantes <= 3 && (e.estado === 'proxima' || e.estado === 'hoy')) && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-3">
              <FaExclamationTriangle className="text-yellow-400 text-2xl flex-shrink-0" />
              <div>
                <p className="text-yellow-400 font-semibold">¡Atención!</p>
                <p className="text-yellow-400/80 text-sm">
                  Tienes evaluaciones próximas en los próximos 3 días. ¡Prepárate!
                </p>
              </div>
            </div>
          )}

          {/* Lista de Evaluaciones */}
          <div className="space-y-4">
            {evalsFiltradas.length > 0 ? (
              evalsFiltradas.map((evaluacion, index) => (
                <div
                  key={index}
                  className={`bg-slate-700/30 rounded-xl p-5 border transition-all duration-300 hover:bg-slate-700/50 ${
                    evaluacion.estado === 'hoy' 
                      ? 'border-red-500 shadow-lg shadow-red-500/20' 
                      : evaluacion.diasRestantes <= 3 && evaluacion.estado === 'proxima'
                      ? 'border-yellow-500 shadow-lg shadow-yellow-500/20'
                      : 'border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FaBook className="text-orange-400 text-xl" />
                        <h3 className="text-white font-bold text-xl">
                          {evaluacion.nombreEvaluacion}
                        </h3>
                      </div>
                      <p className="text-slate-300 text-sm mb-1">
                        <span className="text-slate-400">Materia:</span> {evaluacion.Materias?.asignatura || 'N/A'}
                      </p>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <FaCalendarAlt />
                        <span className="capitalize">{formatFecha(evaluacion.fechaEvaluacion)}</span>
                      </div>
                    </div>
                    {getEstadoBadge(evaluacion)}
                  </div>

                  {evaluacion.descripcion && (
                    <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                      <p className="text-slate-300 text-sm">{evaluacion.descripcion}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 ${getTipoColor(evaluacion.tipoEvaluacion)} text-xs rounded border font-medium`}>
                      {evaluacion.tipoEvaluacion}
                    </span>
                    <span className={`px-3 py-1 ${getLapsoColor(evaluacion.lapso)} text-xs rounded border font-medium`}>
                      Lapso {evaluacion.lapso}
                    </span>
                    <span className="px-3 py-1 bg-slate-600/50 text-slate-300 text-xs rounded border border-slate-500 font-medium">
                      {evaluacion.porcentaje}% del lapso
                    </span>
                  </div>

                  {evaluacion.archivosEvaluacion && evaluacion.archivosEvaluacion.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <p className="text-slate-400 text-sm mb-2 font-semibold">Archivos adjuntos:</p>
                      <div className="space-y-2">
                        {evaluacion.archivosEvaluacion.map((archivo, idx) => (
                          <a
                            key={idx}
                            href={`${import.meta.env.VITE_API_URL}${archivo.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                          >
                            <FaFileAlt />
                            <span>{archivo.nombre}</span>
                            <FaDownload className="ml-auto" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FaTasks className="text-6xl text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No hay evaluaciones con los filtros seleccionados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluacionesDetalleModal;
