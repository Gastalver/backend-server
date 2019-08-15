// Requires (Importación de librerías)
var express = require('express');
var mongoose = require('mongoose');

// Inicializar variables
var app = express();

// Conexión a la base de datos.
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB',{ useNewUrlParser: true },(error,res) => {
  if (error) throw error;
    console.log('Mongo en puerto 27017: \x1b[32m%s\x1b[0m','Conectado con éxito');
})

// Rutas
app.get(
    '/',
    (req,res,next) => {
        res.status(200).json(
            {
                ok: true,
                mensaje: 'Petición realizada correctamente'
            }
            )
    }
);


// Escuchar peticiones
app.listen(
    3000,
    () => {
        console.log('Express server en puerto 3000: \x1b[32m%s\x1b[0m','online');
    });

