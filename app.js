// Dependencias
require('dotenv').config();
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');

// Inicializar variables
var app = express();

// Importar rutas
var rutasRaiz = require('./rutas/raiz');
var rutasUsuario = require('./rutas/usuario');
var rutasLogin = require('./rutas/login');
var rutasHospital = require('./rutas/hospital');
var rutasMedico = require('./rutas/medico');
var rutasBusqueda = require('./rutas/busqueda');
var rutasUpload = require('./rutas/upload');
var rutasImagen = require('./rutas/imagen');


// MIDDLEWARE

// Body Parser
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
// Parse application/json
app.use(bodyParser.json());

//File Upload con opciones por defecto
app.use(fileUpload(({})));

// Serve Index Config
// Ejemplo de cómo hacer público un directorio y listar sus recursos.
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));



// Usar rutas
app.use('/login', rutasLogin);
app.use('/usuario', rutasUsuario);
app.use('/hospital', rutasHospital);
app.use('/medico', rutasMedico);
app.use('/busqueda', rutasBusqueda);
app.use('/upload', rutasUpload);
app.use('/imagen', rutasImagen);
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

