require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const fileUpload = require('express-fileupload');
const db = require('./models');
const app = express();

const directorios = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads/documentos'),
  path.join(__dirname, 'tmp')
];

directorios.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directorio creado: ${dir}`);
  }
});

// Importar rutas
const personaRoutes = require('./routes/persona.routes');
const nivelRoutes = require('./routes/nivel.routes');
const gradosRoutes = require('./routes/grados.routes');
const materiasRoutes = require('./routes/materias.routes');
const seccionesRoutes = require('./routes/secciones.routes');
const evaluacionesRoutes = require('./routes/evaluaciones.routes');
const calificacionesRoutes = require('./routes/calificaciones.routes');
const documentosRoutes = require('./routes/documentos.routes');
const annoEscolarRoutes = require('./routes/annoEscolar.routes');
const nominaRoutes = require('./routes/nomina.routes');
const metodoPagoRoutes = require('./routes/metodoPagos.routes');
const arancelesRoutes = require('./routes/aranceles.routes');
const pagoEmpleadosRoutes = require('./routes/pagoEmpleado.routes');
const pagoEstudiantesRoutes = require('./routes/pagoEstudiantes.routes');
const configuracionNominaRoutes = require('./routes/configuracionNomina.routes')
const configuracionBeneficioRoutes = require('./routes/configuracionBeneficio.routes')
const liquidacionRoutes = require('./routes/liquidacion.routes')
const inscripcionRoutes = require('./routes/inscripcion.routes')
const cuposRoutes = require('./routes/cupos.routes')
const authRoutes = require('./routes/auth.routes');

// ruta de prueba multer
const testRoutes = require('./routes/test.routes');



app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Ajusta según tus necesidades
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configurar express-fileupload
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 },
  abortOnLimit: true,
  responseOnLimit: 'Archivo demasiado grande',
  useTempFiles: true,
  tempFileDir: '/tmp/',
  // Añadir esta opción para verificar si la solicitud debe usar fileupload
  isFileUploadDisabled: function(req) {
    return req.disableFileUpload === true;
  }
}));


// Servir archivos estáticos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API del Sistema de Gestión Escolar - Brisas de Mamporal');
});

// Usar la ruta de prueba
app.use('/test', testRoutes);

// Usar rutas
app.use('/', personaRoutes);
app.use('/', nivelRoutes);
app.use('/', gradosRoutes);
app.use('/', materiasRoutes);
app.use('/', seccionesRoutes);
app.use('/', evaluacionesRoutes);
app.use('/', calificacionesRoutes);
app.use('/', documentosRoutes);
app.use('/', annoEscolarRoutes);
app.use('/', nominaRoutes);
app.use('/', metodoPagoRoutes);
app.use('/', arancelesRoutes);
app.use('/', pagoEmpleadosRoutes);
app.use('/', pagoEstudiantesRoutes)
app.use('/', configuracionNominaRoutes);
app.use('/', configuracionBeneficioRoutes)
app.use('/', liquidacionRoutes);
app.use('/', inscripcionRoutes)
app.use('/', cuposRoutes);
app.use('/', authRoutes);


// Sincronizar base de datos
db.sequelize.sync({ force: false })
  .then(() => {
    console.log('Base de datos sincronizada.');
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || 'localhost';
    app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${HOST}:${PORT}`));
  })
  .catch(error => {
    console.error('Error al sincronizar la base de datos:', error);
});
