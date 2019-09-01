var Hospital = require('../modelos/hospital');

/**
 *
 * @param req
 * @param res
 * @param next
 */
function getHospital  (req,res,next) {
    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital
        .find(
            // Criterios
            {
            },
        )
        .limit(
            // Máximo de documentos a localizar
            5
        )
        .skip(
            // Saltar x docs: Ordinal por el que empezar la entrega de documentos
            desde
        )
        .select(
            // Selección de propiedades
            'nombre img usuario'
            )
        .populate(
            // Propiedades a completar
            [
                {
                    path: 'usuario',
                    select: 'nombre email'
                }
            ]
        )
        .exec(
            {},
            // Callback
            (error, hospitales) => {
                if (error) {
                    return res.status(500).json(
                        {
                            ok: false,
                            mensaje: 'Error al buscar hospitales en la BD',
                            error: error
                        }
                    );
                }
                Hospital.count(
                    // Criterios de selección de docs a contar
                    {},
                    // Callback
                    (err,total) => {

                        return res.status(200).json(
                            {
                                ok: true,
                                hospitales: hospitales,
                                total: total
                            }
                        )
                    })
            }
        );
}

function postHospital (req,res) {
    let body = req.body;
    console.log('Recibido post/hospital con el body ' + body)
    // Tomamos el id de usuario de req, donde lo añadió el middleware autenticador.
    // No hace falta que lo indique el cliente en el body de su request.
    let nuevoHospital = new Hospital({
            nombre: body.nombre,
            img: body.img,
            usuario: req.usuario._id
        }
    );
    nuevoHospital.save(
        (error,hospitalGuardado) => {
            if (error) {
                // Devolvemos 400 porque se supone que los únicos errores serán del cliente,
                // por hacer un bad request
                return res.status(400).json(
                    {
                        ok: false,
                        mensaje: 'Error al crear hospital en la BD',
                        error: error
                    }
                )
            }
            return res.status(201).json(
                {
                    ok: true,
                    hospital: hospitalGuardado
                }
            )
        });
}

function putHospital (req,res) {
    let id = req.params.id;
    let body = req.body;

    Hospital.findById(
        id,
        // Callback
        (error, hospital) => {
            if (error) {
                // Devolvemos 500 porque un findById nunca debería dar error
                return res.status(500).json(
                    {
                        ok: false,
                        mensaje: 'Error al buscar hospital en la BD',
                        error: error
                    }
                )
            }
            // Si hace la búsqueda correctamente pero no encuentra el id
            if (!hospital) {
                return res.status(400).json(
                    {
                        ok: false,
                        mensaje: 'No existe hospital con el ID ' + id + ' en la BD',
                        error: error
                    }
                );
            }
            // Cambiamos directamente las propiedades del hospital recibido de la búsqueda
            hospital.nombre = body.nombre;
            // La imagen la gestionamos de otra manera
            // hospital.img = body.img;
            hospital.usuario = req.usuario._id;

            // Guardamos el hospital ya editado
            hospital.save(
                // Callback
                (err,hospitalGuardado) =>{
                    if (err) {
                        // Devolvemos 500
                        return res.status(500).json(
                            {
                                ok: false,
                                mensaje: 'Error al actualizar hospital en la BD',
                                error: err
                            }
                        )
                    }
                    return res.status(200).json(
                        {
                            ok: true,
                            hospital: hospitalGuardado
                        }
                    )
                }
            );
        }
    );
}

function deleteHospital (req,res) {
    let id = req.params.id;

    Hospital.findByIdAndRemove(
        id,
        // Callback
        (error, hospitalBorrado) => {
            if (error) {
                // Devolvemos 500 porque un findByIdAndDelete nunca debería dar error
                return res.status(500).json(
                    {
                        ok: false,
                        mensaje: 'Error al borrar hospital en la BD',
                        error: error
                    }
                )
            }
            // Si hace la búsqueda correctamente pero no encuentra el id
            if (!hospitalBorrado) {
                return res.status(400).json(
                    {
                        ok: false,
                        mensaje: 'No existe hospital con el ID ' + id + ' en la BD',
                        errors: {
                            message: 'No existe hospital con el ID indicado'
                        }
                    }
                );
            }
            return res.status(200).json(
                {
                    ok: true,
                    hospital: hospitalBorrado
                }
            )
        }
    );
}

function getHospitalPorId (req,res) {
    var id = req.params.id;

    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec(
            (err,hospital) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar hospital',
                        errors: err
                    });
                }
                if (!hospital) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El hospital con el id ' + id + ' no existe.',
                        errors: {
                            message: 'No existe un hospital con ese ID'
                        }
                    })
                }
                res.status(200).json({
                    ok: true,
                    hospital:hospital
                })
            }
        )
}

module.exports = {
    getHospital,
    getHospitalPorId,
    postHospital,
    putHospital,
    deleteHospital
}
