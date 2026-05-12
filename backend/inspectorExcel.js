const XlsxPopulate = require('xlsx-populate');
const path = require('path');

async function inspectExcel() {
    const filePath = path.join(__dirname, 'uploads', 'documentos', '1° Año.xlsx');
    
    try {
        const workbook = await XlsxPopulate.fromFileAsync(filePath);
        const sheets = workbook.sheets();
        
        console.log(`Workbook has ${sheets.length} sheets: ${sheets.map(s => s.name()).join(', ')}`);
        
        const firstSheet = sheets[0];
        const usedRange = firstSheet.usedRange();
        
        if (usedRange) {
            console.log(`First sheet range: ${usedRange.address()}`);
            
            // Inspect first few rows/cols to see headers and styling
            for (let r = 1; r <= 5; r++) {
                for (let c = 1; c <= 5; c++) {
                    const cell = firstSheet.row(r).cell(c);
                    const val = cell.value();
                    if (val) {
                        console.log(`Cell ${cell.address()}: "${val}"`);
                        console.log(`  - Fill:`, cell.style('fill'));
                        console.log(`  - Font: ${cell.style('fontSize')}pt ${cell.style('fontFamily')} (Bold: ${cell.style('bold')})`);
                        console.log(`  - Border:`, JSON.stringify(cell.style('border')));
                        console.log(`  - Width:`, firstSheet.column(c).width());
                        console.log(`  - Height:`, firstSheet.row(r).height());
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('Error reading file:', error);
    }
}

inspectExcel();
