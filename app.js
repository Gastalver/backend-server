// Dependencias
require('dotenv').config();
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Inicializar variables
var app = express();

// Importar rutas
var rutasRaiz = require('./rutas/raiz');
var rutasUsuario = require('./rutas/usuario');
var rutasLogin = require('./rutas/login');

// MIDDLEWARE

// Body Parser
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// Parse application/json
app.use(bodyParser.json());


// Usar rutas
app.use('/usuario', rutasUsuario);
app.use('/login', rutasLogin);
app.use('/', rutasRaiz);

// Conexión a la base de datos.
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB',{ useNewUrlParser: true },(error,res) => {
  if (error) throw error;
    console.log('Mongo en puerto 27017: \x1b[32m%s\x1b[0m','Conectado con éxito');
})

// Escuchar peticiones
app.listen(
    3000,
    () => {
        console.log('Express server en puerto 3000: \x1b[32m%s\x1b[0m','online');
    });

