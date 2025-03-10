require('dotenv').config()
const express = require('express')
const { Sequelize, DataTypes } = require('sequelize')
const bodyParser = require('body-parser')
const cors = require('cors')
const sequelize = require('./config/dbconfig.js')
const app = express()

app.use(cors())
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

// Elimina esta segunda declaración de sequelize ya que la tienes arriba
// const sequelize = new Sequelize( ... )

sequelize.sync({ force: false })
  .then(() => {
    console.log('Base de datos sincronizada.');
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || 'localhost';
    app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${HOST}:${PORT}`));
  })
  .catch(error => {
    console.error('Error al sincronizar la base de datos:', error);
  });