var express = require('express');
var controladorRaiz = require('../controladores/raiz');
var routerRaiz = express.Router();
// Establecemos las Rutas y sus correspondientes metodos

/**
 * Ruta raiz de la app
 * @name raiz
 * @path {GET} /
 * @response {Object} response {}
 * @response {string} response.mensaje Mensaje informativo
 * @auth No requiere autenticación
 */
routerRaiz.get('/', controladorRaiz.raiz);

module.exports = routerRaiz;
