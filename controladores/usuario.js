var Usuario = require('../modelos/usuario');
var bcrypt = require('bcryptjs')

function getUsuario  (req,res,next) {

    var desde = req.query.desde || 0
    desde = Number(desde);
    // TODO Ojo, que si envian un string rompen el código. Prevenir. En este y en los demás Get

    Usuario
        .find(
            // Criterios
            {

            },
        )
        .select(
            // Campos elegidos
            'nombre email img role google'
        )
        .limit(
            // Número de documentos por pagina
            5
        )
        .skip(
            desde
        )
        .exec(
            // Callback
            (error, usuarios) => {
                if (error) {
                    return res.status(500).json(
                        {
                            ok: false,
                            mensaje: 'Error al buscar usuarios en la BD',
                            error: error
                        }
                    );
                }
                Usuario.countDocuments(
                    // Criterios de selección de documentos a contar, en este caso todos
                    {

                    },
                    // Callback
                    (err,total) => {

                        if (err) {
                            return res.status(500).json(
                                {
                                    ok: false,
                                    mensaje: 'Extraño error al contar usuarios',
                                    errors: err
                                }
                            )
                        }

                        return res.status(200).json(
                            {
                                ok: true,
                                usuarios: usuarios,
                                total: total
                            }
                        )
                    });
            }
        );
}

function postUsuario (req,res) {
    let body = req.body;
    let nuevoUsuario = new Usuario({
            nombre: body.nombre,
            email: body.email,
            password: bcrypt.hashSync(body.password,10),
            img: body.img,
            role: body.role
        }
    );
    nuevoUsuario.save(
        (error,usuarioGuardado) => {
            if (error) {
                // Devolvemos 400 porque se supone que los únicos errores serán del cliente,
                // por hacer un bad request
                return res.status(400).json(
                    {
                        ok: false,
                        mensaje: 'Error al crear usuario en la BD',
                        error: error
                    }
                )
            }
            return res.status(201).json(
                {
                    ok: true,
                    usuario: usuarioGuardado
                }
            )
        });
}

function putUsuario (req,res) {
    let id = req.params.id;
    let body = req.body;

    Usuario.findById(
        id,
        // Callback
        (error, usuario) => {
            if (error) {
                // Devolvemos 500 porque un findById nunca debería dar error
                return res.status(500).json(
                    {
                        ok: false,
                        mensaje: 'Error al buscar usuario en la BD',
                        error: error
                    }
                )
            }
            // Si hace la búsqueda correctamente pero no encuentra el id
            if (!usuario) {
                return res.status(400).json(
                    {
                        ok: false,
                        mensaje: 'No existe usuario con el ID ' + id + ' en la BD',
                        error: error
                    }
                );
            }
            // Cambiamos directamente las propiedades del usuario recibido de la búsqueda
            usuario.nombre = body.nombre;
            usuario.email = body.email;
            usuario.role = body.role

            // Guardamos el usuario ya editado
            usuario.save(
                // Callback
                (err,usuarioGuardado) =>{
                    if (err) {
                        // Devolvemos 500
                        return res.status(500).json(
                            {
                                ok: false,
                                mensaje: 'Error al actualizar usuario en la BD',
                                error: err
                            }
                        )
                    }
                    // Cambiamos el password por una carita para no desvelarlo.
                    usuarioGuardado.password = ':)';
                    return res.status(200).json(
                        {
                            ok: true,
                            usuario: usuarioGuardado
                        }
                    )
                }
            );
        }
    );
}

function deleteUsuario (req,res) {
    let id = req.params.id;

    Usuario.findByIdAndRemove(
        id,
        // Callback
        (error, usuarioBorrado) => {
            if (error) {
                // Devolvemos 500 porque un findByIdAndDelete nunca debería dar error
                return res.status(500).json(
                    {
                        ok: false,
                        mensaje: 'Error al borrar usuario en la BD',
                        error: error
                    }
                )
            }
            // Si hace la búsqueda correctamente pero no encuentra el id
            if (!usuarioBorrado) {
                return res.status(400).json(
                    {
                        ok: false,
                        mensaje: 'No existe usuario con el ID ' + id + ' en la BD',
                        errors: {
                            message: 'No existe usuario con el ID indicado'
                        }
                    }
                );
            }
            return res.status(200).json(
                {
                    ok: true,
                    usuario: usuarioBorrado
                }
            )
        }
    );
}

module.exports = {
    getUsuario,
    postUsuario,
    putUsuario,
    deleteUsuario
}
