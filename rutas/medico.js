var express = require('express');
var routerMedico = express.Router();
var controladorMedico = require('../controladores/medico');
var autenticacion = require('../middleware/autenticacion');

// Rutas relativas a medicos

/**
 * @description Devuelve nombre, img, usuario y hospital de todos los medicoes
 * @param req
 * @param res
 * @returns JSON { mensaje, medicos }
 */
routerMedico.get('/', controladorMedico.getMedico);

/**
 * @description Crear un nuevo medico.
 * @param req
 * @param res
 * @requires JSON { nombre, img, usuario, hospital }
 * @returns JSON { mensaje, medico }
 */
routerMedico.post('/', autenticacion.verificaToken, controladorMedico.postMedico);

/**
 * @description Actualizar un medico.
 * @param req
 * @param res
 * @requires JSON { nombre, img, usuario }
 * @returns JSON { mensaje, medico }
 */
routerMedico.put('/:id', autenticacion.verificaToken, controladorMedico.putMedico);

/**
 * @description Borrar un medico.
 * @param req
 * @param res
 */
routerMedico.delete('/:id', autenticacion.verificaToken, controladorMedico.deleteMedico);

module.exports = routerMedico;
