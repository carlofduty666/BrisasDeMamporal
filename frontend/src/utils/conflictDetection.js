/**
 * Utilidades para detección de conflictos de horarios
 */

/**
 * Verifica si dos horarios se superponen en tiempo
 */
export const tiemposSuperpuestos = (inicio1, fin1, inicio2, fin2) => {
  const convertirAMinutos = (tiempo) => {
    const [horas, minutos] = tiempo.split(':').map(Number);
    return horas * 60 + minutos;
  };

  const inicio1Min = convertirAMinutos(inicio1);
  const fin1Min = convertirAMinutos(fin1);
  const inicio2Min = convertirAMinutos(inicio2);
  const fin2Min = convertirAMinutos(fin2);

  return inicio1Min < fin2Min && inicio2Min < fin1Min;
};

/**
 * Detecta conflictos de profesor (mismo profesor no puede tener dos clases simultáneas)
 */
export const detectarConflictosProfesor = (nuevoHorario, horariosExistentes) => {
  if (!nuevoHorario.profesor_id || !nuevoHorario.dia_semana) return [];

  const conflictos = horariosExistentes.filter(horario => {
    // Mismo profesor
    if (horario.profesor_id !== nuevoHorario.profesor_id) return false;
    
    // Mismo día
    if (horario.dia_semana !== nuevoHorario.dia_semana) return false;

    // Tiempo superpuesto
    if (tiemposSuperpuestos(
      nuevoHorario.hora_inicio,
      nuevoHorario.hora_fin,
      horario.hora_inicio,
      horario.hora_fin
    )) {
      return true;
    }

    return false;
  });

  return conflictos;
};

/**
 * Detecta conflictos de grado/sección (no puede haber dos clases simultáneas)
 */
export const detectarConflictosGradoSeccion = (nuevoHorario, horariosExistentes) => {
  if (!nuevoHorario.grado_id || !nuevoHorario.seccion_id || !nuevoHorario.dia_semana) return [];

  const conflictos = horariosExistentes.filter(horario => {
    // Mismo grado y sección
    if (horario.grado_id !== nuevoHorario.grado_id || 
        horario.seccion_id !== nuevoHorario.seccion_id) return false;
    
    // Mismo día
    if (horario.dia_semana !== nuevoHorario.dia_semana) return false;

    // Tiempo superpuesto
    if (tiemposSuperpuestos(
      nuevoHorario.hora_inicio,
      nuevoHorario.hora_fin,
      horario.hora_inicio,
      horario.hora_fin
    )) {
      return true;
    }

    return false;
  });

  return conflictos;
};

/**
 * Detecta conflictos de aula (la aula no puede estar asignada a dos clases simultáneas)
 */
export const detectarConflictosAula = (nuevoHorario, horariosExistentes) => {
  if (!nuevoHorario.aula || !nuevoHorario.dia_semana) return [];

  const conflictos = horariosExistentes.filter(horario => {
    // Misma aula
    if (horario.aula !== nuevoHorario.aula) return false;
    
    // Mismo día
    if (horario.dia_semana !== nuevoHorario.dia_semana) return false;

    // Tiempo superpuesto
    if (tiemposSuperpuestos(
      nuevoHorario.hora_inicio,
      nuevoHorario.hora_fin,
      horario.hora_inicio,
      horario.hora_fin
    )) {
      return true;
    }

    return false;
  });

  return conflictos;
};

/**
 * Obtiene todos los conflictos para un nuevo horario
 */
export const obtenerTodosLosConflictos = (nuevoHorario, horariosExistentes) => {
  const conflictos = {
    profesor: [],
    gradoSeccion: [],
    aula: []
  };

  // Excluir el horario actual si es edición
  const horariosParaVerificar = nuevoHorario.id
    ? horariosExistentes.filter(h => h.id !== nuevoHorario.id)
    : horariosExistentes;

  conflictos.profesor = detectarConflictosProfesor(nuevoHorario, horariosParaVerificar);
  conflictos.gradoSeccion = detectarConflictosGradoSeccion(nuevoHorario, horariosParaVerificar);
  conflictos.aula = detectarConflictosAula(nuevoHorario, horariosParaVerificar);

  return conflictos;
};

/**
 * Genera un mensaje legible sobre los conflictos detectados
 */
export const generarMensajeConflictos = (conflictos, profesores, grados, secciones, aulas) => {
  const mensajes = [];

  if (conflictos.profesor.length > 0) {
    const nomProfesor = profesores.find(p => p.id === conflictos.profesor[0].profesor_id);
    mensajes.push(`El profesor ${nomProfesor?.nombre} ${nomProfesor?.apellido} ya tiene una clase en este horario`);
  }

  if (conflictos.gradoSeccion.length > 0) {
    const conflicto = conflictos.gradoSeccion[0];
    const nomGrado = grados.find(g => g.id === conflicto.grado_id);
    const nomSeccion = secciones.find(s => s.id === conflicto.seccion_id);
    mensajes.push(`El grado ${nomGrado?.nombre_grado} ${nomSeccion?.nombre_seccion} ya tiene una clase en este horario`);
  }

  if (conflictos.aula.length > 0) {
    const conflicto = conflictos.aula[0];
    mensajes.push(`El aula ${conflicto.aula} ya está asignada en este horario`);
  }

  return mensajes.join('. ');
};

/**
 * Obtiene la disponibilidad del profesor en un día específico
 */
export const obtenerDisponibilidadProfesor = (profesorId, dia, horariosExistentes, horariosMinimos = { inicio: '07:00', fin: '17:00' }) => {
  const horariosProfesor = horariosExistentes.filter(
    h => h.profesor_id === profesorId && h.dia_semana === dia
  ).sort((a, b) => {
    const timeA = a.hora_inicio.split(':').map(Number);
    const timeB = b.hora_inicio.split(':').map(Number);
    return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
  });

  const franjasLibres = [];
  const convertirAMinutos = (tiempo) => {
    const [horas, minutos] = tiempo.split(':').map(Number);
    return horas * 60 + minutos;
  };
  const convertirDeMinutos = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${String(horas).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  if (horariosProfesor.length === 0) {
    franjasLibres.push({
      inicio: horariosMinimos.inicio,
      fin: horariosMinimos.fin
    });
  } else {
    let tiempoActual = convertirAMinutos(horariosMinimos.inicio);
    const finDia = convertirAMinutos(horariosMinimos.fin);

    for (const horario of horariosProfesor) {
      const inicioHorario = convertirAMinutos(horario.hora_inicio);
      
      if (tiempoActual < inicioHorario) {
        franjasLibres.push({
          inicio: convertirDeMinutos(tiempoActual),
          fin: convertirDeMinutos(inicioHorario)
        });
      }
      
      tiempoActual = Math.max(tiempoActual, convertirAMinutos(horario.hora_fin));
    }

    if (tiempoActual < finDia) {
      franjasLibres.push({
        inicio: convertirDeMinutos(tiempoActual),
        fin: convertirDeMinutos(finDia)
      });
    }
  }

  return franjasLibres;
};