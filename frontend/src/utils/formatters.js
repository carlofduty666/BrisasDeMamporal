// Mapeo de tipos de documentos
export const tipoDocumentoFormateado = {
    'cedula': 'Cédula de Identidad',
    'partidaNacimiento': 'Partida de Nacimiento',
    'boletin': 'Boletín de Calificaciones',
    'notasCertificadas': 'Notas Certificadas',
    'fotoCarnet': 'Foto Carnet',
    'fotoCarta': 'Foto Tamaño Carta',
    'boletaRetiroPlantel': 'Boleta de Retiro del Plantel',
    'constanciaTrabajo': 'Constancia de Trabajo',
    'solvenciaPago': 'Solvencia de Pago',
    'foniatrico': 'Informe Foniátrico',
    'psicomental': 'Evaluación Psicomental',
    'certificadoSalud': 'Certificado de Salud',
    'curriculumVitae': 'Curriculum Vitae',
    'constanciaEstudio6toSemestre': 'Constancia de Estudio 6to Semestre',
    'titulo': 'Título Académico'
  };
  
  // Función para formatear nombres de grados
  export const formatearNombreGrado = (nombreGrado) => {
    if (!nombreGrado) return 'No asignado';
    return nombreGrado.replace(/_/g, ' ');
  };
  
  // Función para formatear fechas para mostrar al usuario
  export const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    
    // Si la fecha ya tiene formato DD-MM-YYYY o DD/MM/YYYY, devolverla tal cual
    if (typeof fecha === 'string') {
      // Verificar formato DD-MM-YYYY
      if (/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
        return fecha.replace(/-/g, '/');
      }
      // Verificar formato DD/MM/YYYY
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
        return fecha;
      }
      
      // Verificar formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        const [year, month, day] = fecha.split('-');
        return `${day}/${month}/${year}`;
      }
    }
    
    // Para otros formatos, intentar parsear sin crear un objeto Date
    // para evitar problemas de zona horaria
    try {
      // Si es una fecha ISO completa (con hora)
      if (typeof fecha === 'string' && fecha.includes('T')) {
        const datePart = fecha.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}/${year}`;
      }
      
      // Si todo lo demás falla, usar el objeto Date (con riesgo de desfase)
      const dateObj = new Date(fecha);
      if (!isNaN(dateObj.getTime())) {
        // Usar toLocaleDateString para obtener la fecha en formato local
        return dateObj.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'UTC' // Importante: usar UTC para evitar ajustes de zona horaria
        });
      }
    } catch (e) {
      console.error('Error al formatear fecha:', e);
    }
    
    return fecha; // Devolver el valor original si no se puede formatear
  };

  // Función para parsear fechas desde cualquier formato a objeto Date
  export const parsearFecha = (fecha) => {
    if (!fecha) return null;
    
    // Si ya es un objeto Date, devolverlo
    if (fecha instanceof Date && !isNaN(fecha.getTime())) return fecha;
    
    // Intentar diferentes formatos
    let fechaObj;
    
    // 1. Intentar como fecha ISO (YYYY-MM-DD)
    fechaObj = new Date(fecha);
    if (!isNaN(fechaObj.getTime())) return fechaObj;
    
    // 2. Intentar como DD-MM-YYYY
    if (typeof fecha === 'string') {
      const parts = fecha.split('-');
      if (parts.length === 3) {
        // Verificar si es formato DD-MM-YYYY
        if (parts[0].length === 2 || parseInt(parts[0]) <= 31) {
          fechaObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          if (!isNaN(fechaObj.getTime())) return fechaObj;
        }
      }
      
      // 3. Intentar con formato DD/MM/YYYY
      const slashParts = fecha.split('/');
      if (slashParts.length === 3) {
        fechaObj = new Date(`${slashParts[2]}-${slashParts[1]}-${slashParts[0]}`);
        if (!isNaN(fechaObj.getTime())) return fechaObj;
      }
    }
    
    console.error("No se pudo parsear la fecha:", fecha);
    return null;
  };

  // Función para formatear fechas para enviar al backend (DD-MM-YYYY)
  export const formatearFechaParaBackend = (fecha) => {
    const fechaObj = parsearFecha(fecha);
    if (!fechaObj) return '';
    
    // Formatear como DD-MM-YYYY
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const anio = fechaObj.getFullYear();
    
    return `${dia}-${mes}-${anio}`;
  };

  // Función para formatear fechas para inputs HTML (YYYY-MM-DD)
  export const formatearFechaParaInput = (fecha) => {
    const fechaObj = parsearFecha(fecha);
    if (!fechaObj) return '';
    
    // Formatear como YYYY-MM-DD
    return fechaObj.toISOString().split('T')[0];
  };

  
  // Función para calcular edad basada en una fecha
  export const calcularEdad = (fechaNacimiento) => {
    const fechaNacimientoDate = parsearFecha(fechaNacimiento);
    
    if (!fechaNacimientoDate) {
      return "N/A";
    }
    
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimientoDate.getFullYear();
    const mes = hoy.getMonth() - fechaNacimientoDate.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimientoDate.getDate())) {
      edad--;
    }
    
    return edad;
  };

  // Esta función debería existir en tu componente
  export const formatearNombreNivel = (nombreNivel) => {
    if (!nombreNivel) return 'No asignado';
    
    // Convertir 'primaria' a 'Primaria' y 'secundaria' a 'Secundaria'
    return nombreNivel.charAt(0).toUpperCase() + nombreNivel.slice(1);
  };

  