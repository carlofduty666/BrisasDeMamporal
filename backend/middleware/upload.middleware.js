const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Directorio base para uploads
const uploadDir = path.join(__dirname, '../uploads/documentos');

// Asegurarse de que el directorio existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Directorio creado: ${uploadDir}`);
}

// Configuración de storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(`Guardando archivo en: ${uploadDir}`);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${Date.now()}-${file.originalname}`;
    console.log(`Nombre de archivo generado: ${uniqueFilename}`);
    cb(null, uniqueFilename);
  }
});

// Filtro para validar tipos de archivos
const fileFilter = (req, file, cb) => {
  console.log(`Verificando tipo de archivo: ${file.mimetype}`);
  // Tipos de archivos permitidos
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log(`Tipo de archivo rechazado: ${file.mimetype}`);
    cb(null, false); // No lanzar error, solo rechazar el archivo
  }
};

// Configuración de Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10 // Máximo 10 archivos por solicitud
  },
  fileFilter: fileFilter
});

module.exports = {
  upload
};
