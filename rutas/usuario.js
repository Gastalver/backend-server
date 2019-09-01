var express = require('express');
var routerUsuario = express.Router();
var controladorUsuario = require('../controladores/usuario');
var Usuario = require('../modelos/usuario');
var bcrypt = require('bcryptjs');
var autenticacion = require('../middleware/autenticacion');

// Rutas relativas a usuarios

/**
 * @description Devuelve nombre, email, img, role y propiedad Google de todos los usuarios
 * @type {app}
 * @param req
 * @param res
 * @returns JSON { mensaje, usuarios }
 */
routerUsuario.get('/', controladorUsuario.getUsuario);

/**
 * @description Crear un nuevo usuario.
 * @type {app}
 * @param req
 * @param res
 * @requires JSON { nombre, email, img, role }
 * @returns JSON { mensaje, usuario }
 */
routerUsuario.post('/', controladorUsuario.postUsuario);

/**
 * @description Actualizar un usuario.
 * @type {app}
 * @param req
 * @param res
 * @requires JSON { nombre, email, img, role }
 * @returns JSON { mensaje, usuario }
 */
routerUsuario.put('/:id', autenticacion.verificaToken, controladorUsuario.putUsuario);

/**
 * @description Borrar un usuario.
 * @type {app}
 * @param req
 * @param res
 */
routerUsuario.delete('/:id', autenticacion.verificaToken, controladorUsuario.deleteUsuario);

module.exports = routerUsuario;
