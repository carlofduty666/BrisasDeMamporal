const express = require('express');
const router = express.Router();
const documentosController = require('../controllers/documentos.controller');
const upload = require('../middlewares/upload.middleware');

// Rutas para documentos
router.get('/documentos', documentosController.getAllDocumentos);
router.get('/documentos/:id', documentosController.getDocumentoById);
router.get('/documentos/persona/:personaID', documentosController.getDocumentosByPersona);
router.post('/documentos', upload.single('archivo'), documentosController.uploadDocumento);
router.get('/documentos/:id/download', documentosController.downloadDocumento);
router.put('/documentos/:id', documentosController.updateDocumento);
router.delete('/documentos/:id', documentosController.deleteDocumento);

module.exports = router;
