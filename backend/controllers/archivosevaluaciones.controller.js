const db = require('../models');
const ArchivosEvaluaciones = db.ArchivosEvaluaciones;
const Evaluaciones = db.Evaluaciones;
const Personas = db.Personas;
const fs = require('fs');
const path = require('path');

const archivosEvaluacionesController = {
    // Obtener archivos de una evaluación específica
    getArchivosByEvaluacion: async (req, res) => {
        try {
            const { evaluacionID } = req.params;
            
            const archivos = await ArchivosEvaluaciones.findAll({
                where: { evaluacionID },
                include: [
                    { 
                        model: Evaluaciones, 
                        as: 'Evaluacion',
                        include: [
                            { model: db.Personas, as: 'Profesor', attributes: ['id', 'nombre', 'apellido'] }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            
            res.json(archivos);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },

    // Obtener archivos entregados por un estudiante para una evaluación
    getArchivosByEstudiante: async (req, res) => {
        try {
            const { evaluacionID, estudianteID } = req.params;
            
            const archivos = await ArchivosEvaluaciones.findAll({
                where: { evaluacionID, estudianteID },
                include: [
                    { 
                        model: Evaluaciones, 
                        as: 'Evaluacion',
                        include: [
                            { model: db.Materias, as: 'Materias' },
                            { model: db.Personas, as: 'Profesor', attributes: ['id', 'nombre', 'apellido'] }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            
            res.json(archivos);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },

    // Subir archivo de entrega de estudiante
    uploadArchivoEstudiante: async (req, res) => {
        try {
            const { evaluacionID } = req.params;
            const { estudianteID, descripcion } = req.body;
            
            // Verificar que la evaluación existe y requiere entrega
            const evaluacion = await Evaluaciones.findByPk(evaluacionID);
            if (!evaluacion) {
                return res.status(404).json({ message: 'Evaluación no encontrada' });
            }
            
            if (!evaluacion.requiereEntrega) {
                return res.status(400).json({ message: 'Esta evaluación no requiere entrega de archivos' });
            }
            
            // Verificar que no se ha pasado la fecha límite
            if (evaluacion.fechaLimiteEntrega && new Date() > new Date(evaluacion.fechaLimiteEntrega)) {
                return res.status(400).json({ message: 'La fecha límite de entrega ha pasado' });
            }
            
            if (!req.files || !req.files.archivo) {
                return res.status(400).json({ message: 'No se ha proporcionado ningún archivo' });
            }
            
            const archivo = req.files.archivo;
            const fileName = `estudiante_${estudianteID}_eval_${evaluacionID}_${Date.now()}-${archivo.name}`;
            const uploadPath = path.join(__dirname, '../uploads/entregas', fileName);
            
            // Crear directorio si no existe
            const dir = path.join(__dirname, '../uploads/entregas');
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // Mover el archivo
            await archivo.mv(uploadPath);
            
            // Guardar información en la base de datos
            const nuevoArchivo = await ArchivosEvaluaciones.create({
                evaluacionID,
                estudianteID,
                archivoURL: `/uploads/entregas/${fileName}`,
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

    // Descargar archivo
    downloadArchivo: async (req, res) => {
        try {
            const { id } = req.params;
            
            const archivo = await ArchivosEvaluaciones.findByPk(id);
            if (!archivo) {
                return res.status(404).json({ message: 'Archivo no encontrado' });
            }
            
            const filePath = path.join(__dirname, '..', archivo.archivoURL);
            
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: 'El archivo no existe en el servidor' });
            }
            
            res.download(filePath, archivo.nombreArchivo);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },

    // Eliminar archivo
    deleteArchivo: async (req, res) => {
        try {
            const { id } = req.params;
            
            const archivo = await ArchivosEvaluaciones.findByPk(id);
            if (!archivo) {
                return res.status(404).json({ message: 'Archivo no encontrado' });
            }
            
            // Eliminar archivo físico
            const filePath = path.join(__dirname, '..', archivo.archivoURL);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            // Eliminar registro de la base de datos
            await archivo.destroy();
            
            res.json({ message: 'Archivo eliminado correctamente' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    },

    // Obtener todas las entregas de una evaluación (para el profesor)
    getEntregasByEvaluacion: async (req, res) => {
        try {
            const { evaluacionID } = req.params;
            
            // Obtener archivos agrupados por estudiante
            const archivos = await ArchivosEvaluaciones.findAll({
                where: { evaluacionID },
                include: [
                    { 
                        model: db.Personas, 
                        as: 'Estudiante', 
                        attributes: ['id', 'nombre', 'apellido', 'cedula'] 
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            
            // También obtener las calificaciones existentes
            const calificaciones = await db.Calificaciones.findAll({
                where: { evaluacionID },
                include: [
                    { 
                        model: db.Personas, 
                        as: 'Personas', 
                        attributes: ['id', 'nombre', 'apellido'] 
                    }
                ]
            });
            
            // Agrupar archivos por estudiante
            const entregasPorEstudiante = {};
            archivos.forEach(archivo => {
                const estudianteId = archivo.estudianteID;
                if (!entregasPorEstudiante[estudianteId]) {
                    entregasPorEstudiante[estudianteId] = {
                        estudiante: archivo.Estudiante,
                        archivos: [],
                        calificacion: null
                    };
                }
                entregasPorEstudiante[estudianteId].archivos.push(archivo);
            });
            
            // Agregar calificaciones
            calificaciones.forEach(cal => {
                const estudianteId = cal.personaID;
                if (entregasPorEstudiante[estudianteId]) {
                    entregasPorEstudiante[estudianteId].calificacion = cal;
                }
            });
            
            res.json(Object.values(entregasPorEstudiante));
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = archivosEvaluacionesController;