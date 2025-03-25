const express = require('express');
const router = express.Router();
const path = require('path');

router.post('/upload-test', (req, res) => {
  console.log("Test de carga de archivos");
  console.log("Body:", req.body);
  console.log("Files:", req.files ? Object.keys(req.files).length : 0);
  
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ message: 'No se recibieron archivos' });
  }
  
  const testFile = req.files.testFile;
  const uploadPath = path.join(__dirname, '../uploads/test-' + testFile.name);
  
  testFile.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    res.json({
      message: 'Archivo subido correctamente',
      fileName: testFile.name,
      path: uploadPath
    });
  });
});

module.exports = router;
