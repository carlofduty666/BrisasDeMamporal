const db = require('../models');
const Documentos = db.Documentos;
const Personas = db.Personas;
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Asegurar que el directorio de uploads existe
const uploadDir = path.join(__dirname, '../uploads/documentos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const documentosController = {
  // Obtener todos los documentos
  getAllDocumentos: async (req, res) => {
    try {
      const documentos = await Documentos.findAll({
        include: [
          {
            model: Personas,
            as: 'persona',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
          }
        ]
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
      
      const documentos = await Documentos.findAll({
        where: { personaID },
        include: [
          {
            model: Personas,
            as: 'persona',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
          }
        ]
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
        include: [
          {
            model: Personas,
            as: 'persona',
            attributes: ['id', 'nombre', 'apellido', 'cedula', 'tipo']
          }
        ]
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
  
  // Subir un documento
  uploadDocumento: async (req, res) => {
    try {
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({ message: 'No se ha subido ningún archivo' });
      }
      
      const { personaID, tipoDocumento, descripcion } = req.body;
      const archivo = req.files.documento; // 'documento' es el nombre del campo en el formulario
      
      // Verificar que la persona existe
      const persona = await Personas.findByPk(personaID);
      if (!persona) {
        return res.status(404).json({ message: 'Persona no encontrada' });
      }
      
      // Generar nombre único para el archivo
      const uniqueFilename = `${Date.now()}-${uuidv4()}-${archivo.name.replace(/\s+/g, '_')}`;
      const uploadPath = path.join(uploadDir, uniqueFilename);
      
      // Mover el archivo al directorio de uploads
      await archivo.mv(uploadPath);
      
      // Crear un nuevo documento en la base de datos
      const nuevoDocumento = await Documentos.create({
        personaID,
        tipoDocumento,
        urlDocumento: `/uploads/documentos/${uniqueFilename}`,
        nombre_archivo: archivo.name,
        tamano: archivo.size,
        tipo_archivo: archivo.mimetype,
        descripcion: descripcion || `Documento: ${tipoDocumento}`
      });
      
      res.status(201).json({
        message: 'Documento subido correctamente',
        documento: nuevoDocumento
      });
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
      const rutaArchivo = path.join(__dirname, '..', documento.urlDocumento);
      if (fs.existsSync(rutaArchivo)) {
        fs.unlinkSync(rutaArchivo);
      }
      
      // Eliminar el registro de la base de datos
      await documento.destroy();
      
      res.json({ message: 'Documento eliminado correctamente' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Actualizar un documento
  updateDocumento: async (req, res) => {
    try {
      const { id } = req.params;
      const { descripcion } = req.body;
      
      const documento = await Documentos.findByPk(id);
      if (!documento) {
        return res.status(404).json({ message: 'Documento no encontrado' });
      }
      
      if (!req.files || !req.files.documento) {
        // Solo actualizar la descripción
        await documento.update({ descripcion });
        return res.json({
          message: 'Descripción del documento actualizada correctamente',
          documento
        });
      }
      
      const archivo = req.files.documento;
      
      // Eliminar el archivo anterior
      const rutaAnterior = path.join(__dirname, '..', documento.urlDocumento);
      if (fs.existsSync(rutaAnterior)) {
        fs.unlinkSync(rutaAnterior);
      }
      
      // Generar nombre único para el nuevo archivo
      const uniqueFilename = `${Date.now()}-${uuidv4()}-${archivo.name.replace(/\s+/g, '_')}`;
      const uploadPath = path.join(uploadDir, uniqueFilename);
      
      // Mover el nuevo archivo al directorio de uploads
      await archivo.mv(uploadPath);
      
      // Actualizar el documento
      await documento.update({
        urlDocumento: `/uploads/documentos/${uniqueFilename}`,
        nombre_archivo: archivo.name,
        tamano: archivo.size,
        tipo_archivo: archivo.mimetype,
        descripcion: descripcion || documento.descripcion
      });
      
      res.json({
        message: 'Documento actualizado correctamente',
        documento
      });
    } catch (err) {
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
      
      const rutaArchivo = path.join(__dirname, '..', documento.urlDocumento);
      
      if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({ message: 'El archivo físico no existe' });
      }
      
      res.download(rutaArchivo, documento.nombre_archivo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },

// Verificar documentos requeridos
verificarDocumentosRequeridos: async (req, res) => {
  try {
    const { personaID, tipoPersona } = req.params;
    
    // Configuración completa de documentos con estructura de objetos
    const documentosConfig = {
      estudiante: [
        { id: 'cedula', nombre: 'Cédula Escolar', obligatorio: false },
        { id: 'partidaNacimiento', nombre: 'Partida de Nacimiento', obligatorio: true },
        { id: 'boletin', nombre: 'Boletín de Calificaciones', obligatorio: true },
        { id: 'notasCertificadas', nombre: 'Notas Certificadas', obligatorio: true },
        { id: 'fotoCarnet', nombre: 'Foto Carnet', obligatorio: true },
        { id: 'boletaRetiroPlantel', nombre: 'Boleta de Retiro', obligatorio: true }
      ],
      representante: [
        { id: 'cedula', nombre: 'Cédula de Identidad', obligatorio: true },
        { id: 'constanciaTrabajo', nombre: 'Constancia Laboral', obligatorio: true },
        { id: 'solvenciaPago', nombre: 'Solvencia de Pagos', obligatorio: true },
        { id: 'fotoCarnet', nombre: 'Foto Carnet', obligatorio: true }
      ],
      profesor: [
        { id: 'cedula', nombre: 'Cédula de Identidad', obligatorio: true },
        { id: 'curriculumVitae', nombre: 'Currículum Vitae', obligatorio: true },
        { id: 'titulo', nombre: 'Título Profesional', obligatorio: true },
        { id: 'certificadoSalud', nombre: 'Certificado de Salud', obligatorio: true },
        { id: 'foniatrico', nombre: 'Foniatría', obligatorio: true },
        { id: 'psicomental', nombre: 'Psicomental', obligatorio: true },
        { id: 'constanciaEstudio6toSemestre', nombre: 'Constancia de Estudio 6to Semestre', obligatorio: true },
        { id: 'fotoCarta', nombre: 'Foto Carta', obligatorio: true }
      ],
      administrativo: [
        { id: 'cedula', nombre: 'Cédula de Identidad', obligatorio: true },
        { id: 'curriculumVitae', nombre: 'Currículum Vitae', obligatorio: true },
        { id: 'certificadoSalud', nombre: 'Certificado de Salud', obligatorio: true },
        { id: 'psicomental', nombre: 'Psicomental', obligatorio: true },
        { id: 'titulo', nombre: 'Título Profesional', obligatorio: true },
        { id: 'fotoCarta', nombre: 'Foto Carta', obligatorio: true }
      ],
      obrero: [
        { id: 'cedula', nombre: 'Cédula de Identidad', obligatorio: true },
        { id: 'curriculumVitae', nombre: 'Currículum Vitae', obligatorio: true },
        { id: 'certificadoSalud', nombre: 'Certificado de Salud', obligatorio: true },
        { id: 'fotoCarta', nombre: 'Foto Carta', obligatorio: true }
      ]
    };

    if (personaID === '0') {
      // Devuelve TODA la configuración cuando personaID es 0
      return res.json({ 
        documentosConfig,
        documentosRequeridos: documentosConfig[tipoPersona] 
      });
    }

    // Caso para persona existente (personaID válido)
    const persona = await Personas.findByPk(personaID);
    if (!persona) return res.status(404).json({ message: 'Persona no encontrada' });

    const tipo = tipoPersona || persona.tipo;
    if (!documentosConfig[tipo]) return res.status(400).json({ message: 'Tipo no válido' });

    const documentosPersona = await Documentos.findAll({ where: { personaID } });
    const documentosPresentes = documentosPersona.map(doc => doc.tipoDocumento);

    const documentosRequeridos = documentosConfig[tipo].map(doc => ({
      ...doc,
      subido: documentosPresentes.includes(doc.id)
    }));

    res.json({
      completo: documentosRequeridos.every(doc => !doc.obligatorio || doc.subido),
      documentosRequeridos
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}
};

module.exports = documentosController;