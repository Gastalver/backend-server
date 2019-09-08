// Modelos
var Usuario = require('../modelos/usuario');
var Hospital = require('../modelos/hospital');
var Medico = require('../modelos/medico');

function general(req,res) {
    var voz = req.params.voz;
    // Criterios. Lo transformamos mediante una expresión regular
    // para que sea insensible a may./min.
    var regExp = new RegExp( voz, 'i');

    // Ejecutamos las búsquedas como promesas en paralelo, para ello previamente,
    // hemos creado funciones de búsqueda que devuelven promesas. Ver más abajo.

    Promise
        .all(
            [
                buscarHospitales(voz, regExp),
                buscarMedicos(voz, regExp),
                buscarUsuarios(voz, regExp),
            ]
        )
        .then(
            (resultados) => {
                // Resultados es un array con el resolve de cada Promise,
                // en el mismo orden en que fueron invocados en .all.
                res.status(200).json(
                    {
                        ok: true,
                        mensaje: 'Búsqueda realizada correctamente',
                        hospitales: resultados[0],
                        medicos: resultados[1],
                        usuarios: resultados[2]
                    }
                )
            },
            (error) => {
                res.status(500).json(
                    {
                        ok: false,
                        mensaje: 'Error al realizar la búsqueda',
                        error: error
                    }
                )
            }
        )
}

function particular(req,res) {
    var coleccion = req.params.coleccion;
    var voz = req.params.voz;
    var regExp = new RegExp( voz, 'i');
    var funcionBúsqueda;
    if (coleccion == 'usuarios') {
        funcionBúsqueda = buscarUsuarios;
    } else if (coleccion == 'hospitales') {
        funcionBúsqueda = buscarHospitales;
    } else if (coleccion == 'medicos') {
        funcionBúsqueda = buscarMedicos;
    } else {
        return res.status(400).json(
            {
                ok: false,
                mensaje: 'Error al realizar la búsqueda.',
                error: 'No existe la colección indicada'
            }
        )
    }

    funcionBúsqueda(voz, regExp).then(
        (resultado) => {
            res.status(200).json(
                {
                    ok: true,
                    mensaje: 'Búsqueda realizada correctamente',
                    [coleccion]: resultado
                }
            )
        },
        (error) => {
            res.status(500).json(
                {
                    ok: false,
                    mensaje: 'Error al realizar la búsqueda',
                    error: error
                }
            )
        }
    )



}


// Funciones de búsqueda instrumentadas como promesas.
// Convertimos la búsqueda en promesa para poder realizar varias simultáneas y
// entregar la respuesta sólo cuando se hayan resuelto todas. Es decir, para
// gestionar la asincronicidad. También se podría usar async / await

function buscarHospitales( voz, regExp) {
    return new Promise((resolve, reject) => {
        Hospital.find(
            {
                // Criterios
                nombre: regExp
            })
            .populate(
                {
                    path: 'usuario',
                    select: 'nombre email'
                }
            )
            .exec(
                // Opciones exec
                {},
                // Callback
                (err, hospitales) => {
                    if (err){
                        reject('Error al cargar hospitales', err);
                    } else {
                        resolve(hospitales)
                    }
                }
            )
    });
}

function buscarMedicos( voz, regExp) {
    return new Promise((resolve, reject) => {
        Medico.find(
            {
                // Criterios
                nombre: regExp
            })
            .populate(
                [
                    {
                        path: 'usuario',
                        select: 'nombre email'
                    },
                    {
                        path: 'hospital',
                        select: 'nombre'
                    },

                ]
            )
            .exec(
                // Opciones exec
                {},
                // Callback
                (err, medicos) => {
                    if (err){
                        reject('Error al cargar médicos', err);
                    } else {
                        resolve(medicos)
                    }
                }
            )
    });
}

function buscarUsuarios( voz, regExp) {
    return new Promise((resolve, reject) => {
        Usuario
            .find(
                // Criterios. No usamos. Usamos la técnica OR, para buscar en
                // dos campos
                {
                }
            )
            .select(
                // Seleccionamos los campos que queremos. No queremos password
                'nombre email img role'
            )
            .or(
                // Operador para buscar por varios criterios en varios campos a la vez.
                [
                    { nombre: regExp },
                    { email: regExp }
                ]
            )
            .exec(
                // Opciones exec
                {},
                // Callback
                (err, usuarios) => {
                    if (err){
                        reject('Error al cargar usuarios:', err);
                    } else {
                        resolve(usuarios)
                    }
                }
            )
    });
}

module.exports = {
    general,
    particular
};
