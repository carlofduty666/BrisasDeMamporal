import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Hook para obtener calificaciones de un estudiante con histórico de secciones
 * Detecta automáticamente cuáles calificaciones pertenecen a secciones anteriores
 * 
 * @param {number} estudianteID - ID del estudiante
 * @param {number} annoEscolarID - ID del año escolar
 * @param {string} token - Token de autenticación
 * @returns {Object} { calificaciones, loading, error, refetch }
 */
export const useCalificacionesHistorico = (estudianteID, annoEscolarID, token) => {
  const [calificaciones, setCalificaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCalificaciones = async () => {
    if (!estudianteID || !annoEscolarID || !token) {
      setCalificaciones([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${apiUrl}/calificaciones/historialseccion/${estudianteID}/${annoEscolarID}`,
        config
      );

      if (response.data && response.data.calificaciones) {
        setCalificaciones(response.data.calificaciones);
      } else {
        console.warn('Respuesta inesperada del servidor:', response.data);
        setCalificaciones([]);
      }
    } catch (err) {
      console.error('Error al obtener calificaciones con histórico:', err);
      setError(err.response?.data?.message || err.message);
      setCalificaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalificaciones();
  }, [estudianteID, annoEscolarID, token]);

  return {
    calificaciones,
    loading,
    error,
    refetch: fetchCalificaciones
  };
};

/**
 * Hook para obtener calificaciones agrupadas por materia
 * Separa automáticamente las calificaciones actuales de las históricas
 */
export const useCalificacionesPorMateria = (estudianteID, annoEscolarID, token) => {
  const { calificaciones, loading, error, refetch } = useCalificacionesHistorico(
    estudianteID,
    annoEscolarID,
    token
  );

  // Agrupar por materia
  const calificacionesPorMateria = calificaciones.reduce((acc, cal) => {
    if (!cal.materia || !cal.materia.id) {
      console.warn('Calificación sin materia válida:', cal);
      return acc;
    }

    const materiaId = cal.materia.id;
    if (!acc[materiaId]) {
      acc[materiaId] = {
        id: cal.materia.id,
        nombre: cal.materia.nombre,
        actuales: [],
        historicas: []
      };
    }

    if (cal.esDeSeccionAnterior) {
      acc[materiaId].historicas.push(cal);
    } else {
      acc[materiaId].actuales.push(cal);
    }

    return acc;
  }, {});

  return {
    calificacionesPorMateria: Object.values(calificacionesPorMateria),
    loading,
    error,
    refetch
  };
};

/**
 * Hook para obtener calificaciones agrupadas por lapso
 * Útil para vistas de progreso académico
 */
export const useCalificacionesPorLapso = (estudianteID, annoEscolarID, token) => {
  const { calificaciones, loading, error, refetch } = useCalificacionesHistorico(
    estudianteID,
    annoEscolarID,
    token
  );

  // Agrupar por lapso y materia
  const calificacionesPorLapso = calificaciones.reduce((acc, cal) => {
    // Validar datos
    if (!cal.evaluacion || !cal.materia) {
      console.warn('Calificación con estructura incompleta:', cal);
      return acc;
    }

    const lapso = cal.evaluacion.lapso || 'Sin lapso';
    const materiaId = cal.materia.id;

    if (!acc[lapso]) {
      acc[lapso] = {};
    }

    if (!acc[lapso][materiaId]) {
      acc[lapso][materiaId] = {
        materia: {
          id: cal.materia.id,
          nombre: cal.materia.nombre
        },
        actuales: [],
        historicas: []
      };
    }

    if (cal.esDeSeccionAnterior) {
      acc[lapso][materiaId].historicas.push(cal);
    } else {
      acc[lapso][materiaId].actuales.push(cal);
    }

    return acc;
  }, {});

  // Convertir a array ordenado
  const resultado = Object.entries(calificacionesPorLapso)
    .sort((a, b) => {
      // Intenta ordenar por número de lapso si es posible
      const lapsoA = parseInt(a[0]) || a[0];
      const lapsoB = parseInt(b[0]) || b[0];
      if (typeof lapsoA === 'number' && typeof lapsoB === 'number') {
        return lapsoA - lapsoB;
      }
      return String(a[0]).localeCompare(String(b[0]));
    })
    .map(([lapso, materias]) => ({
      lapso,
      materias: Object.values(materias)
    }));

  return {
    calificacionesPorLapso: resultado,
    loading,
    error,
    refetch
  };
};

/**
 * Hook para filtrar calificaciones por criterios específicos
 * Útil para vistas selectivas
 */
export const useCalificacionesFiltradas = (
  estudianteID,
  annoEscolarID,
  token,
  filtro = {}
) => {
  const { calificaciones, loading, error, refetch } = useCalificacionesHistorico(
    estudianteID,
    annoEscolarID,
    token
  );

  const calificacionesFiltradas = calificaciones.filter(cal => {
    // Filtro por histórico
    if (filtro.historico !== undefined) {
      if (filtro.historico && !cal.esDeSeccionAnterior) return false;
      if (!filtro.historico && cal.esDeSeccionAnterior) return false;
    }

    // Filtro por materia
    if (filtro.materiaId && cal.materia?.id !== filtro.materiaId) {
      return false;
    }

    // Filtro por lapso
    if (filtro.lapso && cal.evaluacion?.lapso !== filtro.lapso) {
      return false;
    }

    // Filtro por tipo de evaluación
    if (filtro.tipoEvaluacion && cal.evaluacion?.tipo !== filtro.tipoEvaluacion) {
      return false;
    }

    // Filtro por rango de calificación
    if (filtro.calificacionMin !== undefined && cal.calificacion < filtro.calificacionMin) {
      return false;
    }

    if (filtro.calificacionMax !== undefined && cal.calificacion > filtro.calificacionMax) {
      return false;
    }

    return true;
  });

  return {
    calificacionesFiltradas,
    total: calificacionesFiltradas.length,
    totalHistoricas: calificacionesFiltradas.filter(c => c.esDeSeccionAnterior).length,
    totalActuales: calificacionesFiltradas.filter(c => !c.esDeSeccionAnterior).length,
    loading,
    error,
    refetch
  };
};

/**
 * Hook para obtener estadísticas de calificaciones
 */
export const useCalificacionesEstadisticas = (
  estudianteID,
  annoEscolarID,
  token
) => {
  const { calificaciones, loading, error } = useCalificacionesHistorico(
    estudianteID,
    annoEscolarID,
    token
  );

  const estadisticas = {
    totalCalificaciones: calificaciones.length,
    totalHistoricas: calificaciones.filter(c => c.esDeSeccionAnterior).length,
    totalActuales: calificaciones.filter(c => !c.esDeSeccionAnterior).length,
    promedioActual: 0,
    promedioHistorico: 0,
    calificacionMaxima: 0,
    calificacionMinima: 100,
    porMateria: {}
  };

  // Calcular promedios
  const actuales = calificaciones.filter(c => !c.esDeSeccionAnterior);
  const historicas = calificaciones.filter(c => c.esDeSeccionAnterior);

  if (actuales.length > 0) {
    const sumaActual = actuales.reduce((sum, c) => sum + (c.calificacion || 0), 0);
    estadisticas.promedioActual = (sumaActual / actuales.length).toFixed(2);
  }

  if (historicas.length > 0) {
    const sumaHistorica = historicas.reduce((sum, c) => sum + (c.calificacion || 0), 0);
    estadisticas.promedioHistorico = (sumaHistorica / historicas.length).toFixed(2);
  }

  // Calcular min/max
  calificaciones.forEach(cal => {
    if (cal.calificacion) {
      if (cal.calificacion > estadisticas.calificacionMaxima) {
        estadisticas.calificacionMaxima = cal.calificacion;
      }
      if (cal.calificacion < estadisticas.calificacionMinima) {
        estadisticas.calificacionMinima = cal.calificacion;
      }
    }
  });

  // Agrupar por materia
  calificaciones.forEach(cal => {
    const materiaId = cal.materia?.id;
    if (!materiaId) return;

    if (!estadisticas.porMateria[materiaId]) {
      estadisticas.porMateria[materiaId] = {
        nombre: cal.materia.nombre,
        total: 0,
        promedio: 0,
        calificaciones: []
      };
    }

    estadisticas.porMateria[materiaId].total++;
    estadisticas.porMateria[materiaId].calificaciones.push(cal.calificacion);
  });

  // Calcular promedios por materia
  Object.keys(estadisticas.porMateria).forEach(materiaId => {
    const materia = estadisticas.porMateria[materiaId];
    if (materia.calificaciones.length > 0) {
      const suma = materia.calificaciones.reduce((sum, cal) => sum + cal, 0);
      materia.promedio = (suma / materia.calificaciones.length).toFixed(2);
    }
  });

  return {
    estadisticas,
    loading,
    error
  };
};

export default useCalificacionesHistorico;