// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Directorio base para uploads
// const uploadDir = path.join(__dirname, '../uploads/documentos');

// // Asegurarse de que el directorio existe
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir, { recursive: true });
//   console.log(`Directorio creado: ${uploadDir}`);
// }

// // Configuración de storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     console.log(`Guardando archivo en: ${uploadDir}`);
//     cb(null, uploadDir);
//   },
//   filename: function (req, file, cb) {
//     // Generar un nombre único para el archivo
//     const uniqueFilename = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
//     console.log(`Nombre de archivo generado: ${uniqueFilename}`);
//     cb(null, uniqueFilename);
//   }
// });


// // Configuración de Multer con más logs
// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10MB
//   },
//   fileFilter: function(req, file, cb) {
//     console.log(`Procesando archivo: ${file.originalname}, mimetype: ${file.mimetype}`);
    
//     // Permitir todos los tipos de archivo por ahora para depuración
//     cb(null, true);
//   }
// });

// module.exports = {
//   upload,
//   uploadDir
// };
