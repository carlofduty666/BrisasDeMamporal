import { FaTasks, FaCalendarAlt, FaBook, FaClock, FaCheckCircle, FaExclamationTriangle, FaEye } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const EvaluacionesWidget = ({ evaluaciones, onVerDetalle }) => {
  const [evaluacionesOrdenadas, setEvaluacionesOrdenadas] = useState([]);

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
        return new Date(a.fechaEvaluacion) - new Date(b.fechaEvaluacion);
      });

      setEvaluacionesOrdenadas(ordenadas.slice(0, 5));
    }
  }, [evaluaciones]);

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-VE', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getEstadoBadge = (evaluacion) => {
    if (evaluacion.estado === 'hoy') {
      return (
        <span className="px-2 py-1 bg-red-500/20 border border-red-500 text-red-400 text-xs rounded-full flex items-center gap-1">
          <FaClock className="text-xs" />
          Hoy
        </span>
      );
    } else if (evaluacion.estado === 'proxima') {
      const color = evaluacion.diasRestantes <= 3 ? 'yellow' : 'blue';
      return (
        <span className={`px-2 py-1 bg-${color}-500/20 border border-${color}-500 text-${color}-400 text-xs rounded-full flex items-center gap-1`}>
          <FaClock className="text-xs" />
          {evaluacion.diasRestantes} día{evaluacion.diasRestantes !== 1 ? 's' : ''}
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-green-500/20 border border-green-500 text-green-400 text-xs rounded-full flex items-center gap-1">
          <FaCheckCircle className="text-xs" />
          Realizada
        </span>
      );
    }
  };

  const getTipoColor = (tipo) => {
    const tipos = {
      'examen': 'text-red-400',
      'quiz': 'text-blue-400',
      'taller': 'text-green-400',
      'proyecto': 'text-purple-400',
      'exposicion': 'text-yellow-400',
      'trabajo': 'text-pink-400'
    };
    return tipos[tipo?.toLowerCase()] || 'text-slate-400';
  };

  const getLapsoColor = (lapso) => {
    const lapsos = {
      '1': 'bg-blue-500/20 text-blue-400 border-blue-500',
      '2': 'bg-purple-500/20 text-purple-400 border-purple-500',
      '3': 'bg-green-500/20 text-green-400 border-green-500'
    };
    return lapsos[lapso?.toString()] || 'bg-slate-500/20 text-slate-400 border-slate-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {/* Header */}
      <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <FaTasks className="text-2xl text-white" />
          <h2 className="text-xl font-bold text-white">Evaluaciones</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {evaluacionesOrdenadas && evaluacionesOrdenadas.length > 0 ? (
          <div className="space-y-3">
            {evaluacionesOrdenadas.map((evaluacion, index) => (
              <div
                key={index}
                className={`bg-slate-50 rounded-lg p-4 border transition-all duration-300 hover:bg-white hover:scale-[1.02] hover:shadow-sm ${
                  evaluacion.estado === 'hoy' 
                    ? 'border-red-300 shadow-md shadow-red-100' 
                    : evaluacion.diasRestantes <= 3 && evaluacion.estado === 'proxima'
                    ? 'border-yellow-300 shadow-md shadow-yellow-100'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <FaBook className={`text-sm ${getTipoColor(evaluacion.tipoEvaluacion)}`} />
                      <h3 className="text-slate-800 font-semibold text-sm">
                        {evaluacion.nombreEvaluacion}
                      </h3>
                    </div>
                    <p className="text-slate-500 text-xs">
                      {evaluacion.Materias?.asignatura || 'Materia desconocida'}
                    </p>
                  </div>
                  {getEstadoBadge(evaluacion)}
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <FaCalendarAlt className="text-xs" />
                    <span>{formatFecha(evaluacion.fechaEvaluacion)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 ${getLapsoColor(evaluacion.lapso)} text-xs rounded border`}>
                      Lapso {evaluacion.lapso}
                    </span>
                    <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded">
                      {evaluacion.porcentaje}%
                    </span>
                  </div>
                </div>

                {evaluacion.descripcion && (
                  <p className="text-slate-500 text-xs mt-2 line-clamp-2">
                    {evaluacion.descripcion}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaTasks className="text-6xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No hay evaluaciones próximas</p>
          </div>
        )}

        {/* Alerta de Evaluaciones Próximas */}
        {evaluacionesOrdenadas.some(e => e.diasRestantes <= 3 && e.estado === 'proxima') && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
            <FaExclamationTriangle className="text-yellow-500 text-xl flex-shrink-0" />
            <p className="text-yellow-700 text-sm">
              Tienes evaluaciones próximas esta semana. ¡Prepárate!
            </p>
          </div>
        )}

        {/* Botón Ver Detalles */}
        {onVerDetalle && evaluacionesOrdenadas.length > 0 && (
          <button
            onClick={onVerDetalle}
            className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 border border-slate-600 shadow-sm"
          >
            <FaEye className="text-lg" />
            Ver Todas las Evaluaciones
          </button>
        )}
      </div>
    </div>
  );
};

export default EvaluacionesWidget;
