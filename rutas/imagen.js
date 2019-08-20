var express = require('express');
var controladorImagen = require('../controladores/imagen');
var routerImagen = express.Router();
// Establecemos las Rutas y sus correspondientes metodos

/**
 * Ruta raiz de imagenes
 * @name raiz
 * @path {GET} /
 * @response {Object} response {}
 * @response {string} response.mensaje Mensaje informativo
 * @auth No requiere autenticación
 */
routerImagen.get('/:coleccion/:img', controladorImagen.getImagen);

module.exports = routerImagen;
