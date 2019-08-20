var express = require('express');
var controladorBusqueda = require('../controladores/busqueda');
var routerBusqueda = express.Router();
// Establecemos las Rutas y sus correspondientes metodos

/**
 * Busqueda global
 * @name busquedaGlobal
 * @path {GET} /busqueda/general/:voz
 * @response {Object} response {}
 * @response {string} response.mensaje Mensaje informativo
 * @auth No requiere autenticación
 */
routerBusqueda.get('/general/:voz', controladorBusqueda.general);

/**
 * Busqueda por colección
 * @name busquedaColeccion
 * @path {GET} /busqueda/:coleccion/:voz
 * @response {Object} response {}
 * @response {string} response.mensaje Mensaje informativo
 * @auth No requiere autenticación
 */
routerBusqueda.get('/:coleccion/:voz', controladorBusqueda.particular);



module.exports = routerBusqueda;
