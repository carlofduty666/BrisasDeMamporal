const db = require('../models');
const Documentos = db.Documentos;
const Personas = db.Personas;
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = './uploads/documentos';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB límite
  fileFilter: function(req, file, cb) {
    // Validar tipos de archivo permitidos
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Tipo de archivo no permitido. Solo se permiten PDF, JPEG, JPG y PNG.'), false);
    }
    cb(null, true);
  }
}).single('documento');

const documentosController = {
  // Middleware para manejar la subida de archivos
  uploadMiddleware: (req, res, next) => {
    upload(req, res, function(err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Error de Multer: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  
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
      if (!req.file) {
        return res.status(400).json({ message: 'No se ha subido ningún archivo' });
      }
      
      const { personaID, tipoDocumento, descripcion } = req.body;
      
      // Verificar que la persona existe
      const persona = await Personas.findByPk(personaID);
      if (!persona) {
        // Eliminar el archivo subido
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'Persona no encontrada' });
      }
      
      // Verificar si ya existe un documento del mismo tipo para esta persona
      const documentoExistente = await Documentos.findOne({
        where: { personaID, tipoDocumento }
      });
      
      if (documentoExistente) {
        // Eliminar el archivo anterior
        const rutaAnterior = path.join(__dirname, '..', documentoExistente.urlDocumento);
        if (fs.existsSync(rutaAnterior)) {
          fs.unlinkSync(rutaAnterior);
        }
        
        // Actualizar el documento existente
        await documentoExistente.update({
          urlDocumento: `/uploads/documentos/${req.file.filename}`,
          descripcion: descripcion || documentoExistente.descripcion
        });
        
        return res.json({
          message: 'Documento actualizado correctamente',
          documento: documentoExistente
        });
      }
      
      // Crear un nuevo documento
      const nuevoDocumento = await Documentos.create({
        personaID,
        tipoDocumento,
        urlDocumento: `/uploads/documentos/${req.file.filename}`,
        descripcion
      });
      
      res.status(201).json({
        message: 'Documento subido correctamente',
        documento: nuevoDocumento
      });
    } catch (err) {
      // Si hay un error y se subió un archivo, eliminarlo
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
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
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha subido ningún archivo' });
    }
    
    const { id } = req.params;
    const { descripcion } = req.body;
    
    // Verificar que el documento existe
    const documento = await Documentos.findByPk(id);
    if (!documento) {
      // Eliminar el archivo subido
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Documento no encontrado' });
    }
    
    // Eliminar el archivo anterior
    const rutaAnterior = path.join(__dirname, '..', documento.urlDocumento);
    if (fs.existsSync(rutaAnterior)) {
      fs.unlinkSync(rutaAnterior);
    }
    
    // Actualizar el documento
    await documento.update({
      urlDocumento: `/uploads/documentos/${req.file.filename}`,
      descripcion: descripcion || documento.descripcion
    });
    
    res.json({
      message: 'Documento actualizado correctamente',
      documento
    });
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
      
      const rutaArchivo = path.join(__dirname, '..', documento.urlDocumento);
      
      if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({ message: 'El archivo físico no existe' });
      }
      
      // Obtener el nombre original del archivo
      const nombreArchivo = path.basename(documento.urlDocumento);
      
      res.download(rutaArchivo, nombreArchivo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  },


  // verificarDocumentosRequeridos: async (req, res) => {
  //   try {
  //     const { personaID, tipoPersona } = req.params;
      
  //     // Verificar que la persona existe
  //     const persona = await Personas.findByPk(personaID);
  //     if (!persona) {
  //       return res.status(404).json({ message: 'Persona no encontrada' });
  //     }
      
  //     // Definir documentos requeridos según el tipo de persona
  //     let documentosRequeridos = [];
      
  //     switch (tipoPersona || persona.tipo) {
  //       case 'estudiante':
  //         documentosRequeridos = [
  //           'cedula',
  //           'partidaNacimiento',
  //           'boletin',
  //           'notasCertificadas',
  //           'fotoCarnet',
  //           'cedula',
  //           'boletinRetiroPlantel',
  //           'notasCertificadas',
  //           'fotoCarnet'
  //         ];
  //         break;
  //       case 'representante':
  //         documentosRequeridos = [
  //           'cedula',
  //           'constanciaTrabajo',
  //           'solvenciaPago',
  //           'fotoCarnet'
  //         ];
  //         break;
  //       case 'profesor':
  //         documentosRequeridos = [
  //           'cedula',
  //           'curriculumVitae',
  //           'titulo',
  //           'certificadoSalud',
  //           'foniatrico',
  //           'psicomental',
  //           'constanciaEstudio6toSemestre',
  //           'fotoCarta'
  //         ];
  //         break;
  //       case 'administrativo':
  //         documentosRequeridos = [
  //           'cedula',
  //           'curriculumVitae',
  //           'certificadoSalud',
  //           'psicomental',
  //           'titulo',
  //           'fotoCarta'
  //         ];
  //         break;
  //       case 'obrero':
  //         documentosRequeridos = [
  //           'cedula',
  //           'curriculumVitae',
  //           'certificadoSalud',
  //           'fotoCarta'
  //         ];
  //         break;
  //       default:
  //         return res.status(400).json({ message: 'Tipo de persona no válido' });
  //     }
      
  //     // Obtener documentos de la persona
  //     const documentosPersona = await Documentos.findAll({
  //       where: { personaID }
  //     });
      
  //     // Verificar cuáles documentos están presentes y cuáles faltan
  //     const documentosPresentes = documentosPersona.map(doc => doc.tipoDocumento);
  //     const documentosFaltantes = documentosRequeridos.filter(doc => !documentosPresentes.includes(doc));
      
  //     res.json({
  //       completo: documentosFaltantes.length === 0,
  //       documentosRequeridos,
  //       documentosPresentes,
  //       documentosFaltantes
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     res.status(500).json({ message: err.message });
  //   }
  // }

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
                { id: 'boletinRetiroPlantel', nombre: 'Boleta de Retiro', obligatorio: false }
            ],
            representante: [
                { id: 'cedula', nombre: 'Cédula de Identidad', obligatorio: true },
                { id: 'constanciaTrabajo', nombre: 'Constancia Laboral', obligatorio: true },
                { id: 'solvenciaPago', nombre: 'Solvencia de Pagos', obligatorio: true },
                { id: 'fotoCarnet', nombre: 'Foto Carnet', obligatorio: false }
            ]
        };

        if (personaID === '0') {
          if (!documentosConfig[tipoPersona]) {
            return res.status(400).json({ message: 'Tipo de persona no válido' });
          }
          return res.json({ documentosRequeridos: documentosConfig[tipoPersona] });
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
