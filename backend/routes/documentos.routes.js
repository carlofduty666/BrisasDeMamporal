const express = require('express');
const router = express.Router();
const documentosController = require('../controllers/documentos.controller');

// Rutas para documentos
router.get('/documentos', documentosController.getAllDocumentos);
router.get('/documentos/:id', documentosController.getDocumentoById);
router.get('/documentos/persona/:personaID', documentosController.getDocumentosByPersona);
router.get('/documentos/verificar/:personaID/:tipoPersona?', documentosController.verificarDocumentosRequeridos); // Nueva ruta para verificar documentos requeridos
router.get('/documentos/descargar/:id', documentosController.downloadDocumento);

router.post('/documentos/upload', documentosController.uploadMiddleware, documentosController.uploadDocumento);

router.put('/documentos/:id', documentosController.uploadMiddleware, documentosController.updateDocumento);


router.delete('/documentos/:id', documentosController.deleteDocumento);

module.exports = router;
