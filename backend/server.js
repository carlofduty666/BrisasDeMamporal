require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const db = require('./models')
const app = express()

// Importar rutas
const personaRoutes = require('./routes/persona.routes');
const nivelRoutes = require('./routes/nivel.routes');
const gradoRoutes = require('./routes/grados.routes');
const materiaRoutes = require('./routes/materias.routes');
const annoEscolarRoutes = require('./routes/annoEscolar.routes')

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use('/', personaRoutes)
app.use('/', nivelRoutes)
app.use('/', gradoRoutes)
app.use('/', materiaRoutes)
app.use('/', annoEscolarRoutes)



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