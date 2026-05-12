const db = require('../models');
const XlsxPopulate = require('xlsx-populate');
const path = require('path');

/**
 * ReporteController
 * Controlador para la generación de reportes en Excel imitando el estilo del colegio.
 */
const reporteController = {
    /**
     * Genera una nómina de estudiantes por sección imitando el estilo del archivo original.
     * GET /api/reportes/nomina-seccion/:seccionID
     */
    generarNominaSeccion: async (req, res) => {
        try {
            const { seccionID } = req.params;
            const { annoEscolarID } = req.query; // Opcional: filtrar por año escolar

            // 1. Obtener datos de la sección y sus estudiantes
            const seccion = await db.Secciones.findByPk(seccionID, {
                include: [
                    {
                        model: db.Grados,
                        as: 'Grados'
                    }
                ]
            });

            if (!seccion) {
                return res.status(404).json({ message: 'Sección no encontrada' });
            }

            // Buscar estudiantes asignados a esta sección
            const whereClause = { seccionID, rol: 'estudiante' };
            if (annoEscolarID) whereClause.annoEscolarID = annoEscolarID;

            const asignaciones = await db.Seccion_Personas.findAll({
                where: whereClause,
                include: [{
                    model: db.Personas,
                    as: 'personas',
                    attributes: ['cedula', 'apellido', 'nombre']
                }],
                order: [
                    [{ model: db.Personas, as: 'personas' }, 'apellido', 'ASC'],
                    [{ model: db.Personas, as: 'personas' }, 'nombre', 'ASC']
                ]
            });

            // 2. Crear el Excel con xlsx-populate
            const workbook = await XlsxPopulate.fromBlankAsync();
            const sheet = workbook.sheet(0).name("RESUMEN FINAL");

            // --- CONFIGURACIÓN DE ESTILOS (Basado en 1° Año.xlsx) ---
            
            // Anchos de columna
            sheet.column("A").width(4);      // N°
            sheet.column("B").width(15);     // C.I.
            sheet.column("C").width(25);     // APELLIDOS
            sheet.column("D").width(28);     // NOMBRES
            sheet.column("E").width(5);
            
            // Encabezados
            const headerStyle = {
                bold: true,
                fontSize: 10,
                fontFamily: "Arial",
                verticalAlignment: "center",
                horizontalAlignment: "center",
                border: true,
                fill: "F2F2F2"
            };

            sheet.cell("A1").value("N°").style(headerStyle);
            sheet.cell("B1").value("C. I.").style(headerStyle);
            sheet.cell("C1").value("APELLIDOS").style(headerStyle);
            sheet.cell("D1").value("NOMBRES").style(headerStyle);

            // 3. Renderizar los datos de la base de datos
            asignaciones.forEach((asig, index) => {
                const rowNum = index + 2;
                const estudiante = asig.personas;

                sheet.cell(`A${rowNum}`).value(index + 1);
                sheet.cell(`B${rowNum}`).value(estudiante.cedula);
                sheet.cell(`C${rowNum}`).value(estudiante.apellido);
                sheet.cell(`D${rowNum}`).value(estudiante.nombre);

                // Estilo de datos (Calibri 9pt)
                const dataRange = sheet.range(`A${rowNum}:D${rowNum}`);
                dataRange.style({
                    fontFamily: "Calibri",
                    fontSize: 9,
                    border: true
                });

                sheet.cell(`A${rowNum}`).style("horizontalAlignment", "center");
            });

            // 4. Preparar la descarga
            const fileName = `Nomina_${seccion.Grados.nombre_grado}_${seccion.nombre_seccion}.xlsx`;
            
            // Generar el buffer del archivo
            const buffer = await workbook.outputAsync();

            // Configurar cabeceras de respuesta para descarga
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            
            return res.send(buffer);

        } catch (error) {
            console.error('Error al generar reporte:', error);
            return res.status(500).json({ 
                message: 'Error al generar el reporte Excel',
                error: error.message 
            });
        }
    }
};

module.exports = reporteController;
