import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaChartBar, FaTrophy, FaStar, FaBook, FaCalendarAlt,
  FaArrowUp, FaArrowDown, FaMinus, FaSpinner
} from 'react-icons/fa';

const CalificacionesPage = () => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroMateria, setFiltroMateria] = useState('todas');
  const [filtroLapso, setFiltroLapso] = useState('todos');
  const [stats, setStats] = useState({
    promedio: 0,
    mejorNota: 0,
    peorNota: 0,
    totalEvaluaciones: 0,
    aprobadas: 0,
    tendencia: 'neutral'
  });

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
      const notas = calificaciones.map(c => parseFloat(c.calificacion) || 0);
      const suma = notas.reduce((acc, nota) => acc + nota, 0);
      const promedio = suma / notas.length;
      const mejorNota = Math.max(...notas);
      const peorNota = Math.min(...notas);
      const aprobadas = notas.filter(nota => nota >= 10).length;

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
    if (n >= 16) return 'text-green-600 bg-green-100 border-green-500';
    if (n >= 14) return 'text-blue-600 bg-blue-100 border-blue-500';
    if (n >= 10) return 'text-yellow-600 bg-yellow-100 border-yellow-500';
    return 'text-red-600 bg-red-100 border-red-500';
  };

  const getTendenciaIcon = () => {
    switch (stats.tendencia) {
      case 'up':
        return <FaArrowUp className="text-green-500" />;
      case 'down':
        return <FaArrowDown className="text-red-500" />;
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

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-VE', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-slate-800 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Cargando calificaciones...</p>
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

  const califsFiltradas = getCalificacionesFiltradas();

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <FaChartBar className="text-4xl text-slate-800" />
          <h1 className="text-3xl font-bold text-slate-800">Mis Calificaciones</h1>
        </div>

        {/* Resumen - Promedio General Destacado */}
        <div className={`bg-gradient-to-r ${getPromedioColor()} rounded-xl p-6 shadow-lg mb-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm font-medium mb-2">Promedio General</p>
              <p className="text-5xl font-bold text-white">{stats.promedio}</p>
            </div>
            <div className="text-4xl text-white/90">
              {getTendenciaIcon()}
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-green-200 text-center">
            <FaTrophy className="text-3xl text-green-600 mx-auto mb-2" />
            <p className="text-slate-500 text-xs mb-1">Mejor Nota</p>
            <p className="text-3xl font-bold text-green-600">{stats.mejorNota}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-red-200 text-center">
            <FaStar className="text-3xl text-red-600 mx-auto mb-2" />
            <p className="text-slate-500 text-xs mb-1">Nota Mínima</p>
            <p className="text-3xl font-bold text-red-600">{stats.peorNota}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-blue-200 text-center">
            <FaBook className="text-3xl text-blue-600 mx-auto mb-2" />
            <p className="text-slate-500 text-xs mb-1">Evaluaciones</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalEvaluaciones}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-purple-200 text-center">
            <FaStar className="text-3xl text-purple-600 mx-auto mb-2" />
            <p className="text-slate-500 text-xs mb-1">Aprobadas</p>
            <p className="text-3xl font-bold text-purple-600">
              {stats.aprobadas}/{stats.totalEvaluaciones}
            </p>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6">
          <p className="text-slate-600 text-sm mb-2">Tasa de Aprobación</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-200 rounded-full h-4 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ 
                  width: `${stats.totalEvaluaciones > 0 ? (stats.aprobadas / stats.totalEvaluaciones * 100) : 0}%` 
                }}
              />
            </div>
            <span className="text-slate-800 font-semibold">
              {stats.totalEvaluaciones > 0 
                ? ((stats.aprobadas / stats.totalEvaluaciones * 100).toFixed(0)) 
                : 0}%
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Filtrar por Materia</label>
              <select
                value={filtroMateria}
                onChange={(e) => setFiltroMateria(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todas">Todas las materias</option>
                {getMaterias().map(materia => (
                  <option key={materia} value={materia}>{materia}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">Filtrar por Lapso</label>
              <select
                value={filtroLapso}
                onChange={(e) => setFiltroLapso(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos los lapsos</option>
                {getLapsos().map(lapso => (
                  <option key={lapso} value={lapso}>Lapso {lapso}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Calificaciones */}
      <div className="space-y-4">
        {califsFiltradas.length > 0 ? (
          califsFiltradas.map((calif, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FaBook className="text-blue-600" />
                    <h3 className="text-slate-800 font-semibold text-lg">
                      {calif.Evaluaciones?.nombreEvaluacion || 'Evaluación'}
                    </h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-700">
                      <span className="text-slate-500">Materia:</span> {calif.Evaluaciones?.Materias?.asignatura || 'N/A'}
                    </p>
                    <p className="text-slate-700">
                      <span className="text-slate-500">Tipo:</span> {calif.Evaluaciones?.tipoEvaluacion || 'N/A'}
                    </p>
                    <p className="text-slate-700">
                      <span className="text-slate-500">Lapso:</span> {calif.Evaluaciones?.lapso || 'N/A'}
                    </p>
                    <div className="flex items-center gap-2 text-slate-500">
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
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-slate-600 text-sm">
                    <span className="font-semibold">Observaciones:</span> {calif.observaciones}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <FaChartBar className="text-6xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No hay calificaciones con los filtros seleccionados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalificacionesPage;
