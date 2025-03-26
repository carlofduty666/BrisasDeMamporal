const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ruta de prueba para subida de archivos
router.post('/upload-test', (req, res) => {
  try {
    console.log('Headers:', req.headers);
    console.log('Files:', req.files ? Object.keys(req.files) : 'No hay archivos');
    
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }
    
    // Obtener el primer archivo
    const fieldName = Object.keys(req.files)[0];
    const file = req.files[fieldName];
    
    // Crear directorio si no existe
    const uploadDir = path.join(__dirname, '../uploads/test');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Generar nombre único
    const uniqueFilename = `test-${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    
    // Mover archivo
    file.mv(filePath, (err) => {
      if (err) {
        console.error('Error moviendo archivo:', err);
        return res.status(500).json({ message: err.message });
      }
      
      res.json({
        success: true,
        message: 'Archivo subido correctamente',
        file: {
          name: file.name,
          size: file.size,
          mimetype: file.mimetype,
          path: filePath
        }
      });
    });
  } catch (err) {
    console.error('Error en prueba de upload:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
