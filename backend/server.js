require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./models');
const app = express();

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



// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API del Sistema de Gestión Escolar - Brisas de Mamporal');
});

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
app.use('/', liquidacionRoutes)


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
