const PDFDocument = require('pdfkit');
const { Horarios, Grados, Secciones, Materias, Personas, AnnoEscolar } = require('../models');

const pdfController = {
  // Generar PDF de horario por grado y sección
  async generarHorarioPDF(req, res) {
    try {
      const { grado_id, seccion_id } = req.params;
      
      // Obtener el año escolar actual
      const annoEscolarActual = await AnnoEscolar.getAnnoEscolarActual();
      if (!annoEscolarActual) {
        return res.status(400).json({ 
          message: 'No hay un año escolar activo configurado' 
        });
      }

      // Obtener información del grado y sección
      const grado = await Grados.findByPk(grado_id);
      const seccion = await Secciones.findByPk(seccion_id);

      if (!grado || !seccion) {
        return res.status(404).json({ 
          message: 'Grado o sección no encontrados' 
        });
      }

      // Obtener horarios
      const horarios = await Horarios.getHorariosByGradoSeccion(
        grado_id, 
        seccion_id, 
        annoEscolarActual.id
      );

      if (horarios.length === 0) {
        return res.status(404).json({ 
          message: 'No se encontraron horarios para este grado y sección' 
        });
      }

      // Crear el documento PDF
      const doc = new PDFDocument({ 
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=horario_${grado.nombre_grado}_${seccion.nombre_seccion}.pdf`);

      // Pipe del documento al response
      doc.pipe(res);

      // Título del documento
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('UNIDAD EDUCATIVA PRIVADA BRISAS DE MAMPORAL', { align: 'center' });
      
      doc.fontSize(16)
         .text('HORARIO DE CLASES', { align: 'center' })
         .moveDown();

      // Información del grado y sección
      doc.fontSize(14)
         .font('Helvetica')
         .text(`Grado: ${grado.nombre_grado}`, 50, doc.y)
         .text(`Sección: ${seccion.nombre_seccion}`, 300, doc.y - 14)
         .text(`Año Escolar: ${annoEscolarActual.periodo}`, 50, doc.y + 5)
         .moveDown(2);

      // Organizar horarios por día
      const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
      const horariosPorDia = {};
      
      diasSemana.forEach(dia => {
        horariosPorDia[dia] = horarios.filter(h => h.dia_semana === dia)
                                     .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
      });

      // Crear tabla de horarios
      const startX = 50;
      const startY = doc.y;
      const cellWidth = 100;
      const cellHeight = 30;
      const headerHeight = 40;

      // Headers de la tabla
      doc.fontSize(12)
         .font('Helvetica-Bold');

      // Header "Hora"
      doc.rect(startX, startY, cellWidth, headerHeight)
         .stroke()
         .text('HORA', startX + 5, startY + 15, { width: cellWidth - 10, align: 'center' });

      // Headers de días
      diasSemana.forEach((dia, index) => {
        const x = startX + cellWidth + (index * cellWidth);
        doc.rect(x, startY, cellWidth, headerHeight)
           .stroke()
           .text(dia.toUpperCase(), x + 5, startY + 15, { width: cellWidth - 10, align: 'center' });
      });

      // Obtener todas las horas únicas
      const horasUnicas = [...new Set(horarios.map(h => h.hora_inicio))]
                          .sort()
                          .map(hora => {
                            const horaFin = horarios.find(h => h.hora_inicio === hora)?.hora_fin;
                            return { inicio: hora, fin: horaFin };
                          });

      // Filas de horarios
      doc.font('Helvetica');
      let currentY = startY + headerHeight;

      horasUnicas.forEach((hora, rowIndex) => {
        // Celda de hora
        doc.rect(startX, currentY, cellWidth, cellHeight)
           .stroke()
           .fontSize(10)
           .text(`${hora.inicio} - ${hora.fin}`, startX + 5, currentY + 10, { 
             width: cellWidth - 10, 
             align: 'center' 
           });

        // Celdas de materias por día
        diasSemana.forEach((dia, colIndex) => {
          const x = startX + cellWidth + (colIndex * cellWidth);
          const claseEnHora = horariosPorDia[dia].find(h => h.hora_inicio === hora.inicio);
          
          doc.rect(x, currentY, cellWidth, cellHeight)
             .stroke();

          if (claseEnHora) {
            doc.fontSize(9)
               .text(claseEnHora.materia.asignatura, x + 3, currentY + 5, { 
                 width: cellWidth - 6, 
                 align: 'center' 
               })
               .fontSize(8)
               .text(`${claseEnHora.profesor.nombre} ${claseEnHora.profesor.apellido}`, x + 3, currentY + 18, { 
                 width: cellWidth - 6, 
                 align: 'center' 
               });
            
            if (claseEnHora.aula) {
              doc.text(`Aula: ${claseEnHora.aula}`, x + 3, currentY + 25, { 
                width: cellWidth - 6, 
                align: 'center' 
              });
            }
          }
        });

        currentY += cellHeight;
      });

      // Pie de página
      doc.fontSize(10)
         .font('Helvetica')
         .text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 50, doc.page.height - 100)
         .text('Unidad Educativa Privada Brisas de Mamporal', 50, doc.page.height - 80)
         .text('Sector Brisas de Mamporal, Municipio Plaza, Estado Miranda', 50, doc.page.height - 65);

      // Finalizar el documento
      doc.end();

    } catch (error) {
      console.error('Error al generar PDF de horario:', error);
      res.status(500).json({ 
        message: 'Error interno del servidor',
        error: error.message 
      });
    }
  }
};

module.exports = pdfController;