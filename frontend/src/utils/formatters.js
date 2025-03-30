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
  
  // Función para formatear fechas
  export const formatearFecha = (fecha) => {
    if (!fecha) return 'No disponible';
    
    // Intentar diferentes formatos
    const date = new Date(fecha);
    
    if (isNaN(date.getTime())) {
      // Si la fecha es inválida, intentar parsear manualmente
      const parts = fecha.split('-');
      if (parts.length === 3) {
        // Formato DD-MM-YYYY
        return `${parts[0]}/${parts[1]}/${parts[2]}`;
      }
      return fecha; // Devolver el valor original si no se puede formatear
    }
    
    // Formatear fecha válida
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  export const parsearFecha = (fecha) => {
    if (!fecha) return null;
    
    // Si ya es un objeto Date, devolverlo
    if (fecha instanceof Date) return fecha;
    
    // Intentar diferentes formatos
    let fechaObj = new Date(fecha);
    
    // Verificar si la fecha es válida
    if (!isNaN(fechaObj.getTime())) {
      return fechaObj;
    }
    
    // Si la fecha es inválida, intentar parsear manualmente
    if (typeof fecha === 'string') {
      const parts = fecha.split('-');
      if (parts.length === 3) {
        // Verificar si es formato DD-MM-YYYY o YYYY-MM-DD
        if (parts[0].length === 2 || parseInt(parts[0]) <= 31) {
          // Formato DD-MM-YYYY, convertir a YYYY-MM-DD para JavaScript
          fechaObj = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        } else {
          // Intentar como YYYY-MM-DD
          fechaObj = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`);
        }
        
        // Verificar si ahora es válida
        if (!isNaN(fechaObj.getTime())) {
          return fechaObj;
        }
      }
      
      // Intentar con formato DD/MM/YYYY
      const slashParts = fecha.split('/');
      if (slashParts.length === 3) {
        fechaObj = new Date(`${slashParts[2]}-${slashParts[1]}-${slashParts[0]}`);
        if (!isNaN(fechaObj.getTime())) {
          return fechaObj;
        }
      }
    }
    
    console.error("No se pudo parsear la fecha:", fecha);
    return null;
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

  export const formatearNombreNivel = (nivel) => {
    if (!nivel || !nivel.nombre_nivel) return 'No especificado';
    return nivel.nombre_nivel.charAt(0).toUpperCase() + nivel.nombre_nivel.slice(1);
  };
  