var express = require('express');
var routerHospital = express.Router();
var controladorHospital = require('../controladores/hospital');
var autenticacion = require('../middleware/autenticacion');

// Rutas relativas a hospitales

routerHospital.get('/:id', controladorHospital.getHospitalPorId);

/**
 * @description Devuelve nombre, img y usuarios de todos los hospitales
 * @type {app}
 * @param req
 * @param res
 * @returns JSON { mensaje, hospitales }
 */
routerHospital.get('/', controladorHospital.getHospital);

/**
 * @description Crear un nuevo hospital.
 * @type {app}
 * @param req
 * @param res
 * @requires JSON { nombre, img, usuarios }
 * @returns JSON { mensaje, hospital }
 */
routerHospital.post('/', autenticacion.verificaToken, controladorHospital.postHospital);

/**
 * @description Actualizar un hospital.
 * @type {app}
 * @param req
 * @param res
 * @requires JSON { nombre, img, usuario }
 * @returns JSON { mensaje, hospital }
 */
routerHospital.put('/:id', autenticacion.verificaToken, controladorHospital.putHospital);

/**
 * @description Borrar un hospital.
 * @type {app}
 * @param req
 * @param res
 */
routerHospital.delete('/:id', autenticacion.verificaToken, controladorHospital.deleteHospital);

module.exports = routerHospital;
