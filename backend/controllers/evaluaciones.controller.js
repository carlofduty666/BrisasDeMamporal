const db = require('../models');
const Evaluaciones = db.Evaluaciones;
const Materias = db.Materias;
const Grados = db.Grados;
const Secciones = db.Secciones;
const Personas = db.Personas;
const AnnoEscolar = db.AnnoEscolar;
const ArchivosEvaluaciones = db.ArchivosEvaluaciones;
const fs = require('fs');
const path = require('path');

const evaluacionesController = {
    // Obtener todas las evaluaciones
    getAllEvaluaciones: async (req, res) => {
      try {
        const evaluaciones = await Evaluaciones.findAll({
          include: [
            { model: Materias, as: 'Materias' },
            { model: Grados, as: 'Grado' },
            { model: Secciones, as: 'Seccion' },
            { model: Personas, as: 'Profesor', attributes: ['id', 'nombre', 'apellido'] },
            { model: AnnoEscolar, as: 'AnnoEscolar' }
          ]
        });
        res.json(evaluaciones);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
      }
    },

    // Obtener una evaluación por ID
    getEvaluacionById: async (req, res) => {
        try {
          const { id } = req.params;
          
          const evaluacion = await Evaluaciones.findByPk(id, {
            include: [
              { model: Materias, as: 'Materias' },
              { model: Grados, as: 'Grado' },
              { model: Secciones, as: 'Seccion' },
              { model: Personas, as: 'Profesor', attributes: ['id', 'nombre', 'apellido'] },
              { model: AnnoEscolar, as: 'AnnoEscolar' },
              { model: ArchivosEvaluaciones, as: 'Archivos' }
            ]
          });
          
          if (!evaluacion) {
            return res.status(404).json({ message: 'Evaluación no encontrada' });
          }
          
          res.json(evaluacion);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: err.message });
        }
    },

    // Obtener evaluaciones por materia, grado, sección y año escolar
    getEvaluacionesFiltradas: async (req, res) => {
        try {
        const { materiaID, gradoID, seccionID, annoEscolarID, lapso } = req.query;
        
        const whereClause = {};
        
        if (materiaID) whereClause.materiaID = materiaID;
        if (gradoID) whereClause.gradoID = gradoID;
        if (seccionID) whereClause.seccionID = seccionID;
        if (annoEscolarID) whereClause.annoEscolarID = annoEscolarID;
        if (lapso) whereClause.lapso = lapso;
        
        const evaluaciones = await Evaluaciones.findAll({
            where: whereClause,
            include: [
            { model: Materias, as: 'Materias' },
            { model: Grados, as: 'Grado' },
            { model: Secciones, as: 'Seccion' },
            { model: Personas, as: 'Profesor', attributes: ['id', 'nombre', 'apellido'] },
            { model: AnnoEscolar, as: 'AnnoEscolar' }
            ]
        });
        
        res.json(evaluaciones);
        } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
        }
    },    

    createEvaluacion: async (req, res) => {
        try {
            let {
                nombreEvaluacion,
                tipoEvaluacion,
                porcentaje,
                lapso,
                materiaID,
                gradoID,
                seccionID,
                profesorID,
                annoEscolarID,
                descripcion,
                fechaEvaluacion,
                requiereEntrega,
                fechaLimiteEntrega
            } = req.body;

            if (!annoEscolarID) {
                const annoEscolarActual = await db.AnnoEscolar.findOne({
                    where: { activo: true }
                });
                
                if (!annoEscolarActual) {
                    return res.status(400).json({ 
                        message: 'No hay un año escolar activo. Por favor, especifique el año escolar.' 
                    });
                }
                
                annoEscolarID = annoEscolarActual.id;
            }

            const profesorMateriaGrado = await db.Profesor_Materia_Grados.findOne({
                where: {
                    profesorID,
                    materiaID,
                    gradoID
                }
            });
            
            if (!profesorMateriaGrado) {
                return res.status(400).json({
                    message: 'No estás autorizado para crear evaluaciones para esta materia en este grado'
                });
            }
    
            // Validar que la suma de porcentajes no exceda el 100% para el lapso
            const evaluacionesExistentes = await Evaluaciones.findAll({
                where: {
                    materiaID,
                    gradoID,
                    seccionID,
                    annoEscolarID,
                    lapso
                }
            });
    
            const sumaPorcentajes = evaluacionesExistentes.reduce((sum, eval) => sum + eval.porcentaje, 0);
    
            if (sumaPorcentajes + parseFloat(porcentaje) > 100) {
                return res.status(400).json({
                    message: `La suma de porcentajes excede el 100% para el lapso ${lapso}. Porcentaje disponible: ${100 - sumaPorcentajes}%`
                });
            }
    
            // Crear la evaluación
            const nuevaEvaluacion = await Evaluaciones.create({
                nombreEvaluacion,
                tipoEvaluacion,
                porcentaje,
                lapso,
                materiaID,
                gradoID,
                seccionID,
                profesorID,
                annoEscolarID,
                descripcion,
                fechaEvaluacion,
                requiereEntrega,
                fechaLimiteEntrega
            });
    
            // Si hay un archivo adjunto (procesado por express-fileupload)
            if (req.files && req.files.archivo) {
                const archivo = req.files.archivo;
                const fileName = `${Date.now()}-${archivo.name}`;
                const uploadPath = path.join(__dirname, '../uploads/evaluaciones', fileName);
    
                // Crear directorio si no existe
                const dir = path.join(__dirname, '../uploads/evaluaciones');
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
    
                // Mover el archivo al directorio de uploads
                await archivo.mv(uploadPath);
    
                // Actualizar la evaluación con la información del archivo
                await nuevaEvaluacion.update({
                    archivoURL: `/uploads/evaluaciones/${fileName}`,
                    nombreArchivo: archivo.name,
                    tipoArchivo: archivo.mimetype,
                    tamanoArchivo: archivo.size
                });
            }
    
            res.status(201).json(nuevaEvaluacion);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },

    // Actualizar una evaluación
    updateEvaluacion: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                nombreEvaluacion,
                tipoEvaluacion,
                porcentaje,
                lapso,
                materiaID,
                gradoID,
                seccionID,
                profesorID,
                annoEscolarID,
                descripcion,
                fechaEvaluacion,
                requiereEntrega,
                fechaLimiteEntrega
            } = req.body;
    
            const evaluacion = await Evaluaciones.findByPk(id);
    
            if (!evaluacion) {
                return res.status(404).json({ message: 'Evaluación no encontrada' });
            }
    
            // Si cambia el lapso o el porcentaje, validar que no exceda el 100%
            if (lapso !== evaluacion.lapso || parseFloat(porcentaje) !== evaluacion.porcentaje) {
                const evaluacionesExistentes = await Evaluaciones.findAll({
                    where: {
                        materiaID: materiaID || evaluacion.materiaID,
                        gradoID: gradoID || evaluacion.gradoID,
                        seccionID: seccionID || evaluacion.seccionID,
                        annoEscolarID: annoEscolarID || evaluacion.annoEscolarID,
                        lapso: lapso || evaluacion.lapso,
                        id: { [db.Sequelize.Op.ne]: id } // Excluir la evaluación actual
                    }
                });
    
                const sumaPorcentajes = evaluacionesExistentes.reduce((sum, eval) => sum + eval.porcentaje, 0);
    
                if (sumaPorcentajes + parseFloat(porcentaje) > 100) {
                    return res.status(400).json({
                        message: `La suma de porcentajes excede el 100% para el lapso ${lapso || evaluacion.lapso}. Porcentaje disponible: ${100 - sumaPorcentajes}%`
                    });
                }
            }
    
            // Actualizar la evaluación
            await evaluacion.update({
                nombreEvaluacion: nombreEvaluacion || evaluacion.nombreEvaluacion,
                tipoEvaluacion: tipoEvaluacion || evaluacion.tipoEvaluacion,
                porcentaje: porcentaje || evaluacion.porcentaje,
                lapso: lapso || evaluacion.lapso,
                materiaID: materiaID || evaluacion.materiaID,
                gradoID: gradoID || evaluacion.gradoID,
                seccionID: seccionID || evaluacion.seccionID,
                profesorID: profesorID || evaluacion.profesorID,
                annoEscolarID: annoEscolarID || evaluacion.annoEscolarID,
                descripcion: descripcion !== undefined ? descripcion : evaluacion.descripcion,
                fechaEvaluacion: fechaEvaluacion || evaluacion.fechaEvaluacion,
                requiereEntrega: requiereEntrega !== undefined ? requiereEntrega : evaluacion.requiereEntrega,
                fechaLimiteEntrega: fechaLimiteEntrega || evaluacion.fechaLimiteEntrega
            });
    
            // Si hay un nuevo archivo adjunto
            if (req.files && req.files.archivo) {
                // Si ya había un archivo, eliminarlo
                if (evaluacion.archivoURL) {
                    const oldFilePath = path.join(__dirname, '..', evaluacion.archivoURL);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }
    
                const archivo = req.files.archivo;
                const fileName = `${Date.now()}-${archivo.name}`;
                const uploadPath = path.join(__dirname, '../uploads/evaluaciones', fileName);
    
                // Crear directorio si no existe
                const dir = path.join(__dirname, '../uploads/evaluaciones');
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
    
                // Mover el archivo al directorio de uploads
                await archivo.mv(uploadPath);
    
                // Actualizar con el nuevo archivo
                await evaluacion.update({
                    archivoURL: `/uploads/evaluaciones/${fileName}`,
                    nombreArchivo: archivo.name,
                    tipoArchivo: archivo.mimetype,
                    tamanoArchivo: archivo.size
                });
            }
    
            res.json(evaluacion);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },
    
    // Eliminar una evaluación
    deleteEvaluacion: async (req, res) => {
        try {
        const { id } = req.params;
        
        const evaluacion = await Evaluaciones.findByPk(id);
        
        if (!evaluacion) {
            return res.status(404).json({ message: 'Evaluación no encontrada' });
        }
        
        // Verificar si hay calificaciones asociadas
        const calificaciones = await db.Calificaciones.count({ where: { evaluacionID: id } });
        
        if (calificaciones > 0) {
            return res.status(400).json({ 
            message: 'No se puede eliminar la evaluación porque tiene calificaciones asociadas' 
            });
        }
        
        // Si hay un archivo, eliminarlo
        if (evaluacion.archivoURL) {
            const filePath = path.join(__dirname, '..', evaluacion.archivoURL);
            if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            }
        }
        
        // Eliminar archivos adjuntos asociados
        const archivos = await ArchivosEvaluaciones.findAll({ where: { evaluacionID: id } });
        
        for (const archivo of archivos) {
            const filePath = path.join(__dirname, '..', archivo.archivoURL);
            if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            }
            await archivo.destroy();
        }
        
        // Eliminar la evaluación
        await evaluacion.destroy();
        
        res.json({ message: 'Evaluación eliminada correctamente' });
        } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
        }
    },

    // Subir archivo adjunto a una evaluación
    uploadArchivoEvaluacion: async (req, res) => {
        try {
            const { evaluacionID, descripcion } = req.body;

            if (!req.files || !req.files.archivo) {
                return res.status(400).json({ message: 'No se ha subido ningún archivo' });
            }

            const evaluacion = await Evaluaciones.findByPk(evaluacionID);

            if (!evaluacion) {
                return res.status(404).json({ message: 'Evaluación no encontrada' });
            }

            const archivo = req.files.archivo;
            const fileName = `${Date.now()}-${archivo.name}`;
            const uploadPath = path.join(__dirname, '../uploads/evaluaciones', fileName);

            // Crear directorio si no existe
            const dir = path.join(__dirname, '../uploads/evaluaciones');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Mover el archivo al directorio de uploads
            await archivo.mv(uploadPath);

            // Crear el registro del archivo
            const nuevoArchivo = await ArchivosEvaluaciones.create({
                evaluacionID,
                archivoURL: `/uploads/evaluaciones/${fileName}`,
                nombreArchivo: archivo.name,
                tipoArchivo: archivo.mimetype,
                tamanoArchivo: archivo.size,
                descripcion: descripcion || null
            });

            res.status(201).json(nuevoArchivo);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },

    // Eliminar archivo adjunto
    deleteArchivoEvaluacion: async (req, res) => {
        try {
        const { id } = req.params;
        
        const archivo = await ArchivosEvaluaciones.findByPk(id);
        
        if (!archivo) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
        }
        
        // Eliminar el archivo físico
        const filePath = path.join(__dirname, '..', archivo.archivoURL);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        // Eliminar el registro
        await archivo.destroy();
        
        res.json({ message: 'Archivo eliminado correctamente' });
        } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
        }
    },

    // Descargar archivo de evaluación
    downloadArchivoEvaluacion: async (req, res) => {
        try {
        const { id } = req.params;
        
        // Determinar si es un archivo de evaluación principal o un archivo adjunto
        let archivo;
        let filePath;
        
        if (req.query.tipo === 'adjunto') {
            archivo = await ArchivosEvaluaciones.findByPk(id);
            if (!archivo) {
            return res.status(404).json({ message: 'Archivo adjunto no encontrado' });
            }
            filePath = path.join(__dirname, '..', archivo.archivoURL);
        } else {
            const evaluacion = await Evaluaciones.findByPk(id);
            if (!evaluacion || !evaluacion.archivoURL) {
            return res.status(404).json({ message: 'Archivo de evaluación no encontrado' });
            }
            archivo = evaluacion;
            filePath = path.join(__dirname, '..', evaluacion.archivoURL);
        }
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'El archivo físico no existe' });
        }
        
        res.download(filePath, archivo.nombreArchivo);
        } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
        }
    },
  
    // Obtener evaluaciones por profesor
    getEvaluacionesByProfesor: async (req, res) => {
        try {
        const { profesorID } = req.params;
        const { annoEscolarID } = req.query;
        
        const whereClause = { profesorID };
        if (annoEscolarID) whereClause.annoEscolarID = annoEscolarID;
        
        const evaluaciones = await Evaluaciones.findAll({
            where: whereClause,
            include: [
            { model: Materias, as: 'Materias' },
            { model: Grados, as: 'Grado' },
            { model: Secciones, as: 'Seccion' },
            { model: AnnoEscolar, as: 'AnnoEscolar' }
            ]
        });
        
        res.json(evaluaciones);
        } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
        }
    },
  
    // Obtener evaluaciones por estudiante (a través de su sección)
    getEvaluacionesByEstudiante: async (req, res) => {
        try {
        const { estudianteID } = req.params;
        const { annoEscolarID } = req.query;
        
        // Buscar la sección del estudiante para el año escolar actual
        const seccionPersona = await db.Seccion_Personas.findOne({
            where: {
            personaID: estudianteID,
            annoEscolarID: annoEscolarID || { [db.Sequelize.Op.ne]: null }
            },
            order: [['annoEscolarID', 'DESC']]
        });
        
        if (!seccionPersona) {
            return res.status(404).json({ message: 'El estudiante no está asignado a ninguna sección' });
        }
        
        // Buscar el grado de la sección
        const seccion = await db.Secciones.findByPk(seccionPersona.seccionID);
        
        if (!seccion) {
            return res.status(404).json({ message: 'Sección no encontrada' });
        }
        
        // Buscar evaluaciones para esa sección y grado
        const evaluaciones = await Evaluaciones.findAll({
            where: {
            seccionID: seccionPersona.seccionID,
            gradoID: seccion.gradoID,
            annoEscolarID: seccionPersona.annoEscolarID
            },
            include: [
            { model: Materias, as: 'Materias' },
            { model: Grados, as: 'Grado' },
            { model: Secciones, as: 'Seccion' },
            { model: Personas, as: 'Profesor', attributes: ['id', 'nombre', 'apellido'] },
            { model: AnnoEscolar, as: 'AnnoEscolar' }
            ]
        });
        
        res.json(evaluaciones);
        } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
        }
    },
  
  // Verificar si la suma de porcentajes de evaluaciones es 100% para un lapso
    verificarPorcentajesLapso: async (req, res) => {
        try {
        const { materiaID, gradoID, seccionID, annoEscolarID, lapso } = req.query;
        
        if (!materiaID || !gradoID || !seccionID || !annoEscolarID || !lapso) {
            return res.status(400).json({ message: 'Todos los parámetros son requeridos' });
        }
        
        const evaluaciones = await Evaluaciones.findAll({
            where: {
            materiaID,
            gradoID,
            seccionID,
            annoEscolarID,
            lapso
            },
            attributes: ['id', 'nombreEvaluacion', 'porcentaje']
        });
        
        const sumaPorcentajes = evaluaciones.reduce((sum, eval) => sum + eval.porcentaje, 0);
        const porcentajeFaltante = 100 - sumaPorcentajes;
        
        res.json({
            completo: Math.abs(porcentajeFaltante) < 0.01, // Considerar completo si la diferencia es menor a 0.01
            sumaPorcentajes,
            porcentajeFaltante,
            evaluaciones
        });
        } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
        }
    },

    // Obtener evaluaciones por profesor
    getEvaluacionesByProfesor: async (req, res) => {
        try {
            const { profesorID } = req.params;
            const { annoEscolarID, materiaID, gradoID, seccionID, lapso } = req.query;

            if (!profesorID) {
                return res.status(400).json({ message: 'Se requiere el ID del profesor' });
            }

            // Construir filtros
            const whereClause = { profesorID };
            if (annoEscolarID) whereClause.annoEscolarID = annoEscolarID;
            if (materiaID) whereClause.materiaID = materiaID;
            if (gradoID) whereClause.gradoID = gradoID;
            if (seccionID) whereClause.seccionID = seccionID;
            if (lapso) whereClause.lapso = lapso;

            const evaluaciones = await Evaluaciones.findAll({
                where: whereClause,
                include: [
                    { model: Materias, as: 'Materias' },
                    { model: Grados, as: 'Grado' },
                    { model: Secciones, as: 'Seccion' },
                    { model: Personas, as: 'Profesor', attributes: ['id', 'nombre', 'apellido'] },
                    { model: AnnoEscolar, as: 'AnnoEscolar' },
                    { model: ArchivosEvaluaciones, as: 'Archivos' }
                ],
                order: [['createdAt', 'DESC']]
            });

            res.json(evaluaciones);
        } catch (err) {
            console.error('Error al obtener evaluaciones del profesor:', err);
            res.status(500).json({ message: err.message });
        }
    }
}

module.exports = evaluacionesController;