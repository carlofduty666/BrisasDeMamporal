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

const sequelize = new Sequelize(
    dbconfig.database,
    dbconfig.username,
    dbconfig.password, 
    {
        host: dbconfig.host,
        dialect: dbconfig.dialect
    }
);

sequelize.sync({ force: false }) // { force: true } borra y crea las tablas
  .then(() => {
    console.log('Base de datos sincronizada.');
    // Puerto y arranque del servidor
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || 'localhost';
    app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${HOST}:${PORT}`));
  })
  .catch(error => {
    console.error('Error al sincronizar la base de datos:', error);
  });