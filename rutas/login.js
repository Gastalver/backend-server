//Dependencias
var express=require('express');
var controladorLogin = require('../controladores/login');
var routerLogin = express.Router();
var bcrypt = require('bcryptjs');


/**
 * Simplemente dice Hola.
 *
 * @name postLogin
 * @path {POST} /login
 * @response {Object} response {}
 * @response {string} response.mensaje Mensaje informativo
 * @auth No requiere autenticación
 */
routerLogin.post('/', controladorLogin.logIn);

routerLogin.post('/google', controladorLogin.logInGoogle);

module.exports = routerLogin;


