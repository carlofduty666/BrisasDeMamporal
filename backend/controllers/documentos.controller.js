const db = require('../models');
const Documentos = db.Documentos;
const Personas = db.Personas;
const fs = require('fs');
const path = require('path');

const documentosController = {
  // Obtener todos los documentos
  getAllDocumentos: async (req, res) => {
    try {
      const documentos = await Documentos.findAll({
        include: [{
          model: Personas,
          as: 'persona',
          attributes: ['id', 'nombre', 'apellido', 'cedula']
        }]
      });
      res.json(documentos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener documentos por persona
  getDocumentosByPersona: async (req, res) => {
    try {
      const { personaID } = req.params;
      
      const persona = await Personas.findByPk(personaID);
      if (!persona) {
        return res.status(404).json({ message: 'Persona no encontrada' });
      }
      
      const documentos = await Documentos.findAll({
        where: { personaID },
        include: [{
          model: Personas,
          as: 'persona',
          attributes: ['id', 'nombre', 'apellido', 'cedula']
        }]
      });
      
      res.json(documentos);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Obtener documento por ID
  getDocumentoById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const documento = await Documentos.findByPk(id, {
        include: [{
          model: Personas,
          as: 'persona',
          attributes: ['id', 'nombre', 'apellido', 'cedula']
        }]
      });
      
      if (!documento) {
        return res.status(404).json({ message: 'Documento no encontrado' });
      }
      
      res.json(documento);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Subir un nuevo documento (adaptado para Multer)
  uploadDocumento: async (req, res) => {
    try {
      // Multer ya ha procesado el archivo y lo ha guardado en req.file
      if (!req.file) {
        return res.status(400).json({ message: 'No se ha subido ningún archivo' });
      }
      
      const { personaID, tipo, descripcion } = req.body;
      
      // Verificar que la persona existe
      const persona = await Personas.findByPk(personaID);
      if (!persona) {
        // Si la persona no existe, eliminar el archivo subido
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Persona no encontrada' });
      }
      
      // Crear el registro en la base de datos
      const newDocumento = await Documentos.create({
        personaID,
        tipo,
        descripcion,
        urlDocumento: `/uploads/documentos/${req.file.filename}`,
        nombre_archivo: req.file.originalname,
        tamano: req.file.size,
        tipo_archivo: req.file.mimetype
      });
      
      res.status(201).json(newDocumento);
    } catch (err) {
      // Si hay un error y se subió un archivo, eliminarlo
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Descargar un documento
  downloadDocumento: async (req, res) => {
    try {
      const { id } = req.params;
      
      const documento = await Documentos.findByPk(id);
      if (!documento) {
        return res.status(404).json({ message: 'Documento no encontrado' });
      }
      
      const filePath = path.join(__dirname, '..', documento.urlDocumento); // 
      
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Archivo no encontrado en el servidor' });
      }
      
      res.download(filePath, documento.nombre_archivo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Eliminar un documento
  deleteDocumento: async (req, res) => {
    try {
      const { id } = req.params;
      
      const documento = await Documentos.findByPk(id);
      if (!documento) {
        return res.status(404).json({ message: 'Documento no encontrado' });
      }
      
      // Eliminar el archivo físico
      const filePath = path.join(__dirname, '..', documento.urlDocumento);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Eliminar el registro de la base de datos
      await documento.destroy();
      
      res.json({ message: 'Documento eliminado correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Actualizar información de un documento
  updateDocumento: async (req, res) => {
    try {
      const { id } = req.params;
      const { tipo, descripcion } = req.body;
      
      const documento = await Documentos.findByPk(id);
      if (!documento) {
        return res.status(404).json({ message: 'Documento no encontrado' });
      }
      
      await documento.update({ tipo, descripcion });
      
      res.json(documento);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = documentosController;
