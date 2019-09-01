var Medico = require('../modelos/medico');

function getMedico  (req,res,next) {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico
        .find(
            // Criterios
            {

            }
        )
        .select(
            // Select
            'nombre img usuario hospital'
        )
        .limit(
            // Máximo de documentos a localizar
            5
        )
        .skip(
            // Saltar x docs: Ordinal por el que empezar la entrega de documentos
            desde
        )
        .populate(
            [
                {
                    path: 'usuario',
                    select: 'nombre email'
                },
                {
                    path: 'hospital',
                    select: 'nombre'
                }
            ]
        )
        .exec(
            // Callback
            (error, medicos) => {
                if (error) {
                    return res.status(500).json(
                        {
                            ok: false,
                            mensaje: 'Error al buscar medicos en la BD',
                            error: error
                        }
                    );
                }
                Medico.count({},(err,total) => {
                    return res.status(200).json(
                        {
                            ok: true,
                            medicos: medicos,
                            total: total
                        }
                    )
                })
            }
        );
}

function getMedicoPorId (req,res) {
    var id = req.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre img email')
        .populate('hospital')
        .exec(
            (err,medico) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al buscar medico',
                        errors: err
                    });
                }
                if (!medico) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'El médico con el id ' + id + ' no existe.',
                        errors: {
                            message: 'No existe un médico con ese ID'
                        }
                    })
                }
                res.status(200).json({
                    ok: true,
                    medico:medico
                })
            }
        )
}

function postMedico (req,res) {
    let body = req.body;
    let nuevoMedico = new Medico({
            nombre: body.nombre,
            //img: body.img,
            usuario: req.usuario._id,
            hospital: body.hospital
        }
    );
    nuevoMedico.save(
        (error,medicoGuardado) => {
            if (error) {
                // Devolvemos 400 porque se supone que los únicos errores serán del cliente,
                // por hacer un bad request
                return res.status(400).json(
                    {
                        ok: false,
                        mensaje: 'Error al crear medico en la BD',
                        error: error
                    }
                )
            }
            return res.status(201).json(
                {
                    ok: true,
                    medico: medicoGuardado
                }
            )
        });
}

function putMedico (req,res) {
    let id = req.params.id;
    let body = req.body;

    Medico.findById(
        id,
        // Callback
        (error, medico) => {
            if (error) {
                // Devolvemos 500 porque un findById nunca debería dar error
                return res.status(500).json(
                    {
                        ok: false,
                        mensaje: 'Error al buscar medico en la BD',
                        error: error
                    }
                )
            }
            // Si hace la búsqueda correctamente pero no encuentra el id
            if (!medico) {
                return res.status(400).json(
                    {
                        ok: false,
                        mensaje: 'No existe medico con el ID ' + id + ' en la BD',
                        error: error
                    }
                );
            }
            // Cambiamos directamente las propiedades del medico recibido de la búsqueda
            medico.nombre = body.nombre;
            // medico.img = body.img;
            medico.usuario = req.usuario._id;
            medico.hospital = body.hospital;

            // Guardamos el medico ya editado
            medico.save(
                // Callback
                (err,medicoGuardado) =>{
                    if (err) {
                        // Devolvemos 500
                        return res.status(500).json(
                            {
                                ok: false,
                                mensaje: 'Error al actualizar medico en la BD',
                                error: err
                            }
                        )
                    }
                    return res.status(200).json(
                        {
                            ok: true,
                            medico: medicoGuardado
                        }
                    )
                }
            );
        }
    );
}

function deleteMedico (req,res) {
    let id = req.params.id;

    Medico.findByIdAndRemove(
        id,
        // Callback
        (error, medicoBorrado) => {
            if (error) {
                // Devolvemos 500 porque un findByIdAndDelete nunca debería dar error
                return res.status(500).json(
                    {
                        ok: false,
                        mensaje: 'Error al borrar medico en la BD',
                        error: error
                    }
                )
            }
            // Si hace la búsqueda correctamente pero no encuentra el id
            if (!medicoBorrado) {
                return res.status(400).json(
                    {
                        ok: false,
                        mensaje: 'No existe medico con el ID ' + id + ' en la BD',
                        errors: {
                            message: 'No existe medico con el ID indicado'
                        }
                    }
                );
            }
            return res.status(200).json(
                {
                    ok: true,
                    medico: medicoBorrado
                }
            )
        }
    );
}

module.exports = {
    getMedico,
    getMedicoPorId,
    postMedico,
    putMedico,
    deleteMedico
}
