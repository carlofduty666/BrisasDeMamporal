const express = require('express');
const router = express.Router();
const documentosController = require('../controllers/documentos.controller');
const authMiddleware = require('../middleware/auth.middleware');


// Rutas para documentos
router.get('/documentos', authMiddleware.verifyToken, documentosController.getAllDocumentos);
router.get('/documentos/persona/:personaID', authMiddleware.verifyToken, documentosController.getDocumentosByPersona);
router.get('/documentos/:id', authMiddleware.verifyToken, documentosController.getDocumentoById);
router.get('/documentos/:id/download', documentosController.downloadDocumento);
router.get('/documentos/:id/preview', documentosController.previewDocumento);
router.get('/documentos/persona/:personaID/download-all', authMiddleware.verifyToken, documentosController.downloadAllDocumentos);
router.get('/documentos/verificar/:personaID/:tipoPersona', documentosController.verificarDocumentosRequeridos);

// Ruta para subir un documento
router.post('/documentos', authMiddleware.verifyToken, documentosController.uploadDocumento);

router.post('/documentos/upload', documentosController.uploadDocumento);

router.put('/documentos/:id', authMiddleware.verifyToken, documentosController.updateDocumento);
router.delete('/documentos/:id', authMiddleware.verifyToken, documentosController.deleteDocumento);

module.exports = router;