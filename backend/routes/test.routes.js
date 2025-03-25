const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración básica de multer para pruebas
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/test');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Ruta de prueba para subir un solo archivo
router.post('/upload-test', upload.single('testFile'), (req, res) => {
  console.log('Archivo recibido:', req.file);
  console.log('Datos del formulario:', req.body);
  
  if (!req.file) {
    return res.status(400).json({ message: 'No se recibió ningún archivo' });
  }
  
  res.json({ 
    message: 'Archivo subido correctamente',
    file: req.file
  });
});

module.exports = router;
