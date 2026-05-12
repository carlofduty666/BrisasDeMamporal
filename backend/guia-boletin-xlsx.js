/**
 * GUÍA PARA GENERAR BOLETINES USANDO XLSX-POPULATE
 * Esta guía imita el estilo del archivo "1° Año.xlsx"
 */

const XlsxPopulate = require('xlsx-populate');
const path = require('path');

async function generarBoletin() {
    // 1. CREAR EL LIBRO (WORKBOOK)
    // También puedes cargar uno existente con XlsxPopulate.fromFileAsync(path)
    const workbook = await XlsxPopulate.fromBlankAsync();

    // 2. MANEJAR VARIAS HOJAS
    const sheet1 = workbook.sheet(0).name("RESUMEN FINAL");
    const sheet2 = workbook.addSheet("FÍSICA"); // Agregar nueva hoja
    const sheet3 = workbook.addSheet("DATOS BOLETIN");

    // --- TRABAJANDO EN "RESUMEN FINAL" ---

    // 3. TAMAÑO DE LAS CASILLAS (WIDTH / HEIGHT)
    sheet1.column("A").width(4);      // Columna para el número
    sheet1.column("B").width(15);     // C.I.
    sheet1.column("C").width(25);     // Apellidos
    sheet1.column("D").width(28);     // Nombres
    sheet1.column("E").width(7);      // Nota GHC
    
    // Altura de fila (opcional, si no se especifica es automática)
    sheet1.row(1).height(30);

    // 4. RANGO DE CASILLAS UNIDAS (MERGE)
    sheet1.range("A1:A2").merge(); // Une las filas 1 y 2 de la columna A
    sheet1.range("B1:B2").merge(); // Une C.I.
    sheet1.range("C1:C2").merge(); // Une Apellidos
    sheet1.range("D1:D2").merge(); // Une Nombres

    // 5. QUÉ IRÁ EN LA CASILLA (VALORES)
    sheet1.cell("A1").value("N°");
    sheet1.cell("B1").value("C. I.");
    sheet1.cell("C1").value("APELLIDOS");
    sheet1.cell("D1").value("NOMBRES");
    sheet1.cell("E1").value("GHC");

    // 6. ESTILOS: COLOR, BORDES, FUENTES, ALINEACIÓN
    
    // Estilo para el Encabezado
    const headerStyle = {
        fill: "F2F2F2",        // Color de fondo (Hexadecimal sin #)
        bold: true,            // Negrita
        fontSize: 10,          // Tamaño de letra
        fontFamily: "Arial",   // Tipo de fuente
        fontColor: "000000",   // Color de fuente
        horizontalAlignment: "center", // Alineación horizontal
        verticalAlignment: "center",   // Alineación vertical
        border: {              // Bordes
            top: { style: "thin", color: "000000" },
            bottom: { style: "thin", color: "000000" },
            left: { style: "thin", color: "000000" },
            right: { style: "thin", color: "000000" }
        }
    };

    // Aplicar estilo a un rango
    sheet1.range("A1:E2").style(headerStyle);

    // Personalizar un color específico (como el amarillo en GHC según tu archivo)
    sheet1.cell("E1").style("fill", "FFFF00"); // Amarillo

    // 7. RENDERIZAR INFO (DATOS)
    const estudiantes = [
        { ci: "V 33887451", apellidos: "MADRIZ FLORES", nombres: "RACIEL PAULINA", nota: 18 },
        { ci: "V 34160268", apellidos: "DUARTE LARA", nombres: "RONIEL ALEXANDER", nota: 15 }
    ];

    estudiantes.forEach((est, index) => {
        const rowNum = index + 3; // Empezamos en la fila 3
        
        sheet1.cell(`A${rowNum}`).value(index + 1);
        sheet1.cell(`B${rowNum}`).value(est.ci);
        sheet1.cell(`C${rowNum}`).value(est.apellidos);
        sheet1.cell(`D${rowNum}`).value(est.nombres);
        sheet1.cell(`E${rowNum}`).value(est.nota);

        // Estilo de datos: Calibrí 9pt, bordes finos
        const dataRange = sheet1.range(`A${rowNum}:E${rowNum}`);
        dataRange.style({
            fontFamily: "Calibri",
            fontSize: 9,
            border: true // Atajo para poner todos los bordes finos negros
        });
        
        // Alineación específica para el número y nota
        sheet1.cell(`A${rowNum}`).style("horizontalAlignment", "center");
        sheet1.cell(`E${rowNum}`).style("horizontalAlignment", "center");
    });

    // 8. GUARDAR EL ARCHIVO
    const outputPath = path.join(__dirname, 'uploads', 'documentos', 'Boletin_Generado.xlsx');
    await workbook.toFileAsync(outputPath);
    
    console.log("Archivo generado exitosamente en:", outputPath);
}

generarBoletin().catch(err => console.error(err));
