import { FaChartBar, FaStar, FaTrophy, FaArrowUp, FaArrowDown, FaMinus, FaEye } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const CalificacionesResumen = ({ calificaciones, onVerDetalle }) => {
  const [stats, setStats] = useState({
    promedio: 0,
    mejorNota: 0,
    peorNota: 0,
    totalEvaluaciones: 0,
    aprobadas: 0,
    tendencia: 'neutral'
  });

  useEffect(() => {
    if (calificaciones && calificaciones.length > 0) {
      const notas = calificaciones.map(c => parseFloat(c.calificacion) || 0);
      const suma = notas.reduce((acc, nota) => acc + nota, 0);
      const promedio = suma / notas.length;
      const mejorNota = Math.max(...notas);
      const peorNota = Math.min(...notas);
      const aprobadas = notas.filter(nota => nota >= 10).length;

      // Calcular tendencia (comparando últimas 3 notas con las 3 anteriores)
      let tendencia = 'neutral';
      if (notas.length >= 6) {
        const ultimas3 = notas.slice(-3);
        const anteriores3 = notas.slice(-6, -3);
        const promedioReciente = ultimas3.reduce((a, b) => a + b, 0) / 3;
        const promedioAnterior = anteriores3.reduce((a, b) => a + b, 0) / 3;
        
        if (promedioReciente > promedioAnterior + 0.5) tendencia = 'up';
        else if (promedioReciente < promedioAnterior - 0.5) tendencia = 'down';
      }

      setStats({
        promedio: promedio.toFixed(2),
        mejorNota: mejorNota.toFixed(2),
        peorNota: peorNota.toFixed(2),
        totalEvaluaciones: calificaciones.length,
        aprobadas,
        tendencia
      });
    }
  }, [calificaciones]);

  const getTendenciaIcon = () => {
    switch (stats.tendencia) {
      case 'up':
        return <FaArrowUp className="text-green-400" />;
      case 'down':
        return <FaArrowDown className="text-red-400" />;
      default:
        return <FaMinus className="text-slate-400" />;
    }
  };

  const getPromedioColor = () => {
    const promedio = parseFloat(stats.promedio);
    if (promedio >= 16) return 'from-green-500 to-emerald-600';
    if (promedio >= 14) return 'from-blue-500 to-blue-600';
    if (promedio >= 10) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {/* Header */}
      <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <FaChartBar className="text-2xl text-white" />
          <h2 className="text-xl font-bold text-white">Resumen de Calificaciones</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {calificaciones && calificaciones.length > 0 ? (
          <div className="space-y-4">
            {/* Promedio General - Destacado */}
            <div className={`bg-gradient-to-r ${getPromedioColor()} rounded-lg p-4 shadow-lg transform transition-all duration-300 hover:scale-105`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/90 text-sm font-medium">Promedio General</p>
                  <p className="text-4xl font-bold text-white">{stats.promedio}</p>
                </div>
                <div className="text-3xl text-white/90">
                  {getTendenciaIcon()}
                </div>
              </div>
            </div>

            {/* Grid de Estadísticas */}
            <div className="grid grid-cols-2 gap-3">
              {/* Mejor Nota */}
              <div className="bg-slate-50 rounded-lg p-3 border border-green-200 transition-all duration-300 hover:bg-white hover:border-green-500 hover:shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FaTrophy className="text-green-500" />
                  <p className="text-slate-500 text-xs">Mejor Nota</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{stats.mejorNota}</p>
              </div>

              {/* Peor Nota */}
              <div className="bg-slate-50 rounded-lg p-3 border border-red-200 transition-all duration-300 hover:bg-white hover:border-red-500 hover:shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FaStar className="text-red-500" />
                  <p className="text-slate-500 text-xs">Nota Mínima</p>
                </div>
                <p className="text-2xl font-bold text-red-600">{stats.peorNota}</p>
              </div>

              {/* Total Evaluaciones */}
              <div className="bg-slate-50 rounded-lg p-3 border border-blue-200 transition-all duration-300 hover:bg-white hover:border-blue-500 hover:shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FaChartBar className="text-blue-500" />
                  <p className="text-slate-500 text-xs">Evaluaciones</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalEvaluaciones}</p>
              </div>

              {/* Aprobadas */}
              <div className="bg-slate-50 rounded-lg p-3 border border-purple-200 transition-all duration-300 hover:bg-white hover:border-purple-500 hover:shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <FaStar className="text-purple-500" />
                  <p className="text-slate-500 text-xs">Aprobadas</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.aprobadas}/{stats.totalEvaluaciones}
                </p>
              </div>
            </div>

            {/* Barra de Progreso */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-slate-500 text-sm mb-2">Tasa de Aprobación</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out"
                    style={{ 
                      width: `${stats.totalEvaluaciones > 0 ? (stats.aprobadas / stats.totalEvaluaciones * 100) : 0}%` 
                    }}
                  />
                </div>
                <span className="text-slate-800 font-semibold text-sm">
                  {stats.totalEvaluaciones > 0 
                    ? ((stats.aprobadas / stats.totalEvaluaciones * 100).toFixed(0)) 
                    : 0}%
                </span>
              </div>
            </div>

            {/* Últimas Calificaciones */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-slate-500 text-sm mb-2">Últimas 5 Calificaciones</p>
              <div className="flex gap-2 overflow-x-auto">
                {calificaciones.slice(-5).reverse().map((calif, idx) => (
                  <div 
                    key={idx}
                    className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white transition-all duration-300 hover:scale-110 ${
                      parseFloat(calif.calificacion) >= 16 ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-sm' :
                      parseFloat(calif.calificacion) >= 14 ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm' :
                      parseFloat(calif.calificacion) >= 10 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-sm' :
                      'bg-gradient-to-br from-red-500 to-red-600 shadow-sm'
                    }`}
                  >
                    {parseFloat(calif.calificacion).toFixed(0)}
                  </div>
                ))}
              </div>
            </div>

            {/* Botón Ver Detalles */}
            {onVerDetalle && (
              <button
                onClick={onVerDetalle}
                className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 border border-slate-600 shadow-sm"
              >
                <FaEye className="text-lg" />
                Ver Detalles Completos
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaChartBar className="text-6xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No hay calificaciones disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalificacionesResumen;
