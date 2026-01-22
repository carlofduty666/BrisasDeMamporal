import { FaChartLine, FaBook, FaTrophy, FaExclamationCircle, FaEye } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProgresoAcademico = ({ calificaciones }) => {
  const [materiaStats, setMateriaStats] = useState([]);

  useEffect(() => {
    if (calificaciones && calificaciones.length > 0) {
      const materiaMap = {};

      calificaciones.forEach(calif => {
        const materia = calif.Evaluaciones?.Materias?.asignatura || 'Sin materia';
        const materiaID = calif.Evaluaciones?.Materias?.id || 'sin-id';
        const nota = parseFloat(calif.calificacion) || 0;

        if (!materiaMap[materiaID]) {
          materiaMap[materiaID] = {
            nombre: materia,
            notas: [],
            promedio: 0,
            totalEvaluaciones: 0
          };
        }

        materiaMap[materiaID].notas.push(nota);
        materiaMap[materiaID].totalEvaluaciones++;
      });

      const statsArray = Object.values(materiaMap).map(materia => {
        const suma = materia.notas.reduce((acc, nota) => acc + nota, 0);
        const promedio = suma / materia.notas.length;
        return {
          ...materia,
          promedio: promedio.toFixed(2)
        };
      });

      statsArray.sort((a, b) => parseFloat(b.promedio) - parseFloat(a.promedio));

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
    if (prom >= 16) return <FaTrophy className="text-green-400" />;
    if (prom >= 10) return <FaBook className="text-blue-400" />;
    return <FaExclamationCircle className="text-red-400" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
      {/* Header */}
      <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <FaChartLine className="text-2xl text-white" />
          <h2 className="text-xl font-bold text-white">Progreso por Materia</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {materiaStats && materiaStats.length > 0 ? (
          <div className="space-y-4">
            {materiaStats.map((materia, index) => (
              <div
                key={index}
                className="bg-slate-50 rounded-lg p-4 border border-slate-200 transition-all duration-300 hover:bg-white hover:border-purple-500 hover:shadow-sm"
              >
                {/* Encabezado de Materia */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    {getIconoEstado(materia.promedio)}
                    <div className="flex-1">
                      <h3 className="text-slate-800 font-semibold text-sm truncate">
                        {materia.nombre}
                      </h3>
                      <p className="text-slate-500 text-xs">
                        {materia.totalEvaluaciones} evaluación{materia.totalEvaluaciones !== 1 ? 'es' : ''}
                      </p>
                    </div>
                  </div>
                  <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${getPromedioColor(materia.promedio)} flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110`}>
                    <span className="text-white font-bold text-lg">
                      {parseFloat(materia.promedio).toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Barra de Progreso */}
                <div className="relative">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>0</span>
                    <span>20</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full ${getProgressBarColor(materia.promedio)} transition-all duration-500 ease-out`}
                      style={{ width: `${(parseFloat(materia.promedio) / 20) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Mini Indicadores de Últimas Notas */}
                <div className="mt-3 flex gap-1">
                  {materia.notas.slice(-5).map((nota, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 h-8 rounded ${
                        nota >= 16 ? 'bg-green-500/20 text-green-700' :
                        nota >= 14 ? 'bg-blue-500/20 text-blue-700' :
                        nota >= 10 ? 'bg-yellow-500/20 text-yellow-700' :
                        'bg-red-500/20 text-red-700'
                      } flex items-center justify-center text-xs font-semibold transition-all duration-300 hover:scale-105`}
                      title={`Nota: ${nota}`}
                    >
                      {nota.toFixed(0)}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Leyenda */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-slate-500 text-xs mb-2 font-semibold">Escala de Notas:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gradient-to-r from-green-500 to-emerald-500" />
                  <span className="text-slate-600 text-xs">16-20 (Excelente)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-blue-600" />
                  <span className="text-slate-600 text-xs">14-15 (Bueno)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gradient-to-r from-yellow-500 to-yellow-600" />
                  <span className="text-slate-600 text-xs">10-13 (Regular)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gradient-to-r from-red-500 to-red-600" />
                  <span className="text-slate-600 text-xs">0-9 (Insuficiente)</span>
                </div>
              </div>
            </div>

            {/* Botón Ver Detalles */}
            <Link
              to="/estudiante/progreso"
              className="block w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 border border-slate-600 shadow-sm"
            >
              <FaEye className="text-lg" />
              Ver Análisis Detallado
            </Link>
          </div>
        ) : (
          <div className="text-center py-8">
            <FaChartLine className="text-6xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No hay datos de progreso disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgresoAcademico;
