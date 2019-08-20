var express = require('express');
var controladorUpload = require('../controladores/upload');
var routerUpload = express.Router();
// Establecemos las Rutas y sus correspondientes metodos

/**
 * Ruta raiz de upload
 * @name raiz
 * @path {PUT} /upload
 * @response {Object} response {}
 * @response {string} response.mensaje Mensaje informativo
 * @auth No requiere autenticación
 */
routerUpload.put('/:coleccion/:id', controladorUpload.putUpload);

module.exports = routerUpload;
